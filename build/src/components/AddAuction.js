import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Modal, Button } from 'react-bootstrap'

// Modal shown when the Add Exhibit Button is clicked
const AddAuction = ({ onAdd, onClose, show }) => {
    // onAdd - the function that should be called when submit button is presses
    // onClose - the function that should be called when modal is closed
    // show - bool, defines whether modal is shown or not

    const [item, setItem] = useState("")
    const [description, setDescription] = useState('')
    const [sealed, setSealed] = useState(false)
    const [img, setImg] = useState('')

    // When form is submitted, call the onAdd Function, if item and sealed are filled in
    const onSubmit = (e) => {
        e.preventDefault()
        if (!item || !description) {
            alert("Please make sure that a description and item are specified")
            return
        }
        onClose();
        onAdd({ item, description, img, sealed });
    }

    return (
        <Modal onHide={onClose} centered show={show} >
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton><h3>Add a new Exhibit</h3></Modal.Header>
                <Modal.Body style={{padding: "2rem"}}>
                        <Form.Group>
                            <Form.Label>Name of auction</Form.Label>
                            <Form.Control type="text" placeholder="Name" onChange={(e) => setItem(e.target.value)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" as="textarea" placeholder="Very nice auction. Must bid" 
                                onChange={(e) => setDescription(e.target.value)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check type="checkbox" label="Sealed auction" onChange={(e) => setSealed(e.target.checked)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Specify an Image</Form.Label>
                            <Form.Control type="text" placeholder="URL to Image" onChange={(e) => setImg(e.target.value)}/>
                        </Form.Group>    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" type="submit">Submit</Button>
                </Modal.Footer>
            </Form>
            
        </Modal>
    )
}

AddAuction.propTypes = {
    onAdd: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
}

export default AddAuction
