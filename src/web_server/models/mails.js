let mailsIdCounter = 0;
const mails = []

const listMailsByUser = (user) => {
  return [...user.sent, ...user.inbox, ...user.drafts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50)
    .map(({ timestamp, ...mailWithoutTimestamp }) => mailWithoutTimestamp);
};

const createMail = ({ sender, recipient, subject, bodyPreview, status }) => {
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
    status
  };

  mails.push(newMail);
  if (status === 'draft') {
    sender.drafts.push(newMail);
  } else if (status === 'sent') {
    if (!sender.sent.some(m => m.id === newMail.id)) {
      sender.sent.push(newMail);
    }
    if (!recipient.inbox.some(m => m.id === newMail.id)) {
      recipient.inbox.push(newMail);
    }
  }

  return newMail;
};

const getMailById = (user, id) => {
  return (
    user.sent.find(m => m.id === id) ||
    user.inbox.find(m => m.id === id) ||
    user.drafts.find(m => m.id === id)
  );
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


const deleteMailById = (user, id) => {

  let removed = false;

  const sentIndex = user.sent.findIndex(m => m.id === id);
  if (sentIndex !== -1) {
    user.sent.splice(sentIndex, 1);
    removed = true;
  }

  const recvIndex = user.inbox.findIndex(m => m.id === id);
  if (recvIndex !== -1) {
    user.inbox.splice(recvIndex, 1);
    removed = true;
  }
  const draftIndex = user.drafts.findIndex(m => m.id === id);
  if (draftIndex !== -1) {
    user.drafts.splice(draftIndex, 1);
    removed = true;
  }

  (user.labels || []).forEach(label => {
    label.mailIds = label.mailIds.filter(mailId => mailId !== id);
  });

  const stillReferenced = [
    user.sent,
    user.inbox,
    user.drafts
  ].some(arr => arr.some(m => m.id === id));

  if (!stillReferenced) {
    const globalIndex = mails.findIndex(m => m.id === id);
    if (globalIndex !== -1) {
      mails.splice(globalIndex, 1);
    }
  }
  return removed;
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

module.exports = {
  listMailsByUser,
  createMail,
  getMailById,
  updateMailById,
  deleteMailById,
  searchMailsByUser
};
