var express = require('express');
var router = express.Router();

var queryable = require('queryable');
var db = queryable.open('auctionhouse.db');

const ganache = require('ganache-core');
const Web3 = require('web3');
let web3 = new Web3(ganache.provider());

import AuctionHouse from "../../build/src/contracts/AuctionHouse.json"
const auctionHouseAddress = process.env.HOUSE_ADDR
const auctionHouseAbi = AuctionHouse.abi
  
const networkId = await web3.eth.net.getId();
const deployedNetwork = AuctionHouse.networks[networkId];
const auctionHouse = new web3.eth.Contract(
  AuctionHouse.abi,
  deployedNetwork && deployedNetwork.address,
);


let auctionKeys = ['item', 'description']
/**
 * Used to check whether the passed json has the necessary keys
 * @param jsonObject the object that should have the keys
 * @param keys list of strings: the keys
 * @returns true if all keys exist, false otherwise
 */
function requireJsonKeys(jsonObject, keys) {
  for(const key of keys) {
    if(!(key in jsonObject)) {
      return false;
    }
  }
  return true;
}

/**
 * The auction house can create a new auction here
 * body:
 *  'item' item on sale (string)
 *  'description' longer description (string, TODO Max maybe even HTML?)
 * returns:
 *  'id' Id of Contract on Chain
 */
router.post('/auction/', function(req, res, next) {
  // let alreadyExists = db.find({'id': req.params.id});
  // if(alreadyExists.length != 0) {
  //   res.status(400).send({
  //     'msg': "This auction already exists, cannot create it",
  //     'existing': alreadyExists
  //   })
  //   return
  // }

  if (!requireJsonKeys(req.body, auctionKeys)) {
    res.status(400).send({
      'msg': "The auction cannot be saved because it is missing keys",
      'provided': req.body,
      'required': auctionKeys
    })
    return
  }
  
  // TODO Create New Auction Here, Get ID Back
  let auctionId = 0
  let newAuction = req.body
  db.insert(newAuction);
  db.save();
  res.status(200).send(db.find({'id': auctionId}).rows[0]);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({
    'db': db.find().rows,
    'block': provider.getBlockNumber()
  })
});



module.exports = router;
