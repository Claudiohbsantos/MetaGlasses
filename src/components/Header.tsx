import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Jumbotron } from 'reactstrap'

function Header(): JSX.Element {
  return (
    <Jumbotron className="text-center" style={{ backgroundColor: 'transparent' }}>
      <h1 className="display-4">MetaGlasses</h1>
      <p className="lead">Offline .wav file field recorder metadata scanner</p>
    </Jumbotron>
  )
}

export default Header
