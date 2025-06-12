const { getMailById } = require('./mails');
let labelIdCounter = 0;

const listLabelsByUser = (user) => {
  return user.labels || [];
}

const createLabel = (user, { name, color, parentId }) => {
  const newLabel = {
    id: ++labelIdCounter,
    name,
    color: color || 'gray',
    parentId: parentId ? parseInt(parentId) : null, // Ensure parentId is a number
    mailIds: []
  };
  if (!user.labels) user.labels = [];
  user.labels.push(newLabel);
  return newLabel;
};

const getLabelById = (user, labelId) => {
  return user.labels.find(label => label.id === labelId);
};

const deleteLabel = (user, labelId) => {
  const index = user.labels.findIndex(label => label.id === labelId);
  if (index === -1) return false;

  // Find all child labels that have this label as parent
  const childLabels = user.labels.filter(label => label.parentId === labelId);

  // Recursively delete all child labels first
  childLabels.forEach(childLabel => {
    console.log(`🗑️ Cascading delete: removing child label "${childLabel.name}" (ID: ${childLabel.id})`);
    deleteLabel(user, childLabel.id);
  });

  // Delete the parent label
  const parentIndex = user.labels.findIndex(label => label.id === labelId);
  if (parentIndex !== -1) {
    const deletedLabel = user.labels[parentIndex];
    console.log(`🗑️ Deleting parent label "${deletedLabel.name}" (ID: ${labelId})`);
    user.labels.splice(parentIndex, 1);
    return true;
  }

  return false;
};

const editLabel = (user, labelId, { name, color }) => {
  const label = getLabelById(user, labelId);
  if (!label) return null;

  if (name !== undefined) label.name = name;
  if (color !== undefined) label.color = color;

  return label;
};

const addMailToLabel = (user, labelId, mailId) => {
  const label = getLabelById(user, labelId);
  if (!label) return false;

  const mail = getMailById(user, mailId);
  if (!mail) return false;

  if (!label.mailIds) label.mailIds = [];

  if (!label.mailIds.includes(mailId)) {
    label.mailIds.push(mailId);
    return true;
  }

  return false;
}

const getLabelWithMails = (user, labelId) => {
  const label = getLabelById(user, labelId);
  if (!label) return null;

  const fullMails = (label.mailIds || [])
    .map(mailId => getMailById(user, mailId))
    .filter(Boolean);

  return {
    ...label,
    mails: fullMails
  };
};

const labelNameExists = (user, name, excludeId = null) => {
  return (user.labels || []).some(label =>
    label.name.toLowerCase() === name.toLowerCase() && label.id !== excludeId
  );
};

const removeMailFromLabel = (user, labelId, mailId) => {
  const label = (user.labels || []).find(l => l.id === labelId);
  if (!label) return false;

  const index = label.mailIds.indexOf(mailId);
  if (index === -1) return false;

  label.mailIds.splice(index, 1); // Remove mailId from label
  return true;
};


module.exports = {
  listLabelsByUser,
  createLabel,
  getLabelById,
  deleteLabel,
  addMailToLabel,
  editLabel,
  labelNameExists,
  getLabelWithMails,
  removeMailFromLabel
};