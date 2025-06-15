const { getMailById } = require('./mails');
let labelIdCounter = 0;

const listLabelsByUser = (user) => {
  const labels = user.labels || [];
  console.log(`📋 listLabelsByUser: Found ${labels.length} labels for user:`, labels);
  return labels;
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

const editLabel = (user, labelId, { name, color, parentId }) => {
  const label = getLabelById(user, labelId);
  if (!label) return null;

  console.log(`🔧 editLabel: Editing label ID ${labelId}`);
  console.log(`🔧 Current label:`, label);
  console.log(`🔧 Changes requested:`, { name, color, parentId });

  if (name !== undefined) {
    console.log(`🔧 Changing name from "${label.name}" to "${name}"`);
    label.name = name;
  }
  if (color !== undefined) {
    console.log(`🔧 Changing color from "${label.color}" to "${color}"`);
    label.color = color;
  }
  if (parentId !== undefined) {
    const oldParentId = label.parentId;
    // Handle parentId - can be null to remove parent, or a number to set parent
    label.parentId = parentId ? parseInt(parentId) : null;
    console.log(`🔧 Changing parentId from ${oldParentId} to ${label.parentId}`);
  }

  console.log(`🔧 Final label after edit:`, label);
  return label;
};

const addMailToLabel = (user, labelId, mailId) => {
  console.log('🏷️ addMailToLabel model:', { labelId, mailId, mailIdType: typeof mailId });

  const label = getLabelById(user, labelId);
  if (!label) {
    console.log('❌ Label not found:', labelId);
    return false;
  }

  // Ensure mailId is a number for consistency
  const numericMailId = parseInt(mailId);
  if (isNaN(numericMailId)) {
    console.log('❌ Invalid mail ID:', mailId);
    return false;
  }

  const mail = getMailById(user, numericMailId);
  if (!mail) {
    console.log('❌ Mail not found:', numericMailId);
    return false;
  }

  if (!label.mailIds) label.mailIds = [];

  // Check if mail is already in label (ensure both are numbers)
  const alreadyExists = label.mailIds.some(id => parseInt(id) === numericMailId);
  if (!alreadyExists) {
    label.mailIds.push(numericMailId);
    console.log('✅ Mail added to label successfully');
    return true;
  }

  console.log('⚠️ Mail already in label');
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
  console.log('🗑️ removeMailFromLabel model:', { labelId, mailId, mailIdType: typeof mailId });

  const label = (user.labels || []).find(l => l.id === labelId);
  if (!label) {
    console.log('❌ Label not found:', labelId);
    return false;
  }

  // Ensure mailId is a number for consistency
  const numericMailId = parseInt(mailId);
  if (isNaN(numericMailId)) {
    console.log('❌ Invalid mail ID:', mailId);
    return false;
  }

  // Find the index using numeric comparison
  const index = label.mailIds.findIndex(id => parseInt(id) === numericMailId);
  if (index === -1) {
    console.log('❌ Mail not found in label:', numericMailId);
    return false;
  }

  label.mailIds.splice(index, 1); // Remove mailId from label
  console.log('✅ Mail removed from label successfully');
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