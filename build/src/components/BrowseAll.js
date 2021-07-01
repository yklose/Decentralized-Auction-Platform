import React from 'react'
import PropTypes from 'prop-types'

import { Container, FormControl, Row } from 'react-bootstrap'
import { Items } from "./index"

// Component shown when site is routed to /browse-all
const BrowseAll = ({ auctions }) => {
    // auctions: should be fetched by DB query, the exhibits currently available

    return (
        <Container style={{maxWidth: "90%"}}>
            <Row className="justify-content-between" style={{padding: "1rem 1.5rem 0rem 1.5rem"}}>
                <FormControl style={{color: "gray", width: "15%"}} type="text" placeholder="Explore"/>
            </Row>
            <hr style={{marginTop: "0.5rem"}}/>
            <Items items={auctions}/>
        </Container>
    )
}

BrowseAll.propTypes = {
    auctions: PropTypes.array.isRequired,
}

export default BrowseAll
