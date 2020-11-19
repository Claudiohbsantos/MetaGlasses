import Timecode from 'smpte-timecode'
import { clean } from './utils'

type TCRate = 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60 | undefined

export type TrackMetadata = {
  recorderChannel?: string
  name?: string
  interleaveChannel: string
}

export type BWFMetadata = {
  project?: string
  scene?: string
  take?: string
  tape?: string
  circled?: boolean
  note?: string
  tracks?: TrackMetadata[]
  originalFilename?: string
  userbits?: string
  framerate?: string
  timecode?: string
  bitDepth?: string
  sampleRate?: string
  dateCreated?: string
  timeCreated?: string
  size?: number
  filename?: string
  duration?: number
  channelNum?: number
}

export function cleanFmt(fmt: Record<string, any>): Partial<BWFMetadata> {
  return clean({
    channelNum: fmt.numChannels,
    bitDepth: fmt.bitsPerSample,
    sampleRate: fmt.sampleRate,
    tracks: Array.from(Array(fmt.numChannels), (_, i) => i + 1).map((ch) => ({
      interleaveChannel: ch.toString(),
    })),
  })
}

export function cleanBext(bext: Record<string, any>): Partial<BWFMetadata> {
  return clean({
    dateCreated: bext.originationDate || undefined,
    timeCreated: bext.originationTime || undefined,
  })
}

export function cleaniXML(xml: Record<string, any>): Partial<BWFMetadata> {
  const metadata: Partial<BWFMetadata> = {}
  metadata.project = extractIxmlString(xml.PROJECT)
  metadata.scene = extractIxmlString(xml.SCENE)
  metadata.take = extractIxmlString(xml.TAKE)
  metadata.tape = extractIxmlString(xml.TAPE)
  metadata.note = extractIxmlString(xml.NOTE)
  metadata.userbits = extractIxmlString(xml.UBITS)
  metadata.originalFilename = extractIxmlString(xml.HISTORY?.[0]?.ORIGINAL_FILENAME)
  metadata.bitDepth = getBitDepth(xml.SPEED?.[0]?.AUDIO_BIT_DEPTH)
  metadata.sampleRate = getSampleRate(xml.SPEED?.[0]?.FILE_SAMPLE_RATE)
  metadata.framerate = getFrameRate(xml.SPEED?.[0]?.TIMECODE_RATE, xml.SPEED?.[0]?.TIMECODE_FLAG)
  metadata.timecode =
    getIxmlTimecode(xml.SPEED?.[0]) || getIxmlBextTimecode(xml.SPEED?.[0], xml.BEXT?.[0])
  metadata.circled = extractIxmlBoolean(xml, 'CIRCLED')
  metadata.tracks = getTracks(xml.TRACK_LIST)
  return clean(metadata)
}

export function cleanFile(fileData: Record<string, any>): Partial<BWFMetadata> {
  return clean({
    size: fileData.sizeBytes || undefined,
    filename: fileData.filename || undefined,
  })
}

function getTracks(tracksXML: Record<string, any>): BWFMetadata['tracks'] {
  if (!Array.isArray(tracksXML?.[0]?.TRACK) || tracksXML[0].TRACK.length < 1) return []
  return tracksXML[0].TRACK.map((track: Record<string, string[]>) => {
    return {
      recorderChannel: extractIxmlString(track.CHANNEL_INDEX),
      name: extractIxmlString(track.NAME),
      interleaveChannel: extractIxmlString(track.INTERLEAVE_INDEX),
    }
  })
}

function standardTimecode(rate: number): TCRate {
  switch (parseInt(rate.toString())) {
    case 23:
      return 23.976
    case 24:
      return 24
    case 25:
      return 25
    case 29:
      return 29.97
    case 30:
      return 30
    case 50:
      return 50
    case 59:
      return 59.94
  }
}

function getIxmlTimecode(speedXML: Record<string, string[]>): string | undefined {
  if (!speedXML) return
  const sampleRate = parseInt(speedXML.TIMESTAMP_SAMPLE_RATE?.[0])
  const samples = parseInt(speedXML.TIMESTAMP_SAMPLES_SINCE_MIDNIGHT_LO?.[0])
  const tcRate = getRawFrameRate(speedXML.TIMECODE_RATE)
  const tcFlag = extractIxmlString(speedXML.TIMECODE_FLAG)
  return calculateTimecode(samples, sampleRate, tcRate, tcFlag)
}

function getIxmlBextTimecode(
  speedXML: Record<string, string[]>,
  BextIXML: Record<string, string[]>
): string | undefined {
  if (!speedXML || !BextIXML) return
  const sampleRate = getSampleRateFromCodingHistory(BextIXML.BWF_CODING_HISTORY?.[0])
  if (!sampleRate) return
  const samples = parseInt(BextIXML.BWF_TIME_REFERENCE_LOW?.[0])
  const tcRate = getRawFrameRate(speedXML.TIMECODE_RATE)
  const tcFlag = extractIxmlString(speedXML.TIMECODE_FLAG)

  return calculateTimecode(samples, sampleRate, tcRate, tcFlag)
}

function getSampleRateFromCodingHistory(st: string): number | undefined {
  const matches = /,F=(\d+),/.exec(st)
  if (matches?.[1]) return parseInt(matches[1])
}

function calculateTimecode(
  samples: number,
  sampleRate: number,
  tcRate: number,
  tcFlag?: string
): string | undefined {
  const frameCount = (samples / sampleRate) * tcRate
  if (isNaN(frameCount)) return
  const isDropFrame = tcFlag === 'DF'

  return Timecode(frameCount, standardTimecode(tcRate), isDropFrame).toString()
}

function getRawFrameRate(rateXml: string[]): number {
  const rgx = /(\d+)\/(\d+)/
  const rateMatches = rgx.exec(extractIxmlString(rateXml) || '')
  if (!rateMatches || !rateMatches[1] || !rateMatches[2]) return 1
  const rate = parseInt(rateMatches[1]) / parseInt(rateMatches[2])
  if (isNaN(rate)) return 1
  return rate
}

function getFrameRate(rateXml: string[], flagXml: string[]): string | undefined {
  const rate = getRawFrameRate(rateXml)
  if (rate === 1) return
  const rateString = standardTimecode(rate)?.toString()
  if (!rateString) return
  const flag = extractIxmlString(flagXml)

  return rateString === '29.97' || rateString === '59.94' ? `${rateString} ${flag}` : rateString
}

function getBitDepth(xml: string[]): string | undefined {
  const srString = extractIxmlString(xml)
  if (!srString) return
  return `${srString} bits`
}

function getSampleRate(xml: string[]): string | undefined {
  const srString = extractIxmlString(xml)
  if (!srString) return
  return `${parseInt(srString) / 1000} kHz`
}

function extractIxmlString(xml: string[]): string | undefined {
  return (xml && xml[0].trim()) || undefined
}

function extractIxmlBoolean(xml: Record<string, any>, att: string): boolean | undefined {
  switch (xml?.[att]?.[0]) {
    case 'TRUE':
      return true
    case 'FALSE':
      return false
    default:
      return undefined
  }
}
