# Simple AuctionHouse

First very simple implementation of an action house. 

Current Rules:
- Contact creater is owner (seller)
- The owner (seller) can not bid on the object
- Bidders need to deposit 5 ether to place bids
- The owner need to start the auction (predefined auction interval)
- Bids from bidders are only accepted during auction interval
- Bid is no crypto currency (on purpose!) 
- You can not take back your bid or reduce your bid


# Required Dependencies
- Install [Ganache](https://www.trufflesuite.com/ganache) for running the blockchain locally
- Install Node.js (include node package manager)
- Install truffle with: ` npm install -g truffle `
- Install [Metamask](https://metamask.io/) in your browser

# Optional Dependencies
- Solidity Syntax Highlighting for the IDE of your choice
- Install and add [openzeppelin-contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) ` npm install @openzeppelin/contracts `
- **For running the frontend locally**:
    - Install Visual Studio 2019
    - Choose Workload **Desktop Development with C++** (Needed for compiling underlying node libraries using C++)
    - Run npm install in build/

# Running everything
1. Set Up Ganache + Metamask
    1. Add new Ganache Project using the truffle-config.js
    2. Set up Metamask to [connect to Ganache](https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask#setting-up-metamask)
    3. Import any Account from the Blockchain to Metamask using the private key provided
2. Set up Truffle
    1. `truffle compile` - compiles the .sol Contracts in contracts/
    2. `truffle migrate` - migrate the contracts to the blockchain (can be seen in Ganache)
    3. `cd build`
    4. `npm run start` - hosts the frontend located in build/src on localhost:3000
