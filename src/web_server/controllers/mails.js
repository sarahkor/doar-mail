const Mail = require('../models/mails');
const { getUserByUsername } = require('../models/userModel');
const {
  getLoggedInUser,
  checkUrlAgainstBloomServer,
  extractUrls
} = require('../utils/mailUtils');

exports.listMails = (req, res) => {

  const user = getLoggedInUser(req, res);
  if (!user) return;

  const userFiftyMails = Mail.listMailsByUser(user);
  res.status(200).json(userFiftyMails);
};

exports.createMail = async (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const allowedFields = ['to', 'subject', 'bodyPreview', 'status'];
  const requiredFields = ['to', 'status'];
  const unexpectedFields = Object.keys(req.body).filter(
    key => !allowedFields.includes(key)
  );

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected fields in request: ${unexpectedFields.join(', ')}`,
      allowedFields,
      requiredFields
    });
  }


  const { to, subject, bodyPreview, status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Missing required field: status (sent/draft)' });
  }
  if (status !== 'draft' && status !== 'sent') {
    return res.status(400).json({ error: 'status must be sent/draft' });
  }

  const cleanTo = to?.trim();
  if (!cleanTo) {
    return res.status(400).json({ error: 'Missing required field: to (recipient email)' });
  }

  const safeSubject = subject?.trim() === "" ? "(no subject)" : (subject || "(no subject)");
  const safeBody = bodyPreview || "";

  // Check if recipient exists (by username)
  const recipient = getUserByUsername(to.trim());
  if (!recipient) {
    return res.status(400).json({ error: 'Recipient does not exist' });
  }

  const urls = [
    ...extractUrls(cleanTo),
    ...extractUrls(safeSubject),
    ...extractUrls(safeBody)
  ];

  const blacklistedChecks = await Promise.all(urls.map(url => checkUrlAgainstBloomServer(url)));

  if (blacklistedChecks.includes(true)) {
    return res.status(400).json({ error: 'Mail contains blacklisted URL.' });
  }
  const newMail = Mail.createMail({
    sender: user,
    recipient,
    subject: safeSubject,
    bodyPreview: safeBody,
    status
  });

  res.status(201)
    .location(`/api/mails/${newMail.id}`)
    .end();
};

exports.getMailById = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  const mailId = parseInt(req.params.id);
  const mail = Mail.getMailById(user, mailId);

  if (!mail) {
    return res.status(404).json({ error: 'Mail not found in your sent or recived emails' });
  }

  res.status(200).json(mail);
};

exports.updateMail = async (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const allowedFields = ['to', 'subject', 'bodyPreview', 'status'];
  const requiredFields = [];
  const unexpectedFields = Object.keys(req.body).filter(
    key => !allowedFields.includes(key)
  );

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected fields in PATCH request: ${unexpectedFields.join(', ')}`,
      allowedFields,
      requiredFields
    });
  }


  const mailId = parseInt(req.params.id);
  const mail = Mail.getMailById(user, mailId);
  if (!mail) {
    return res.status(404).json({ error: 'Mail not found' });
  }
  if (mail.from !== user.username) {
    return res.status(403).json({ error: 'Access denied to this mail, you must be the sender of this mail in order to edit it' });
  }

  if (mail.status !== 'draft') {
    return res.status(403).json({ error: `Mail status is '${mail.status}'. Only draft mails can be edited.` });
  }

  const { to, subject, bodyPreview, status } = req.body;
  let recipient = null;
  if (to !== undefined) {
    const cleanTo = to.trim();
    if (!cleanTo) {
      return res.status(400).json({ error: 'Recipient email cannot be empty.' });
    }

    recipient = getUserByUsername(cleanTo);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist.' });
    }
  }
  const urls = [
    ...extractUrls(to),
    ...extractUrls(subject),
    ...extractUrls(bodyPreview)
  ];
  const blacklistedChecks = await Promise.all(urls.map(url => checkUrlAgainstBloomServer(url)));

  if (blacklistedChecks.includes(true)) {
    return res.status(400).json({ error: 'Updated mail contains blacklisted URL.' });
  }
  const safeSubject = subject?.trim() === "" ? "(no subject)" : subject;
  const safeBody = bodyPreview || "";

  const updatedMail = Mail.updateMailById(user, mailId, {
    to,
    recipient,
    subject: safeSubject,
    bodyPreview: safeBody,
    status
  });

  if (!updatedMail) {
    return res.status(404).json({ error: 'update failed' });
  }

  res.status(204).end();
};

exports.deleteMail = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  const mailId = parseInt(req.params.id);
  const mail = Mail.getMailById(user, mailId);
  if (!mail) {
    return res.status(404).json({ error: 'Mail not found in your mails' });
  }

  // Only allow deletion if user is either sender or receiver
  const isSender = mail.from === user.username;
  const isReceiver = mail.to === user.username;
  if (!isSender && !isReceiver) {
    return res.status(403).json({ error: 'Access denied: you must be the sender or recipient to delete this mail' });
  }

  const deleted = Mail.deleteMailById(user, mailId);

  if (!deleted) {
    return res.status(404).json({ error: 'Mail not found or already deleted from your view' });
  }

  res.status(204).end();
};

exports.searchMails = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  const query = req.params.query?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  const results = Mail.searchMailsByUser(user, query);
  res.status(200).json(results);
};