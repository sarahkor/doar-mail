const { add, remove } = require('../models/blacklistModel');
// Adds a new URL to the blacklist
exports.addToBlacklist = (req, res) => {
    const { url } = req.body;
    // Check if URL was provided
    if (!url) {
        return res.status(400).json({ error: 'Missing url' });
    }
    // Calls the add function in blacklistModel.js
    const entry = add(url); 
    // Sends the client an HTTP response with code 201 (Created) and returns the new object in JSON format
    res.status(201).json(entry);
};
// Removes a URL from the blacklist by ID
exports.removeFromBlacklist = (req, res) => {
    const { id } = req.body;
    // Calls the remove function in blacklistModel.js
    const success = remove(id); 
    // Check if deleted successfully
    if (!success) {
        return res.status(400).json({ error: 'ID not found' });
    }
    // Sends the client an HTTP response with code 204 (No Content)
    res.status(204).end();
};