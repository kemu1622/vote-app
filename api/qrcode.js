const QRCode = require('qrcode');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    // Vercel 部署后的域名会自动从环境变量获取
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const voteUrl = `${protocol}://${host}/vote.html`;
    
    try {
      const qrCode = await QRCode.toDataURL(voteUrl);
      return res.status(200).json({ url: voteUrl, qrCode });
    } catch (err) {
      return res.status(500).json({ error: '生成二维码失败' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
