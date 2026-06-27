const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VOTES_FILE = path.join(process.cwd(), 'votes.json');
const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 读取投票数据
function loadVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    const voteData = {};
    config.options.forEach(opt => { voteData[opt.id] = 0; });
    return { voteData, voters: {}, totalParticipants: 0 };
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
  
  if (req.method === 'POST') {
    const { token, optionId } = req.body;
    
    if (!token || !optionId) {
      return res.status(400).json({ error: '缺少参数' });
    }
    
    const data = loadVotes();
    
    // 检查是否已投票
    if (data.voters[token]) {
      return res.status(403).json({ error: '您已经投过票了' });
    }
    
    // 记录投票
    data.voteData[optionId] = (data.voteData[optionId] || 0) + 1;
    data.voters[token] = optionId;
    data.totalParticipants += 1;
    
    saveVotes(data);
    
    return res.status(200).json({ success: true, message: '投票成功' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
