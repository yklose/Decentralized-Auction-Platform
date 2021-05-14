pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionHouse is Ownable {
    mapping (uint => address payable) private bidders;
    mapping (address => uint) private bids;
    mapping (address => uint) private deposit;
    mapping (address => uint) private timestamp;

    // define variables
    uint _total_bidders;
    uint256 ether_var = 10**18;
    uint256 endtime;
    uint256 interval = 5; // If nothing happens for $interval blocks the auction is over
    bool active = false;

    // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint amount);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public payable {}

    modifier onlyNotOwner {
        require(msg.sender != owner());
        _;
    }

    modifier onlyDeposited {
        require(deposit[msg.sender]>=5*ether_var);
        _;
    }

    function start_auction() public payable onlyOwner {
        //start the auction, setting timelimit, can only not be reactivated
        require(!active && endtime == 0); // Contract should not already be finished
        endtime = block.timestamp + interval;
        active = true;
    }

    function deposit_money() public payable onlyNotOwner returns (uint) {
        // Deposit money in order to be able to participate
        require(msg.value > 0);
        if (deposit[msg.sender] == 0) {
            // This sender has not made a deposit yet
            // Lets save that it has made a deposit so we can iterate over all senders later
            bidders[_total_bidders] = payable(msg.sender);
            _total_bidders++;
        }
        deposit[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return deposit[msg.sender];
    }

    function get_deposit_balance() public view returns (uint) {
        // gets the balances of bidders
        return deposit[msg.sender];
    }

    function set_bid(uint bid_value) public onlyNotOwner onlyDeposited {
        // contract has to be active
        require(active);
        // only accept bid if its higher than the previous bid (and > 0)
        require(bid_value > bids[msg.sender] && bid_value > 0);
        // only accept bid if in valid time period
        require(endtime > block.timestamp);
        bids[msg.sender] = bid_value;
        timestamp[msg.sender] = block.timestamp;
        endtime = block.timestamp + interval;

    }

    function get_bid() public view returns (uint) {
        // returns last/highest bid of bidder
        return bids[msg.sender];
    }

    function get_endtime() public view returns (uint) {
        // returns the endtime
        return endtime;
    }

    /**
    the owner can finish the auction, at which point the deposits will be paid back
    and the winner can be determined by anyone by viewing view_winner()
     */
    function finish_auction() public onlyOwner {
        require(active);
        require(block.timestamp > endtime);
        active = false;
        // TODO now the owner has to pay the gas to return the deposit
        // but i think thats good because the owner profits from the gas deposit
        for (uint256 i = 0; i < _total_bidders; i++) {
            address payable curr = bidders[i];
            uint deposited = deposit[curr];
            deposit[curr] = 0;
            curr.transfer(deposited);
        }
    }

    /**
    if the contract is not active anymore
     */
    function view_winner() public view returns (address, uint, uint) {
        require(!active);
        address winner;
        uint best_bid = 0;
        require(_total_bidders > 0);
        for (uint256 i = 0; i < _total_bidders; i++) {
            address curr = bidders[i];
            if (bids[curr] > best_bid) {
                best_bid = bids[curr];
                winner = curr;
            }
        }
        return (winner, bids[winner], timestamp[winner]);
    }

    function get_timestamp() public view returns (uint) {
        // returns the timestamp of the last/highest bid of the bidder
        // Probably not secure! (TODO: add verification like in lecture 1)
        return timestamp[msg.sender];
    }
}
