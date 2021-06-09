import React from 'react'
import PropTypes from 'prop-types'

import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'

import { RiAccountCircleLine } from 'react-icons/ri'

// Navbar which is always shown on top of the screen
const CustomNavbar = ({ brand, accounts, isConnected }) => {
    // brand - Name shown on the top left
    // account: provided by web3 - the wallet currently connected
    // isConnected: provided by App.js - whether an account is currently connected

    return (
        <Navbar bg="light" expand="lg">
            <Link to="/">
                <Navbar.Brand>{brand}</Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Link to="/login" className="nav-link">Connect your wallet</Link>
                </Nav>
            </Navbar.Collapse>
            <Navbar.Text style={{marginRight: "1rem"}}>
                { isConnected ? "Connected as: " + accounts[0] : "Not connected" }
            </Navbar.Text>
            <Link  to={ isConnected ? "/owner" : "/login"}>
                <RiAccountCircleLine style={{ color: "grey", height: "2rem", width: "2rem"}}/>
            </Link>
        </Navbar>
    )
}

CustomNavbar.propTypes = {
    brand: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

export default CustomNavbar
