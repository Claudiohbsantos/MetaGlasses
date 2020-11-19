import React, { SyntheticEvent } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Button, Container, UncontrolledTooltip } from 'reactstrap'
import WaveSurfer from 'wavesurfer.js'
// import '../modules/wavesurferAugment'
import style from './Waveform.module.css'

type Props = {
  channel: number
  channelNum: number
  audioFile: File
  playHandler: (instance: WaveSurfer) => void
  seekHandler: (pos: number) => void
  players: WaveSurfer[]
}

type State = {
  isPlaying: boolean
  channelGain: GainNode[]
  mutes: Set<number>
}

const range = (start: number, n: number): number[] => Array.from(Array(n), (_, i) => i + start)
const otherChannels = (nChannels: number, chI: number): number[] =>
  range(0, nChannels).filter((n) => n !== chI - 1)

export class TrackWaveform extends React.Component<Props, State> {
  wavesurfer: WaveSurfer | undefined
  constructor(props: Props) {
    super(props)
    this.state = { isPlaying: false, channelGain: [], mutes: new Set() }
    this.seekAll = this.seekAll.bind(this)
  }

  connectChannelMixer(): void {
    if (!this.wavesurfer) return
    const splitter = this.wavesurfer.backend.ac.createChannelSplitter(6)
    const monoMerger = this.wavesurfer.backend.ac.createChannelMerger(1)

    const gainNodes: GainNode[] = []
    for (let i = 0; i < (this.props.channelNum ?? 0); i++) {
      const gainNode = this.wavesurfer?.backend.ac.createGain()
      splitter.connect(gainNode, i)
      gainNode.connect(monoMerger)
      gainNodes.push(gainNode)
    }

    // workaround. Wavesurfer connects filters in the filters array, wich results in splitter being connected directly to monomerger without a stopper. Dummy simply mutes this path.
    const dummy = this.wavesurfer?.backend.ac.createGain()
    dummy.gain.value = 0

    this.wavesurfer.backend.setFilters([splitter, dummy, monoMerger])
    this.setState({ channelGain: gainNodes })
  }

  seekAll(e: SyntheticEvent): void {
    const el = e as any
    const rect = el.target.getBoundingClientRect()
    const x = el.clientX - rect.left

    this.props.seekHandler(x / rect.width)
  }

  componentDidMount(): void {
    if (this.props.audioFile) {
      this.wavesurfer = WaveSurfer.create({
        container: `#waveform-${this.props.channel}`,
        normalize: true,
        splitChannels: true,
        splitChannelsOptions: {
          relativeNormalization: true,
          filterChannels: otherChannels(this.props.channelNum, this.props.channel),
        },
        waveColor: '#777',
        interact: false,
        // barWidth: 1,
        height: 60,
        responsive: true,
        pixelRatio: 1,
      })

      this.wavesurfer.on('ready', (): void => {
        this.connectChannelMixer()
        this.muteHidden()
      })

      this.wavesurfer.on('play', (): void => {
        this.setState({ isPlaying: true })
      })

      this.wavesurfer.on('pause', (): void => {
        this.setState({ isPlaying: false })
      })

      this.wavesurfer.setDisabledEventEmissions(['seek', 'interaction'])

      this.props.players.push(this.wavesurfer)

      this.wavesurfer.loadBlob(this.props.audioFile)
    }
  }

  muteHidden(): void {
    this.state.channelGain.forEach((chGain, chI) => {
      chGain.gain.value = chI !== this.props.channel - 1 ? 0 : 1
    })
  }

  componentWillUnmount(): void {
    this.wavesurfer?.destroy()
  }

  render(): JSX.Element | null {
    return (
      <Container>
        <div
          id={`waveform-${this.props.channel}`}
          className={[style.waveform].join(' ')}
          onClick={this.seekAll}
        />
      </Container>
    )
  }
}
