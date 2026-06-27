const crypto = require('crypto');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    const token = crypto.randomBytes(16).toString('hex');
    return res.status(200).json({ token });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
