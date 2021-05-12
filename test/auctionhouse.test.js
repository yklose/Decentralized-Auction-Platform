var AuctionHouse = artifacts.require("./AuctionHouse.sol");

const ether = 10**18;

contract("AuctionHouse - basic initialization", function(accounts) {
  // create test accounts
  const alice = accounts[0];      // Owner
  const bob = accounts[1];        // Bidder
  const charlie = accounts[2];    // Bidder
  const dave = accounts[3];       // Bidder
  
  describe("Testing Auction", async () => {
    it("test auction with one timeout", async () => {
      const auction = await AuctionHouse.deployed();

      // deposit money
      await auction.deposit_money({from: bob, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money({from: charlie, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money({from: dave, value: web3.utils.toBN(5*ether)});

      // Owner (Alice) starts the auction
      await auction.start_auction({from: alice})

      // Bob bids 40 ether
      const bidBob = 40;
      await auction.set_bid(bidBob, {from: bob});

      // wait for 1 second
      await new Promise(r => setTimeout(r, 3000));

      // Charlie bids 38 ether
      const bidCharlie = 38;
      await auction.set_bid(bidCharlie, {from: charlie});

      // Dave bids 18 ether
      const bidDave = 18;
      await auction.set_bid(bidDave, {from: dave});

      // wait for another 2 seconds (should be outside the interval)
      await new Promise(r => setTimeout(r, 2000));

      // Dave updates bids 44 ether (should be outside the time interval)
      const bidDaveUpdate = 44;
      await auction.set_bid(bidDaveUpdate, {from: dave});

    
      // ---------------- PRINTING STATISTICS ----------------
  
      // get endtime
      const endTime    = await auction.get_endtime({from: bob});
      // get all balances
      const EndBidBob       = await auction.get_bid({from: bob});
      const EndBidCharlie   = await auction.get_bid({from: charlie});
      const EndBidDave      = await auction.get_bid({from: dave});
      // get all timestamps
      const TimeBidBob       = await auction.get_timestamp({from: bob});
      const TimeBidCharlie   = await auction.get_timestamp({from: charlie});
      const TimeBidDave      = await auction.get_timestamp({from: dave});
      // show results
      console.log("")
      console.log("Endtime: ", endTime.toString());
      console.log("")
      console.log("Bobs      Bid: ", EndBidBob.toString(), "Timestamp: ", TimeBidBob.toString());
      console.log("Charlies  Bid: ", EndBidCharlie.toString(), "Timestamp: ", TimeBidCharlie.toString());
      console.log("Daves     Bid: ", EndBidDave.toString(), "Timestamp: ", TimeBidDave.toString());
    });  
  });
}); 

  