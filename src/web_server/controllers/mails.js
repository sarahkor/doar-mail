const Mail = require('../models/mails');
const { getUserByUsername } = require('../models/userModel');
const {
  checkUrl,
  extractUrls,
  sortByRecent,
  paginateMails
} = require('../utils/mailUtils');
const blacklist = require('../models/blacklistModel');

const ALLOWED_FIELDS = ['to', 'subject', 'bodyPreview', 'status'];
const REQUIRED_FIELDS = ['to'];

exports.listMails = (req, res) => {
  try {
    const user = req.user;
    const mails = Mail.listMailsByUser(user);
    res.status(200).json(mails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list mails.' });
  }
};

exports.createMail = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

    const keys = Object.keys(body);
    const unexpected = keys.filter(k => !ALLOWED_FIELDS.includes(k));
    const missing = REQUIRED_FIELDS.filter(f => !body[f]);

    if (unexpected.length > 0)
      throw { status: 400, error: `Unexpected fields: ${unexpected.join(', ')}` };

    if (missing.length > 0)
      throw { status: 400, error: `Missing required: ${missing.join(', ')}` };

    let { to, subject, bodyPreview, status } = body;
    status = status || 'draft';

    const attachments = req.files || [];

    const processedAttachments = attachments.map(file => ({
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64') // OR save to disk and store path
    }));

    if (!['sent', 'draft'].includes(status))
      throw { status: 400, error: 'Status must be "sent" or "draft".' };

    const cleanTo = to.trim();
    if (!cleanTo) throw { status: 400, error: 'Recipient email required.' };

    const recipient = getUserByUsername(cleanTo);
    if (!recipient) throw { status: 400, error: 'Recipient does not exist.' };

    // Extract all URLs from fields
    const urls = [
      ...extractUrls(cleanTo),
      ...extractUrls(subject),
      ...extractUrls(bodyPreview)
    ];

    // Check if any of the extracted URLs are blacklisted
    let hasBlacklistedUrl = false;
    for (const url of urls) {
      if (await checkUrl(url)) {
        hasBlacklistedUrl = true;
        break;
      }
    }

    // If mail is being sent and contains blacklisted URL, deliver to spam
    let finalStatus = status;
    if (status === 'sent' && hasBlacklistedUrl) {
      finalStatus = 'spam';
    }

    const safeSubject = subject?.trim() === '' ? '(no subject)' : (subject || '(no subject)');
    const safeBody = bodyPreview || '';

    const newMail = Mail.createMail({
      sender: user,
      recipient,
      subject: safeSubject,
      bodyPreview: safeBody,
      status: finalStatus,
      attachments: processedAttachments
    });

    const { timestamp, ...mailWithoutTimestamp } = newMail;

    res.status(201)
      .location(`/api/mails/${newMail.id}`)
      .json({
        ...mailWithoutTimestamp,
        info: finalStatus === 'spam' ? 'Mail was delivered to spam due to blacklisted content' : undefined
      });

  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
  }
};



exports.getMailById = (req, res) => {
  try {
    const user = req.user;

    const mailId = parseInt(req.params.id);
    const mail = Mail.getMailById(user, mailId);
    if (!mail) throw { status: 404, error: 'Mail not found in your sent, received, or drafts folder' };

    res.status(200).json(mail);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Failed to get mail' });
  }
};

exports.updateMail = async (req, res) => {
  try {
    const user = req.user;

    const body = req.body;
    if (!body) throw { status: 400, error: 'Missing request body.' };

    const unexpected = Object.keys(body).filter(k => !ALLOWED_FIELDS.includes(k));
    if (unexpected.length > 0)
      throw { status: 400, error: `Unexpected fields in PATCH request: ${unexpected.join(', ')}`, allowedFields: ALLOWED_FIELDS };

    const mailId = parseInt(req.params.id);
    const mail = Mail.getMailById(user, mailId);
    if (!mail) throw { status: 404, error: 'Mail not found in your sent, received, or drafts folder' };
    if (mail.from !== user.username)
      throw { status: 403, error: 'Access denied: you must be the sender to edit this mail' };
    if (mail.status !== 'draft')
      throw { status: 403, error: `Mail status is '${mail.status}'. Only draft mails can be edited.` };

    const { to, subject, bodyPreview, status } = body;
    let recipient = null;
    if (to !== undefined) {
      const cleanTo = to.trim();
      if (!cleanTo) throw { status: 400, error: 'Recipient email cannot be empty.' };

      recipient = getUserByUsername(cleanTo);
      if (!recipient) throw { status: 400, error: 'Recipient does not exist.' };
    }

    const urls = [
      ...(to ? extractUrls(to) : []),
      ...(subject ? extractUrls(subject) : []),
      ...(bodyPreview ? extractUrls(bodyPreview) : [])
    ];

    for (const url of urls) {
      if (await checkUrl(url))
        throw { status: 400, error: `Mail contains blacklisted URL: ${url}` };
    }

    const safeSubject = subject?.trim() === '' ? '(no subject)' : subject;
    const safeBody = bodyPreview || '';

    const updated = Mail.updateMailById(user, mailId, {
      to,
      recipient,
      subject: safeSubject,
      bodyPreview: safeBody,
      status
    });

    if (!updated) throw { status: 404, error: 'update failed' };
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Mail update failed' });
  }
};

exports.deleteMail = (req, res) => {
  try {
    const user = req.user;

    const mailId = parseInt(req.params.id);
    const mail = Mail.getMailById(user, mailId);
    if (!mail) {
      return res.status(404).json({ error: 'Mail not found in your mails' });
    }

    const isSender = mail.from === user.username;
    const isReceiver = mail.to === user.username;
    if (!isSender && !isReceiver)
      throw { status: 403, error: 'Access denied: you must be the sender or recipient' };

    const deleted = Mail.deleteMailById(user, mailId);
    if (!deleted) throw { status: 404, error: 'Mail not found or already deleted' };

    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Mail deletion failed' });
  }
};

exports.searchMails = (req, res) => {
  try {
    const user = req.user;

    // Decode the raw query string from the path
    const encodedQuery = req.params.query;
    const query = decodeURIComponent(encodedQuery || '').trim().toLowerCase();

    if (!query) throw { status: 400, error: 'Missing search query' };

    const results = Mail.searchMailsByUser(user, query);
    res.status(200).json(results);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Search failed' });
  }
};


exports.toggleStarred = (req, res) => {
  try {
    const user = req.user;
    const mailId = parseInt(req.params.id);

    const result = Mail.toggleStarred(user, mailId);
    if (!result) return res.status(404).json({ error: 'Mail not found' });

    const { mail, starred } = result;

    res.status(200).json({
      message: starred ? 'Mail starred' : 'Mail unstarred',
      starred,
      mail
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle starred status' });
  }
};


exports.getStarredMails = (req, res) => {
  try {
    const sorted = sortByRecent(req.user.starred || []);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch starred mails' });
  }
};

exports.getTrash = (req, res) => {
  try {
    const sorted = sortByRecent(req.user.trash || []);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trash' });
  }
};

exports.deleteFromTrash = (req, res) => {
  try {
    const user = req.user;
    const mailId = parseInt(req.params.id);
    const success = Mail.permanentlyDeleteFromTrash(user, mailId);

    if (!success) {
      return res.status(404).json({ error: 'Mail not found in trash.' });
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mail from trash.' });
  }
};

exports.emptyTrash = (req, res) => {
  try {
    const user = req.user;
    const count = Mail.emptyTrash(user);
    res.status(200).json({ message: `Trash emptied. ${count} mails deleted permanently.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to empty trash.' });
  }
};


exports.restoreFromTrash = (req, res) => {
  try {
    const user = req.user;
    const mailId = parseInt(req.params.id);

    const success = Mail.restoreMailFromTrash(user, mailId);
    if (!success) {
      return res.status(404).json({ error: 'Mail not found in trash.' });
    }

    res.status(200).json({ message: 'Mail successfully restored.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore mail from trash.' });
  }
};

exports.markAsSpam = async (req, res) => {
  try {
    const user = req.user;
    const mailId = parseInt(req.params.id);

    const mail = Mail.getMailById(user, mailId);
    if (!mail) return res.status(404).json({ error: 'Mail not found.' });
    if (mail.status === 'draft') return res.status(400).json({ error: 'Cannot report a draft mail as spam.' });

    const success = await Mail.reportAsSpam(user, mailId);
    if (!success) return res.status(404).json({ error: 'Mail not found or already marked as spam.' });

    res.status(200).json({ message: 'Mail marked as spam and URLs blacklisted.' });
  } catch (err) {
    console.error("Error in markAsSpam:", err);
    res.status(500).json({ error: 'Failed to mark mail as spam.' });
  }
};


exports.unmarkAsSpam = async (req, res) => {
  try {
    const user = req.user;
    const mailId = parseInt(req.params.id);

    const success = await Mail.unspam(user, mailId);
    if (!success) return res.status(404).json({ error: 'Mail not found in spam.' });

    res.status(200).json({ message: 'Mail unspammed and URLs removed from blacklist.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unmark spam.' });
  }
};

exports.getSpam = (req, res) => {
  try {
    const sorted = sortByRecent(req.user.spam || []);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spam mails.' });
  }
};
exports.getDrafts = (req, res) => {
  try {
    const sorted = sortByRecent(req.user.drafts || []);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drafts.' });
  }
};

exports.getInbox = (req, res) => {
  try {
    const sorted = sortByRecent(req.user.inbox || []);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inbox.' });
  }
};

exports.getSent = (req, res) => {
  try {
    const sorted = sortByRecent(req.user.sent || []);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent mails.' });
  }
};

exports.getAllMails = (req, res) => {
  try {
    const all = [
      ...(req.user.inbox || []),
      ...(req.user.sent || []),
      ...(req.user.drafts || [])
    ];
    const sorted = sortByRecent(all);
    const paginated = paginateMails(sorted, req.query.page);
    res.status(200).json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all mails.' });
  }
};
