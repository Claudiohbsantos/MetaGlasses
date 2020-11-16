import * as WaveSurfer from 'wavesurfer.js'

declare module 'wavesurfer.js' {
  interface WaveSurferBackend {
    ac: AudioContext
    setFilters(filters: AudioNode[]): void
    buffer: AudioBuffer
  }
  interface WaveSurferParams {
    splitChannelsOptions?: {
      overlay?: boolean
      channelColors?: Record<
        string,
        {
          progressColor?: string
          waveColor?: string
          backgroundColor?: string
        }
      >
      filterChannels: number[]
    }
  }
}
