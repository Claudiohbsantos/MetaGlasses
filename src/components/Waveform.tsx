import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Button, Container, UncontrolledTooltip } from 'reactstrap'
import WaveSurfer from 'wavesurfer.js'
// import '../modules/wavesurferAugment'
import style from './Waveform.module.css'

type Props = {
  channelNum?: number
  audioFile?: File
  setWaveformReadiness: (isReady: boolean) => void
  handleDurationChange: (duration: number | undefined) => void
}

type State = {
  isPlaying: boolean
  channelGain: GainNode[]
  mutes: Set<number>
}
export class Waveform extends React.Component<Props, State> {
  wavesurfer: WaveSurfer | undefined
  constructor(props: Props) {
    super(props)
    this.state = { isPlaying: false, channelGain: [], mutes: new Set() }
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

  componentDidMount(): void {
    if (this.props.audioFile) {
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        // normalize: true,
        splitChannels: true,
        waveColor: '#777',
        // barWidth: 1,
        height: 60,
        responsive: true,
        pixelRatio: 1,
      })

      this.wavesurfer.on('ready', (): void => {
        this.connectChannelMixer()
        this.props.setWaveformReadiness(true)
        this.props.handleDurationChange(this.wavesurfer?.getDuration())
      })

      this.wavesurfer.on('destroy', (): void => {
        this.props.setWaveformReadiness(false)
        this.props.handleDurationChange(undefined)
      })

      this.wavesurfer.on('play', (): void => {
        this.setState({ isPlaying: true })
      })

      this.wavesurfer.on('pause', (): void => {
        this.setState({ isPlaying: false })
      })

      this.wavesurfer.loadBlob(this.props.audioFile)
    }
  }

  updateGains(): void {
    this.state.channelGain.forEach((chGain, chI) => {
      chGain.gain.value = this.state.mutes.has(chI) ? 0 : 1
    })
  }

  muteChannel(ch: number): void {
    if (this.state.mutes.has(ch)) {
      const newSet = new Set(this.state.mutes)
      newSet.delete(ch)
      this.setState({ mutes: newSet }, this.updateGains)
    } else {
      this.setState({ mutes: new Set(this.state.mutes).add(ch) }, this.updateGains)
    }
  }

  componentWillUnmount(): void {
    this.wavesurfer?.destroy()
  }

  renderPlayButton(): JSX.Element | undefined {
    if (this.wavesurfer) {
      return (
        <Button
          outline
          size="sm"
          color="secondary"
          onClick={(): void => {
            this.wavesurfer?.playPause()
          }}
        >
          {this.state.isPlaying ? 'pause' : 'play'}
        </Button>
      )
    }
  }

  renderMuteButtons(): JSX.Element[] | undefined {
    if (!this.wavesurfer) return

    return this.state.channelGain.map((_, i) => {
      return (
        <span key={i.toString()}>
          <Button
            id={'mute-' + i}
            size="sm"
            outline
            onClick={() => this.muteChannel(i)}
            className={this.state.mutes.has(i) ? style.muteButtonActivated : ''}
          >
            M
          </Button>
          <UncontrolledTooltip placement="bottom" target={'mute-' + i}>
            Mute channel {i + 1}
          </UncontrolledTooltip>
        </span>
      )
    })
  }

  render(): JSX.Element | null {
    return (
      <Container>
        <div id="waveform" className={[style.waveform].join(' ')} />
        {this.renderPlayButton()}
        {this.renderMuteButtons()}
      </Container>
    )
  }
}
