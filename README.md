# AuctionHouse

First working implementation of an action house. 

![alt text](./readme_images/StartingPage.png?raw=true)

![alt text](./readme_images/BiddingPage.png?raw=true)

**Current Rules**:
- Multiple contracts are allowed 
- Auction types are: sealed and open
- Everyone can create a auction and is automatically the owner
- To create an auction an identifier is needed. This idendifier is unique and will not be accepted otherwise. 
- Bidders can get the auction index by having the auction identifier 
- The owner (seller) can not bid on the object
- Bidders need to deposit 5 ether to place bids
- If the action has not started, bidders can refund the deposit
- The owner need to start the auction (predefined auction interval)
- Bids from bidders are only accepted during auction interval
- Bid is no crypto currency (on purpose!) 
- For sealed auctions the bid is hashed with a user specific nonce
- You can not take back your bid (or reduce your bid)
- Once the time is over, everyone can call the get winner function and see who won if the auction was configured as open.
- The owner can kill the auction after the time interval. All deposits are automatically send back to the bidders. 
- If the owner does not kill the auction bidders can refund the deposit after the auction interval is expired. 


# Required Dependencies
- Install [Ganache](https://www.trufflesuite.com/ganache) for running the blockchain locally
- Install Node.js (include node package manager)
- Install truffle with: ` npm install -g truffle `
- Install [Metamask](https://metamask.io/) in your browser

# Optional Dependencies
- Solidity Syntax Highlighting for the IDE of your choice
- **For running the frontend locally**:
    - Install Visual Studio 2019
    - Choose Workload **Desktop Development with C++** (Needed for compiling underlying node libraries using C++)
    - Run npm install in build/

# Running blockchain
1. Set Up Ganache + Metamask
    1. Add new Ganache Project using the truffle-config.js
    2. Set up Metamask to [connect to Ganache](https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask#setting-up-metamask)
    3. Import any Account from the Blockchain to Metamask using the private key provided
2. Set up Truffle
    1. `truffle compile` - compiles the .sol Contracts in contracts/
    2. `truffle migrate --reset` - migrate the contracts to the blockchain (can be seen in Ganache)
    3. `cd build`, `npm run start` - hosts the frontend located in build/src on localhost:3000
    4. `cd api`, `npm run start` - hosts the backend api located in api/ on localhost:5000

# Test the contracts
Run `truffle test`
