const mailService = require('../services/mailsService');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const ALLOWED_FIELDS = ['to', 'subject', 'bodyPreview', 'status'];
const REQUIRED_FIELDS = ['to'];

exports.listMails = async (req, res) => {
  try {
    const mails = await mailService.listMailsByUser(req.user.username);
    res.status(200).json(mails);
  } catch (err) {
    console.error('Error listing mails:', err);
    res.status(500).json({ error: 'Failed to list mails.' });
  }
};

exports.createMail = async (req, res) => {
  try {
    const user = req.user;
    const { to, subject = '', bodyPreview = '', status = 'draft' } = req.body;

    // Validate fields
    const keys = Object.keys(req.body);
    const unexpected = keys.filter(k => !ALLOWED_FIELDS.includes(k));
    const missing = REQUIRED_FIELDS.filter(f => !req.body[f]);

    if (unexpected.length > 0)
      throw { status: 400, error: `Unexpected fields: ${unexpected.join(', ')}` };

    if (missing.length > 0)
      throw { status: 400, error: `Missing required: ${missing.join(', ')}` };

    if (!['sent', 'draft'].includes(status))
      throw { status: 400, error: 'Status must be "sent" or "draft".' };

    const cleanTo = to.trim();
    if (!cleanTo.endsWith('@doar.com'))
      throw { status: 400, error: 'You can only send mail to Doar users. Please use an @doar.com address.' };

    const recipient = await User.findOne({ username: cleanTo });
    if (!recipient)
      throw { status: 400, error: 'Recipient does not exist.' };

    const safeSubject = subject.trim() || '(no subject)';
    const safeBody = bodyPreview || '';

    const attachments = (req.files || []).map(file => ({
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    const newMail = await mailService.createMail({
      sender: user,
      recipient,
      subject: safeSubject,
      bodyPreview: safeBody,
      status,
      attachments
    });

    const payload = newMail.toObject();
    if (newMail.status === 'spam') {
      payload.info = 'Mail was delivered to spam due to blacklisted content';
    }
    return res
      .status(201)
      .location(`/api/mails/${newMail._id}`)
      .json(payload);

  } catch (err) {
    console.error('createMail error:', err);
    return res
      .status(err.status || 500)
      .json({ error: err.error || err.message || 'Internal server error' });
  }
};


exports.getMailById = async (req, res) => {
  try {
    const username = req.user.username;
    const mailId = req.params.id;

    const mail = await mailService.getMailById(username, mailId);

    if (!mail) {
      throw { status: 404, error: 'Mail not found in your inbox, sent, drafts, or spam.' };
    }

    res.status(200).json(mail);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Failed to get mail' });
  }
};

exports.updateMail = async (req, res) => {
  try {
    const username = req.user.username;
    const user = req.user;
    const body = req.body;
    const files = req.files || [];

    if (!body) {
      throw { status: 400, error: 'Missing request body.' };
    }

    const unexpected = Object.keys(body).filter(k => !ALLOWED_FIELDS.includes(k));
    if (unexpected.length > 0) {
      throw {
        status: 400,
        error: `Unexpected fields in PATCH request: ${unexpected.join(', ')}`,
        allowedFields: ALLOWED_FIELDS
      };
    }

    const mailId = req.params.id;
    const mail = await mailService.getMailById(username, mailId);
    if (!mail) {
      throw { status: 404, error: 'Mail not found in your sent, received, or drafts folder' };
    }
    if (mail.from !== user.username) {
      throw { status: 403, error: 'Access denied: you must be the sender to edit this mail' };
    }
    if (mail.status !== 'draft') {
      throw {
        status: 403,
        error: `Mail status is '${mail.status}'. Only draft mails can be edited.`
      };
    }

    // Build an update payload from whichever fields are present
    const updateData = {};
    const { to, subject, bodyPreview, status } = body;

    if (to !== undefined) {
      const cleanTo = to.trim();
      if (!cleanTo) {
        throw { status: 400, error: 'Recipient email cannot be empty.' };
      }
      if (!cleanTo.endsWith('@doar.com')) {
        throw {
          status: 400,
          error: 'You can only send mail to Doar users. Please use an @doar.com address.'
        };
      }
      const recipient = await User.findOne({ username: cleanTo });
      if (!recipient) {
        throw { status: 400, error: 'Recipient does not exist.' };
      }
      updateData.to = cleanTo;
      updateData.recipient = recipient;
      updateData.status = status;
    }

    if (subject !== undefined) {
      updateData.subject = (subject || '').trim() || '(no subject)';
    }
    if (bodyPreview !== undefined) {
      updateData.bodyPreview = bodyPreview;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // Always call updateMailById if anything changed (including just status)
    const updated = await mailService.updateMailById(username, mailId, updateData);
    if (!updated) {
      throw { status: 404, error: 'Update failed' };
    }

    // Handle any new attachments
    if (files.length > 0) {
      updated.attachments = files.map(file => ({
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`
      }));
    }

    return res.status(204).end();
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ error: err.error || err.message || 'Mail update failed' });
  }
};

exports.deleteMail = async (req, res) => {
  try {
    const username = req.user.username;
    const user = req.user;
    const mailId = req.params.id;
    const mail = await mailService.getMailById(username, mailId);
    if (!mail) {
      return res.status(404).json({ error: 'Mail not found in your mails' });
    }

    const isSender = mail.from === user.username;
    const isReceiver = mail.to === user.username;
    if (!isSender && !isReceiver)
      throw { status: 403, error: 'Access denied: you must be the sender or recipient' };

    const deleted = await mailService.deleteMailById(username, mailId);
    if (!deleted) throw { status: 404, error: 'Mail not found or already deleted' };

    res.status(204).end();
  } catch (err) {
    console.error('deleteMail ERROR:', err);
    return res
      .status(err.status || 500)
      .json({ error: err.error || err.message || 'Mail deletion failed' });
  }
};

exports.searchMails = async (req, res) => {
  try {
    const username = req.user.username;

    // Decode the raw query string from the path
    const encodedQuery = req.params.query;
    const query = decodeURIComponent(encodedQuery || '').trim().toLowerCase();

    if (!query) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const results = await mailService.searchMailsByUser(username, query);
    res.status(200).json(results);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'Search failed' });
  }
};



exports.toggleStarred = async (req, res) => {
  try {
    const username = req.user.username;
    const mailId = req.params.id; // MongoDB _id, so no parseInt

    const result = await mailService.toggleStarred(username, mailId);
    if (!result) {
      return res.status(404).json({ error: 'Mail not found for this user' });
    }

    res.status(200).json({
      message: result.starred ? 'Mail starred' : 'Mail unstarred',
      starred: result.starred,
      mailId: result.mailId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle starred status' });
  }
};


exports.getTrash = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const result = await mailService.getTrash(username, page);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trash' });
  }
};

exports.deleteFromTrash = async (req, res) => {
  try {
    const username = req.user.username;
    const mailId = req.params.id;

    const success = await mailService.permanentlyDeleteFromTrash(username, mailId);

    if (!success) {
      return res.status(404).json({ error: 'Mail not found in trash.' });
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mail from trash.' });
  }
};

exports.emptyTrash = async (req, res) => {
  try {
    const username = req.user.username;
    const count = await mailService.emptyTrash(username);

    res.status(200).json({ message: `Trash emptied. ${count} mails deleted permanently.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to empty trash.' });
  }
};

exports.restoreFromTrash = async (req, res) => {
  try {
    const username = req.user.username;
    const mailId = req.params.id;

    const success = await mailService.restoreMailFromTrash(username, mailId);
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
    const username = req.user.username;
    const mailId = req.params.id; // Note: mailId is a MongoDB ObjectId string

    // Fetch the user-specific mail view
    const mailView = await mailService.getMailById(username, mailId);
    if (!mailView) {
      return res.status(404).json({ error: 'Mail not found.' });
    }

    if (mailView.folder === 'draft') {
      return res.status(400).json({ error: 'Cannot report a draft mail as spam.' });
    }

    // Report the mail as spam
    const success = await mailService.reportAsSpam(username, mailId);
    if (!success) {
      return res.status(404).json({ error: 'Mail not found or already marked as spam.' });
    }

    res.status(200).json({ message: 'Mail marked as spam and URLs blacklisted.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark mail as spam.' });
  }
};


exports.unmarkAsSpam = async (req, res) => {
  try {
    const username = req.user.username;
    const mailId = req.params.id;

    const success = await mailService.unspam(username, mailId);
    if (!success) {
      return res.status(404).json({ error: 'Mail not found in spam.' });
    }

    res.status(200).json({ message: 'Mail unspammed and URLs removed from blacklist.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unmark spam.' });
  }
};

exports.getSpam = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const spam = await mailService.getSpam(username, page);

    res.status(200).json(spam);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spam mails.' });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const drafts = await mailService.getDrafts(username, page);
    res.status(200).json(drafts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drafts.' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const inbox = await mailService.getInbox(username, page);
    res.status(200).json(inbox);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inbox.' });
  }
};

exports.getSent = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const sent = await mailService.getSent(username, page);
    res.status(200).json(sent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent mails.' });
  }
};

exports.getStarredMails = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const starred = await mailService.getStarredMails(username, page);
    res.status(200).json(starred);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch starred mails' });
  }
};

exports.getAllMails = async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 0;

    const result = await mailService.getAllMails(username, page);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all mails.' });
  }
};

exports.isMailStarred = async (req, res) => {
  try {
    const username = req.user.username;
    const mailId = req.params.id;

    const starred = await mailService.isMailStarred(username, mailId);
    return res.status(200).json({ starred });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to check starred status' });
  }
};