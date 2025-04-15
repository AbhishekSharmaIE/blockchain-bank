// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {
    struct Account {
        uint256 balance;
        uint256 lastTransaction;
        bool isActive;
    }

    mapping(address => Account) private accounts;
    address public owner;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event AccountCreated(address indexed user);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier accountExists() {
        require(accounts[msg.sender].isActive, "Account does not exist");
        _;
    }
    
    function createAccount() public {
        require(!accounts[msg.sender].isActive, "Account already exists");
        accounts[msg.sender] = Account({
            balance: 0,
            lastTransaction: block.timestamp,
            isActive: true
        });
        emit AccountCreated(msg.sender);
    }
    
    function deposit() public payable accountExists {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        accounts[msg.sender].balance += msg.value;
        accounts[msg.sender].lastTransaction = block.timestamp;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public accountExists {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        
        accounts[msg.sender].balance -= amount;
        accounts[msg.sender].lastTransaction = block.timestamp;
        totalWithdrawals += amount;
        
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
    
    function getBalance() public view accountExists returns(uint256) {
        return accounts[msg.sender].balance;
    }
    
    function getAccountInfo() public view accountExists returns(uint256 balance, uint256 lastTransaction) {
        return (accounts[msg.sender].balance, accounts[msg.sender].lastTransaction);
    }
    
    function getBankStats() public view returns(uint256 deposits, uint256 withdrawals) {
        return (totalDeposits, totalWithdrawals);
    }
} 