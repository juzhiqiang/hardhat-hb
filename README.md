# Hardhat 红包合约 (hardhat-hb)

一个基于以太坊的智能合约项目，实现了红包功能。合约包含 0.05 ETH，可以由 6 个人随机分配领取。

## 🎯 项目特点

- 💰 总金额：0.05 ETH
- 👥 参与人数：最多 6 人
- 🎲 随机分配：每个人获得随机金额
- 🔒 安全性：使用 OpenZeppelin 合约库
- ⛽ Gas 优化：经过优化的智能合约

## 🛠️ 技术栈

- **Hardhat**: 开发框架
- **Solidity**: 智能合约语言 (^0.8.19)
- **OpenZeppelin**: 安全的合约库
- **Ethers.js**: 以太坊交互库
- **Chai**: 测试框架

## 📦 安装依赖

```bash
npm install
```

## 🚀 快速开始

### 1. 编译合约

```bash
npm run compile
```

### 2. 运行测试

```bash
npm run test
```

### 3. 启动本地节点

```bash
npm run node
```

### 4. 部署到本地网络

```bash
npm run deploy:local
```

### 5. 与合约交互

部署成功后，将合约地址复制到 `scripts/interact.js` 中的 `CONTRACT_ADDRESS`，然后运行：

```bash
npm run interact
```

## 📋 合约功能

### 主要功能

- **claimRedPacket()**: 领取红包
- **getRedPacketInfo()**: 获取红包状态信息
- **getClaimers()**: 获取已领取用户列表
- **getContractBalance()**: 获取合约余额

### 管理员功能

- **deposit()**: 充值ETH到合约
- **emergencyWithdraw()**: 紧急提取剩余资金

## 🧪 测试

运行完整测试套件：

```bash
npm run test
```

测试覆盖：
- ✅ 合约部署
- ✅ 红包领取
- ✅ 防止重复领取
- ✅ 随机金额分配
- ✅ 6人限制
- ✅ 管理员功能
- ✅ 紧急情况处理

## 🌐 网络部署

### 配置环境变量

1. 复制 `.env.example` 到 `.env`
2. 填入你的私钥和其他配置信息

```bash
cp .env.example .env
```

### 部署到测试网

```bash
# 部署到 Sepolia 测试网
npm run deploy:sepolia

# 部署到主网 (谨慎操作!)
npm run deploy:mainnet
```

## 🔧 可用脚本

- `npm run compile` - 编译合约
- `npm run test` - 运行测试
- `npm run deploy:local` - 部署到本地网络
- `npm run deploy:sepolia` - 部署到 Sepolia 测试网
- `npm run deploy:mainnet` - 部署到主网
- `npm run interact` - 与合约交互
- `npm run node` - 启动本地 Hardhat 节点
- `npm run clean` - 清理构建文件
- `npm run coverage` - 运行测试覆盖率报告

## 💡 使用示例

### 部署和交互流程

1. **启动本地节点**
   ```bash
   npm run node
   ```

2. **部署合约**
   ```bash
   npm run deploy:local
   ```

3. **复制合约地址到交互脚本**
   ```javascript
   // 在 scripts/interact.js 中
   const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
   ```

4. **模拟多个用户领取红包**
   ```bash
   npm run interact
   ```

### 合约状态查询

```javascript
// 获取红包信息
const info = await redPacket.getRedPacketInfo();
console.log("剩余金额:", ethers.utils.formatEther(info._remainingAmount));
console.log("已领取人数:", info._claimedCount.toString());

// 检查是否已领取
const hasClaimed = await redPacket.hasClaimed(userAddress);
if (hasClaimed) {
    const amount = await redPacket.claimedAmount(userAddress);
    console.log("已领取:", ethers.utils.formatEther(amount), "ETH");
}
```

## 🔒 安全特性

- **ReentrancyGuard**: 防止重入攻击
- **Ownable**: 访问控制
- **随机算法**: 使用区块信息生成伪随机数
- **余额检查**: 防止超额提取
- **事件日志**: 完整的操作记录

## ⚠️ 注意事项

1. **测试环境**: 请先在测试网络充分测试
2. **私钥安全**: 不要将私钥提交到代码仓库
3. **Gas费用**: 主网部署需要真实的ETH作为Gas费
4. **随机性**: 当前使用区块信息生成随机数，在生产环境可考虑使用Chainlink VRF
5. **合约验证**: 部署到主网后建议进行合约验证

## 📄 许可证

本项目使用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📞 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

---

**注意**: 这是一个演示项目，请在使用真实资金前进行充分测试！