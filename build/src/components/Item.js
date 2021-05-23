import React from 'react'

import { Card, Button } from 'react-bootstrap'
import { BsFillEggFill } from 'react-icons/bs'

const Item = () => {
    return (
        <Card style={{ width: '100%' }}>
            <Card.Body>
                <BsFillEggFill/>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                    Some quick example text to build on the card title and make up the bulk of
                    the card's content.
                </Card.Text>
                <Button variant="primary">Go somewhere</Button>
            </Card.Body>
        </Card>
    )
}

export default Item
