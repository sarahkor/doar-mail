const { findUserById } = require('../models/userModel');
const sessions = require('../models/sessions');
const net = require('net');

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
      console.error("Error occurred:", err);
      reject(err);
      client.destroy();
    });
  });
};


function getLoggedInUser(req, res) {
   /* ===== DEV AUTH-BYPASS – להסיר כש-Login מוכן ===== */
  if (process.env.DISABLE_AUTH === 'true') {
    // משתמש דמה לסביבת פיתוח
    return { id: 0, name: 'Dev User' };
  }
  /* ===== /DEV AUTH-BYPASS ===== */

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

  /************ */

  // const userId = req.headers['id'];
  // if (!userId) {
  //   res.status(401).json({ error: 'Missing user ID in header' });
  //   return null;
  // }

  // const user = findUserById(userId);
  // if (!user) {
  //   res.status(401).json({ error: 'Invalid user ID' });
  //   return null;
  // }

  // if (!sessions.has(userId)) {
  //   res.status(401).json({ error: 'Unauthorized: user is not logged in' });
  //   return null;
  // }


  // return user;
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
    console.error("Error in checkUrl:", error);
    throw error;
  }
};

function extractUrls(text) {
  if (!text) return [];

  const results = new Set();

  // Split the input into words (this includes "dorwww.s.com")
  const words = text.split(/[\s<>\"\',]+/);
  const regex = /^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S*)?$/;

  for (const word of words) {
    // Check every possible substring
    for (let start = 0; start < word.length; start++) {
      for (let end = start + 1; end <= word.length; end++) {
        const sub = word.slice(start, end);
        if (regex.test(sub)) {
          results.add(sub);
        }
      }
    }
  }

  return Array.from(results);
}

module.exports = {
  getLoggedInUser,
  checkUrl,
  extractUrls,
  sendRequest
};