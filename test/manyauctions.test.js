var ManyAuctions = artifacts.require("./ManyAuctions.sol");

const ether = 10 ** 18;

contract("ManyAuctions - basic initialization", function (accounts) {
  // create test accounts
  const alice = accounts[0];      // Owner
  const bob = accounts[1];        // Bidder
  const charlie = accounts[2];    // Bidder
  const dave = accounts[3];       // Bidder

  describe("Testing Auction", async () => {
    it("create auction with two bidders", async () => {
      const auction = await ManyAuctions.deployed();

      // Owner (Alice) starts the auction
      await auction.createAuction([bob, charlie], { from: alice })

      await auction.bid(0,10, { from: bob})
      await auction.bid(0,20, { from: charlie })

      await auction.finish(0, {from: alice});
      let winner = await auction.get_winner(0);
      console.log();
    });
  });
});