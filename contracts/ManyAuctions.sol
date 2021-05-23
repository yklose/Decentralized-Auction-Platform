pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/access/Ownable.sol";

contract ManyAuctions is Ownable {
    uint256 ether_var = 10**18;
    uint interval = 5000;
    struct Auction {
        bool active;
        address[] bidders;
        mapping (address => uint) bids;
    }
    Auction[] auctions;

    modifier onlyNotOwner {
        require(msg.sender != owner());
        _;
    }

    modifier canBid(uint auction_id) {
        require(auctions.length > auction_id, "Auction does not exist");
        bool exists = false;
        for (uint256 i = 0; i < auctions[auction_id].bidders.length; i++) {
            if (auctions[auction_id].bidders[i] == msg.sender) {
                exists = true;
                break;
            }
        }
        require(exists, "Bidder not in auction");
        require(auctions[auction_id].active, "Auction not active");
        _;
    }

    function createAuction(address[] memory bidders) onlyOwner public returns (uint) {
        // https://ethereum.stackexchange.com/questions/97366/storage-arrays-with-nested-mappings-do-not-support-pusharg
        uint idx = auctions.length;
        auctions.push();
        Auction storage new_auct = auctions[idx];
        new_auct.bidders = bidders;
        new_auct.active = true;
        return (idx);
    }

    function bid(uint auction, uint new_bid) canBid(auction) public {
        Auction storage auct = auctions[auction];
        // New bid must be bigger than old bid
        require(new_bid > auct.bids[msg.sender], "Must bid more than before");
        auct.bids[msg.sender] = new_bid;
    }

    
    //returns winner, ends auction
    
    function finish(uint auction) onlyOwner public returns (address, uint) {
        Auction storage auct = auctions[auction];
        auct.active = false;
        return get_winner(auction);
    }

    function get_winner(uint auction) public view returns (address, uint) {
        Auction storage auct = auctions[auction];
        require(!auct.active);
        address winner;
        uint winning_bid;
        for (uint256 i = 0; i < auct.bidders.length; i++) {
            address curr = auct.bidders[i];
            if (auct.bids[curr] > winning_bid) {
                winner = curr;
                winning_bid = auct.bids[curr];
            }
        }
        return (winner, winning_bid);
    }

}