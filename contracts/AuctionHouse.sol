pragma solidity ^0.5.8;

contract AuctionHouse {
    mapping (address => uint) private bids;
    mapping (address => uint) private balances;
    address public owner;

    // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint amount);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public payable {
        owner = msg.sender;
    }

    function deposit_money() public payable returns (uint){
        // Deposit money in order to be able to participate
        balances[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return balances[msg.sender];
    }

    function get_balance() public view returns (uint){
        // gets the balances of bidders
        return balances[msg.sender];
    }

    function set_bid() public payable returns (uint){
        // the owner can not bid
        if (msg.sender != owner){
            // you can not bid more than you have in balance
            if (msg.value < balances[msg.sender]){
                // only accept bid if its higher than the previous bid
                if (msg.value > bids[msg.sender]) {
                    bids[msg.sender] = msg.value;
                }
            }
        }
    }

    function get_bid() public view returns (uint){
        return bids[msg.sender];
    }

    /*
    function get_highest_bid() public view returns (uint) {
        uint256 largest = 0; 
        uint256 i;

        for(i = 0; i < bids.length; i++){
            if(bids[i] > largest) {
                largest = bids[i]; 
            } 
        }
        return largest;
    }
    */

}
