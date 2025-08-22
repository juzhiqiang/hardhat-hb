require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

// 免费公共RPC节点
const FREE_RPC_URLS = {
  sepolia: [
    "https://rpc.sepolia.org",
    "https://sepolia.rpc.thirdweb.com",
    "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
    "https://sepolia.gateway.tenderly.co"
  ]
};

// 获取环境变量或使用默认值
function getSepoliaUrl() {
  // 优先使用环境变量中的URL
  if (process.env.SEPOLIA_URL) {
    return process.env.SEPOLIA_URL;
  }
  
  // 如果有Infura项目ID，构建Infura URL
  if (process.env.INFURA_PROJECT_ID) {
    return `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
  }
  
  // 使用免费公共节点
  console.log("💡 使用免费公共RPC节点");
  return FREE_RPC_URLS.sepolia[0];
}

function getPrivateKey() {
  if (!process.env.PRIVATE_KEY) {
    console.log("⚠️  请设置 PRIVATE_KEY 环境变量");
    return [];
  }
  return [process.env.PRIVATE_KEY];
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
    // Sepolia测试网络 - 自动选择可用的RPC
    sepolia: {
      url: getSepoliaUrl(),
      accounts: getPrivateKey(),
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
      timeout: 60000, // 60秒超时
    },
    // 主网
    mainnet: {
      url: process.env.MAINNET_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`,
      accounts: getPrivateKey(),
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};