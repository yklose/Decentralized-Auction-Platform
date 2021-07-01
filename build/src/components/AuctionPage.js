import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { run as runHolder } from 'holderjs/holder';
import { Container, Row, Col, Image, Button, Alert, FormControl, InputGroup, Spinner } from 'react-bootstrap';

import { Card } from 'react-bootstrap'

const ether = 10**18;

const AuctionPage = ({ web3, contractSocket, auctions, contract, match, accounts }) => {
	// items - Array with all the items to display
	//NOTE: Currently only a placeholder item is displayed
	const [auction, setAuction] = useState({})
	const [highestBid, setHighestBid] = useState("Please connect with a wallet to see the highest bid")
	const [endtime, setEndtime] = useState("0")
	const [loadEndtime, setLoadEndtime] = useState(false)
	const [canBid, setCanBid] = useState(false)
	const [idx, setIdx] = useState(undefined)
	const [userBid, setUserBid] = useState(0)
	const [isActive, setIsActive] = useState(false)
	const [winner, setWinner] = useState(null)

	// Renders the temp picture
	useEffect(() => {
		runHolder("auction-holder-image")
	})

	// Get idx and auction data based on identifier
	useEffect(() => {
		const fetch_auction_idx = async (identifier) => {
			if(accounts[0] !== null && Object.keys(contract).length !== 0) {
				try {
					contract.methods.get_idx_from_identifier(identifier).call()
					.then((cid) => setIdx(cid))
				} catch(error) {
					console.log(error)
				}	
			}
		}

		const fetch_auction_data = async (identifier) => {

			let auction_arr = auctions.filter((e) => e.identifier === parseInt(identifier))
			if(auction_arr.length !== 0) {
				setAuction(auction_arr[0])
			} else {
				setAuction({item: "Unnamed auction", description: "Unnamed Artist", img: "holder.js/500x500", sealed: false})
			}
		}
		fetch_auction_idx(match.params.identifier)
		fetch_auction_data(match.params.identifier)
	}, [match, auctions, accounts, contract]);

	// Gets the auction information saved on-chain
	useEffect(() => {
		if(accounts[0] !== null && Object.keys(contract).length !== 0 && idx !== undefined) {
			console.log("Auction identifier:", idx)
			contract.methods.get_highest_bid(idx).call()
			.then((bid) => setHighestBid(bid));
			
			contract.methods.get_endtime(idx).call()
			.then((end) => setEndtime(end));

			contract.methods.get_deposit_balance(idx).call({ from: accounts[0] })
			.then((deposit) => setCanBid(parseInt(deposit) >= 5*ether));

		}

	}, [idx, contract, accounts])

	//Listens to the BidEvents
	useEffect(() => {
		if(contractSocket !== undefined && idx !== undefined && endtime > 0) {
			contractSocket.events.BidEvent({
				filter: {idx: idx}, 
				fromBlock: 0
				}, (err, event) => {
					if(err !== null) {
						console.error("Event error: ", err);
					} else {
						setHighestBid(event.returnValues.value)
						setIsActive(event.returnValues.blockNr < endtime)
						console.log("BidEvent", event.returnValues)
					}
			})
		}
	}, [contractSocket, endtime, idx])

	//Gets the winner when the endtime has passed
	useEffect(() => {
		if(web3 !== null && Object.keys(contract).length !== 0 && endtime !== "0" && idx !== undefined) {
			web3.eth.getBlockNumber()
			.then((blockNr) => {
				if(blockNr >= endtime) {
					setIsActive(false)
					contract.methods.get_winner(idx).call()
					.then((res) => setWinner(res.winner))
					// fetch(`http://localhost:5000/auction/${match.params.identifier}/endOpen`, {method:"POST"})
					// .then((res) => {
					// 	res.json().then(async (res) => {
					// 		console.log(res)
					// 	})
					// })
				}
			})
		}
	}, [match, web3, endtime, contract, idx])

	const setBid = async () => {
		// Function can only be executed properly if an account is connected
		if(accounts[0] !== null && Object.keys(contract).length !== 0) {
			try {
				// Set the bid according to the input
				await contract.methods.set_bid(idx, userBid).send({ from: accounts[0] })
			} catch(error) {
				const msg = JSON.parse(error.message.split("'")[1]);
				console.log(msg.value.data.message)
				alert(msg.value.data.message)
			}
		}
	}

	const depositMoney = async () => {
		if(idx !== undefined) {
			try {
				await contract.methods.deposit_money(idx).send({ from: accounts[0], value: 5*ether })
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

	const refundDeposit = async () => {
		if(idx !== undefined) {
			try {
				await contract.methods.refund_deposit(idx).send({ from: accounts[0] })
				.on("receipt", (receipt) => {
					console.log("Here is the receipt:", receipt);
				});
				setCanBid(false)
			} catch(error) {
				const msg = JSON.parse(error.message.split("'")[1]);
				console.log(msg.value.data.message)
				alert(msg.value.data.message)
			}
		}
	}

	const startAuction = async () => {
		fetch(`http://localhost:5000/auction/${match.params.identifier}/start`, {method:"POST"})
		.then((res) => {
			res.json().then(async (res) => {
				console.log("The following auction was started", res)
				setIsActive(true);
				var end = "0";
				setLoadEndtime(true);
				while(end === "0") { end = await contract.methods.get_endtime(idx).call() }
				setLoadEndtime(false)
				setEndtime(end)
			})
		});
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

					<Card border={isActive && winner === null ? "success" : "danger" } className="center-items">
						<Card.Header>Bidding information</Card.Header>
						<Card.Body>
							<p>{"Highest Bid: " + highestBid}</p>
							<p className="center-items">Endtime: 
								<span style={{marginLeft: "5px"}}>
									{loadEndtime ? (
										<Spinner animation="border" variant="secondary" size="sm" as="span"/>
									) : winner !== null ? "Auction has ended" : isActive ? endtime : "Auction hasn't started yet" }
								</span>
							</p>
							<hr />
							{canBid ? isActive ? ( <Row className="center-items">
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
									This auction is not currently active
								</Alert>
								<Button style={{width: "50%"}} variant="outline-secondary" size="lg" 
									onClick={refundDeposit} disabled={accounts[0] === null}>
										Refund Deposit
								</Button>
							</ > ) : ( <>
								<Alert variant="warning" style={{width: "80%", margin: "1rem auto"}}>
									{ winner !== null ? "This auction has ended" : "In order to participate you need a security deposit!" }
								</Alert>
								<Button style={{width: "50%"}} variant="outline-secondary" size="lg" 
									onClick={depositMoney} disabled={accounts[0] === null || winner !== null}>
										Deposit Money
								</Button>
							</> )}
							{ winner !== null ? ( <>
								<hr />
								<p>{"Winner: " + winner}</p>
							</>) : ( <> </>)}							
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