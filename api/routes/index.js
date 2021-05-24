var express = require('express');
var queryable = require('queryable');
var router = express.Router();
var db = queryable.open('auctionhouse.db');

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
 * param id: the id that the auction has on-chain
 * body:
 *  'item' item on sale (string)
 *  'description' longer description (string, TODO Max maybe even HTML?)
 */
router.post('/auction/:id', function(req, res, next) {
  let alreadyExists = db.find({'id': req.params.id});
  if(alreadyExists.length != 0) {
    res.status(400).send({
      'msg': "This auction already exists, cannot create it",
      'existing': alreadyExists
    })
    return
  }

  if (!requireJsonKeys(req.body, auctionKeys)) {
    res.status(400).send({
      'msg': "The auction cannot be saved because it is missing keys",
      'provided': req.body,
      'required': auctionKeys
    })
    return
  }
  
  let newAuction = req.body
  req.body.id = req.params.id
  db.insert(newAuction);
  db.save();
  res.status(200).send(db.find({'id': req.params.id}).rows[0]);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(db.find().rows);
});



module.exports = router;
