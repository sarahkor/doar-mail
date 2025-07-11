const mailService = require('../services/mailsService');
const mongoose = require('mongoose');
exports.searchMails = async (req, res) => {
    try {
        const username = req.user.username;
        const { q, subject, from, to, content } = req.query;

        let results = [];

        // Simple search (legacy support)
        if (q) {
            results = await mailService.searchMailsByUser(username, q);
        }
        // Advanced search
        else if (subject || from || to || content) {
            const searchParams = {};
            if (subject) searchParams.subject = subject;
            if (from) searchParams.from = from;
            if (to) searchParams.to = to;
            if (content) searchParams.content = content;

            results = await mailService.advancedSearchMails(username, searchParams);
        }
        else {
            return res.status(400).json({
                error: 'No search parameters provided. Use "q" for simple search or "subject", "from", "to", "content" for advanced search.'
            });
        }

        res.status(200).json({
            results,
            count: results.length,
            searchParams: req.query
        });

    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
