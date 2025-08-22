require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

// 检查环境变量
function checkEnvVar(name, value) {
  if (!value || value === "") {
    console.error(`❌ 环境变量 ${name} 未设置或为空`);
    console.error(`请在 .env 文件中设置 ${name}`);
    process.exit(1);
  }
}

// 验证必需的环境变量
if (process.env.NODE_ENV !== "test") {
  // 只在非测试环境下检查
  const requiredForSepolia = process.argv.includes("sepolia");
  const requiredForMainnet = process.argv.includes("mainnet");
  
  if (requiredForSepolia) {
    checkEnvVar("INFURA_PROJECT_ID", process.env.INFURA_PROJECT_ID);
    checkEnvVar("PRIVATE_KEY", process.env.PRIVATE_KEY);
  }
  
  if (requiredForMainnet) {
    checkEnvVar("INFURA_PROJECT_ID", process.env.INFURA_PROJECT_ID);
    checkEnvVar("PRIVATE_KEY", process.env.PRIVATE_KEY);
  }
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
      url: process.env.INFURA_PROJECT_ID 
        ? `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}` 
        : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
    },
    // 主网
    mainnet: {
      url: process.env.INFURA_PROJECT_ID 
        ? `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}` 
        : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};