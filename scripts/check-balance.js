const { ethers } = require("hardhat");

async function checkBalance() {
  // 请填入你的钱包地址
  const walletAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // 替换为你的地址
  
  const provider = ethers.provider;
  const balance = await provider.getBalance(walletAddress);
  const formatEther = ethers.formatEther || ethers.utils.formatEther;
  
  console.log("=".repeat(50));
  console.log("💰 钱包余额检查");
  console.log("=".repeat(50));
  console.log("地址:", walletAddress);
  console.log("余额:", formatEther(balance), "ETH");
  console.log("=".repeat(50));
}

checkBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });