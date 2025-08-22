const hre = require("hardhat");
const { ethers } = require("hardhat");
const readline = require('readline');

// 安全地从命令行读取私钥
function readPrivateKey() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // 隐藏输入（简单实现）
    process.stdout.write('\n🔑 请输入私钥 (输入时不会显示): ');
    process.stdin.setRawMode(true);
    
    let privateKey = '';
    process.stdin.on('keypress', (char, key) => {
      if (key && key.name === 'return') {
        process.stdin.setRawMode(false);
        rl.close();
        console.log('\n');
        resolve(privateKey);
      } else if (key && key.name === 'backspace') {
        privateKey = privateKey.slice(0, -1);
      } else if (char) {
        privateKey += char;
      }
    });
  });
}

async function secureDeployment() {
  console.log("🚀 安全部署脚本");
  console.log("⚠️  私钥将在内存中临时使用，不会被保存");
  
  let privateKey;
  
  // 首先尝试从环境变量获取
  if (process.env.PRIVATE_KEY) {
    privateKey = process.env.PRIVATE_KEY;
    console.log("✅ 从环境变量获取私钥");
  } else {
    // 如果没有环境变量，提示用户输入
    console.log("💡 未找到环境变量 PRIVATE_KEY");
    privateKey = await readPrivateKey();
  }
  
  // 验证私钥格式
  if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
    console.error("❌ 私钥格式错误");
    process.exit(1);
  }
  
  // 创建临时 Signer
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.SEPOLIA_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
  );
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("📍 部署账户:", wallet.address);
  
  // 检查余额
  const balance = await wallet.getBalance();
  const formatEther = ethers.formatEther || ethers.utils.formatEther;
  console.log("💰 账户余额:", formatEther(balance), "ETH");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.warn("⚠️  余额较低，可能无法完成部署");
  }
  
  // 部署合约
  console.log("\n🚀 开始部署合约...");
  
  const RedPacket = await ethers.getContractFactory("RedPacket", wallet);
  const redPacket = await RedPacket.deploy();
  await redPacket.deployed();
  
  console.log("✅ 合约部署成功!");
  console.log("📍 合约地址:", redPacket.address);
  
  // 清除私钥变量（安全措施）
  privateKey = null;
  
  return redPacket.address;
}

secureDeployment()
  .then((address) => {
    console.log(`\n🎉 部署完成! 合约地址: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 部署失败:", error.message);
    process.exit(1);
  });