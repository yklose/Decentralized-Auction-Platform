// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuctionHouse {

    struct Auction {
        address owner;
        uint user_identifier;
        uint endtime; 
        bool active; 
        bool sealed_auction; 
        address[] bidders;
        mapping (address => uint) deposit;   
        mapping (address => uint) bids;
    }

    Auction[] auctions;

    // define variables
    uint256 ether_var = 10**18;
    uint256 interval = 7;
    

    function hashSeriesNumber(uint256 nonce, uint256 number) public pure returns (bytes32) {
        // hash the value of a string and number 
        return keccak256(abi.encode(number, nonce));
    }

    function get_owner(uint idx) public view returns (address){
        // returns the address of the owner for certain id 
        return auctions[idx].owner;
    }

    function is_owner(address add, uint idx) public view returns (bool){
        // returns true/false of an address with idx
        if (add == auctions[idx].owner){
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
        require(identifier_is_unused(identifier)==false);
        for (uint256 idx = 0; idx < auctions.length; idx++) {
            if (auctions[idx].user_identifier == identifier){
                return idx;
            }
        }
        return 0;
    }

    function identifier_is_unused(uint identifier) public view returns (bool){
        // check if the identifier is already in use
        for (uint256 idx = 0; idx < auctions.length; idx++) {
            if (auctions[idx].user_identifier == identifier){
                return false;
            }
        }
        return true;
    }

    function get_number_of_auctions() public view returns (uint){
        // returns the number of auctions
        return auctions.length;
    }

    function deploy_auction(uint identifier, bool type_sealed) public payable returns (uint){
        // check if identifier is already used
        require(identifier_is_unused(identifier));
        // deploy auction
        uint idx = auctions.length;
        auctions.push();
        // define parameters
        Auction storage new_auct = auctions[idx];
        new_auct.endtime = block.number + interval;
        new_auct.owner = msg.sender;
        new_auct.sealed_auction = type_sealed;
        new_auct.user_identifier = identifier;
        return idx;
    }

    function start_auction(uint idx) public payable {
        // start the auction, setting timelimit, can only not be reactivated
        if (msg.sender == auctions[idx].owner && auctions[idx].active == false){
            auctions[idx].endtime = block.number + interval;
            auctions[idx].active = true;
        }
    }

    function deposit_money(uint idx) public payable returns (uint){
        // Deposit money in order to be able to participate
        auctions[idx].deposit[msg.sender] += msg.value;
        auctions[idx].bidders.push(msg.sender);
        return auctions[idx].deposit[msg.sender];
    }

    function get_deposit_balance(uint idx) public view returns (uint){
        // gets the balances of bidders
        return auctions[idx].deposit[msg.sender];
    }

    function set_bid(uint idx, uint bid_value, uint nonce) public {
        // contract has to be active
        if (auctions[idx].active){
            // the owner can not bid
            if (msg.sender != auctions[idx].owner){
                // you can not bid if you have not deposit inital money (5 Ether)
                if (auctions[idx].deposit[msg.sender]>=5*ether_var){
                    // only accept bid if its higher than the previous bid
                    if (bid_value > auctions[idx].bids[msg.sender]) {
                        // only accept bid if in valid time period
                        if (auctions[idx].endtime > create_timestamp()){
                            if (auctions[idx].sealed_auction == true){
                                auctions[idx].bids[msg.sender] = uint256(hashSeriesNumber(nonce, bid_value));
                            }
                            else{
                                auctions[idx].bids[msg.sender] = bid_value;
                            }
                        }
                    }
                }
            }
        }
    }

    function get_bid(uint idx) public view returns (uint){
        // returns last/highest bid of bidder
        return auctions[idx].bids[msg.sender];
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
        require(msg.sender == auctions[idx].owner);
        require(block.number > auctions[idx].endtime);
        for (uint256 i = 0; i < auctions[idx].bidders.length; i++) {
            address bidder = auctions[idx].bidders[i];
            uint deposit = auctions[idx].deposit[auctions[idx].bidders[i]];
            payable(bidder).transfer(deposit);
            auctions[idx].deposit[auctions[idx].bidders[i]] = 0;
        }
    }    

    function get_winner(uint idx) public view returns (address, uint) {
        // gets the winner in an open price auction
        require((auctions[idx].endtime < block.number));
        require(auctions[idx].sealed_auction == false);
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
        require(auctions[idx].active == false || auctions[idx].endtime < block.number);
        payable(msg.sender).transfer(auctions[idx].deposit[msg.sender]);
        auctions[idx].deposit[msg.sender] = 0;
    }
}
