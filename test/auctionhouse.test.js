var AuctionHouse = artifacts.require("./AuctionHouse.sol");

const ether = 10**18;

contract("AuctionHouse - basic initialization", function(accounts) {
  // create test accounts
  const alice = accounts[0];      // Owner
  const bob = accounts[1];        // Bidder
  const charlie = accounts[2];    // Bidder
  const dave = accounts[3];       // Bidder

  let auction;
  before(async () => {
    auction = await AuctionHouse.deployed();
  });

  
  describe("Testing Auction", async () => {
    
    it("Deploy two contracts with auction IDs", async () => {
      // Use special user identifier! 
      await auction.deploy_auction(0000, false, {from: alice});
      await auction.deploy_auction(0001, false, {from: bob});

    });

    it("Deploy two contracts and let bidders deposit money and refund before auction started", async () => {
      //const auction = await AuctionHouse.deployed();
      const auction_id0 = 0002;
      const auction_id1 = 0003;
      await auction.deploy_auction(auction_id0, false, {from: alice});
      await auction.deploy_auction(auction_id1, false, {from: bob});

      
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

      // check if deposit is zero for auction
      await auction.get_deposit_balance.call(auction_id0, {from: bob}).then(function(balance){
        assert.equal(balance.toString(), "0");
      });
      await auction.get_deposit_balance.call(auction_id0, {from: charlie}).then(function(balance){
        assert.equal(balance.toString(), "0");
      });
      await auction.get_deposit_balance.call(auction_id0, {from: dave}).then(function(balance){
        assert.equal(balance.toString(), "0");
      });
      await auction.get_deposit_balance.call(auction_id1, {from: alice}).then(function(balance){
        assert.equal(balance.toString(), "0");
      });
      await auction.get_deposit_balance.call(auction_id1, {from: charlie}).then(function(balance){
        assert.equal(balance.toString(), "0");
      });
      await auction.get_deposit_balance.call(auction_id1, {from: dave}).then(function(balance){
        assert.equal(balance.toString(), "0");
      });

    });
    
    it("Full test with two auctions 3 bidders and winner determination", async () => {
      // Use special user identifier for deploying an auction
      const auction_id0 = 1111;
      const auction_id1 = 2222;
      await auction.deploy_auction(auction_id0, false, {from: alice});
      await auction.deploy_auction(auction_id1, false, {from: bob});

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
      await auction.set_bid(auction_id1, bidAlice1, 0, {from: alice});
      // Bob Bids:
      const bidBob0 = 40;
      await auction.set_bid(auction_id0, bidBob0, 0, {from: bob});
      // Charlie Bids:
      const bidCharlie0 = 38;
      await auction.set_bid(auction_id0, bidCharlie0, 0, {from: charlie});
      const bidCharlie1 = 14;
      await auction.set_bid(auction_id1, bidCharlie1, 0, {from: charlie});
      // Dave Bids:
      const bidDave0 = 18;
      await auction.set_bid(auction_id0, bidDave0, 0, {from: dave});
      const bidDave1 = 19;
      await auction.set_bid(auction_id1, bidDave1, 0, {from: dave});
      const bidDave2 = 22;
      await auction.set_bid(auction_id1, bidDave2, 0, {from: dave});
      // wait for another 2 seconds (should be outside the interval)
      await new Promise(r => setTimeout(r, 2000));
      // Dave updates bids 44 ether (should be outside the time interval)
      const bidDaveUpdate = 44;
      try{
        await auction.set_bid(auction_id0, bidDaveUpdate, 0, {from: dave});
      }
      catch{
        console.log("Could not place Daves bid (44)");
      }
  
      // ----------------------------- STATISTICS -----------------------------
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
      console.log("Bobs      Bid: ", EndBidBob.toString());
      console.log("Charlies  Bid: ", EndBidCharlie.toString());
      console.log("Daves     Bid: ", EndBidDave.toString());
      // Get winner
      await auction.get_winner.call(auction_id0, {from: alice}).then(function(result){
        console.log("Auction_ID=%d, Address=%s, Winning_bid=%d", auction_id0, result[0], result[1]);
      });
      // The owner of the action id can kill the auction (deposits are payed back automatically)
      await auction.kill(auction_id0, {from: alice});
      // show results for action 1
      console.log("");
      console.log("--------- Highest bids for auction 1 ---------");
      console.log("Alices    Bid: ", EndBidAlice1.toString());
      console.log("Charlies  Bid: ", EndBidCharlie1.toString());
      console.log("Daves     Bid: ", EndBidDave1.toString());
      // Get winner
      await auction.get_winner.call(auction_id1, {from: alice}).then(function(result){
        console.log("Auction_ID=%d, Address=%s, Winning_bid=%d", auction_id0, result[0], result[1]);
      });
      // Bob requests back his refund
      await auction.refund_deposit(auction_id0, {from: bob});
      // The owner of the action id can kill the auction (deposits are payed back automatically)
      await auction.kill(auction_id1, {from: bob});

    });

    it("Deploy one sealed auction with published hash value", async () => {
      // Use special user identifier for deploying an auction
      const auction_id0 = 3333;
      await auction.deploy_auction(3333, true, {from: alice});
    });

    it("Deploy one sealed auction with published hash value", async () => {
      // Use special user identifier for deploying an auction
      const auction_id0 = 4444;
      await auction.deploy_auction(auction_id0, true, {from: alice});

      // let bidders deposit money on auction 0
      await auction.deposit_money(auction_id0, {from: bob, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id0, {from: charlie, value: web3.utils.toBN(5*ether)});
      await auction.deposit_money(auction_id0, {from: dave, value: web3.utils.toBN(5*ether)});
      // start auction
      await auction.start_auction(auction_id0, {from: alice})
      // -------------------------- BIDDING EXAMPLE --------------------------
      const bidCharlie = 14;
      await auction.set_bid(auction_id0, bidCharlie, 0, {from: charlie});
      const bidBob = 40;
      await auction.set_bid(auction_id0, bidBob, 0, {from: bob});
      const bidDave = 40;
      await auction.set_bid(auction_id0, bidDave, 1, {from: dave});

      const hashBidCharlie = await auction.get_bid(auction_id0, {from: charlie});
      const hashBidBob = await auction.get_bid(auction_id0, {from: bob});
      const hashBidDave = await auction.get_bid(auction_id0, {from: dave});

      console.log("Charlies Hash Bid : ", hashBidCharlie.toString());
      console.log("Bobs Hash Bid     : ", hashBidBob.toString());
      console.log("Daves Hash Bid    : ", hashBidDave.toString());
      // ---------------------------------------------------------------------
    });
    
  });
  
}); 

  