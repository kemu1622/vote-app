const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 读取配置
let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

// 数据存储（内存中）
const voteData = {};
config.options.forEach(opt => { voteData[opt.id] = 0; });

// 已投票记录（token -> optionId）
const voters = new Map();
let totalParticipants = 0;

// SSE 客户端列表
const sseClients = [];

// 生成或验证投票者token
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// 广播更新给所有大屏客户端
function broadcastUpdate() {
  const results = getResults();
  const payload = JSON.stringify({
    type: 'update',
    data: results
  });
  sseClients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
}

// 获取结果
function getResults() {
  const total = Object.values(voteData).reduce((a, b) => a + b, 0);
  const results = config.options.map(opt => ({
    id: opt.id,
    name: opt.name,
    desc: opt.desc,
    color: opt.color,
    votes: voteData[opt.id],
    percentage: total > 0 ? ((voteData[opt.id] / total) * 100).toFixed(1) : '0.0'
  }));
  results.sort((a, b) => b.votes - a.votes);
  return { results, totalVotes: total, totalParticipants };
}

// ====== API 路由 ======

// 获取投票配置
app.get('/api/config', (req, res) => {
  res.json({
    title: config.title,
    subtitle: config.subtitle,
    maxVotes: config.maxVotes,
    options: config.options.map(o => ({ id: o.id, name: o.name, desc: o.desc, color: o.color }))
  });
});

// 获取当前结果
app.get('/api/results', (req, res) => {
  res.json(getResults());
});

// 提交投票
app.post('/api/vote', (req, res) => {
  const { token, optionId } = req.body;

  if (!token) {
    return res.status(400).json({ error: '缺少投票凭证' });
  }

  if (!config.options.find(o => o.id === optionId)) {
    return res.status(400).json({ error: '无效的投票选项' });
  }

  // 检查是否已投票
  if (voters.has(token)) {
    return res.status(403).json({ error: '您已经投过票了，每人限投一票', voted: true, optionId: voters.get(token) });
  }

  // 记录投票
  voters.set(token, optionId);
  voteData[optionId] = (voteData[optionId] || 0) + 1;
  totalParticipants++;

  // 广播更新
  broadcastUpdate();

  res.json({ success: true, message: '投票成功' });
});

// 检查投票状态
app.get('/api/status', (req, res) => {
  const token = req.query.token;
  if (token && voters.has(token)) {
    res.json({ voted: true, optionId: voters.get(token) });
  } else {
    res.json({ voted: false });
  }
});

// 生成新token
app.get('/api/token', (req, res) => {
  res.json({ token: generateToken() });
});

// SSE 实时推送
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 立即推送一次当前数据
  const results = getResults();
  res.write(`data: ${JSON.stringify({ type: 'update', data: results })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx > -1) sseClients.splice(idx, 1);
  });
});

// 生成二维码（指向手机投票页）
app.get('/api/qrcode', async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  const protocol = req.headers['x-forwarded-proto'] || (req.headers.host && req.headers.host.includes('localhost') ? 'http' : 'https');
  const voteUrl = `${protocol}://${host}/vote.html`;

  try {
    const qrDataUrl = await QRCode.toDataURL(voteUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });
    res.json({ qrCode: qrDataUrl, url: voteUrl });
  } catch (err) {
    res.status(500).json({ error: '二维码生成失败' });
  }
});

// 重置投票（管理接口）
app.post('/api/reset', (req, res) => {
  config.options.forEach(opt => { voteData[opt.id] = 0; });
  voters.clear();
  totalParticipants = 0;
  broadcastUpdate();
  res.json({ success: true, message: '投票已重置' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  投票系统已启动！`);
  console.log(`========================================`);
  console.log(`  大屏展示页:  http://localhost:${PORT}`);
  console.log(`  手机投票页:  http://localhost:${PORT}/vote.html`);
  console.log(`========================================\n`);
});
