require("dotenv").config();
const { ethers } = require("hardhat");

async function testPrivateKey() {
  console.log("🔑 私钥格式检查");
  console.log("=" .repeat(50));
  
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.log("❌ PRIVATE_KEY 环境变量未设置");
    return;
  }
  
  console.log(`私钥长度: ${privateKey.length} 字符`);
  console.log(`私钥前缀: ${privateKey.substring(0, 4)}`);
  
  // 检查格式
  if (!privateKey.startsWith("0x")) {
    console.log("❌ 私钥必须以 '0x' 开头");
    return;
  }
  
  if (privateKey.length !== 66) {
    console.log(`❌ 私钥长度错误。应该是66个字符，实际是${privateKey.length}个字符`);
    console.log("正确格式: 0x + 64个十六进制字符");
    return;
  }
  
  // 尝试创建钱包
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("✅ 私钥格式正确!");
    console.log(`钱包地址: ${wallet.address}`);
  } catch (error) {
    console.log("❌ 私钥无效:", error.message);
  }
}

testPrivateKey();