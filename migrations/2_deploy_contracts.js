const ether = 10**18; // 1 ether = 1000000000000000000 wei

var AuctionHouse = artifacts.require("AuctionHouse");

module.exports = function(deployer) {
  deployer.deploy(AuctionHouse, { value: 30 * ether });
};
