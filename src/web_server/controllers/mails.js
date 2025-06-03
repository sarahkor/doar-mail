const Mail = require('../models/mails');
const { getUserByUsername } = require('../models/userModel');
const {
  getLoggedInUser,
  checkUrl,
  extractUrls,
} = require('../utils/mailUtils');

const ALLOWED_FIELDS = ['to', 'subject', 'bodyPreview', 'status'];
const REQUIRED_FIELDS = ['to', 'status'];

exports.listMails = (req, res) => {
  try {
    const user = getLoggedInUser(req, res);
    if (!user) return;

    const mails = Mail.listMailsByUser(user);
    res.status(200).json(mails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list mails.' });
  }
};

exports.createMail = async (req, res) => {
  try {
    const user = getLoggedInUser(req, res);
    if (!user) return;

    const body = req.body;
    const keys = Object.keys(body);
    const unexpected = keys.filter(k => !ALLOWED_FIELDS.includes(k));
    const missing = REQUIRED_FIELDS.filter(f => !body[f]);

    if (unexpected.length > 0)
      throw { status: 400, error: `Unexpected fields in request: ${unexpected.join(', ')}`, allowedFields: ALLOWED_FIELDS, requiredFields: REQUIRED_FIELDS };

    if (missing.length > 0)
      throw { status: 400, error: `Missing required field(s): ${missing.join(', ')}`, allowedFields: ALLOWED_FIELDS, requiredFields: REQUIRED_FIELDS };


    const { to, subject, bodyPreview, status } = body;
    if (!['sent', 'draft'].includes(status))
      throw { status: 400, error: 'status must be sent/draft' };

    const cleanTo = to.trim();
    if (!cleanTo) throw { status: 400, error: 'Missing required field: to (recipient email)' };

    const recipient = getUserByUsername(cleanTo);
    if (!recipient) throw { status: 400, error: 'Recipient does not exist' };

    const urls = [
      ...extractUrls(cleanTo),
      ...extractUrls(subject),
      ...extractUrls(bodyPreview)
    ];

    for (const url of urls) {
      const isBlacklisted = await checkUrl(url);
      if (isBlacklisted) {
        throw { status: 400, error: `Mail contains blacklisted URL: ${url}` };
      }
    }

    const safeSubject = subject?.trim() === '' ? '(no subject)' : (subject || '(no subject)');
    const safeBody = bodyPreview || '';

    const newMail = Mail.createMail({
      sender: user,
      recipient,
      subject: safeSubject,
      bodyPreview: safeBody,
      status
    });

    const { timestamp, ...mailWithoutTimestamp } = newMail;

    res.status(201)
      .location(`/api/mails/${newMail.id}`)
      .json(mailWithoutTimestamp);

  } catch (err) {
    const status = err.status || 500;
    const message = err.error || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

exports.getMailById = (req, res) => {
  try {
    const user = getLoggedInUser(req, res);
    if (!user) return;

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
    const user = getLoggedInUser(req, res);
    if (!user) return;

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
    const user = getLoggedInUser(req, res);
    if (!user) return;

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
    const user = getLoggedInUser(req, res);
    if (!user) return;

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

