import { parseBlob, IAudioMetadata } from 'music-metadata-browser'

export type AudioMetadata = IAudioMetadata

export function getTags(file: File): Promise<Record<string, Record<string, any>>> {
  return readTaggedMetadata(file).then(formatTags)
}

function readTaggedMetadata(file: File): Promise<IAudioMetadata> {
  return parseBlob(file, { duration: true }).then((metadata) => {
    return metadata
  })
}

function formatTags(tags: IAudioMetadata): Record<string, Record<string, any>> {
  // console.log(tags)
  const commonTags = formatCommonTags(tags.common)
  const picture = commonTags.picture ? commonTags.picture : {}
  delete commonTags.picture

  const format = formatFormatTags(tags.format)

  return Object.assign({}, { commonTags }, { picture }, { format })
}

function formatCommonTags(common: IAudioMetadata['common']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(common).map((tagTuple) => {
      if (Array.isArray(tagTuple[1])) return [tagTuple[0], tagTuple[1].join('')]
      if (tagTuple[0] === 'disk' || tagTuple[0] === 'track' || tagTuple[0] === 'movementIndex') {
        return [tagTuple[0], cleanObjectResults(tagTuple[1])]
      }
      return tagTuple
    })
  )
}

function formatFormatTags(format: IAudioMetadata['format']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(format).map((tagTuple) => [tagTuple[0], tagTuple[1].toString()])
  )
}

function cleanObjectResults(obj: { no?: number | undefined; of?: number | undefined }): string {
  return obj.no && obj.no !== null ? `${obj.no} ${obj.of ? 'of ' + obj.of : ''}` : ''
}
