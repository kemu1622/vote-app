const fs = require('fs');
const path = require('path');

const VOTES_FILE = path.join(process.cwd(), 'votes.json');

// 读取投票数据
function loadVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    return { voteData: {}, voters: {}, totalParticipants: 0 };
  }
  const data = fs.readFileSync(VOTES_FILE, 'utf-8');
  return JSON.parse(data);
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    const token = req.query.token;
    
    if (!token) {
      return res.status(400).json({ error: '缺少token参数' });
    }
    
    const data = loadVotes();
    const voted = data.voters[token] !== undefined;
    const optionId = voted ? data.voters[token] : null;
    
    return res.status(200).json({ voted, optionId });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
