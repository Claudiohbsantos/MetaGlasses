import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Button, Spinner } from 'reactstrap'

type Props = { handleFileSelected: (evt: Event) => void; loading: boolean }

type State = {}

class Loader extends React.Component<Props, State> {
  fileSelector: HTMLInputElement | undefined

  buildFileSelector(): HTMLInputElement {
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.setAttribute('tabindex', '-1')
    fileSelector.addEventListener('change', this.props.handleFileSelected)
    return fileSelector
  }

  componentDidMount(): void {
    this.fileSelector = this.buildFileSelector()
  }

  handleFileSelect = (e: React.MouseEvent): void => {
    e.preventDefault()
    this.fileSelector?.click()
  }

  render(): JSX.Element {
    const spinner = <Spinner color="secondary" />

    const button = (
      <Button outline color="secondary" onClick={this.handleFileSelect}>
        Scan local file
      </Button>
    )

    return <div style={{ height: '100px' }}>{this.props.loading ? spinner : button}</div>
  }
}

export default Loader
