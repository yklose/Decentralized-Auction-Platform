const ether = 10**18; // 1 ether = 1000000000000000000 wei

var AuctionHouse = artifacts.require("AuctionHouse");
var ManyAuctions = artifacts.require("ManyAuctions");

module.exports = function(deployer) {
  deployer.deploy(AuctionHouse);
  deployer.deploy(ManyAuctions);
};
