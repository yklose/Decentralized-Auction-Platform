import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, InputGroup, Modal, Button } from 'react-bootstrap'

const AddAd = ({ onAdd, onClose, show }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [img, setImg] = useState('')
    const [price, setPrice] = useState(0)

    const onSubmit = (e) => {
        e.preventDefault()
        if (!name || !price) {
            alert("Please make sure that a price and name are specified")
            return
        }

        onAdd({ name, description, img, price})
    }

    return (
        <Modal onHide={onClose} centered show={show} >
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton><h3>Add a new Auction</h3></Modal.Header>
                <Modal.Body style={{padding: "2rem"}}>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Mathe Toiletten" onChange={(e) => setName(e.target.value)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" placeholder="Best ad spot @ TU" 
                                onChange={(e) => setDescription(e.target.value)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Starting Bid</Form.Label>
                            <InputGroup>
                                <Form.Control type="number" placeholder="20" onChange={(e) => setPrice(e.target.value)}/>
                                <InputGroup.Append>
                                    <InputGroup.Text>€</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form.Group>      
                        <Form.Group>
                            <Form.Label>Upload an image</Form.Label>
                            <Form.File id="custom-file" label="Image" custom onChange={(e) => setImg(e.target.value)}/>
                        </Form.Group>      
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" type="submit">Submit</Button>
                </Modal.Footer>
            </Form>
            
        </Modal>
    )
}

AddAd.propTypes = {
    onAdd: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
}

export default AddAd
