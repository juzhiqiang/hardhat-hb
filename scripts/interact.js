const hre = require("hardhat");
const { ethers } = require("hardhat");

// 请在这里填入已部署的合约地址
const CONTRACT_ADDRESS = "your_deployed_contract_address_here";

async function main() {
  if (CONTRACT_ADDRESS === "your_deployed_contract_address_here") {
    console.log("请先在脚本中填入合约地址!");
    console.log("部署合约后，将合约地址复制到 CONTRACT_ADDRESS 变量中");
    return;
  }
  
  const [account] = await ethers.getSigners();
  console.log("当前账户:", account.address);
  
  // 兼容不同版本的 ethers
  const formatEther = ethers.formatEther || ethers.utils.formatEther;
  const parseEther = ethers.parseEther || ethers.utils.parseEther;
  
  console.log("账户余额:", formatEther(await account.getBalance()), "ETH");
  
  // 连接到已部署的合约
  const RedPacket = await ethers.getContractFactory("RedPacket");
  const redPacket = RedPacket.attach(CONTRACT_ADDRESS);
  
  console.log("\n连接到红包合约:", CONTRACT_ADDRESS);
  
  try {
    // 获取红包信息
    const info = await redPacket.getRedPacketInfo();
    console.log("\n红包信息:");
    console.log("- 剩余金额:", formatEther(info._remainingAmount), "ETH");
    console.log("- 已领取人数:", info._claimedCount.toString());
    console.log("- 最大领取人数:", info._maxRecipients.toString());
    console.log("- 是否已完成:", info._isFinished);
    
    // 检查当前账户是否已经领取
    const hasClaimed = await redPacket.hasClaimed(account.address);
    console.log("- 当前账户是否已领取:", hasClaimed);
    
    if (hasClaimed) {
      const claimedAmount = await redPacket.claimedAmount(account.address);
      console.log("- 已领取金额:", formatEther(claimedAmount), "ETH");
    }
    
    // 显示已领取者列表
    const claimers = await redPacket.getClaimers();
    if (claimers.length > 0) {
      console.log("\n已领取者列表:");
      for (let i = 0; i < claimers.length; i++) {
        const claimerAddress = claimers[i];
        const amount = await redPacket.claimedAmount(claimerAddress);
        console.log(`${i + 1}. ${claimerAddress}: ${formatEther(amount)} ETH`);
      }
    }
    
    // 如果还没有领取且红包还没结束，尝试领取
    if (!hasClaimed && !info._isFinished) {
      console.log("\n尝试领取红包...");
      
      try {
        const balanceBefore = await account.getBalance();
        const tx = await redPacket.claimRedPacket();
        console.log("交易哈希:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("交易确认!");
        
        const balanceAfter = await account.getBalance();
        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice || receipt.gasPrice);
        const claimedAmount = await redPacket.claimedAmount(account.address);
        
        console.log("\n领取成功!");
        console.log("- 获得金额:", formatEther(claimedAmount), "ETH");
        console.log("- Gas费用:", formatEther(gasUsed), "ETH");
        console.log("- 净收益:", formatEther(claimedAmount.sub(gasUsed)), "ETH");
        
      } catch (error) {
        console.error("领取失败:", error.message);
      }
    } else if (hasClaimed) {
      console.log("\n您已经领取过红包了!");
    } else if (info._isFinished) {
      console.log("\n红包已经被领完了!");
    }
    
  } catch (error) {
    console.error("连接合约失败:", error.message);
    console.log("请检查:");
    console.log("1. 合约地址是否正确");
    console.log("2. 本地节点是否正在运行");
    console.log("3. 合约是否已正确部署");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });