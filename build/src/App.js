import React, { Component } from 'react';
import AuctionHouse from './contracts/AuctionHouse.json';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Web3 from "web3"

import { auctions as temp_auctions } from "./db.json";
import CustomNavbar from './components/CustomNavbar';
import { StartPage, LoginPage, Info, BrowseAll, OwnerPage, AuctionPage } from './components/index';

class App extends Component {
  state = { 
    web3: null, 
    accounts: [null], 
    contract: {}, 
    isConnected: false,
    auctions: [],
  };

  setupAccount = async (accounts) => {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
              
      // Use web3 to get the user's accounts, if no accounts are specified
      if(accounts === undefined) {
        accounts = await web3.eth.getAccounts();
      }
          
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionHouse.networks[networkId];
      const instance = new web3.eth.Contract(AuctionHouse.abi, deployedNetwork && deployedNetwork.address);
      
      // Set web3, accounts, and contract to the state
      this.setState({ web3, accounts, contract: instance, isConnected: true });
      sessionStorage.setItem("accounts", accounts);
      return true;

    // Catch any errors for any of the above operations.
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  fetchAuctionData = async () => {
    // Not implemented yet
    const res = await fetch('http://localhost:5000/')
    const data = await res.json()
    console.log("The following data was fetched from the server", data)
    if(data.length === 0) {
      return temp_auctions
    }
    return data
  }

  addAuction = async ({item, description, img, sealed}) => {

    const res = await fetch('http://localhost:5000/auction/', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        item: item,
        description: description,
        sealed: sealed
      }),
    })

    const data = await res.json()
    this.setState({ auctions: [...this.state.auctions, data] })
  }

  componentDidMount = async () => {
    // Fetch Exhibit Data from Endpoint
    await this.fetchAuctionData().then((auctions_data) => {
      this.setState({ auctions: auctions_data });
    })

    // Get accounts from session storage
    const accounts = sessionStorage.getItem("accounts")
    if(accounts !== null) {
      console.log("Account loaded from session storage", accounts);
      this.setupAccount([accounts])
    }
    
  }

  render() {
    return (
      <Router>
        <CustomNavbar brand="Zothebys" setupExchange={this.setupAccount.bind(this)} accounts={this.state.accounts} isConnected={this.state.isConnected}/>
        <Route path="/" exact render={() => (
          <StartPage {...this.state}/>
        )} />
        <Route path="/browse-all" exact render={() => (
          <BrowseAll {...this.state}/>
        )} />
        <Route path="/info" render={() => (
          <Info />
        )} />
        <Route path="/login" render={() => (
          <LoginPage setupAccount={this.setupAccount} isConnected={this.state.isConnected}/>
        )} />
        <Route path="/owner" render={() => (
          <OwnerPage {...this.state} addAuction={this.addAuction}/>
        )} />
        <Route path="/auctions/:identifier" render={routeProps => (
          <AuctionPage {...this.state} {...routeProps}/>
        )} />


      </Router>
    );
  }
}

export default App;
