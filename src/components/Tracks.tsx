import React, { MouseEvent } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { TrackWaveform } from './TrackWaveform'
import style from './Tracks.module.css'
import { Container, Row, Col } from 'reactstrap'
import { TrackMetadata } from '../modules/cleanMetadata'
import WaveSurfer from 'wavesurfer.js'

function unmuteChannel(players: WaveSurfer[], chI: number): void {
  players[chI].setMute(false)
  players[chI].setWaveColor('#999')
  players[chI].setProgressColor('#555')
  document.getElementById(`mute-btn-${chI}`)?.classList.remove(style['btn-muted'])
}

function muteChannel(players: WaveSurfer[], chI: number): void {
  players[chI].setMute(true)
  players[chI].setWaveColor('#f99')
  players[chI].setProgressColor('#f55')
  document.getElementById(`mute-btn-${chI}`)?.classList.add(style['btn-muted'])
}

function toggleMute(players: WaveSurfer[], chI: number): void {
  if (players[chI].getMute()) unmuteChannel(players, chI)
  else muteChannel(players, chI)
}

function soloChannel(players: WaveSurfer[], chI: number): void {
  players.forEach((_, i) => muteChannel(players, i))
  unmuteChannel(players, chI)
}

function Play({ players }: { players: WaveSurfer[] }): JSX.Element {
  return (
    <button className={style.btn} onClick={(): void => players.forEach((p) => p.playPause())}>
      play
    </button>
  )
}

function MuteTrack({ channel, players }: { channel: number; players: WaveSurfer[] }): JSX.Element {
  return (
    <button
      id={`mute-btn-${channel}`}
      className={style.btn}
      onClick={(): void => toggleMute(players, channel)}
    >
      M
    </button>
  )
}

function SoloTrack({ channel, players }: { channel: number; players: WaveSurfer[] }): JSX.Element {
  return (
    <button className={style.btn} onClick={(evt): void => soloChannel(players, channel)}>
      S
    </button>
  )
}

function Track({ track, players }: { track: TrackMetadata; players: WaveSurfer[] }): JSX.Element {
  return (
    <Container>
      <Row>
        <Col>
          {track.interleaveChannel} : {track.name} (track {track.recorderChannel}){' '}
          <MuteTrack channel={parseInt(track.interleaveChannel) - 1} players={players} />
          <SoloTrack channel={parseInt(track.interleaveChannel) - 1} players={players} />
        </Col>
      </Row>
    </Container>
  )
}

type TrackProps = {
  tracks?: TrackMetadata[]
  audioFile?: File
}

const Tracks = ({ tracks = [], audioFile }: TrackProps): JSX.Element | null => {
  if (!audioFile) return null

  const players: WaveSurfer[] = []

  const playHandler = (caller: WaveSurfer): void =>
    players.forEach((player: WaveSurfer) => {
      if (player !== caller) player.play()
    })

  const seekHandler = (pos: number): void =>
    players.forEach((player: WaveSurfer) => {
      const isPlaying = player.isPlaying()
      player.seekTo(pos)
      if (isPlaying) player.play()
    })

  const trackList = (track: TrackMetadata, totalTracks: number, audioFile: File): JSX.Element => (
    <Container key={'track-container' + track.interleaveChannel}>
      <Track track={track} players={players} />
      <TrackWaveform
        channel={parseInt(track.interleaveChannel)}
        channelNum={totalTracks}
        audioFile={audioFile}
        playHandler={playHandler}
        seekHandler={seekHandler}
        players={players}
      />
    </Container>
  )

  return (
    <Container>
      <Play players={players} />
      {tracks.map((track) => trackList(track, tracks.length, audioFile))}
    </Container>
  )
}

export default Tracks
