var queryable = require('queryable');
var db = queryable.open('auctionhouse.db');

module.exports = db;