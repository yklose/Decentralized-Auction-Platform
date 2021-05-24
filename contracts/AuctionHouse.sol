//pragma solidity ^0.5.8;
pragma solidity ^0.8.0;

contract AuctionHouse {

    struct Auction {
        address owner;
        uint endtime; 
        bool active; 
        address[] bidders;
        mapping (address => uint) bids;
        mapping (address => uint) deposit;   
    }

    Auction[] auctions;

    // define variables
    uint256 ether_var = 10**18;
    uint256 max_num_contracts = 10**10;
    uint256 interval = 7;

    // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint amount);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public payable{
        // TODO: add something here
    }

    function get_owner(uint idx) public view returns (address){
        // returns the address of the owner for certain id 
        return auctions[idx].owner;
    }

    function is_owner(address add, uint idx) public view returns (bool){
        if (add == auctions[idx].owner){
            return true;
        }
        else{
            return false;
        }
    }

    function get_id(address owner) public view returns (uint){
        for (uint256 idx = 0; idx < auctions.length; idx++) {
            if (is_owner(owner, idx)){
                return idx;
            }
        }
        return max_num_contracts+1; // TODO: larger value
    }

    function deploy_auction() public payable{
        // deploy an auction
        uint idx = auctions.length;
        // check if maximum number of contracts is reached
        if (idx < max_num_contracts){
            auctions.push();
            // define parameters
            Auction storage new_auct = auctions[idx];
            new_auct.endtime = block.number + interval;
            new_auct.owner = msg.sender;
        }
    }

    function start_auction(uint idx) public payable {
        //start the auction, setting timelimit, can only not be reactivated
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

    function set_bid(uint idx, uint bid_value) public {
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
                            auctions[idx].bids[msg.sender] = bid_value;
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
        require((auctions[idx].endtime < block.number));
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
        // refund the deposit if action is not active 
        require(auctions[idx].active == false);
        payable(msg.sender).transfer(auctions[idx].deposit[msg.sender]);
        auctions[idx].deposit[msg.sender] = 0;
    }

}
