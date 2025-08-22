require("dotenv").config();
const https = require('https');

async function testInfuraConnection() {
  console.log("🌐 测试 Infura 连接");
  console.log("=" .repeat(50));
  
  const projectId = process.env.INFURA_PROJECT_ID;
  
  if (!projectId) {
    console.log("❌ INFURA_PROJECT_ID 环境变量未设置");
    return;
  }
  
  console.log(`项目ID: ${projectId.substring(0, 8)}...${projectId.substring(projectId.length - 4)}`);
  console.log(`项目ID长度: ${projectId.length} 字符`);
  
  if (projectId.length !== 32) {
    console.log(`⚠️  项目ID长度异常，应该是32位，当前是${projectId.length}位`);
  }
  
  // 构建URL
  const url = `https://sepolia.infura.io/v3/${projectId}`;
  console.log(`测试URL: ${url.substring(0, 50)}...`);
  
  // 测试连接
  const postData = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_chainId",
    params: [],
    id: 1
  });
  
  const options = {
    hostname: 'sepolia.infura.io',
    port: 443,
    path: `/v3/${projectId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            console.log(`❌ Infura 返回错误: ${response.error.message}`);
            if (response.error.message.includes('project id')) {
              console.log("💡 解决方案：");
              console.log("1. 检查项目ID是否正确");
              console.log("2. 确保项目状态为 Active");
              console.log("3. 确保项目支持 Sepolia 网络");
            }
          } else {
            console.log("✅ Infura 连接成功!");
            console.log(`链ID: ${parseInt(response.result, 16)} (Sepolia)`);
          }
        } catch (err) {
          console.log(`❌ 解析响应失败: ${data}`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 连接失败: ${err.message}`);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

testInfuraConnection();