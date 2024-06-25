// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityTracker {
    struct Donation {
        uint256 amount;
        uint256 timestamp;
        address donor;
    }
    

    struct Spending {
        uint256 amount;
        uint256 timestamp;
        string description;
    }


    Donation[] public donations;
    Spending[] public spendings;
    address public owner;

    event DonationMade(address indexed donor, uint256 amount);
    event SpendingMade(uint256 amount, string description);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function Receive() public payable {
        require(msg.value > 0, "Donation amount must be greater than zero");

        donations.push(Donation({
            amount: msg.value,
            timestamp: block.timestamp,
            donor: msg.sender
        }));

        emit DonationMade(msg.sender, msg.value);
    }


    function spend(uint256 amount, string memory description) public onlyOwner {
        require(amount > 0, "Spending amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient funds");

        spendings.push(Spending({
            amount: amount,
            timestamp: block.timestamp,
            description: description
        }));

        payable(owner).transfer(amount);

        emit SpendingMade(amount, description);
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }

    function getAllSpendings() public view returns (Spending[] memory) {
        return spendings;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Fallback function to receive Ether
    receive() external payable {
        emit DonationMade(msg.sender, msg.value);
    }

    fallback() external payable {
        emit DonationMade(msg.sender, msg.value);
    }
}
