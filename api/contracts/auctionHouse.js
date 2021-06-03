const ganache = require('ganache-core');
const Web3 = require('web3');

var queryable = require('queryable');
var db = queryable.open('auctionhouse.db');

contract = {}

//contract.web3 = new Web3(ganache.provider());
const provider = new Web3.providers.WebsocketProvider(
    "ws://127.0.0.1:8545"
  );
contract.web3 = new Web3(provider);


// I need to read the json into node
var fs = require('fs');
contract.AuctionHouse = JSON.parse(fs.readFileSync("../build/src/contracts/AuctionHouse.json"));

// Get ID of network, but if this does not work just use the first available network...
contract.web3.eth.net.getId().then(result=> {
    let deployedNetwork = contract.AuctionHouse.networks[result];
    
    if (deployedNetwork == null) {
        keys = Object.keys(contract.AuctionHouse.networks)
        deployedNetwork = contract.AuctionHouse.networks[keys[0]];
    }
    
    contract.auctionHouse = new contract.web3.eth.Contract(
        contract.AuctionHouse.abi,
        deployedNetwork && deployedNetwork.address,
        );
    
    
    // Get local accounts, use first one. Listen to events for this account
    contract.web3.eth.getAccounts().then(accounts => {
        contract.accounts = accounts;
        //contract.auctionHouse.methods.hashSeriesNumber(1,2).call().then(console.log)
        contract.auctionHouse.events.ContractCreated(
            {fromBlock: 0},
            function(err, event) {
                console.log("Event happened: ", event.returnValues);
                if (err != null) {
                    console.error("Event error: ", err);
                    return;
                }
                let identifier = parseInt(event.returnValues.identifier, 10)
                let createdAuction = db.find({'identifier': identifier});
                console.log("Found Auctions:", createdAuction)
                if (createdAuction.length == 0) {
                    console.log("Event idenfifier " + identifier + " has no locally saved auction (" + createdAuction+ ")... Maybe it was created by another server?")
                    return
                }
                if (createdAuction.rows[0]['idx'] != 0) {
                    console.log("Auction already has an id...",createdAuction);
                    return
                }
                createdAuction.rows[0]['idx'] = event.idx;
                console.log("Updating Auction to: ", createdAuction)
                db.update({'identifier': identifier}, createdAuction);
                db.save();
            }
        );
    });
});

contract.deploy_auction = function(identifier, sealed) {
    console.log("Creating Auction", identifier, sealed);
    contract.auctionHouse.methods.deploy_auction(identifier, sealed).send({from: contract.accounts[0], gas: 1000000, value: 1000000}).then(function(result) {
        console.log("Created Auction, block=", result.blockNumber)
    });
}

contract.get_id_from_identifier = function(identifier) {
    console.log("Trying to get ID from Idenfifier", identifier);
    return contract.auctionHouse.methods.get_idx_from_identifier(identifier).call({from: contract.accounts[0]});
}

module.exports = contract;
