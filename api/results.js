const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VOTES_FILE = path.join(process.cwd(), 'votes.json');

// 读取投票数据
function loadVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    return { voteData: {}, voters: {}, totalParticipants: 0 };
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
