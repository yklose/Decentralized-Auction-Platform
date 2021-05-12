pragma solidity ^0.5.8;

contract AuctionHouse {
    mapping (address => uint) private bids;
    mapping (address => uint) private deposit;
    mapping (address => uint) private timestamp;
    address public owner;
    // define variables
    uint256 ether_var = 10**18;
    uint256 endtime;
    uint256 interval = 5;
    bool active;

    // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint amount);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public payable {
        // set the owner at the beginning
        owner = msg.sender;
    }
    // id --> owner; pass address;

    function start_auction() public payable {
        //start the auction, setting timelimit, can only not be reactivated
        if (msg.sender == owner && active == false){
            endtime = now + interval;
            active = true;
        }
    }

    function deposit_money() public payable returns (uint){
        // Deposit money in order to be able to participate
        deposit[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return deposit[msg.sender];
    }

    function get_deposit_balance() public view returns (uint){
        // gets the balances of bidders
        return deposit[msg.sender];
    }

    function set_bid(uint bid_value) public returns (uint){
        // contract has to be active
        if (active){
            // the owner can not bid
            if (msg.sender != owner){
                // you can not bid if you have not deposit inital money (5 Ether)
                if (deposit[msg.sender]>=5*ether_var){
                    // only accept bid if its higher than the previous bid
                    if (bid_value > bids[msg.sender]) {
                        // only accept bid if in valid time period
                        if (endtime > create_timestamp()){
                            bids[msg.sender] = bid_value;
                            timestamp[msg.sender] = create_timestamp();
                        }
                    }
                }
            }
        }
    }

    function get_bid() public view returns (uint){
        // returns last/highest bid of bidder
        return bids[msg.sender];
    }

    function get_endtime() public view returns (uint){
        // returns the endtime
        return endtime;
    }

    function get_timestamp() public view returns (uint){
        // returns the timestamp of the last/highest bid of the bidder
        // Probably not secure! (TODO: add verification like in lecture 1)
        return timestamp[msg.sender];
    }

    function create_timestamp() public view returns (uint256){
        // creates timestamp
        return now;
    }


}
