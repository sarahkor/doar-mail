const { searchMailsByUser, advancedSearchMails } = require('../models/mails');

exports.searchMails = (req, res) => {
    try {
        const user = req.user;
        const { q, subject, from, to, content } = req.query;

        let results = [];

        // Simple search (legacy support)
        if (q) {
            results = searchMailsByUser(user, q);
        }
        // Advanced search
        else if (subject || from || to || content) {
            const searchParams = {};
            if (subject) searchParams.subject = subject;
            if (from) searchParams.from = from;
            if (to) searchParams.to = to;
            if (content) searchParams.content = content;

            results = advancedSearchMails(user, searchParams);
        }
        else {
            return res.status(400).json({
                error: 'No search parameters provided. Use "q" for simple search or "subject", "from", "to", "content" for advanced search.'
            });
        }

        res.status(200).json({
            results: results,
            count: results.length,
            searchParams: req.query
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
}; 