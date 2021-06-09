import React from 'react';

import { Container, Card, CardDeck } from 'react-bootstrap';

// Component shown when site is routed to /sign-up
const Info = () => {

    return (
        <Container style={{ marginTop: "5rem" }}>

            <blockquote className="blockquote text-center">
                <p className="mb-0">Lorem Ipsum blabla. Maybe someone would liek to put something here. Doesn't have to, just in case anyone
                was bored currently.</p>
                <footer className="blockquote-footer">The founding team behind <cite title="Zothebys">Zothebys</cite></footer>
            </blockquote>

            <CardDeck style={{ marginTop: "5rem" }}>
                <Card border style={{ width: '18rem' }}>
                    <Card.Header className="text-center">O N E</Card.Header>
                    <Card.Body className="text-center">
                        <h5>Set up your wallet</h5>
                        Once you’ve set up your wallet of choice, connect it to Zothebys.
                    </Card.Body>
                </Card>
                <Card border style={{ width: '18rem' }}>
                    <Card.Header className="text-center">T W O</Card.Header>
                    <Card.Body className="text-center">
                        <h5>Look for interesting auctions</h5>
                        Browse through all available auctions.
                    </Card.Body>
                </Card>
                <Card border style={{ width: '18rem' }}>
                    <Card.Header className="text-center">T H R E E</Card.Header>
                    <Card.Body className="text-center">
                        <h5>Participate</h5>
                        Have you found a space you like? Time to start bidding on it
                    </Card.Body>
                </Card>
            </CardDeck>
        </Container>
    )
}

export default Info

