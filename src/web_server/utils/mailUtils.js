const { findUserById } = require('../models/userModel');
const sessions = require('../models/sessions');
const net = require('net');

function getLoggedInUser(req, res) {
  const userId = req.headers['id'];
  if (!userId) {
    res.status(401).json({ error: 'Missing user ID in header' });
    return null;
  }

  const user = findUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Invalid user ID' });
    return null;
  }

  if (!sessions.has(userId)) {
    res.status(401).json({ error: 'Unauthorized: user is not logged in' });
    return null;
  }


  return user;
}

function checkUrlAgainstBloomServer(url, host = '127.0.0.1', port = 12345) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = '';

    client.connect(port, host, () => {
      client.write(`GET ${url}\n`);
    });

    client.on('data', (data) => {
      responseData += data.toString();
      if (responseData.includes('\n\n')) {
        client.destroy(); // disconnect
      }
    });

    client.on('close', () => {
      if (responseData.startsWith('404')) {
        return resolve(false);
      }

      if (responseData.startsWith('200')) {
        const body = responseData.split('\n\n')[1]?.trim();
        return resolve(body === 'true true');
      }

      console.error('Unexpected response from bloom server:', responseData);
      reject(new Error('Unexpected response format'));
    });

    client.on('error', (err) => {
      console.error('Bloom filter server error:', err);
      reject(err);
    });
  });
}

function extractUrls(text) {
  if (!text) return [];
  const urlRegex = /\b((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S*)?\b/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

module.exports = {
  getLoggedInUser,
  checkUrlAgainstBloomServer,
  extractUrls
};