const { add, remove } = require('../models/blacklistModel');
// Adds a new URL to the blacklist
exports.addToBlacklist = async (req, res) => {
    const { url } = req.body;
    // Check if URL was provided
    if (!url) {
        return res.status(400).json({ error: 'Missing url' });
    }
    try {
        const entry = await add(url);
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add to blacklist' });
    }
};
// Removes a URL from the blacklist by ID
exports.removeFromBlacklist = async (req, res) => {
    const { id } = req.body;
     try {
        const success = await remove(id);
        if (!success) {
            return res.status(400).json({ error: 'ID not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove from blacklist' });
    }
};