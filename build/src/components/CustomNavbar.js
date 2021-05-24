import React from 'react'

import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'
import Web3Connect from './Web3Connect';

const CustomNavbar = ({ brand }) => {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand>{brand}</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Link to="/" className="nav-link">Browse Auctions</Link>
                    <Link to="/owner" className="nav-link">Apply as an Auctioneer</Link>
                    <Web3Connect />
                </Nav>
            </Navbar.Collapse>
            </Navbar>
    )
}

export default CustomNavbar
