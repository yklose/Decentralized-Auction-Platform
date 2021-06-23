import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { run as runHolder } from 'holderjs/holder';
import { Container, Row, Col, Image, Button, Alert } from 'react-bootstrap';

import { Card } from 'react-bootstrap'

const ether = 10**18;

const AuctionPage = ({ auctions, isConnected, contract, match, accounts }) => {
	// items - Array with all the items to display
	//NOTE: Currently only a placeholder item is displayed
	const [auction, setAuction] = useState({})
	const [highestBid, setHighestBid] = useState("Please connect with a wallet to see the highest bid")
	const [owner, setOwner] = useState("Please connect with a wallet to see the Owner")
	const [endtime, setEndtime] = useState("Please connect with a wallet to see the endtime")
	const [canBid, setCanBid] = useState(false)
	const [idx, setIdx] = useState(undefined)

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
			} else {
				setAuction({item: "Unnamed auction", description: "Unnamed Artist", img: "holder.js/500x500", sealed: false})
			}
		}
		
		fetch_auction_data(parseInt(match.params.identifier))
		fetch_auction_idx(match.params.identifier)

		runHolder("auction-holder-image")

	}, [match, auctions, contract, isConnected, accounts])

	const fetch_auction_bid = async (identifier) => {
		if(isConnected && Object.keys(contract).length !== 0) {
			setIdx(identifier)
			console.log("Auction identifier:", identifier)
			let highest = await contract.methods.get_highest_bid(identifier).call();
			let endtime = await contract.methods.get_endtime(identifier).call();
			let owner = await contract.methods.get_owner(identifier).call();
			let deposit = await contract.methods.get_deposit_balance(identifier).call({ from: accounts[0] });
			console.log(deposit)
			setCanBid(parseInt(deposit) >= 5*ether);
			console.log(canBid)
			setHighestBid(highest[0]);
			setOwner(owner[0]);
			setEndtime(endtime[0]);
		}
	}

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
				fetch_auction_bid(idx)
			} catch(error) {
				const msg = JSON.parse(error.message.split("'")[1]);
				console.log(msg.value.data.message)
				alert(msg.value.data.message)
			}
		}
	}

	const deposit_money = async () => {
		if(idx !== undefined) {
			try {
				await contract.methods.deposit_money(idx).send({ from: accounts[0], value: 5*ether })
				.on("transactionHash", (hash) => {
					console.log("The transaction hash is:", hash);
				})
				.on("receipt", (receipt) => {
					console.log("Here is the receipt:", receipt);
				});
				// User is now able to 
				setCanBid(true)
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
					<Image src={auction.img === undefined ? "holder.js/100px160" : auction.img} className="auction-holder-image" rounded style={{margin: "auto"}} />
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
							<hr />
							{canBid ? (
								<Button style={{width: "50%"}} variant="outline-secondary" size="lg" 
									onClick={setBid} disabled={!isConnected && accounts[0] !== owner}>
									Set a bid
								</Button>
							) : ( <>
								<Alert variant="warning" style={{width: "fit-content", margin: "1rem auto"}}>
									In order to participate you need a security deposit!
								</Alert>
								<Button style={{width: "50%"}} variant="outline-secondary" size="lg" 
									onClick={deposit_money} disabled={!isConnected && accounts[0] !== owner}>
										Deposit Money
								</Button>
							</> )}							
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