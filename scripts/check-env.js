require("dotenv").config();

console.log("🔍 检查环境变量配置");
console.log("=" .repeat(50));

const envVars = {
  "PRIVATE_KEY": process.env.PRIVATE_KEY,
  "INFURA_PROJECT_ID": process.env.INFURA_PROJECT_ID,
  "SEPOLIA_URL": process.env.SEPOLIA_URL,
  "ETHERSCAN_API_KEY": process.env.ETHERSCAN_API_KEY
};

let hasError = false;

Object.entries(envVars).forEach(([key, value]) => {
  if (!value || value.trim() === "") {
    console.log(`❌ ${key}: 未设置或为空`);
    hasError = true;
  } else {
    // 隐藏敏感信息
    const displayValue = key === "PRIVATE_KEY" 
      ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}`
      : key === "INFURA_PROJECT_ID"
      ? `${value.substring(0, 8)}...`
      : value;
    console.log(`✅ ${key}: ${displayValue}`);
  }
});

console.log("=" .repeat(50));

if (hasError) {
  console.log("❌ 发现配置问题，请检查 .env 文件");
  console.log("\n📝 .env 文件示例：");
  console.log("PRIVATE_KEY=0x1234567890abcdef...");
  console.log("INFURA_PROJECT_ID=abc123def456...");
  console.log("SEPOLIA_URL=https://sepolia.infura.io/v3/abc123def456...");
  console.log("ETHERSCAN_API_KEY=ABC123XYZ...");
  process.exit(1);
} else {
  console.log("✅ 所有环境变量配置正确！");
  
  // 测试构建的 Sepolia URL
  const sepoliaUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
  console.log(`\n🌐 Sepolia URL: ${sepoliaUrl}`);
}