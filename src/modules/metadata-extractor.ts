import { WaveFile } from 'wavefile'
import { parseStringPromise } from 'xml2js'

export function getWavMetadata(file: File): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    readFileDataURL(file)
      .then(readWavfromDataURI)
      // .then(peek)
      .then((wav: WaveFile) =>
        Promise.all([
          getiXML(wav),
          getBext(wav),
          getFileInformation(file),
          getFmt(wav),
          getDuration(file),
        ]).then((values) => ({
          ixml: values[0],
          bext: values[1],
          file: values[2],
          fmt: values[3],
          media: values[4],
        }))
      )
      .then(peek)
      .then(resolve)
      .catch(reject)
  })
}

function getDuration(file: File): Record<string, any> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audioEl = document.createElement('audio')
    audioEl.addEventListener('loadedmetadata', () => {
      resolve({duration: audioEl.duration})
    })
    audioEl.addEventListener('error', reject)
    audioEl.src = url
  })
}

function getFileInformation(file: File): Record<string, any> {
  return {
    filename: file.name,
    sizeBytes: file.size,
  }
}

function getFmt(wav: WaveFile): Record<string, any> {
  return wav.fmt || {}
}

function getBext(wav: WaveFile): Record<string, any> {
  return wav.bext || {}
}

function getiXML(wav: WaveFile): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    parseStringPromise(getIXMLString(wav))
      .then((ixmlObj) => ixmlObj?.BWFXML ?? {}) // prevent null return
      .then(resolve)
      .catch(reject)
  })
}

function readWavfromDataURI(dataURL: string): WaveFile {
  const wav = new WaveFile()
  wav.fromDataURI(dataURL)
  return wav
}

function getIXMLString(wav: WaveFile): string {
  if (
    !wav.iXML ||
    !(wav.iXML as Record<string, string>).value ||
    typeof (wav.iXML as Record<string, string>).value !== 'string'
  ) {
    return ''
  }

  return (wav.iXML as Record<string, string>).value
}

function readFileDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e): void {
      if (e.target?.result && typeof e.target.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(Error('failed to read file'))
      }
    }
    reader.readAsDataURL(file)
  })
}

function peek<T>(x: T): T {
  console.log(x)
  return x
}
