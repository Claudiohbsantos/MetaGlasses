import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import style from './MetadataTable.module.css'
// import { Table, Collapse, Button, CardBody, Card } from 'reactstrap'
import { Container, Row, Col } from 'reactstrap'
import { BWFMetadata } from '../modules/cleanMetadata'

// const expandIcon = (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
//     <path d="M0 0h24v24H0z" fill="none" />
//     <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
//   </svg>
// )
// const collapseIcon = (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
//     <path d="M0 0h24v24H0z" fill="none" />
//     <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
//   </svg>
// )

function objIsEmpty<T extends object>(obj: T): boolean {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

function entry(tag: string, value?: string): JSX.Element {
  return (
    <Col className={style.entry + ' ' + (!value ? style.disabled : '')}>
      <span className={style.metadataTag}>{`${tag}:`}</span> <span>{value || ''}</span>
    </Col>
  )
}

type MetadataTableState = {
  isOpen: boolean
}

function formCircledValue(isCircled: boolean | undefined): string {
  if (isCircled === undefined) return ''
  return isCircled ? 'Yes' : 'No'
}

class MetadataTable extends React.Component<{ metadata: BWFMetadata }, MetadataTableState> {
  render(): JSX.Element | null {
    const md = this.props.metadata

    if (!objIsEmpty(md)) {
      return (
        <Container className={[style.metadataTable].join(' ')}>
          <Row>{entry('Filename', md.filename)}</Row>
          <Row>{entry('Original Filename', md.originalFilename)}</Row>
          <Row>
            {entry('Size', `${md.size ? (md.size / 1048576).toFixed(2) + ' MB' : ''}`)}
            {entry('Length', `${md.duration ? md.duration.toFixed(2) + ' s' : ''}`)}
          </Row>
          <Row>
            {entry('Date', md.dateCreated)}
            {entry('Time', md.timeCreated)}
          </Row>
          {/* divider */}
          <Row>
            {entry('Project', md.project)}
            {entry('Tape', md.tape)}
          </Row>
          <Row>
            {entry('Scene', md.scene)}
            {entry('Take', md.take)}
          </Row>
          <Row>
            {entry('Bit Depth', md.bitDepth)}
            {entry('Sample Rate', md.sampleRate)}
          </Row>
          <Row>{entry('Framerate', md.framerate)}</Row>
          <Row>
            {entry('Timecode start', md.timecode)}
            {entry('Userbits', md.userbits)}
          </Row>
          <Row>
            {entry('Tracks', md.tracks?.map((t) => `${t.interleaveChannel}:${t.recorderChannel}:${t.name}`).join('\n'))}
          </Row>
          <Row>{entry('Circled', formCircledValue(md.circled))}</Row>
          <Row>{entry('Notes', md.note)}</Row>
        </Container>
      )
    } else {
      return null
    }
  }
}

export default MetadataTable
