const { add, remove } = require('../models/blacklistModel');
// Adds a new URL to the blacklist
exports.addToBlacklist = async (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Missing or malformed request body. Did you forget Content-Type: application/json' });
    }
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Missing "url" field in request body.' });
    }

    try {
        const response = await add(url);
        const statusCode = parseInt(response.split(' ')[0]);
        if (statusCode === 201) {
            return res.status(201).json({ url });
        } else if (statusCode === 400) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Removes a URL from the blacklist by ID
exports.removeFromBlacklist = async (req, res) => {
    const encodedUrl = req.params.url;
    const url = decodeURIComponent(encodedUrl);

    if (!url) {
        return res.status(400).json({ error: 'Missing URL in request path' });
    }

    try {
        const responseText = await remove(url);  // get raw response string like "204 No Content"
        const statusCode = parseInt(responseText.split(' ')[0]);

        if (statusCode === 204) {
            return res.status(204).end(); // success
        } else if (statusCode === 404) {
            return res.status(404).json({ error: 'URL not found in blacklist' });
        } else if (statusCode === 400) {
            return res.status(400).json({ error: 'Invalid URL format' });
        } else {
            // fallback for unexpected code
            return res.status(500).json({ error: `Unexpected server response: ${responseText}` });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};