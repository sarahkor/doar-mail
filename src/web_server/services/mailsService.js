const { extractUrls, checkUrl } = require('../utils/mailUtils');
const blacklist = require('../models/blacklistModel');
const Mail = require('../models/mails');
const MailUserView = require('../models/mailUserView');
const mongoose = require('mongoose');
const Label = require('../models/labels');
const { dedupeByMailId } = require('../utils/mailUtils');
const REAL_FOLDERS = ['inbox', 'sent', 'draft', 'spam'];

const listMailsByUser = async (username) => {
  const views = await MailUserView.find({
    username,
    folder: { $in: ['inbox', 'sent', 'draft'] }
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('mailId')
    .lean();

  return views.map(view => {
    // alias the populated field to `mail`
    const { mailId: mail, read, starred, folder, status } = view;

    // strip out timestamp, keep everything else
    const { timestamp, ...mailWithoutTimestamp } = mail;

    return {
      ...mailWithoutTimestamp,
      read,
      starred,
      folder,
      status
    };
  });
};


async function hasBlacklistedUrls(to, subject, bodyPreview) {
  const urls = [
    ...extractUrls(to),
    ...extractUrls(subject),
    ...extractUrls(bodyPreview)
  ];

  for (const url of urls) {
    if (await checkUrl(url)) {
      return true;
    }
  }
  return false;
}

const createMail = async ({ sender, recipient, subject, bodyPreview, status = 'draft', attachments = [] }) => {
  // Determine if recipient copy should be spam
  const isSpam = status === 'sent' && await hasBlacklistedUrls(recipient.username, subject, bodyPreview);
  const finalStatus = isSpam ? 'spam' : status;

  // Create the Mail document
  const now = Date.now();
  const mail = await Mail.create({
    from: sender.username,
    fromName: `${sender.firstName} ${sender.lastName}`,
    to: recipient.username,
    toName: `${recipient.firstName} ${recipient.lastName}`,
    subject,
    bodyPreview,
    timestamp: now,
    date: new Date(now).toLocaleDateString('en-GB'),
    time: new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    attachments
  });

  // SENDER’s view: draft vs sent
  const senderViewStatus = (status === 'draft') ? 'draft' : 'sent';
  const senderFolder = senderViewStatus;
  await MailUserView.create({
    username: sender.username,
    mailId: mail._id,
    status: senderViewStatus,
    folder: senderFolder,
    read: senderViewStatus === 'sent',
    starred: false
  });

  //  RECIPIENT’s view only on real sends
  if (status === 'sent') {
    await MailUserView.create({
      username: recipient.username,
      mailId: mail._id,
      status: finalStatus,
      folder: finalStatus === 'spam' ? 'spam' : 'inbox',
      read: false,
      starred: false
    });
  }

  return mail;
};

const getMailById = async (username, mailId) => {
  if (!mongoose.isValidObjectId(mailId)) {
    throw new Error(`Invalid mailId passed to getMailById: ${mailId}`);
  }
  // Fetch the user's view and populate the mail document
  const view = await MailUserView
    .findOne({ username, mailId })
    .populate('mailId')
    .lean(); // lean() so toObject() isn’t needed

  if (!view || !view.mailId) return null;

  // Alias populated field
  const mail = view.mailId;

  // Mark as read if recipient and unread
  if (!view.read && mail.to === username) {
    await MailUserView.updateOne(
      { _id: view._id },
      { read: true }
    );
    view.read = true;
  }

  // Strip out timestamp, keep everything else
  const { timestamp, ...mailWithoutTimestamp } = mail;

  return {
    ...mailWithoutTimestamp,
    timestamp,
    folder: view.folder,
    read: view.read,
    starred: view.starred,
    status: view.status
  };
};

const updateMailById = async (username, mailId, { to, recipient, subject, bodyPreview, status }) => {
  if (!mongoose.isValidObjectId(mailId)) {
    throw new Error(`Invalid mailId: ${mailId}`);
  }

  // load the draft‐only view
  const draftView = await MailUserView.findOne({ username, mailId, folder: 'draft' }).populate('mailId');
  if (!draftView) return null;
  const mail = draftView.mailId;

  // apply edits…
  if (subject !== undefined) mail.subject = subject.trim() || '(no subject)';
  if (bodyPreview !== undefined) mail.bodyPreview = bodyPreview;
  if (to !== undefined && recipient) {
    mail.to = recipient.username;
    mail.toName = `${recipient.firstName} ${recipient.lastName}`;
  }
  await mail.save();

  // if still draft, just save and return
  if (status === 'draft') {
    draftView.status = 'draft';
    draftView.folder = 'draft';
    draftView.read = false;
    await draftView.save();
    return mail;
  }

  // we’re sending it
  const now = Date.now();
  mail.timestamp = now;
  mail.date = new Date(now).toLocaleDateString('en-GB');
  mail.time = new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  mail.status = 'sent';
  await mail.save();

  // move this view into Sent
  draftView.status = 'sent';
  draftView.folder = 'sent';
  draftView.read = true;
  await draftView.save();

  // decide recipient folder/status
  const isSpam = await hasBlacklistedUrls(recipient.username, mail.subject, mail.bodyPreview);
  const recipientFold = isSpam ? 'spam' : 'inbox';
  const recipientStat = isSpam ? 'spam' : 'sent';

  //  branch: self‐send vs other‐send
  if (recipient.username === username) {
    // self‐send: leave your Sent view alone,
    // and add a new Inbox/Spam view for yourself
    await MailUserView.create({
      username: username,
      mailId: mail._id,
      status: recipientStat,
      folder: recipientFold,
      read: false,
      starred: false
    });

  } else {
    // other: find or create their view
    const existing = await MailUserView.findOne({
      username: recipient.username,
      mailId: mail._id
    });

    if (existing) {
      existing.status = recipientStat;
      existing.folder = recipientFold;
      existing.read = false;
      await existing.save();
    } else {
      await MailUserView.create({
        username: recipient.username,
        mailId: mail._id,
        status: recipientStat,
        folder: recipientFold,
        read: false,
        starred: false
      });
    }
  }

  return mail;
};

const getTrash = async (username, page = 0, limit = 30) => {
  // Count & fetch views in parallel, with mailId populated
  const [total, views] = await Promise.all([
    MailUserView.countDocuments({
      username,
      folder: 'trash'
    }),
    MailUserView.find({
      username,
      folder: 'trash'
    })
      .skip(page * limit)
      .limit(limit)
      .populate('mailId')
      .lean()
  ]);

  // Sort newest‐first by mail.timestamp
  views.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  // Map each view to its mail + metadata
  const mails = views.map(view => {
    const mail = view.mailId;
    const { timestamp, ...mailWithoutTimestamp } = mail;
    const { read, starred, folder, status } = view;
    return {
      timestamp,
      ...mailWithoutTimestamp,
      read,
      starred,
      folder,
      status
    };
  });

  return { page, limit, total, mails };
};


const deleteMailById = async (username, mailId) => {
  const mailObjectId = new mongoose.Types.ObjectId(mailId);
  // Grab all the user’s existing views
  const originalViews = await MailUserView.find({ username, mailId: mailObjectId }).lean();
  if (originalViews.length === 0) return false;

  // Extract only the folder names
  const originalFolders = originalViews.map(v => v.folder)
    .filter(f => ['inbox', 'sent', 'draft', 'spam'].includes(f));
  const { status, read, starred } = originalViews[0];

  // Delete those views
  await MailUserView.deleteMany({
    username,
    mailId: mailObjectId
  });

  // Clean up labels
  await Label.updateMany(
    { username, mailIds: mailObjectId },
    { $pull: { mailIds: mailObjectId } }
  );

  // Insert exactly one Trash view, storing the original folder list
  await MailUserView.create({
    username,
    mailId: mailObjectId,
    folder: 'trash',
    status,
    read,
    starred,
    originalFolders,
    deletedAt: Date.now()
  });
  return true;
};

const searchMailsByUser = async (username, query) => {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  // 1) fetch raw views (still have v.mailId)
  let views = await MailUserView.find({
    username,
    folder: { $in: ['inbox', 'sent', 'draft'] }
  })
    .populate('mailId')
    .lean();

  // 2) in-memory filter on v.mailId
  views = views.filter(v => {
    if (!v.mailId) return false;
    const text = [
      v.mailId.to,
      v.mailId.from,
      v.mailId.fromName,
      v.mailId.subject,
      v.mailId.bodyPreview
    ].map(s => (s || '').toLowerCase()).join(' ');
    return words.every(w => text.includes(w));
  });

  // 3) dedupe while you still have v.mailId
  views = dedupeByMailId(views);

  // 4) finally map each view → mail + meta
  return views.map(v => ({
    ...v.mailId,
    read: v.read,
    starred: v.starred,
    folder: v.folder,
    status: v.status,
    timestamp: v.mailId.timestamp
  }));
};

const advancedSearchMails = async (username, searchParams) => {
  // 1) No params → empty
  if (!searchParams.subject && !searchParams.from && !searchParams.to && !searchParams.content) {
    return [];
  }

  // 2) Fetch all views in real folders
  let views = await MailUserView.find({
    username,
    folder: { $in: REAL_FOLDERS }
  })
    .populate('mailId')
    .lean();

  // 3) In-memory filter on v.mailId fields
  views = views.filter(v => {
    if (!v.mailId) return false;
    const mail = v.mailId;
    let ok = true;

    // Subject
    if (searchParams.subject) {
      const lower = (mail.subject || '').toLowerCase();
      const phrase = searchParams.subject.toLowerCase();
      const terms = phrase.split(/\s+/);
      ok = ok && (terms.every(t => lower.includes(t)) || lower.includes(phrase));
    }

    // From
    if (searchParams.from) {
      const lowerFrom = (mail.from || '').toLowerCase();
      const lowerFromName = (mail.fromName || '').toLowerCase();
      const phrase = searchParams.from.toLowerCase();
      const terms = phrase.split(/\s+/);
      ok = ok && (
        lowerFrom.includes(phrase) ||
        lowerFromName.includes(phrase) ||
        terms.some(t => lowerFrom.includes(t) || lowerFromName.includes(t))
      );
    }

    // To
    if (searchParams.to) {
      const lowerTo = (mail.to || '').toLowerCase();
      const phrase = searchParams.to.toLowerCase();
      const terms = phrase.split(/\s+/);
      ok = ok && (
        lowerTo.includes(phrase) ||
        terms.some(t => lowerTo.includes(t))
      );
    }

    // Content
    if (searchParams.content) {
      const lowerContent = (mail.bodyPreview || '').toLowerCase();
      const phrase = searchParams.content.toLowerCase();
      const terms = phrase.split(/\s+/);
      ok = ok && (terms.every(t => lowerContent.includes(t)) || lowerContent.includes(phrase));
    }

    return ok;
  });

  // 4) De-duplicate by mailId
  views = dedupeByMailId(views);

  // 5) Map back to the { ...mail, read, starred, folder, status } shape
  return views.map(v => ({
    ...v.mailId,
    read: v.read,
    starred: v.starred,
    folder: v.folder,
    status: v.status
  }));
};


const toggleStarred = async (username, mailId) => {
  const _id = new mongoose.Types.ObjectId(mailId);

  // load all views so we know the current state
  const views = await MailUserView.find({ username, mailId: _id });
  if (!views.length) return null;

  // flip based on the first view’s value
  const newValue = !views[0].starred;

  // update every view for that mail
  await MailUserView.updateMany(
    { username, mailId: _id },
    { $set: { starred: newValue } }
  );

  // return the new state
  return { mail: _id, starred: newValue };
};


const permanentlyDeleteFromTrash = async (username, mailId) => {
  const mailObjectId = new mongoose.Types.ObjectId(mailId);

  // Remove this user’s trash view
  const { deletedCount } = await MailUserView.deleteOne({
    username,
    mailId: mailObjectId,
    folder: 'trash'
  });
  if (deletedCount === 0) {
    // nothing to delete for this user
    return false;
  }

  // Remove from this user’s labels
  await Label.updateMany(
    { username, mailIds: mailObjectId },
    { $pull: { mailIds: mailObjectId } }
  );

  // Check if any views remain for any user
  const stillHasViews = await MailUserView.exists({ mailId: mailObjectId });
  if (!stillHasViews) {
    // Everyone has now permanently deleted it: drop the Mail doc
    await Mail.deleteOne({ _id: mailObjectId });
  }

  return true;
};

const emptyTrash = async (username) => {
  const result = await MailUserView.deleteMany({
    username,
    folder: 'trash'
  });

  return result.deletedCount;
};

const restoreMailFromTrash = async (username, mailId) => {
  const mailObjectId = new mongoose.Types.ObjectId(mailId);

  // Fetch the single trash view (with its originalFolders)
  const trashView = await MailUserView.findOne({
    username,
    mailId: mailObjectId,
    folder: 'trash'
  }).lean();

  if (!trashView) return false;

  const { status, read, starred, originalFolders } = trashView;

  // Remove the trash view
  await MailUserView.deleteOne({ _id: trashView._id });

  // Re-create one view per original folder
  const creations = originalFolders.map(folder =>
    MailUserView.create({
      username,
      mailId: mailObjectId,
      folder,
      status,
      read,
      starred
    })
  );
  await Promise.all(creations);

  return true;
};

const reportAsSpam = async (username, mailId) => {
  // Fetch the user's view and populate the mail document
  const view = await MailUserView.findOne({
    username,
    mailId,
    folder: { $in: ['inbox', 'sent'] }
  }).populate('mailId');

  if (!view) return false;

  // Alias mailId to mail for clarity
  const mail = view.mailId;
  const { read, starred, _id: viewId } = view;

  // Remove the original inbox/sent view
  await MailUserView.deleteOne({ _id: viewId });

  // Create the new spam view
  await MailUserView.create({
    username,
    mailId: mail._id,
    folder: 'spam',
    status: 'spam',
    read,
    starred,
    deletedAt: null
  });

  // Extract URLs and add them to the blacklist
  const urls = [
    ...extractUrls(mail.to),
    ...extractUrls(mail.subject),
    ...extractUrls(mail.bodyPreview)
  ];

  for (const url of urls) {
    try {
      await blacklist.add(url);
    } catch (e) {
      // ignore
    }
  }

  return true;
};


const unspam = async (username, mailId) => {
  // Fetch the spam view and populate the mail document
  const view = await MailUserView.findOne({
    username,
    mailId,
    folder: 'spam'
  }).populate('mailId');

  if (!view) return false;

  // Alias populated mailId to mail
  const mail = view.mailId;
  const viewId = view._id;

  // Remove any blacklisted URLs for this mail
  const urls = [
    ...extractUrls(mail.to),
    ...extractUrls(mail.subject),
    ...extractUrls(mail.bodyPreview)
  ];
  for (const url of urls) {
    try {
      await blacklist.remove(url);
    } catch (e) {
      // ignore
    }
  }

  // Now decide where to restore
  if (mail.to === mail.from) {
    // Self-sent: restore this view to inbox...
    await MailUserView.updateOne(
      { _id: viewId },
      { folder: 'inbox', status: 'sent' }
    );
    // ...and create a second “sent” view if it doesn't exist
    const existsSent = await MailUserView.findOne({
      username,
      mailId,
      folder: 'sent'
    });
    if (!existsSent) {
      await MailUserView.create({
        username,
        mailId,
        folder: 'sent',
        status: 'sent',
        read: true,
        starred: view.starred
      });
    }

  } else if (mail.to === username) {
    // Restore recipient’s view to inbox
    await MailUserView.updateOne(
      { _id: viewId },
      { folder: 'inbox', status: 'sent' }
    );

  } else if (mail.from === username) {
    // Restore sender’s view to sent
    await MailUserView.updateOne(
      { _id: viewId },
      { folder: 'sent', status: 'sent' }
    );
  }

  return true;
};


const getSpam = async (username, page = 0, limit = 30) => {
  const [total, views] = await Promise.all([
    MailUserView.countDocuments({ username, folder: 'spam' }),
    MailUserView.find({ username, folder: 'spam' })
      .skip(page * limit)
      .limit(limit)
      .populate('mailId')
      .lean()
  ]);
  views.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  return {
    page,
    limit,
    total,
    mails: views.map(view => {
      const { mailId: mail, read, starred, folder, status } = view;
      const { timestamp, ...mailWithoutTimestamp } = mail;
      return {
        timestamp,
        ...mailWithoutTimestamp,
        read,
        starred,
        folder,
        status
      };
    })
  };
};


const getDrafts = async (username, page = 0, limit = 30) => {
  const [total, views] = await Promise.all([
    MailUserView.countDocuments({ username, folder: 'draft' }),
    MailUserView.find({ username, folder: 'draft' })
      .skip(page * limit)
      .limit(limit)
      .populate('mailId')
      .lean()
  ]);

  views.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  const mails = views.map(view => {
    const { mailId: mail, read, starred, folder, status } = view;
    const { timestamp, ...mailWithoutTimestamp } = mail;
    return {
      timestamp,
      ...mailWithoutTimestamp,
      read,
      starred,
      folder,
      status
    };
  });

  return { page, limit, total, mails };
};


const getInbox = async (username, page = 0, limit = 30) => {
  const [total, views] = await Promise.all([
    MailUserView.countDocuments({ username, folder: 'inbox' }),
    MailUserView.find({ username, folder: 'inbox' })
      .skip(page * limit)
      .limit(limit)
      .populate('mailId')
      .lean()
  ]);

  views.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  const mails = views.map(view => {
    const { mailId: mail, read, starred, folder, status } = view;
    const { timestamp, ...mailWithoutTimestamp } = mail;
    return {
      timestamp,
      ...mailWithoutTimestamp,
      read,
      starred,
      folder,
      status
    };
  });

  return { page, limit, total, mails };
};


const getSent = async (username, page = 0, limit = 30) => {
  const [total, views] = await Promise.all([
    MailUserView.countDocuments({ username, folder: 'sent' }),
    MailUserView.find({ username, folder: 'sent' })
      .skip(page * limit)
      .limit(limit)
      .populate('mailId')
      .lean()
  ]);
  views.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  const mails = views.map(view => {
    const { mailId: mail, read, starred, folder, status } = view;
    const { timestamp, ...mailWithoutTimestamp } = mail;
    return {
      timestamp,
      ...mailWithoutTimestamp,
      read,
      starred,
      folder,
      status
    };
  });

  return { page, limit, total, mails };
};

const getStarredMails = async (username, page = 0, limit = 30) => {
  //fetch all starred views in real folders
  const views = await MailUserView.find({
    username,
    starred: true,
    folder: { $in: REAL_FOLDERS }
  })
    .populate('mailId')
    .lean();

  // sort by timestamp descending
  views.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  // dedupe so we only keep the first view per mailId
  const seen = new Set();
  const unique = [];
  for (const v of views) {
    const id = v.mailId._id.toString();
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(v);
    }
  }

  // paginate
  const total = unique.length;
  const slice = unique.slice(page * limit, page * limit + limit);
  //  shape the response
  const mails = slice.map(v => {
    const { mailId: mail, read, starred, folder, status } = v;
    const { timestamp, ...rest } = mail;
    return { timestamp, ...rest, read, starred, folder, status };
  });

  return { page, limit, total, mails };
};

const getAllMails = async (username, page = 0, limit = 30) => {
  const folders = ['inbox', 'sent', 'draft'];
  const views = await MailUserView.find({
    username,
    folder: { $in: folders }
  })
    .populate('mailId')
    .lean();

  // Deduplicate by mail._id
  const seen = new Set();
  const unique = views.filter(view => {
    const id = String(view.mailId._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // Sort by mail.timestamp descending
  unique.sort((a, b) => b.mailId.timestamp - a.mailId.timestamp);

  const total = unique.length;
  const start = page * limit;
  const end = start + limit;

  const slice = unique.slice(start, end);
  const mails = slice.map(view => {
    const { mailId: mail, read, starred, folder, status } = view;
    const { timestamp, ...mailWithoutTimestamp } = mail;
    return {
      timestamp,
      ...mailWithoutTimestamp,
      read,
      starred,
      folder,
      status
    };
  });

  return { page, limit, total, mails };
};

const isMailStarred = async (username, mailId) => {
  // simple existence check
  const view = await MailUserView.findOne({
    username,
    mailId,
    starred: true
  });
  return !!view;
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
  getSpam,
  getDrafts,
  getInbox,
  getSent,
  getStarredMails,
  getAllMails,
  isMailStarred
};