const hre = require("hardhat");
const { ethers } = require("hardhat");

// 请在这里填入已部署的合约地址
const CONTRACT_ADDRESS = "your_deployed_contract_address_here";

async function main() {
  if (CONTRACT_ADDRESS === "your_deployed_contract_address_here") {
    console.log("请先在脚本中填入合约地址!");
    return;
  }
  
  const [account] = await ethers.getSigners();
  const formatEther = ethers.formatEther || ethers.utils.formatEther;
  
  console.log("=".repeat(60));
  console.log("🔍 详细余额验证");
  console.log("=".repeat(60));
  
  console.log("📍 账户信息:");
  console.log("   地址:", account.address);
  console.log("   网络:", hre.network.name);
  console.log("   链ID:", hre.network.config.chainId || "未知");
  
  // 连接到合约
  const RedPacket = await ethers.getContractFactory("RedPacket");
  const redPacket = RedPacket.attach(CONTRACT_ADDRESS);
  
  console.log("\n📋 合约信息:");
  console.log("   合约地址:", CONTRACT_ADDRESS);
  console.log("   合约余额:", formatEther(await redPacket.getContractBalance()), "ETH");
  
  // 获取用户当前余额
  const balanceBefore = await account.getBalance();
  console.log("\n💰 领取前用户余额:", formatEther(balanceBefore), "ETH");
  
  // 检查是否已经领取过
  const hasClaimed = await redPacket.hasClaimed(account.address);
  console.log("   是否已领取:", hasClaimed);
  
  if (hasClaimed) {
    const claimedAmount = await redPacket.claimedAmount(account.address);
    console.log("   已领取金额:", formatEther(claimedAmount), "ETH");
    console.log("\n✅ 您已经成功领取过红包!");
    console.log("💡 请检查 MetaMask 是否连接到正确的网络:");
    console.log("   - 网络: Localhost 8545");
    console.log("   - RPC: http://127.0.0.1:8545");
    console.log("   - 链ID: 31337");
    console.log("   - 账户地址:", account.address);
    return;
  }
  
  // 尝试领取红包
  console.log("\n🎁 尝试领取红包...");
  
  try {
    const tx = await redPacket.claimRedPacket();
    console.log("   交易哈希:", tx.hash);
    console.log("   等待确认...");
    
    const receipt = await tx.wait();
    console.log("   ✅ 交易确认成功!");
    console.log("   ⛽ Gas 使用量:", receipt.gasUsed.toString());
    console.log("   💸 Gas 价格:", formatEther(receipt.effectiveGasPrice || receipt.gasPrice), "ETH");
    
    const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice || receipt.gasPrice);
    console.log("   💰 总 Gas 费用:", formatEther(gasUsed), "ETH");
    
    // 获取领取后的余额
    const balanceAfter = await account.getBalance();
    const claimedAmount = await redPacket.claimedAmount(account.address);
    
    console.log("\n📊 交易结果:");
    console.log("   领取前余额:", formatEther(balanceBefore), "ETH");
    console.log("   领取后余额:", formatEther(balanceAfter), "ETH");
    console.log("   获得红包:", formatEther(claimedAmount), "ETH");
    console.log("   Gas 费用:", formatEther(gasUsed), "ETH");
    console.log("   净收益:", formatEther(claimedAmount.sub(gasUsed)), "ETH");
    
    const actualIncrease = balanceAfter.sub(balanceBefore);
    console.log("   实际增加:", formatEther(actualIncrease), "ETH");
    
    console.log("\n🎉 红包领取成功!");
    console.log("💡 如果 MetaMask 中余额没有更新，请:");
    console.log("   1. 确认 MetaMask 连接到 Localhost 8545 网络");
    console.log("   2. 刷新 MetaMask (点击账户名旁的刷新按钮)");
    console.log("   3. 确认显示的账户地址为:", account.address);
    console.log("   4. 检查 MetaMask 的活动记录中是否有这笔交易");
    
    // 验证事件
    const filter = redPacket.filters.RedPacketClaimed(account.address);
    const events = await redPacket.queryFilter(filter);
    
    if (events.length > 0) {
      const event = events[events.length - 1];
      console.log("\n📝 事件验证:");
      console.log("   事件类型: RedPacketClaimed");
      console.log("   领取者:", event.args.claimer);
      console.log("   金额:", formatEther(event.args.amount), "ETH");
      console.log("   区块号:", event.blockNumber);
    }
    
  } catch (error) {
    console.error("\n❌ 领取失败:", error.message);
    
    if (error.message.includes("Already claimed")) {
      console.log("💡 您已经领取过红包了");
    } else if (error.message.includes("No remaining amount")) {
      console.log("💡 红包余额不足");
    } else if (error.message.includes("All red packets claimed")) {
      console.log("💡 红包已经被领完了");
    }
  }
  
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("脚本执行失败:", error);
    process.exit(1);
  });