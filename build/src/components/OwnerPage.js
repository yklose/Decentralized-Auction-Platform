import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Button, Container, Row } from 'react-bootstrap'

import { AiOutlineUnlock } from 'react-icons/ai'
import { AddAuction } from "./index"

// Component shown when site is routed to /login
const OwnerPage = ({ addAuctionToDB, isConnected, contract, accounts }) => {
    // isConnected - Boolean whether Web3 Connection has been established
    const [showAddauction, setShowAddAuction] = useState(false)

    // Used to add Auction to blockchain
    const addAuction = async (auction) => {
        try {
            // First, create an identifier used for the auction
            let identifier = Math.floor(Math.random() * (Math.pow(2, 32) - 1))

            // Then, create an auction with the identifier
            // Listen to the events of the promise and log the TX hash and receipt
            await contract.methods.deploy_auction(identifier, auction.sealed).send({ from: accounts[0] })
            .on("transactionHash", (hash) => {
              console.log("The transaction hash is:", hash);
            })
            .on("receipt", (receipt) => {
              console.log("Here is the receipt:", receipt);
            })

            addAuctionToDB({identifier, ...auction})
            
        } catch(error) {
            alert(error.message)
        }
      }
    
    return (
        <Container>
            <h2 className="center-items">Use this secret site to create an auction as owner</h2>
            <Row className="center-items">
                <AiOutlineUnlock style={{ color: "grey", height: "20%", width: "20%", margin: "auto"}}/>
            </Row>
            <Row className="center-items">
                <Button onClick={() => setShowAddAuction(true)} variant="outline-secondary" disabled={!isConnected}>Add new Auction</Button>
                    {showAddauction && <AddAuction onAdd={(auction) => addAuction(auction)} 
                    show={showAddauction} onClose={() => setShowAddAuction(false)}/>}
            </Row>
        </Container>
    )
}

OwnerPage.propTypes = {
    addAuctionToDB: PropTypes.func.isRequired,
    isConnected: PropTypes.bool.isRequired,
    contract: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired,
}

export default OwnerPage
