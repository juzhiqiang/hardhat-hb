const hre = require("hardhat");
const { ethers } = require("hardhat");

// 你已部署的合约地址
const CONTRACT_ADDRESS = "0xb04611abf453807AC6fDB3151d7839f6f4C53225";

async function manualDeposit() {
  console.log("🔄 手动向合约充值");
  console.log("=" .repeat(50));
  
  const [deployer] = await ethers.getSigners();
  const formatEther = ethers.formatEther || ethers.utils.formatEther;
  const parseEther = ethers.parseEther || ethers.utils.parseEther;
  
  console.log("账户地址:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("当前余额:", formatEther(balance), "ETH");
  
  // 连接到已部署的合约
  const RedPacket = await ethers.getContractFactory("RedPacket");
  const redPacket = RedPacket.attach(CONTRACT_ADDRESS);
  
  console.log("合约地址:", CONTRACT_ADDRESS);
  console.log("合约当前余额:", formatEther(await redPacket.getContractBalance()), "ETH");
  
  // 计算可充值金额（留0.005 ETH作为缓冲）
  const buffer = parseEther("0.005");
  const availableForDeposit = balance.sub(buffer);
  
  if (availableForDeposit.gt(0)) {
    console.log(`\n准备充值 ${formatEther(availableForDeposit)} ETH...`);
    
    try {
      // 使用 send transaction 直接向合约发送ETH
      const tx = await deployer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: availableForDeposit
      });
      
      console.log("交易哈希:", tx.hash);
      await tx.wait();
      
      console.log("✅ 充值成功!");
      
      // 检查结果
      const newContractBalance = await redPacket.getContractBalance();
      const info = await redPacket.getRedPacketInfo();
      
      console.log("\n📊 更新后的信息:");
      console.log("- 合约余额:", formatEther(newContractBalance), "ETH");
      console.log("- 可分配金额:", formatEther(info._remainingAmount), "ETH");
      console.log("- 最大领取人数:", info._maxRecipients.toString());
      
      console.log("\n🎉 红包准备就绪！现在可以开始领取了！");
      
    } catch (error) {
      console.error("❌ 充值失败:", error.message);
    }
  } else {
    console.log("⚠️  当前余额不足以进行充值");
    console.log("请向账户添加更多测试ETH");
  }
}

manualDeposit()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });