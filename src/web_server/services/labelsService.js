const Label = require('../models/labels');
const mongoose = require('mongoose');
const MailUserView = require('../models/mailUserView');
const { dedupeByMailId } = require('../utils/mailUtils');
const Mail = require('../models/mails'); // Ensure Mail model is imported

const listLabelsByUser = async (username) => {
  // find all labels owned by this user, sorted by name
  return await Label
    .find({ username })
    .sort({ name: 1 })
    .lean();
};


const createLabel = async (username, { name, color, parentId }) => {
  const newLabel = await Label.create({
    username,
    name,
    color,
    parent: parentId || null,
    mailIds: []
  });
  return newLabel.toObject();
};

const getLabelById = async (username, labelId) => {
  return await Label.findOne({ username, _id: labelId });
};

const getLabelWithMails = async (username, labelId) => {
  // Load the label itself
  const label = await Label.findOne({ username, _id: labelId }).lean();
  if (!label) return null;

  // Fetch *view* records for this user & these mailIds
  let views = await MailUserView
    .find({ username, mailId: { $in: label.mailIds } })
    .populate('mailId')
    .lean();

  views = dedupeByMailId(views);
  // Build a combined array of mail + view data
  const mails = views.map(v => {
    const m = v.mailId;
    return {
      _id: m._id,
      from: m.from,
      fromName: m.fromName,
      to: m.to,
      toName: m.toName,
      subject: m.subject,
      bodyPreview: m.bodyPreview,
      timestamp: m.timestamp,
      date: m.date,
      time: m.time,
      attachments: m.attachments,

      folder: v.folder,
      status: v.status,
      read: v.read,
      starred: v.starred
    };
  });

  // Return the label + mails
  return {
    id: label._id,
    name: label.name,
    color: label.color,
    parent: label.parent,
    mailIds: label.mailIds,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
    mails
  };
};

const editLabel = async (username, labelId, { name, color, parentId }) => {
  // Load the existing label document
  const label = await Label.findOne({ _id: labelId, username });
  if (!label) return null;

  //  Update the name if provided
  if (name !== undefined) {
    label.name = name;
  }

  // Update the color if provided, validating against your allowed list
  if (color !== undefined) {
    if (!Label.ALLOWED_COLORS.includes(color)) {
      throw { status: 400, error: `Invalid color: '${color}'. Allowed colors are: ${Label.ALLOWED_COLORS.join(', ')}` };
    }
    label.color = color;
  }

  //  Handle parentId changes
  if (parentId !== undefined) {
    // un-setting the parent
    if (parentId === null) {
      label.parent = null;
    } else {
      const pid = mongoose.Types.ObjectId(parentId);

      // cannot set itself as parent
      if (pid.equals(label._id)) {
        throw { status: 400, error: 'A label cannot be its own parent.' };
      }

      // must exist and belong to the same user
      const parent = await Label.findOne({ _id: pid, username });
      if (!parent) {
        throw { status: 400, error: `Parent label with ID ${parentId} not found.` };
      }

      // detect circular reference
      let ancestor = parent;
      while (ancestor.parent) {
        if (ancestor.parent.equals(label._id)) {
          throw { status: 400, error: 'Cannot create circular reference: the selected parent is a child of this label.' };
        }
        ancestor = await Label.findById(ancestor.parent);
        if (!ancestor) break;
      }

      label.parent = parent._id;
    }
  }

  // Persist and return the updated label
  return await label.save();
};


const deleteLabelById = async (username, labelId) => {
  // delete all child labels first
  const children = await Label.find({ username, parent: labelId }).lean();
  await Promise.all(
    children.map(child => deleteLabelById(username, child._id))
  );

  // delete the label
  const { deletedCount } = await Label.deleteOne({ username, _id: labelId });
  return deletedCount > 0;
};


const addMailToLabel = async (username, labelId, mailId) => {
  // Find the label for this user
  const label = await Label.findOne({ _id: labelId, username });
  if (!label) return false;

  // Ensure mailId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(mailId)) return false;

  // Prevent duplicates
  if (label.mailIds.some(id => id.equals(mailId))) {
    return false;
  }

  // Push and save
  label.mailIds.push(mailId);
  await label.save();

  // Also update the mail's labelIds
  await Mail.updateOne(
    { _id: mailId },
    { $addToSet: { labelIds: labelId } }
  );

  return true;
};

const labelNameExists = async (username, name, excludeId = null) => {
  // Build case-insensitive regex to match the exact name (case insenstive)
  const labelName = new RegExp(`^${name.trim()}$`, 'i');

  // we want to check if this user hase this label name
  const query = {
    username,
    name: labelName
  };
  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    query._id = { $ne: mongoose.Types.ObjectId(excludeId) };
  }

  const existing = await Label.findOne(query).lean();
  return !!existing;
};

const removeMailFromLabel = async (username, labelId, mailId) => {
  // 1) Validate inputs
  if (!mongoose.isValidObjectId(labelId) ||
    !mongoose.isValidObjectId(mailId)) {
    return false;
  }

  // 2) Pull the mailId out of the label's mailIds array
  const result = await Label.updateOne(
    { username, _id: labelId, mailIds: mailId },
    { $pull: { mailIds: mailId } }
  );

  // 3) If we actually removed something, keep Mail.labelIds in sync
  if (result.modifiedCount > 0) {
    await Mail.updateOne(
      { _id: mailId },
      { $pull: { labelIds: labelId } }
    );
    return true;
  }

  // 4) Nothing was removed → either wrong IDs or it wasn’t in that label
  return false;
};


module.exports = {
  listLabelsByUser,
  createLabel,
  getLabelById,
  deleteLabelById,
  addMailToLabel,
  editLabel,
  labelNameExists,
  getLabelWithMails,
  removeMailFromLabel
};