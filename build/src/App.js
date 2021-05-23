import React, { Component } from "react";
import AuctionHouse from "./contracts/AuctionHouse.json";
import getWeb3 from "./getWeb3";

import { BrowserRouter as Router, Route } from "react-router-dom"

import { Col, Row, Container, Button } from 'react-bootstrap';
import LoadingButton from './components/LoadingButton'; 
import CustomNavbar from './components/CustomNavbar';
import Items from './components/Items';
import AddExhibit from "./components/AddAd";
import BecomeAuctioneer from "./components/BecomeAuctioneer";

const ether = 10**18;

class App extends Component {
  state = { accountBalance: 0, web3: null, accounts: null, contract: null, showAddAuction: false };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(accounts)

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionHouse.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionHouse.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  deposit5ETH = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.deposit_money().send({ from: accounts[0], value: 5*ether });
  }

  getBalance = async () => {
    const { accounts, contract } = this.state;
    const response = await contract.methods.get_balance().call({ from: accounts[0] });
    this.setState({ accountBalance: response / ether });
  }

  addExhibit = (exhibit) => {
    console.log(exhibit);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Router>
        <CustomNavbar brand="Blockchain Project"/>
        <Container fluid style={{width: "90%"}}>
          <Route path="/" exact render={(props) => (
            <>
              <Button variant="outline-secondary" onClick={() => this.setState({ showAddAuction: true})}>Click here</Button>
              {this.state.showAddAuction && <AddExhibit 
                onAdd={this.addExhibit} show={this.state.showAddAuction} 
                onClose={() => this.setState({ showAddAuction: false})}/>}
              <Row>
              <Items items={["First Item", "Second Item", "Third Item", "Fourth Item"]}/>
              </Row> 
              <Row>
                <LoadingButton variant="primary" style={{marginRight: '20px'}} text="Deposit 5ETH" onClick={this.deposit5ETH}/>
                <LoadingButton variant="primary" text="Show Balance" onClick={this.getBalance}/>
              </Row>
              <Col>
                <h2>
                  {!this.state.accountBalance ? "Not requested yet" : this.state.accountBalance}
                </h2>
              </Col>
            </>
          )} />
          <Route path="/owner" component={BecomeAuctioneer}/>
          
        </Container>
      </Router>
    );
  }
}

export default App;
