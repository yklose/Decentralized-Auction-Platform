import React from 'react'
import PropTypes from 'prop-types'

import { Image, Container, Row } from 'react-bootstrap'

import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai'
import LoadingButton from './LoadingButton'

// Component shown when site is routed to /login
const LoginPage = ({ setupAccount, isConnected }) => {
    // setupAccount - Function handling the account setup
    // isConnected - Boolean whether Web3 Connection has been established
    
    return (
        <Container>
            <h2 className="center-items">Sign in to your wallet</h2>
            <Image src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" width="25%" className="center-items" style={{margin: "auto"}}></Image>
            <Row className="center-items">
                <LoadingButton onClick={setupAccount} text="Connect to MetaMask wallet" variant="primary" size="lg"/>
                {isConnected ? 
                    <AiOutlineCheckCircle style={{ color: "green", height: "2.5rem", width: "2.5rem", margin: "auto 1rem"}}/> : 
                    <AiOutlineCloseCircle style={{ color: "red", height: "2.5rem", width: "2.5rem", margin: "auto 1rem" }}/>}
            </Row>
        </Container>
    )
}

LoginPage.propTypes = {
    setupAccount: PropTypes.func.isRequired,
}

export default LoginPage
