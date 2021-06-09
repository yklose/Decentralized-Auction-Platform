import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { run as runHolder } from 'holderjs/holder';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';

import { FaEthereum } from "react-icons/fa";
import { Card } from 'react-bootstrap'

const ether = 10**18;

const AuctionPage = ({ auctions, isConnected, contract, match, accounts }) => {
	// items - Array with all the items to display
	//NOTE: Currently only a placeholder item is displayed
	const [auction, setAuction] = useState({})
	const [highestBid, setHighestBid] = useState("Please connect with a wallet to see the highest bid")
	const [owner, setOwner] = useState("Please connect with a wallet to see the Owner")
	const [endtime, setEndtime] = useState("Please connect with a wallet to see the endtime")

	useEffect(() => {

		const fetch_auction_idx = async (identifier) => {
			let idx = [undefined];
			if(isConnected && Object.keys(contract).length !== 0) {
				idx = await contract.methods.get_idx_from_identifier(identifier).call();
				fetch_auction_bid(idx)
			}
		}

		const fetch_auction_data = async (identifier) => {
			
			let auction_arr = auctions.filter((e) => e.identifier === identifier)
			if(auction_arr.length !== 0) {
				setAuction(auction_arr[0])
				runHolder("auction-holder-image")
			} else {
				setAuction({item: "Unnamed auction", description: "Unnamed Artist", img: "holder.js/500x500", sealed: false})
				runHolder("auction-holder-image")
			}
		}

		const fetch_auction_bid = async (identifier) => {
			if(isConnected && Object.keys(contract).length !== 0) {
				console.log(identifier)
				let highest = await contract.methods.get_highest_bid(identifier).call();
				let endtime = await contract.methods.get_endtime(identifier).call();
				let owner = await contract.methods.get_owner(identifier).call();
				setHighestBid(highest[0]);
				setOwner(owner[0]);
				setEndtime(endtime[0]);
			} else {
				setHighestBid("Please connect with a wallet to see the bid")
				setOwner("Please connect with a wallet to see the owner")
				setEndtime("Please connect with a wallet to see the partner")
			}
		}
		
		fetch_auction_data(parseInt(match.params.identifier))
		fetch_auction_idx(match.params.identifier)

	}, [match, auctions, contract, isConnected])

	const setBid = async () => {
		// Function can only be executed properly if an account is connected
		if(isConnected && Object.keys(contract).length !== 0) {
			try {
				// Send the transaction to the smart contract and log the transaction
				await contract.methods.rentPartnership(match.params.identifier).send({ from: accounts[0], value: 1 })
				.on("transactionHash", (hash) => {
				  console.log("The transaction hash is:", hash);
				})
				.on("receipt", (receipt) => {
				  console.log("Here is the receipt:", receipt);
				});
				// Set the new Partner
				setEndtime(accounts[0])
			} catch(error) {
				const msg = JSON.parse(error.message.split("'")[1]);
				console.log(msg.value.data.message)
				alert(msg.value.data.message)
			}
		}
	}

	return (
		<Container style={{ maxWidth: "90%", marginTop: "1rem" }}>
			<Row>
				<Col xs="6" className="center-items">
					<Image src={auction.img} className="auction-holder-image" rounded style={{margin: "auto"}} />
				</Col>
				<Col xs={{span: 4, offset: 1}} style={{ margin: "auto", color: "grey" }} className="text-center">
					<h1>{auction.item}</h1>
					<h5 style={{marginTop: "2rem"}}>{auction.description}</h5>
					<h2 style={{marginBottom: "2rem"}}>{auction.sealed ? "This is a sealed auction" : "This is an open auction" }</h2>

					<Card border="success" className="center-items">
						<Card.Header>Bidding information</Card.Header>
						<Card.Body>
							<p>{"Highest Bid: " + highestBid}</p>
							<p>{"Owner: " + owner}</p>
							<p>{"Endtime: " + endtime}</p>
							<Button style={{width: "50%"}} variant="outline-secondary" size="lg" 
								onClick={setBid} disabled={!isConnected && accounts[0] !== owner}>
								Set a bid
							</Button>							
						</Card.Body>
						
					</Card>
				</Col>
			</Row>
		</Container>
	)
}

AuctionPage.propTypes = {
	match: PropTypes.object.isRequired,
}

export default AuctionPage