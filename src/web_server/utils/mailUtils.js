const { findUserById } = require('../models/userModel');
const sessions = require('../models/sessions');
const net = require('net');
const MailUserView = require('../models/mailUserView');

const IP = process.env.CPP_SERVER_IP || '127.0.0.1';
const PORT = parseInt(process.env.CPP_SERVER_PORT, 10) || 12345;

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


async function getLoggedInUser(req, res) {
  const userId = req.headers['id'];
  if (!userId) {
    res.status(401).json({ error: 'Missing user ID in header' });
    return null;
  }

  const user = await findUserById(userId);
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
async function paginateMails({ username, folder, pageQuery }) {
  const limit = 30;
  const page = Math.max(0, parseInt(pageQuery) || 0);
  const skip = page * limit;

  // Query mail views for the user in the specified folder
  const [total, views] = await Promise.all([
    MailUserView.countDocuments({ username, folder }),
    MailUserView.find({ username, folder })
      .sort({ deletedAt: -1, timestamp: -1 }) // fallback sort
      .skip(skip)
      .limit(limit)
      .populate('mailId')
      .lean()
  ]);

  // Map to clean format
  const mails = views.map(view => {
    const { mailId: mail, ...meta } = view;
    const { timestamp, ...mailWithoutTimestamp } = mail;
    return {
      ...mailWithoutTimestamp,
      read: meta.read,
      starred: meta.starred,
      folder: meta.folder
    };
  });

  return {
    page,
    limit,
    total,
    mails
  };
}

function dedupeByMailId(views) {
  const seen = new Set();
  return views.filter(v => {
    const id = (v.mailId._id || v.mailId).toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}


module.exports = {
  getLoggedInUser,
  checkUrl,
  extractUrls,
  sendRequest,
  sortByRecent,
  dedupeByMailId,
  paginateMails
};