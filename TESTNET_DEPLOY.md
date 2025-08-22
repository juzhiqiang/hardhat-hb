# 🌐 测试网络部署指南

## 📋 部署前准备清单

### ✅ 必需准备项目

1. **🚰 获取测试网 ETH**
   - [ ] 访问 Sepolia 水龙头：https://sepoliafaucet.com/
   - [ ] 获取至少 0.1 ETH（用于部署和交易费用）

2. **🔑 创建 Infura 账户**
   - [ ] 注册：https://infura.io/
   - [ ] 创建新项目
   - [ ] 复制项目ID

3. **💰 准备测试钱包**
   - [ ] 创建新的测试钱包（不要使用主钱包）
   - [ ] 记录私钥
   - [ ] 向钱包地址申请测试ETH

4. **🔍 Etherscan API（可选）**
   - [ ] 注册：https://etherscan.io/register
   - [ ] 创建API密钥（用于合约验证）

## ⚙️ 配置步骤

### 1. 环境变量配置
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入实际值
```

### 2. .env 文件内容
```env
# 测试钱包私钥
PRIVATE_KEY=0x1234567890abcdef...

# Infura项目ID
INFURA_PROJECT_ID=your_project_id_here

# Sepolia网络URL
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id_here

# Etherscan API密钥
ETHERSCAN_API_KEY=ABC123XYZ...
```

## 🚀 部署流程

### 1. 编译合约
```bash
npm run compile
```

### 2. 运行测试
```bash
npm run test
```

### 3. 部署到 Sepolia
```bash
npm run deploy:sepolia
```

### 4. 验证合约（可选）
```bash
npx hardhat verify --network sepolia 合约地址
```

## 📱 MetaMask 配置

### Sepolia 测试网络
- **网络名称**: Sepolia Test Network
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **链ID**: 11155111
- **货币符号**: ETH
- **区块浏览器**: https://sepolia.etherscan.io

## 💰 成本估算

### Gas 费用（Sepolia）
- **部署合约**: ~0.01-0.02 ETH
- **充值红包**: ~0.001 ETH
- **领取红包**: ~0.0005 ETH/次

### 建议准备
- **部署者**: 0.05 ETH
- **测试用户**: 0.01 ETH/人

## 🔗 有用链接

### 水龙头
- Sepolia Faucet: https://sepoliafaucet.com/
- Alchemy Faucet: https://www.alchemy.com/faucets/ethereum-sepolia
- QuickNode Faucet: https://faucet.quicknode.com/ethereum/sepolia

### 区块浏览器
- Sepolia Etherscan: https://sepolia.etherscan.io/

### RPC 提供商
- Infura: https://infura.io/
- Alchemy: https://www.alchemy.com/
- QuickNode: https://www.quicknode.com/

## 🚨 安全提醒

- ⚠️ **永远不要在主网使用测试私钥**
- ⚠️ **不要将私钥提交到代码仓库**
- ⚠️ **使用专门的测试钱包**
- ⚠️ **确保 .env 文件在 .gitignore 中**

## 📞 常见问题

### Q: 交易失败，显示 "insufficient funds"
A: 确保钱包有足够的测试ETH支付Gas费用

### Q: 连接失败，显示网络错误
A: 检查Infura项目ID是否正确，URL是否完整

### Q: 合约验证失败
A: 确保Etherscan API密钥正确，编译器版本匹配

### Q: MetaMask没有显示交易
A: 确认网络配置正确，刷新MetaMask