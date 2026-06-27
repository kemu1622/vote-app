module.exports = (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const configPath = path.join(process.cwd(), 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json(config);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
