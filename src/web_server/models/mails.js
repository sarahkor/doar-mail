const { extractUrls } = require('../utils/mailUtils');
const blacklist = require('../models/blacklistModel');
let mailsIdCounter = 0;

const listMailsByUser = (user) => {
  return [...user.sent, ...user.inbox, ...user.drafts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50)
    .map(({ timestamp, ...mailWithoutTimestamp }) => mailWithoutTimestamp);
};

const createMail = ({ sender, recipient, subject, bodyPreview, status = 'draft', attachments = [] }) => {
  const timestamp = Date.now();
  const newMail = {
    id: ++mailsIdCounter,
    from: sender.username,
    to: recipient.username,
    subject,
    bodyPreview,
    timestamp,
    date: new Date(timestamp).toLocaleDateString('en-GB'),
    time: new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    status,
    read: false,
    attachments
  };

  if (status === 'draft') {
    sender.drafts.push(newMail);
  } else if (status === 'sent') {
    sender.sent.push(newMail);
    recipient.inbox.push(newMail);
  } else if (status === 'spam') {
    sender.sent.push(newMail);
    if (!recipient.spam) recipient.spam = [];
    recipient.spam.push(newMail);
  }

  return newMail;
};


const getMailById = (user, id) => {
  const mail =
    user.sent.find(m => m.id === id) ||
    user.inbox.find(m => m.id === id) ||
    user.drafts.find(m => m.id === id);

  // Mark as read only if recipient (not sender) opens it
  if (mail && user.username === mail.to && !mail.read) {
    mail.read = true;
  }

  return mail;
};

const updateMailById = (user, id, { to, recipient, subject, bodyPreview, status }) => {
  const draftIndex = user.drafts.findIndex(m => m.id === id);
  if (draftIndex === -1) return null;

  const mail = user.drafts[draftIndex];

  if (subject !== undefined) mail.subject = subject.trim() || "(no subject)";
  if (bodyPreview !== undefined) mail.bodyPreview = bodyPreview;
  if (to !== undefined && recipient) {
    mail.to = recipient.username;
  }

  if (status === 'sent') {
    mail.status = 'sent';
    const timestamp = Date.now();
    mail.timestamp = timestamp;
    mail.date = new Date(timestamp).toLocaleDateString('en-GB');
    mail.time = new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (!recipient.inbox.some(m => m.id === mail.id)) {
      recipient.inbox.push(mail);
    }
    user.drafts.splice(draftIndex, 1);
    if (!user.sent.some(m => m.id === mail.id)) {
      user.sent.push(mail);
    }
  }

  return mail;
};

const getTrash = (user) => {
  const now = Date.now();
  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

  // Filter out expired mails
  const valid = user.trash.filter(mail => now - mail.deletedAt < FIFTEEN_DAYS);

  // Update user's trash to keep only valid ones
  user.trash = valid;

  // Return without deletedAt
  return valid.map(({ deletedAt, ...rest }) => rest);
};


const deleteMailById = (user, id) => {
  const allSources = ['sent', 'inbox', 'drafts'];
  let mail = null;

  for (const box of allSources) {
    const index = user[box].findIndex(m => m.id === id);
    if (index !== -1) {
      mail = user[box].splice(index, 1)[0]; // Remove & retrieve
      break;
    }
  }

  if (!mail) return false;

  // Remove mail ID from all labels
  (user.labels || []).forEach(label => {
    label.mailIds = label.mailIds.filter(mailId => mailId !== id);
  });

  // Remove from starred if starred
  user.starred = user.starred?.filter(m => m.id !== id);

  // Add to trash with deletion timestamp
  if (!user.trash) user.trash = [];
  mail.deletedAt = Date.now();
  user.trash.push(mail);

  return true;
};

const searchMailsByUser = (user, query) => {
  const lowerQuery = query.toLowerCase();
  return [...user.sent, ...user.inbox, ...user.drafts].filter(mail =>
    mail.to?.toLowerCase().includes(lowerQuery) ||
    mail.from?.toLowerCase().includes(lowerQuery) ||
    mail.subject?.toLowerCase().includes(lowerQuery) ||
    mail.bodyPreview?.toLowerCase().includes(lowerQuery)
  );
};

const toggleStarred = (user, mailId) => {
  if (!user.starred) user.starred = [];

  // Find mail in current user's inbox, sent, or drafts
  const mail =
    user.sent.find(m => m.id === mailId) ||
    user.inbox.find(m => m.id === mailId) ||
    user.drafts.find(m => m.id === mailId);

  if (!mail) return null;

  const alreadyStarred = user.starred.some(m => m.id === mailId);

  if (alreadyStarred) {
    user.starred = user.starred.filter(m => m.id !== mailId);
    return { mail, starred: false };
  } else {
    user.starred.push(mail);
    return { mail, starred: true };
  }
};

const permanentlyDeleteFromTrash = (user, mailId) => {
  const index = user.trash.findIndex(m => m.id === mailId);
  if (index === -1) return false;

  user.trash.splice(index, 1); // Remove it
  return true;
};

const emptyTrash = (user) => {
  const count = user.trash.length;
  user.trash = [];
  return count;
};

const restoreMailFromTrash = (user, mailId) => {
  const index = user.trash.findIndex(m => m.id === mailId);
  if (index === -1) return false;

  const mail = user.trash[index];

  // Remove from trash
  user.trash.splice(index, 1);

  // Restore based on original role/status
  if (mail.status === 'draft') {
    user.drafts.push(mail);
  } else if (mail.from === user.username) {
    user.sent.push(mail);
  } else if (mail.to === user.username) {
    user.inbox.push(mail);
  } else {
    // Should never happen, fallback: return to inbox
    user.inbox.push(mail);
  }

  delete mail.deletedAt;
  return true;
};

const reportAsSpam = async (user, mailId) => {
  const boxes = ['inbox', 'sent', 'spam']; // exclude drafts
  let mail = null;

  for (const box of boxes) {
    const index = user[box]?.findIndex(m => m.id === mailId);
    if (index !== -1) {
      mail = user[box][index];

      // Prevent reporting a draft (shouldn’t happen, but double check)
      if (mail.status === 'draft') return false;

      // Remove from current box
      user[box].splice(index, 1);

      break;
    }
  }

  if (!mail) return false;
  console.log("Mail found. Blacklisting URLs...");
  if (!user.spam) user.spam = [];
  user.spam.push(mail);
  mail.status = 'spam';

  const urls = [
    ...extractUrls(mail.to),
    ...extractUrls(mail.subject),
    ...extractUrls(mail.bodyPreview)
  ];

  for (const url of urls) {
    try {
      await blacklist.add(url);
    } catch (e) {
      console.warn(`Failed to blacklist URL "${url}":`, e.message);
    }
  }

  return true;
};

const unspam = async (user, mailId) => {
  const index = user.spam?.findIndex(m => m.id === mailId);
  if (index === -1) return false;

  const mail = user.spam.splice(index, 1)[0];

  const urls = [
    ...extractUrls(mail.to),
    ...extractUrls(mail.subject),
    ...extractUrls(mail.bodyPreview)
  ];

  for (const url of urls) {
    try {
      await blacklist.remove(url);
    } catch (e) {
      console.warn(`Failed to remove URL from blacklist "${url}":`, e.message);
    }
  }

  // Restore mail to inbox or sent
  if (mail.to === user.username) {
    user.inbox.push(mail);
  } else if (mail.from === user.username) {
    user.sent.push(mail);
  }

  mail.status = 'sent';

  return true;
};

const getSpam = (user) => {
  return user.spam || [];
};

module.exports = {
  listMailsByUser,
  createMail,
  getMailById,
  updateMailById,
  deleteMailById,
  searchMailsByUser,
  toggleStarred,
  getTrash,
  permanentlyDeleteFromTrash,
  emptyTrash,
  restoreMailFromTrash,
  reportAsSpam,
  unspam,
  getSpam
};
