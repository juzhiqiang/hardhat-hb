const https = require('https');

async function testSpecificUrl() {
  console.log("🌐 测试具体的 Infura URL");
  console.log("=" .repeat(50));
  
  const url = "https://sepolia.infura.io/v3/4522c2c01dce4532a23dd57f9c816286";
  console.log(`测试URL: ${url}`);
  
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
    path: '/v3/4522c2c01dce4532a23dd57f9c816286',
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
            console.log("错误代码:", response.error.code);
            
            if (response.error.message.includes('project id')) {
              console.log("\n💡 可能的解决方案：");
              console.log("1. 检查项目ID是否正确");
              console.log("2. 确保Infura项目状态为 Active");
              console.log("3. 确保项目支持 Sepolia 网络");
              console.log("4. 检查API密钥是否被暂停");
            }
          } else if (response.result) {
            console.log("✅ Infura 连接成功!");
            console.log(`链ID: ${parseInt(response.result, 16)} (应该是 11155111 for Sepolia)`);
            
            // 进一步测试：获取最新区块
            testLatestBlock();
          } else {
            console.log("⚠️  响应格式异常:", response);
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

async function testLatestBlock() {
  console.log("\n🔍 测试获取最新区块...");
  
  const postData = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 2
  });
  
  const options = {
    hostname: 'sepolia.infura.io',
    port: 443,
    path: '/v3/4522c2c01dce4532a23dd57f9c816286',
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
          
          if (response.result) {
            const blockNumber = parseInt(response.result, 16);
            console.log(`✅ 最新区块号: ${blockNumber}`);
            console.log("🎉 Infura 连接完全正常，可以进行部署！");
          }
        } catch (err) {
          console.log("⚠️  获取区块信息失败");
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 获取区块失败: ${err.message}`);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

testSpecificUrl();