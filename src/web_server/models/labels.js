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
    mails: []
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

//for later
const addMailToLabel = (user, labelId, mailId) => {
  const label = getLabelById(user, labelId);
  if (!label || label.mails.includes(mailId)) return false;
  label.mails.push(mailId);
  return true;
};

const labelNameExists = (user, name, excludeId = null) => {
  return (user.labels || []).some(label =>
    label.name.toLowerCase() === name.toLowerCase() && label.id !== excludeId
  );
};


module.exports = {
  listLabelsByUser,
  createLabel,
  getLabelById,
  deleteLabel,
  addMailToLabel,
  editLabel,
  labelNameExists
};