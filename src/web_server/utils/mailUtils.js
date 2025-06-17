const { findUserById } = require('../models/userModel');
const sessions = require('../models/sessions');
const net = require('net');

//const IP = 'server-container';
const IP = 'server-container';
const PORT = 12345;

// Sends a request to add a URL to the blacklist on the C++ server
const sendRequest = (command, url, port = PORT) => {

  return new Promise((resolve, reject) => {
    const quotedUrl = url;
    const message = `${command} ${quotedUrl}`;
    const client = new net.Socket();

    client.connect(port, IP, () => {
      client.write(message + "\n");
    });

    client.on("data", (data) => {
      const response = data.toString();
      resolve(response);
      client.destroy();
    });


    client.on("error", (err) => {
      reject(err);
      client.destroy();
    });
  });
};


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

const checkUrl = async (url) => {
  try {
    const response = await sendRequest("GET", url);

    const lines = response.split('\n').map(line => line.trim()).filter(Boolean);
    const statusLine = lines[0];
    const body = lines[1] || '';

    if (statusLine.startsWith("400") || statusLine.startsWith("404")) {
      return false; // Not valid or not found
    }

    if (statusLine.startsWith("200")) {
      return body === "true true"; // true if blacklisted, false otherwise
    }

    throw new Error(`Unexpected status line: "${statusLine}"`);
  } catch (error) {
    throw error;
  }
};

function extractUrls(text) {
  if (!text) return [];

  const results = new Set();

  // Split text into candidate words
  const words = text.split(/[\s<>"'`,;!?()]+/);

  // Matches full URLs like www.example.com or http://x.co/path
  const regex = /^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(\/\S*)?$/;

  for (const word of words) {
    if (regex.test(word)) {
      results.add(word);
    }
  }

  return Array.from(results);
}
function sortByRecent(mails = []) {
  return mails.slice().sort((a, b) => b.timestamp - a.timestamp);
}
function paginateMails(mails, pageQuery) {
  const limit = 30;
  const page = Math.max(0, parseInt(pageQuery) || 0);

  const start = page * limit;
  const end = start + limit;
  const paginated = mails.slice(start, end);

  return {
    page,
    limit,
    total: mails.length,
    mails: paginated
  };
}


module.exports = {
  getLoggedInUser,
  checkUrl,
  extractUrls,
  sendRequest,
  sortByRecent,
  paginateMails
};