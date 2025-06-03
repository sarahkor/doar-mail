let labelIdCounter = 0;

const listLabelsByUser = (user) => {
  return user.labels || [];
}

const createLabel = (user, { name, color }) => {
  const newLabel = {
    id: ++labelIdCounter,
    name,
    color: color || 'pink',
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
  user.labels.splice(index, 1);
  return true;
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