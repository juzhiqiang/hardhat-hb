const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署红包合约...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  // 兼容不同版本的 ethers
  const formatEther = ethers.formatEther || ethers.utils.formatEther;
  const parseEther = ethers.parseEther || ethers.utils.parseEther;
  
  const initialBalance = await deployer.getBalance();
  console.log("账户余额:", formatEther(initialBalance), "ETH");
  
  // 部署合约
  const RedPacket = await ethers.getContractFactory("RedPacket");
  const redPacket = await RedPacket.deploy();
  await redPacket.deployed();
  
  console.log("红包合约部署成功!");
  console.log("合约地址:", redPacket.address);
  
  // 检查部署后的余额
  const balanceAfterDeploy = await deployer.getBalance();
  console.log("部署后余额:", formatEther(balanceAfterDeploy), "ETH");
  
  // 计算可用于充值的金额（留0.01 ETH作为缓冲）
  const buffer = parseEther("0.01"); // 留作缓冲
  const availableForDeposit = balanceAfterDeploy.sub(buffer);
  
  if (availableForDeposit.gt(0)) {
    console.log(`\n向合约充值 ${formatEther(availableForDeposit)} ETH...`);
    
    try {
      const depositTx = await deployer.sendTransaction({
        to: redPacket.address,
        value: availableForDeposit
      });
      await depositTx.wait();
      
      console.log("充值完成!");
      console.log("合约余额:", formatEther(await redPacket.getContractBalance()), "ETH");
      
      // 显示红包信息
      const info = await redPacket.getRedPacketInfo();
      console.log("\n红包信息:");
      console.log("- 剩余金额:", formatEther(info._remainingAmount), "ETH");
      console.log("- 已领取人数:", info._claimedCount.toString());
      console.log("- 最大领取人数:", info._maxRecipients.toString());
      console.log("- 是否已完成:", info._isFinished);
      
      console.log("\n部署完成! 现在可以开始领取红包了!");
      console.log("调用 claimRedPacket() 函数来领取红包");
      
    } catch (error) {
      console.error("充值失败:", error.message);
      console.log("但合约已成功部署，可以稍后手动充值");
    }
  } else {
    console.log("⚠️  余额不足以进行充值，但合约已成功部署");
    console.log("请向账户添加更多测试ETH后再充值");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });