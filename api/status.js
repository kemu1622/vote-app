const fs = require('fs');
const path = require('path');

const VOTES_FILE = path.join('/tmp', 'votes.json');

function loadVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    return { voteData: {}, voters: {}, totalParticipants: 0 };
  }
  return JSON.parse(fs.readFileSync(VOTES_FILE, 'utf-8'));
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: '缺少token参数' });
    }
    
    const data = loadVotes();
    const hasVoted = !!data.voters[token];
    
    return res.status(200).json({ hasVoted });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
