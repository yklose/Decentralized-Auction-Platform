var AuctionHouse = artifacts.require("./AuctionHouse.sol");

const ether = 10**18; // 1 ether = 1000000000000000000 wei



contract("AuctionHouse - basic initialization", function(accounts) {
  const alice = accounts[0];
  const bob = accounts[1];
  const charlie = accounts[2];
  const dave = accounts[3];
  
  

  describe("transfer money to bob", async () => {
    it("deposit money", async () => {
      const auction = await AuctionHouse.deployed();

      // deposit money
      await auction.deposit_money({from: bob, value: web3.utils.toBN(50*ether)});
      await auction.deposit_money({from: charlie, value: web3.utils.toBN(50*ether)});
      await auction.deposit_money({from: dave, value: web3.utils.toBN(50*ether)});

      // show initial balance on account
      const balanceBob = await auction.get_balance({from: bob});
      console.log("Bobs Balance: ", balanceBob.toString()/ether);

      
      // Bob bids 40 ether
      const bidBob = 40 * ether;
      await auction.set_bid({from: bob, value: web3.utils.toBN(bidBob)});

      // Charlie bids 40 ether
      const bidCharlie = 38 * ether;
      await auction.set_bid({from: charlie, value: web3.utils.toBN(bidCharlie)});

      // Dave bids 40 ether
      const bidDave = 43 * ether;
      await auction.set_bid({from: dave, value: web3.utils.toBN(bidDave)});

      // Dave bids 39 ether (should not be accepted)
      // const bidDaveNew = 39 * ether;
      // await auction.set_bid({from: dave, value: web3.utils.toBN(bidDaveNew)});
      


      
      // get all balances
      const balanceAlice    = await auction.get_bid({from: alice});
      const EndBidBob       = await auction.get_bid({from: bob});
      const EndBidCharlie   = await auction.get_bid({from: charlie});
      const EndBidDave      = await auction.get_bid({from: dave});


      console.log("Alice(Owner)    Balance: ", balanceAlice.toString()/ether);
      console.log("Bobs      Bid: ", EndBidBob.toString()/ether);
      console.log("Charlies  Bid: ", EndBidCharlie.toString()/ether);
      console.log("Daves     Bid: ", EndBidDave.toString()/ether);
      
      // get highest bid
      //const highestBid = await auction.get_highest_bid({from: alice});
      //console.log("Highest Bid: ", highestBid);


    });  
  });
}); 

  