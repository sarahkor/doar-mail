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
    fromName: `${sender.firstName} ${sender.lastName}`,
    to: recipient.username,
    subject,
    bodyPreview,
    timestamp,
    date: new Date(timestamp).toLocaleDateString('en-GB'),
    time: new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    status,
    starred: false,
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
    user.spam.find(m => m.id === id) ||
    user.trash.find(m => m.id === id) ||
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
  const allSources = ['sent', 'inbox', 'drafts', 'spam'];
  let mail = null;

  for (const box of allSources) {
    const index = user[box]?.findIndex(m => m.id === id);
    if (index !== -1) {
      const removed = user[box].splice(index, 1)[0];
      if (!mail) mail = removed; // save the first one to keep
    }
  }

  if (!mail) return false;

  // Remove mail ID from all labels
  (user.labels || []).forEach(label => {
    label.mailIds = label.mailIds.filter(mailId => mailId !== id);
  });

  // Remove from starred list
  user.starred = user.starred?.filter(m => m.id !== id);

  // Add to trash
  if (!user.trash) user.trash = [];
  mail.deletedAt = Date.now();
  user.trash.push(mail);

  return true;
};

const searchMailsByUser = (user, query) => {
  const searchQuery = query.toLowerCase().trim();
  const searchWords = searchQuery.split(/\s+/);

  const allMails = [...user.sent, ...user.inbox, ...user.drafts];

  const matchingMails = allMails.filter(mail => {
    // Get all searchable fields
    const mailTo = (mail.to || '').toLowerCase();
    const mailFrom = (mail.from || '').toLowerCase();
    const mailFromName = (mail.fromName || '').toLowerCase();
    const mailSubject = (mail.subject || '').toLowerCase();
    const mailContent = (mail.bodyPreview || '').toLowerCase();

    // Combine all searchable text
    const allText = `${mailTo} ${mailFrom} ${mailFromName} ${mailSubject} ${mailContent}`;

    // Smart matching: check if search query or individual words are found
    const exactMatch = allText.includes(searchQuery);
    const wordMatch = searchWords.every(word => allText.includes(word));

    // Also check individual fields for better relevance
    const subjectMatch = mailSubject.includes(searchQuery) ||
      searchWords.some(word => mailSubject.includes(word));
    const fromMatch = mailFrom.includes(searchQuery) ||
      mailFromName.includes(searchQuery) ||
      searchWords.some(word => mailFrom.includes(word) || mailFromName.includes(word));
    const toMatch = mailTo.includes(searchQuery) ||
      searchWords.some(word => mailTo.includes(word));
    const contentMatch = mailContent.includes(searchQuery) ||
      searchWords.some(word => mailContent.includes(word));

    const isMatch = exactMatch || wordMatch || subjectMatch || fromMatch || toMatch || contentMatch;

    // Return true if any matching strategy succeeds
    return isMatch;
  });

  // Remove duplicates by using a Map with email ID as key
  const uniqueMailsMap = new Map();
  matchingMails.forEach(mail => {
    uniqueMailsMap.set(mail.id, mail);
  });

  // Convert back to array
  return Array.from(uniqueMailsMap.values());
};

const advancedSearchMails = (user, searchParams) => {
  const allMails = [...user.sent, ...user.inbox, ...user.drafts];

  const matchingMails = allMails.filter(mail => {
    // If no search parameters are provided, return no results
    if (!searchParams.subject && !searchParams.from && !searchParams.to && !searchParams.content) {
      return false;
    }

    let allFieldsMatch = true;

    // Check subject search (if provided)
    if (searchParams.subject) {
      const subjectQuery = searchParams.subject.toLowerCase().trim();
      const mailSubject = (mail.subject || '').toLowerCase();

      // Smart subject matching: supports partial words and multiple words
      const subjectMatch = subjectQuery.split(/\s+/).every(word =>
        mailSubject.includes(word)
      ) || mailSubject.includes(subjectQuery);

      allFieldsMatch = allFieldsMatch && subjectMatch;
    }

    // Check from (sender) search (if provided)
    if (searchParams.from) {
      const fromQuery = searchParams.from.toLowerCase().trim();
      const mailFrom = (mail.from || '').toLowerCase();
      const mailFromName = (mail.fromName || '').toLowerCase();

      // Smart from matching: check email address and display name
      const fromMatch = mailFrom.includes(fromQuery) ||
        mailFromName.includes(fromQuery) ||
        fromQuery.split(/\s+/).some(word =>
          mailFrom.includes(word) || mailFromName.includes(word)
        );

      allFieldsMatch = allFieldsMatch && fromMatch;
    }

    // Check to (recipient) search (if provided)
    if (searchParams.to) {
      const toQuery = searchParams.to.toLowerCase().trim();
      const mailTo = (mail.to || '').toLowerCase();

      // Smart to matching: supports partial words and multiple words
      const toMatch = mailTo.includes(toQuery) ||
        toQuery.split(/\s+/).some(word =>
          mailTo.includes(word)
        );

      allFieldsMatch = allFieldsMatch && toMatch;
    }

    // Check content search (if provided)
    if (searchParams.content) {
      const contentQuery = searchParams.content.toLowerCase().trim();
      const mailContent = (mail.bodyPreview || '').toLowerCase();

      // Smart content matching: supports partial words and phrases
      const contentMatch = contentQuery.split(/\s+/).every(word =>
        mailContent.includes(word)
      ) || mailContent.includes(contentQuery);

      allFieldsMatch = allFieldsMatch && contentMatch;
    }

    // Mail matches if ALL specified search criteria match
    return allFieldsMatch;
  });

  // Remove duplicates by using a Map with email ID as key
  const uniqueMailsMap = new Map();
  matchingMails.forEach(mail => {
    uniqueMailsMap.set(mail.id, mail);
  });

  // Convert back to array
  return Array.from(uniqueMailsMap.values());
};

const toggleStarred = (user, mailId) => {
  const mail =
    user.sent.find(m => m.id === mailId) ||
    user.inbox.find(m => m.id === mailId) ||
    user.spam?.find(m => m.id === mailId) ||
    user.drafts.find(m => m.id === mailId);

  if (!mail) return null;

  // Toggle the mail's own field
  mail.starred = !mail.starred;

  // Maintain the user's starred list for fast access (optional)
  if (!user.starred) user.starred = [];

  if (mail.starred) {
    user.starred.push(mail);
  } else {
    user.starred = user.starred.filter(m => m.id !== mailId);
  }

  return { mail, starred: mail.starred };
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

      // Prevent reporting a draft (shouldn't happen, but double check)
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
  advancedSearchMails,
  toggleStarred,
  getTrash,
  permanentlyDeleteFromTrash,
  emptyTrash,
  restoreMailFromTrash,
  reportAsSpam,
  unspam,
  getSpam
};