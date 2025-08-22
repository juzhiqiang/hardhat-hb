// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RedPacket 红包合约
 * @dev 允许6个用户随机分配领取0.05 ETH的红包
 */
contract RedPacket is ReentrancyGuard, Ownable {
    uint256 public constant TOTAL_AMOUNT = 0.05 ether;
    uint256 public constant MAX_RECIPIENTS = 6;
    
    uint256 public remainingAmount;
    uint256 public claimedCount;
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public claimedAmount;
    
    address[] public claimers;
    
    event RedPacketClaimed(address indexed claimer, uint256 amount);
    event RedPacketCreated(uint256 totalAmount, uint256 maxRecipients);
    event RedPacketFinished();
    
    constructor() {
        remainingAmount = 0; // 初始化为0，需要充值后才能使用
        emit RedPacketCreated(TOTAL_AMOUNT, MAX_RECIPIENTS);
    }
    
    /**
     * @dev 领取红包
     */
    function claimRedPacket() external nonReentrant {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(claimedCount < MAX_RECIPIENTS, "All red packets claimed");
        require(remainingAmount > 0, "No remaining amount");
        
        uint256 amount;
        
        // 如果是最后一个人，给剩余的所有金额
        if (claimedCount == MAX_RECIPIENTS - 1) {
            amount = remainingAmount;
        } else {
            // 随机分配金额，确保至少给后面的人留一些
            uint256 remainingRecipients = MAX_RECIPIENTS - claimedCount;
            uint256 maxAmount = (remainingAmount * 2) / remainingRecipients; // 最多分配平均值的2倍
            
            // 生成伪随机数
            uint256 randomSeed = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.difficulty,
                msg.sender,
                claimedCount,
                remainingAmount
            )));
            
            amount = (randomSeed % maxAmount) + 1; // 至少1 wei
            
            // 确保不超过剩余金额
            if (amount > remainingAmount) {
                amount = remainingAmount;
            }
        }
        
        // 更新状态
        hasClaimed[msg.sender] = true;
        claimedAmount[msg.sender] = amount;
        remainingAmount -= amount;
        claimedCount++;
        claimers.push(msg.sender);
        
        // 转账
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RedPacketClaimed(msg.sender, amount);
        
        // 如果所有红包都被领完
        if (claimedCount == MAX_RECIPIENTS) {
            emit RedPacketFinished();
        }
    }
    
    /**
     * @dev 获取已领取用户列表
     */
    function getClaimers() external view returns (address[] memory) {
        return claimers;
    }
    
    /**
     * @dev 获取红包状态信息
     */
    function getRedPacketInfo() external view returns (
        uint256 _remainingAmount,
        uint256 _claimedCount,
        uint256 _maxRecipients,
        bool _isFinished
    ) {
        return (
            remainingAmount,
            claimedCount,
            MAX_RECIPIENTS,
            claimedCount >= MAX_RECIPIENTS
        );
    }
    
    /**
     * @dev 充值函数，只有合约拥有者可以充值
     */
    function deposit() external payable onlyOwner {
        remainingAmount += msg.value;
    }
    
    /**
     * @dev 紧急提取函数，只有合约拥有者可以提取剩余资金
     */
    function emergencyWithdraw() external onlyOwner {
        require(claimedCount >= MAX_RECIPIENTS, "Red packet not finished yet");
        
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "Withdraw failed");
        }
    }
    
    /**
     * @dev 接收ETH
     */
    receive() external payable {
        remainingAmount += msg.value;
    }
    
    /**
     * @dev 获取合约余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}