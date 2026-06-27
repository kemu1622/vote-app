const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VOTES_FILE = path.join('/tmp', 'votes.json');
const CONFIG_FILE = path.join(process.cwd(), 'config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

function loadVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    const config = loadConfig();
    const initData = { voteData: {}, voters: {}, totalParticipants: 0 };
    config.options.forEach(opt => {
      initData.voteData[opt.id] = 0;
    });
    fs.writeFileSync(VOTES_FILE, JSON.stringify(initData, null, 2));
    return initData;
  }
  return JSON.parse(fs.readFileSync(VOTES_FILE, 'utf-8'));
}

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
    const { token, optionId } = req.body || {};
    
    if (!token || !optionId) {
      return res.status(400).json({ error: '缺少参数' });
    }
    
    const data = loadVotes();
    
    // 检查是否已投票
    if (data.voters[token]) {
      return res.status(403).json({ error: '您已经投过票了' });
    }
    
    // 记录投票
    data.voters[token] = optionId;
    if (!data.voteData[optionId]) {
      data.voteData[optionId] = 0;
    }
    data.voteData[optionId]++;
    data.totalParticipants++;
    
    saveVotes(data);
    
    return res.status(200).json({ 
      success: true, 
      message: '投票成功',
      totalParticipants: data.totalParticipants
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
