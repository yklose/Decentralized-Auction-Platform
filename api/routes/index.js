var express = require('express');
var cors = require('cors')
var router = express.Router();
var db = require("../storage/storage")

router.use(cors())

var auctionHouse = require("../contracts/auctionHouse");

let auctionKeys = ['item', 'description', 'sealed'];
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
  
  auctionHouse.deploy_auction(newA.identifier, newA.sealed);

  db.insert(newA);
  db.save();
  res.status(200).send(db.find({'identifier': newA.identifier}).rows[0]);
});

router.post("/auction/:identifier/start", function(req, res) {
  let identifier = parseInt(req.params.identifier, 10);

  let auctionToStart = db.find({'identifier': identifier});
  console.log("Found auction to start:", auctionToStart);

  if(auctionToStart.length != 1) {
    console.log("Auction to start does not have length 1");
  }

  let updatedAuction = auctionToStart.rows[0];
  updatedAuction.started = true;

  auctionHouse.start_auction(updatedAuction.idx);

  db.remove({'identifier': identifier});
  db.insert(updatedAuction);
  db.save();
  res.status(200).send(db.find({'identifier': identifier}).rows[0])

});



/**
 * Retruns all locally saved stuff in the database
 */
router.get('/', function(req, res, next) {
  res.send(db.find().rows)
});

module.exports = router;
