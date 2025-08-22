require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

// 临时测试配置 - 仅用于调试
const TEMP_PRIVATE_KEY = ""; // 临时填入你的私钥进行测试
const TEMP_INFURA_ID = "";   // 临时填入你的Infura项目ID

// 检查环境变量函数
function getEnvVar(name, fallback = "") {
  const value = process.env[name] || fallback;
  if (!value && name !== "ETHERSCAN_API_KEY") {
    console.log(`⚠️  环境变量 ${name} 未设置，使用临时配置`);
  }
  return value;
}

// 构建配置
const privateKey = getEnvVar("PRIVATE_KEY", TEMP_PRIVATE_KEY);
const infuraId = getEnvVar("INFURA_PROJECT_ID", TEMP_INFURA_ID);

if (!privateKey || !infuraId) {
  console.error("❌ 缺少必要配置:");
  console.error("1. 检查 .env 文件是否存在");
  console.error("2. 或者在 hardhat.config.js 中临时设置 TEMP_PRIVATE_KEY 和 TEMP_INFURA_ID");
  console.error("3. 运行 'node scripts/check-env.js' 检查配置");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Sepolia测试网络
    sepolia: {
      url: infuraId ? `https://sepolia.infura.io/v3/${infuraId}` : "",
      accounts: privateKey ? [privateKey] : [],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
    },
    // 主网
    mainnet: {
      url: infuraId ? `https://mainnet.infura.io/v3/${infuraId}` : "",
      accounts: privateKey ? [privateKey] : [],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: getEnvVar("ETHERSCAN_API_KEY"),
  },
};