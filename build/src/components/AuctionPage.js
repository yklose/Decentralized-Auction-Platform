import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { run as runHolder } from 'holderjs/holder';
import { Container, Row, Col, Image, Button, Alert, FormControl, InputGroup } from 'react-bootstrap';

import { Card } from 'react-bootstrap'

const ether = 10**18;

const AuctionPage = ({ web3, auctions, contract, match, accounts }) => {
	// items - Array with all the items to display
	//NOTE: Currently only a placeholder item is displayed
	const [auction, setAuction] = useState({})
	const [highestBid, setHighestBid] = useState("Please connect with a wallet to see the highest bid")
	const [endtime, setEndtime] = useState("Please connect with a wallet to see the Endtime")
	const [canBid, setCanBid] = useState(false)
	const [idx, setIdx] = useState(undefined)
	const [userBid, setUserBid] = useState(0)
	const [isActive, setIsActive] = useState(false)
	const [doUpdate, setdoUpdate] = useState(0)

	useEffect(() => {

		const fetch_auction_idx = async (identifier) => {
			let idx = [undefined];
			if(accounts[0] !== null && Object.keys(contract).length !== 0) {
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

		const fetch_auction_bid = async (identifier) => {

			setIdx(identifier)
			console.log("Auction identifier:", identifier)
			await contract.methods.get_highest_bid(identifier).call()
			.then((bid) => setHighestBid(bid));

			const end = await contract.methods.get_endtime(identifier).call()
			setEndtime(end)

			await web3.eth.getBlockNumber()
			.then((blockNumber) => setIsActive((blockNumber < end) && (end !== 0)))

			await contract.methods.get_deposit_balance(identifier).call({ from: accounts[0] })
			.then((deposit) => setCanBid(parseInt(deposit) >= 5*ether));
		}
		if(web3 !== null) {
			web3.eth.getBlockNumber().then(console.log);
		}
		fetch_auction_data(parseInt(match.params.identifier))
		fetch_auction_idx(match.params.identifier)

		runHolder("auction-holder-image")

	}, [match, auctions, contract, accounts, web3, doUpdate])

	const setBid = async () => {
		// Function can only be executed properly if an account is connected
		if(accounts[0] !== null && Object.keys(contract).length !== 0) {
			try {
				// Send the transaction to the smart contract and log the transaction
				await contract.methods.set_bid(idx, userBid).send({ from: accounts[0] })
				.on("transactionHash", async (hash) => {
				  console.log("The transaction hash is:", hash);
				  if(hash.blockNumber > endtime+1) {
					  setIsActive(false);
					  var res = await fetch(`http://localhost:5000/auction/${match.params.identifier}/endOpen`, {method:"POST"})
					  res.json().then(console.log)
				  }
				})
				.on("receipt", (receipt) => {
				  console.log("Here is the receipt:", receipt);
				});
				await contract.methods.get_highest_bid(idx).call()
				.then((result) => setHighestBid(result))

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

	const startAuction = async () => {
		contract.methods.get_winner(idx).call().then(console.log)
		var res = await fetch(`http://localhost:5000/auction/${match.params.identifier}/endOpen`, {method:"POST"})
		res.json().then(console.log)
		// var res = await fetch(`http://localhost:5000/auction/${match.params.identifier}/start`, {method:"POST"})
		// res.json()
		// .then((res) => {
		// 	console.log("The following auction was started", res)
		// 	setdoUpdate(res.identifier)
		// });
	}

	return (
		<Container style={{ maxWidth: "90%", marginTop: "1rem" }}>
			<Button style={{position: "absolute", left: 0, top: "4em", backgroundColor: "white", border: "none"}}
				onClick={startAuction}>
				Start Auction</Button>
			<Row>
				<Col xs="6" className="center-items">
					<Image src={auction.img === undefined ? "holder.js/100px160" : auction.img} className="auction-holder-image" rounded style={{margin: "auto"}} />
				</Col>
				<Col xs={{span: 4, offset: 1}} style={{ margin: "auto", color: "grey" }} className="text-center">
					<h1>{auction.item}</h1>
					<h5 style={{marginTop: "2rem"}}>{auction.description}</h5>
					<h2 style={{marginBottom: "2rem"}}>{auction.sealed ? "This is a sealed auction" : "This is an open auction" }</h2>

					<Card border={isActive ? "success" : "danger" } className="center-items">
						<Card.Header>Bidding information</Card.Header>
						<Card.Body>
							<p>{"Highest Bid: " + highestBid}</p>
							<p>{"Endtime: " + (isActive ? endtime : "Not started")}</p>
							<hr />
							{isActive ? (<></>) : (
								<Alert variant="warning" style={{width: "80%", margin: "1rem auto"}} dismissible>
									This auction hasn't started yet
								</Alert>
							)}
							{canBid ? ( <Row className="center-items">
								<InputGroup style={{width: "30%"}}>
									<FormControl placeholder="Bid" size="lg" onChange={(e) => setUserBid(e.target.value)}/>
									<InputGroup.Append>
										<InputGroup.Text>€</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>
								<Button style={{width: "50%", marginLeft: "1em" }} variant="outline-secondary" size="lg" 
									onClick={setBid} disabled={accounts[0] === null}>
									Set a bid
								</Button>
							</Row>) : ( <>
								<Alert variant="warning" style={{width: "80%", margin: "1rem auto"}}>
									In order to participate you need a security deposit!
								</Alert>
								<Button style={{width: "50%"}} variant="outline-secondary" size="lg" 
									onClick={deposit_money} disabled={accounts[0] === null}>
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