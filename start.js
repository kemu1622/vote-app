// 同时启动投票服务器和localtunnel内网穿透
const { spawn } = require('child_process');
const path = require('path');

// 启动投票服务器
const server = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
  cwd: __dirname,
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('服务器启动失败:', err);
});

// 等服务器启动后，启动localtunnel
setTimeout(async () => {
  try {
    // 检查服务器是否正常
    const http = require('http');
    const checkServer = () => new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/api/config', (res) => {
        resolve(true);
      });
      req.on('error', reject);
      req.setTimeout(3000, () => reject(new Error('timeout')));
    });

    await checkServer();
    console.log('\n✅ 投票服务器运行中: http://localhost:3000\n');

    // 动态引入localtunnel
    let localtunnel;
    try {
      localtunnel = require('localtunnel');
    } catch (e) {
      // 需要先安装
      console.log('正在安装 localtunnel ...');
      const install = spawn('npm', ['install', 'localtunnel'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
      });
      await new Promise((resolve) => install.on('close', resolve));
      localtunnel = require('localtunnel');
    }

    // 创建隧道
    const tunnel = await localtunnel({ port: 3000 });

    console.log('\n========================================');
    console.log('  🌐 内网穿透已启动！');
    console.log('========================================');
    console.log(`  大屏展示页: ${tunnel.url}`);
    console.log(`  手机投票页: ${tunnel.url}/vote.html`);
    console.log('========================================');
    console.log('  微信扫一扫大屏上的二维码即可投票');
    console.log('========================================\n');

    // 将隧道URL写入文件，供其他程序读取
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, 'tunnel-url.txt'), tunnel.url);

    tunnel.on('close', () => {
      console.log('隧道已关闭');
    });

    tunnel.on('error', (err) => {
      console.error('隧道错误:', err.message);
    });

  } catch (err) {
    console.error('内网穿透启动失败:', err.message);
    console.log('服务器仍在本地运行: http://localhost:3000');
  }
}, 2000);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭...');
  server.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit();
});
