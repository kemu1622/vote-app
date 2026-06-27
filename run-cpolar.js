// 启动cpolar并自动获取/写入URL
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverProcess = spawn(process.execPath, ['server.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'inherit', 'inherit']
});

serverProcess.on('error', (err) => {
  console.error('服务器启动失败:', err.message);
  process.exit(1);
});

setTimeout(() => {
  const cpolarPath = 'C:\\Program Files\\cpolar\\cpolar.exe';
  const cpolar = spawn(cpolarPath, ['http', '3000', '-log', 'stdout', '-log-level', 'INFO'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let tunnelUrl = '';

  cpolar.stdout.on('data', (data) => {
    const text = data.toString();
    console.log('[cpolar]', text.trim());

    // 从输出中提取URL（支持 cn / top / io / vip.cpolar.cn 等格式）
    const urlMatch = text.match(/https?:\/\/[a-z0-9-]+\.(cpolar\.(cn|top|io)|r\d+\.vip\.cpolar\.cn)/);
    if (urlMatch && !tunnelUrl) {
      tunnelUrl = urlMatch[0];
      console.log('\n========================================');
      console.log('  🌐 cpolar 内网穿透已启动！');
      console.log('========================================');
      console.log(`  大屏展示页: ${tunnelUrl}`);
      console.log(`  手机投票页: ${tunnelUrl}/vote.html`);
      console.log('========================================');
      console.log('  微信扫一扫大屏上的二维码即可投票');
      console.log('========================================\n');

      fs.writeFileSync(path.join(__dirname, 'tunnel-url.txt'), tunnelUrl);
    }
  });

  cpolar.stderr.on('data', (data) => {
    console.error('[cpolar ERR]', data.toString().trim());
  });

  cpolar.on('close', (code) => {
    console.log(`cpolar 进程退出，代码: ${code}`);
  });

  cpolar.on('error', (err) => {
    console.error('cpolar 启动失败:', err.message);
    console.log('请确保已安装 cpolar 并配置 authtoken');
  });

  process.on('SIGINT', () => {
    cpolar.kill();
    serverProcess.kill();
    process.exit();
  });
}, 2000);

console.log('正在启动投票服务器和 cpolar 隧道...');
