import React, { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const ErrorModal = (props: { buttonLabel: string; className: string }): JSX.Element => {
  const { buttonLabel, className } = props

  const [modal, setModal] = useState(false)

  const toggle = (): void => setModal(!modal)

  return (
    <div>
      <Button color="danger" onClick={toggle}>
        {buttonLabel}
      </Button>
      <Modal isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle}>Error</ModalHeader>
        <ModalBody>MetaGlasses failed to analyse the provided file</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default ErrorModal
