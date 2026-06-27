const fs = require('fs');
const path = require('path');

// Vercel 文件系统只读，投票数据存到 /tmp
const VOTES_FILE = path.join('/tmp', 'votes.json');
const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 读取配置
function loadConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  return config;
}

// 读取投票数据
function loadVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    const config = loadConfig();
    const initData = { voteData: {}, voters: {}, totalParticipants: 0 };
    // 初始化每个选项的票数为0
    config.options.forEach(opt => {
      initData.voteData[opt.id] = 0;
    });
    fs.writeFileSync(VOTES_FILE, JSON.stringify(initData, null, 2));
    return initData;
  }
  const data = fs.readFileSync(VOTES_FILE, 'utf-8');
  return JSON.parse(data);
}

// 保存投票数据
function saveVotes(data) {
  fs.writeFileSync(VOTES_FILE, JSON.stringify(data, null, 2));
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    const data = loadVotes();
    return res.status(200).json({
      voteData: data.voteData,
      totalParticipants: data.totalParticipants
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
