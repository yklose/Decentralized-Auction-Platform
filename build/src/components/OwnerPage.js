import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Button, Container, Row } from 'react-bootstrap'

import { AiOutlineUnlock } from 'react-icons/ai'
import { AddAuction } from "./index"

// Component shown when site is routed to /login
const OwnerPage = ({ addAuction, isConnected}) => {
    // isConnected - Boolean whether Web3 Connection has been established
    const [showAddauction, setShowAddAuction] = useState(false)

    return (
        <Container>
            <h2 className="center-items">Use this secret site to create an auction as owner</h2>
            <Row className="center-items">
                <AiOutlineUnlock style={{ color: "grey", height: "20%", width: "20%", margin: "auto"}}/>
            </Row>
            <Row className="center-items">
                <Button onClick={() => setShowAddAuction(true)} variant="outline-secondary" disabled={!isConnected}>Add new Auction</Button>
                    {showAddauction && <AddAuction onAdd={addAuction} 
                    show={showAddauction} onClose={() => setShowAddAuction(false)}/>}
            </Row>
        </Container>
    )
}

OwnerPage.propTypes = {
    addAuction: PropTypes.func.isRequired,
    isConnected: PropTypes.bool.isRequired,
}

export default OwnerPage
