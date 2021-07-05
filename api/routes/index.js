var express = require('express');
var cors = require('cors')
var router = express.Router();
var db = require("../storage/storage")

router.use(cors())

var auctionHouse = require("../contracts/auctionHouse");

let auctionKeys = ['item', 'description', 'sealed', 'img'];
let unsealKeys = ['nonce', 'bid', 'address'];
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
 * The auction house can create a new auction here.
 * Note that the ID of the contract will be added later, because the block needs to be mined first....
 * body:
 *  'item' item on sale (string)
 *  'description' longer description (string, TODO Max maybe even HTML?)
 *  'sealed' true or false if this should be a sealed bid
 */
router.post('/auction/', function(req, res) {
  if (!requireJsonKeys(req.body, auctionKeys)) {
    res.status(400).send({
      'msg': "The auction cannot be saved because it is missing keys",
      'provided': req.body,
      'required': auctionKeys
    })
    return
  }

  let newA = req.body;

  newA['identifier'] = Math.floor(Math.random() * (Math.pow(2, 32) - 1));
  newA['started'] = false;
  newA['finished'] = false;
  
  auctionHouse.deploy_auction(newA.identifier, newA.sealed);

  db.insert(newA);
  db.save();
  res.status(200).send(db.find({'identifier': newA.identifier}).rows[0]);
});

/**
 * Start the auction, this expects no parameters
 */
router.post("/auction/:identifier/start", function(req, res) {
  let identifier = parseInt(req.params.identifier, 10);

  let auctionToStart = db.find({'identifier': identifier});
  console.log("Found auction to start:", auctionToStart);

  if(auctionToStart.length != 1) {
    console.log("Auction to start does not have length 1");
  }

  let updatedAuction = auctionToStart.rows[0];
  updatedAuction.started = true;

  auctionHouse.start_auction(updatedAuction.idx)

  db.remove({'identifier': identifier});
  db.insert(updatedAuction);
  db.save();
  res.status(200).send(db.find({'identifier': identifier}).rows[0])

});

/**
 * This stores the bids of different participants
 * body:
 * 'address'
 * 'nonce'
 * 'bid'
 */
router.post("/auction/:identifier/unseal", function(req, res) {
  if (!requireJsonKeys(req.body, unsealKeys)) {
    res.status(400).send({
      'msg': "The bid cannot be unsealed because it is missing keys",
      'provided': req.body,
      'required': unsealKeys
    })
    return
  }
  let identifier = parseInt(req.params.identifier, 10);

  let auctionToUnseal = db.find({'identifier': identifier}).rows[0];
  console.log("Found auction to unseal:", auctionToUnseal);

  // Logic here
  // acutally check the bid here, this is a very important step!! :)
  let addr = req.params.address;
  let nonce = parseInt(req.params.nonce, 10);
  let bid = parseInt(req.params.bid, 10);
  let hash = auctionHouse.web3.utils.soliditySha3(bid, nonce);

  if(auctionToUnseal['latest_bids'][addr] != hash) {
    res.status(400).send({
      'msg': "The Hash and calculated hash from the stored input dont match!",
      'stored_hash': auctionToUnseal['latest_bids'][addr],
      'calculated_hash': hash,
      'addr': addr,
      'nonce': nonce,
      'bid': bid,
    })
    return
  }

  if (!('revealed_bids' in auctionToUnseal)) {
    auctionToUnseal['revealed_bids'] = {}
  }

  auctionToUnseal['revealed_bids'][addr] = {
    'bid': bid,
    'nonce': nonce,
    'hash': hash
  };

  let unsealed_amount = Object.keys(auctionToUnseal['revealed_bids']).length
  let sealed_amount = Object.keys(auctionToUnseal['latest_bids']).length

  if (unsealed_amount == sealed_amount) {
    auctionToUnseal['finished'] = true;

    // Now calculate the winner
    let maxBid = -1;
    let maxAddr = -1;
    for (key in Object.keys(auctionToUnseal['revealed_bids'])) {
        if (auctionToUnseal['revealed_bids'][key] > maxBid) {
          maxBid = auctionToUnseal['revealed_bids'][key]
          maxAddr = key
        }
    }

    auctionToUnseal['winner'] = maxAddr;
    auctionToUnseal['winner_bid'] = maxBid;
  }

  db.remove({'identifier': identifier});
  db.insert(auctionToUnseal);
  db.save();

  res.status(200).send(db.find({'identifier': identifier}).rows[0])

});


router.post("/auction/:identifier/endOpen", function(req, res) {
  let identifier = parseInt(req.params.identifier, 10);

  let auctionToEnd = db.find({'identifier': identifier}).rows[0];
  console.log("Found auction to end:", auctionToEnd);

  contract.auctionHouse.methods.get_winner(idx).call()
  .then((err, cres) => {
    if (err != null) {
      res.status(400).send({
        'msg': "The auction has not ended yet??",
        'err': err,
      })
      return
    }
      console.log("GetWinner has returned:")
      console.dir(cres)
      let winner = cres.winner // TODO
      let winner_bid = cres.bid // TODO

      auctionToEnd['finished'] = true
      auctionToEnd['winner'] = winner
      auctionToEnd['winner_bid'] = winner_bid

      db.remove({'identifier': identifier});
      db.insert(auctionToEnd);
      db.save();
      res.status(200).send(db.find({'identifier': identifier}).rows[0])
      return
  })
});
/**
 * Retruns all locally saved stuff in the database
 */
router.get('/', function(req, res, next) {
  res.send(db.find().rows)
});

module.exports = router;
