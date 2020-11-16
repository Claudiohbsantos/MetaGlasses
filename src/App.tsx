import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'
import Header from './components/Header'
import Loader from './components/Loader'
import MetadataTable from './components/MetadataTable'
import { Waveform } from './components/Waveform'
import Footer from './components/Footer'
import ErrorModal from './components/ErrorModal'
import { Container, Row, Col } from 'reactstrap'
import { getWavMetadata } from './modules/metadata-extractor'
import { cleaniXML, cleanBext, cleanFile, cleanFmt, BWFMetadata } from './modules/cleanMetadata'

type Props = {}

interface State {
  metadata: BWFMetadata
  loading: boolean
  audioFile?: File
  waveformIsReady: boolean
}

function isValidAudioFile(file: File): boolean {
  return /\.wav$/i.test(file.name)
}

class App extends React.Component<Props, State> {
  constructor(props: {}) {
    super(props)
    this.setWaveformReadiness = this.setWaveformReadiness.bind(this)
    this.handleDurationChange = this.handleDurationChange.bind(this)
    this.state = { loading: false, metadata: {}, waveformIsReady: false }
  }

  setWaveformReadiness(isReady: boolean): void {
    this.setState({ waveformIsReady: isReady })
  }

  finishLoadingIfWaveformReady(): void {
    setTimeout((): void => {
      if (this.state.waveformIsReady) {
        this.setState({ loading: false })
      } else {
        this.finishLoadingIfWaveformReady()
      }
    }, 500)
  }

  handleDurationChange(duration: number | undefined): void {
    this.setState({
      metadata: { ...this.state.metadata, ...{ duration } },
    })
  }

  handleFileSelected = (evt: Event): void => {
    const files = (evt.target as HTMLInputElement).files
    const file = files && files[0] ? files[0] : null
    if (!file) return
    if (!isValidAudioFile(file)) {
      alert(`${file.name} is not a valid sound file. Please pick a .wav file for analysis.`)
    } else {
      this.setState({ audioFile: file, loading: true })
      getWavMetadata(file)
        .then((data) => {
          this.setState({
            metadata: {
              ...cleanFmt(data.fmt),
              ...cleanBext(data.bext),
              ...cleaniXML(data.ixml),
              ...cleanFile(data.file),
            },
          })
          this.finishLoadingIfWaveformReady()
        })
        .catch((e) => {
          console.log('aborted', e)
          this.setState({ metadata: {}, loading: false })
        }) // TODO: alert user
    }
  }

  render(): JSX.Element {
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 8, offset: 2 }} className="text-center">
            <Header />
            <Loader handleFileSelected={this.handleFileSelected} loading={this.state.loading} />
            <Waveform
              key={this.state.audioFile?.name}
              audioFile={this.state.audioFile}
              channelNum={this.state.metadata.channelNum}
              setWaveformReadiness={this.setWaveformReadiness}
              handleDurationChange={this.handleDurationChange}
            />
            <MetadataTable metadata={this.state.metadata} />
            <Footer />
            {/* <ErrorModal buttonLabel="Hello" className="" /> */}
          </Col>
        </Row>
      </Container>
    )
  }
}

export default App
