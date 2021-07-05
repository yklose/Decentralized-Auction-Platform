import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import sothebys from './images/Sothebys.svg'
import { Link } from 'react-router-dom';

import { Container, Row, Button, Image, Col, FormControl } from 'react-bootstrap';
import { Items } from './index';

// Component shown when site is not routed anywhere
const StartPage = ({ auctions }) => {
    // exhibits: should be fetched by DB query, the exhibits currently available

    return (
        <Container style={{maxWidth: "90%"}}>
            <Row style={{marginTop: "1.5rem"}}>

                <Image src={sothebys} fluid className="login-holder-image" style={{width: "80%", margin: "auto"}}/>
                <Col className="col-md-12 text-right" style={{transform: "translateY(-3.5rem)", marginBottom: "-2rem"}}>
                    <Link to="/info">
                        <Button variant="outline-secondary" size="lg"> More Info </Button>
                    </Link>
                </Col>
            </Row>
            <Row className="justify-content-between" style={{padding: "0 1.5rem"}}>
                <FormControl style={{color: "gray", width: "15%"}} type="text" placeholder="Explore"/>
                <Link to="/browse-all">
                    <Button variant="outline-secondary">Browse All</Button>
                </Link>
            </Row>
            <hr style={{marginTop: "0.5rem"}}/>
            <Items items={auctions.filter((e, index) => index<4)}/>
        </Container>
    )
}

StartPage.propTypes = {
    auctions: PropTypes.array.isRequired,
}

export default StartPage
