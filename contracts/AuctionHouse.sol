// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuctionHouse {

    struct Auction {
        address owner;
        uint auction_identifier;
        uint endtime; 
        bool active; 
        bool sealed_auction; 
        address[] bidders;
        mapping (address => uint) deposit;   
        mapping (address => uint) bids;
    }

    Auction[] public auctions;

    uint256 interval = 8; 
    
    // define events
    event DepositEvent(address indexed sender, uint value, uint256 idx);
    event AuctionDeployed(address indexed owner, uint256 idx, uint256 identifier, bool sealed_auction);
    event BidEvent(address indexed sender, uint value, uint256 idx);


    function hashSeriesNumber(uint256 nonce, uint256 number) public pure returns (uint) {
        // hash the value of a string and number 
        return uint256(keccak256(abi.encodePacked(number, nonce)));
    }

    function get_owner(uint idx) public view returns (address){
        // returns the address of the owner for certain id 
        return auctions[idx].owner;
    }

    function is_owner(address addr, uint idx) public view returns (bool){
        // returns true/false of an address with idx
        if (addr == auctions[idx].owner){
            return true;
        }
        else{
            return false;
        }
    }

    function is_sealed(uint idx) public view returns (bool){
        // returns true/false if the auction is sealed
        if (auctions[idx].sealed_auction == true){
            return true;
        }
        else{
            return false;
        }
    }

    function get_idx_from_identifier(uint identifier) public view returns (uint){
        // get the id of an auction given an identifier
        require(identifier_is_unused(identifier)==false, "ERROR: Identifier is already used");
        for (uint256 idx = 0; idx < auctions.length; idx++) {
            if (auctions[idx].auction_identifier == identifier){
                return idx;
            }
        }
        return 0;
    }

    function identifier_is_unused(uint identifier) public view returns (bool){
        // check if the identifier is already in use
        for (uint256 idx = 0; idx < auctions.length; idx++) {
            if (auctions[idx].auction_identifier == identifier){
                return false;
            }
        }
        return true;
    }

    function get_number_of_auctions() public view returns (uint){
        // returns the number of auctions
        return auctions.length;
    }

    function deploy_auction(uint identifier, bool type_sealed) public payable{
        // deploys an auction
        require(identifier_is_unused(identifier), "ERROR: Identifier is already used");
        uint idx = auctions.length;
        auctions.push();
        Auction storage new_auct = auctions[idx];
        // Changed by Max
        new_auct.endtime = 0;
        new_auct.owner = msg.sender;
        new_auct.sealed_auction = type_sealed;
        new_auct.auction_identifier = identifier;
        emit AuctionDeployed(msg.sender, idx, identifier, type_sealed);
    }

    function start_auction(uint idx) public payable {
        // start the auction, setting timelimit, can only not be reactivated
        require(msg.sender == auctions[idx].owner, "ERROR: Only the owner can start the auction");
        require(auctions[idx].active == false, "ERROR: The auction can only be started once");
        auctions[idx].endtime = block.number + interval;
        auctions[idx].active = true;
        
    }

    function deposit_money(uint idx) public payable returns (uint){
        // Deposit money in order to be able to participate
        auctions[idx].deposit[msg.sender] += msg.value;
        auctions[idx].bidders.push(msg.sender);
        emit DepositEvent(msg.sender, msg.value, idx);
        return auctions[idx].deposit[msg.sender];
    }

    function get_deposit_balance(uint idx) public view returns (uint){
        // gets the balances of bidders
        return auctions[idx].deposit[msg.sender];
    }

    function set_bid(uint idx, uint bid_value) public {
        // sets the bid, requirements have to be fulfilled 
        require(auctions[idx].active, "ERROR: The auction has to be started (active)");
        require(msg.sender != auctions[idx].owner, "ERROR: The owner can not bid on his/her auction");
        require(auctions[idx].deposit[msg.sender]>=5 ether, "ERROR: Deposit is not enough (at least 5 ETH)");
        require(auctions[idx].endtime > create_timestamp(), "ERROR: Auction is already over (Block limit reached)");

        if (auctions[idx].sealed_auction == true){
            auctions[idx].bids[msg.sender] = bid_value;
            emit BidEvent(msg.sender, bid_value, idx);
        }
        else{
            require(bid_value > auctions[idx].bids[msg.sender], "ERROR: Bids have to be higher than previous bids (open auction)");
            auctions[idx].bids[msg.sender] = bid_value;
            emit BidEvent(msg.sender, bid_value, idx);
        }
    }

    function get_bid(uint idx) public view returns (uint){
        // returns last/highest bid of bidder
        return auctions[idx].bids[msg.sender];
    }

    function get_highest_bid(uint idx) public view returns (uint) {
        require(auctions[idx].sealed_auction == false, "ERROR: get highest bid can only be called on open auction");
        uint winning_bid=0;
        for (uint256 i = 0; i < auctions[idx].bidders.length; i++) {
            address curr_bidder = auctions[idx].bidders[i];
            if (auctions[idx].bids[curr_bidder] > winning_bid){
                winning_bid = auctions[idx].bids[curr_bidder];
            }
        }  
        return winning_bid;
    }

    function get_endtime(uint idx) public view returns (uint){
        // returns the endtime
        return auctions[idx].endtime;
    }

    function create_timestamp() public view returns (uint256){
        // creates timestamp
        return block.number;
    }

    function kill(uint idx) public{
        // transfers back all deposts for auction id
        require(msg.sender == auctions[idx].owner, "ERROR: Only the owner can kill the auction.");
        require(block.number > auctions[idx].endtime, "ERROR: The auction can only be killed when auction is over");
        for (uint256 i = 0; i < auctions[idx].bidders.length; i++) {
            address bidder = auctions[idx].bidders[i];
            uint deposit = auctions[idx].deposit[auctions[idx].bidders[i]];
            payable(bidder).transfer(deposit);
            auctions[idx].deposit[auctions[idx].bidders[i]] = 0;
        }
    }    

    function get_winner(uint idx) public view returns (address winner, uint bid) {
        // gets the winner in an open price auction
        require(auctions[idx].endtime <= block.number, "ERROR: Get winner can only be called when auction is over");
        require(auctions[idx].sealed_auction == false, "ERROR: The function get winner can only be called on open auctions.");
        uint winning_bid=0;
        address winner_address=get_owner(idx);
        for (uint256 i = 0; i < auctions[idx].bidders.length; i++) {
            address curr_bidder = auctions[idx].bidders[i];
            if (auctions[idx].bids[curr_bidder] > winning_bid){
                winning_bid = auctions[idx].bids[curr_bidder];
                winner_address = curr_bidder;
            }
        }  
        return (winner_address, winning_bid);
    }

    function refund_deposit(uint idx) public {
        // refund the deposit if action is not active or if time is over
        require(auctions[idx].active == false || auctions[idx].endtime < block.number, "ERROR: Refund is only possible after the auction is over or before the auction has started.");
        payable(msg.sender).transfer(auctions[idx].deposit[msg.sender]);
        auctions[idx].deposit[msg.sender] = 0;
    }
}
