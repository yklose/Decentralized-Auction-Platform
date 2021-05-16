var AuctionHouse = artifacts.require("./AuctionHouse.sol");

const ether = 10**18;

contract("AuctionHouse - basic initialization", function(accounts) {
  // create test accounts
  const alice = accounts[0];      // Owner
  const bob = accounts[1];        // Bidder
  const charlie = accounts[2];    // Bidder
  const dave = accounts[3];       // Bidder
  
  describe("Testing Auction", async () => {
    it("Simple initialization of contract", async () => {
      const auction = await AuctionHouse.deployed();
    });

    it("Deploy two contracts with auction IDs", async () => {
      const auction = await AuctionHouse.deployed();
      await auction.deploy_auction({from: alice});
      await auction.deploy_auction({from: bob});
    });

    it("Deploy two contracts and let bidders deposit money and refund before auction started", async () => {
      const auction = await AuctionHouse.deployed();
      await auction.deploy_auction({from: alice});
      await auction.deploy_auction({from: bob});

      // these functions can be called by anyone!
      var auction_id0;
      await auction.get_id.call(alice, {from: alice}).then(function(idx){
        auction_id0 = idx;
      });
      var auction_id1;
      await auction.get_id.call(bob, {from: alice}).then(function(idx){
        auction_id1 = idx
      });

      // let bidders deposit money on auction 0
      await auction.deposit_money(auction_id0, {from: bob, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id0, {from: charlie, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id0, {from: dave, value: web3.utils.toBN(5*ether)});
      // let bidders deposit money on auction 1
      await auction.deposit_money(auction_id1, {from: alice, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id1, {from: charlie, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id1, {from: dave, value: web3.utils.toBN(5*ether)});
      
      // refund deposits (only possible when action hasn't started!)
      await auction.refund_deposit(auction_id0, {from: bob});
      await auction.refund_deposit(auction_id0, {from: charlie});
      await auction.refund_deposit(auction_id0, {from: dave});
      await auction.refund_deposit(auction_id1, {from: alice});
      await auction.refund_deposit(auction_id1, {from: charlie});
      await auction.refund_deposit(auction_id1, {from: dave});

    });

    it("Full test with two auctions 3 bidders and winner determination", async () => {
      const auction = await AuctionHouse.deployed();
      await auction.deploy_auction({from: alice});
      await auction.deploy_auction({from: bob});

      // these functions can be called by anyone!
      var auction_id0;
      await auction.get_id.call(alice, {from: alice}).then(function(idx){
        auction_id0 = idx;
      });
      var auction_id1;
      await auction.get_id.call(bob, {from: alice}).then(function(idx){
        auction_id1 = idx
      });

      // let bidders deposit money on auction 0
      await auction.deposit_money(auction_id0, {from: bob, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id0, {from: charlie, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id0, {from: dave, value: web3.utils.toBN(5*ether)});
      // let bidders deposit money on auction 1
      await auction.deposit_money(auction_id1, {from: alice, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id1, {from: charlie, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id1, {from: dave, value: web3.utils.toBN(5*ether)});
      // start auctions
      await auction.start_auction(auction_id0, {from: alice})
      await auction.start_auction(auction_id1, {from: bob})

      // -------------------------- BIDDING EXAMPLE --------------------------
      
      // Alice Bids: 
      const bidAlice1 = 15;
      await auction.set_bid(auction_id1, bidAlice1, {from: alice});
      // Bob Bids:
      const bidBob0 = 40;
      await auction.set_bid(auction_id0, bidBob0, {from: bob});
      // wait for 1 second
      await new Promise(r => setTimeout(r, 3000));
      // Charlie Bids:
      const bidCharlie0 = 38;
      await auction.set_bid(auction_id0, bidCharlie0, {from: charlie});
      const bidCharlie1 = 14;
      await auction.set_bid(auction_id1, bidCharlie1, {from: charlie});
      // Dave Bids:
      const bidDave0 = 18;
      await auction.set_bid(auction_id0, bidDave0, {from: dave});
      const bidDave1 = 19;
      await auction.set_bid(auction_id1, bidDave1, {from: dave});
      // wait for another 2 seconds (should be outside the interval)
      await new Promise(r => setTimeout(r, 2000));
      // Dave updates bids 44 ether (should be outside the time interval)
      const bidDaveUpdate = 44;
      await auction.set_bid(auction_id0, bidDaveUpdate, {from: dave});

      // -------------------------- STATISTICS --------------------------

      // get highest bids of all bidders (auction id=0)
      const EndBidBob       = await auction.get_bid(auction_id0,{from: bob});
      const EndBidCharlie   = await auction.get_bid(auction_id0,{from: charlie});
      const EndBidDave      = await auction.get_bid(auction_id0,{from: dave});
      // get highest bids of all bidders (auction id=1)
      const EndBidAlice1     = await auction.get_bid(auction_id1,{from: alice});
      const EndBidCharlie1   = await auction.get_bid(auction_id1,{from: charlie});
      const EndBidDave1      = await auction.get_bid(auction_id1,{from: dave});
 
      // show results for action 0
      console.log("");
      console.log("--------- Highest bids for auction 0 ---------");
      console.log("");
      console.log("Bobs      Bid: ", EndBidBob.toString());
      console.log("Charlies  Bid: ", EndBidCharlie.toString());
      console.log("Daves     Bid: ", EndBidDave.toString());
      console.log("");
      // Get winner
      await auction.get_winner.call(auction_id0, {from: alice}).then(function(result){
        console.log("Auction_ID=%d, Address=%s, Winning_bid=%d", auction_id0, result[0], result[1]);
      });
      // The owner of the action id can kill the auction (deposits are payed back automatically)
      await auction.kill(auction_id0, {from: alice});

      // show results for action 1
      console.log("");
      console.log("--------- Highest bids for auction 1 ---------");
      console.log("");
      console.log("Alices    Bid: ", EndBidAlice1.toString());
      console.log("Charlies  Bid: ", EndBidCharlie1.toString());
      console.log("Daves     Bid: ", EndBidDave1.toString());
      console.log("");
      // Get winner
      await auction.get_winner.call(auction_id1, {from: alice}).then(function(result){
        console.log("Auction_ID=%d, Address=%s, Winning_bid=%d", auction_id0, result[0], result[1]);
      });
      // The owner of the action id can kill the auction (deposits are payed back automatically)
      await auction.kill(auction_id1, {from: bob});

    });
    
  });
  
}); 

  