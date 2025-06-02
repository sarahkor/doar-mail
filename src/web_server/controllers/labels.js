const Label = require('../models/labels');
const { getLoggedInUser } = require('../utils/mailUtils');

exports.listLabels = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  const labels = Label.listLabelsByUser(user);
  res.status(200).json(labels);
};

exports.createLabel = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing label name' });

  const newLabel = Label.createLabel(user, { name, color });

  res.status(201)
    .location(`/api/labels/${newLabel.id}`)
    .json(newLabel);
};

exports.getLabel = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  const label = Label.getLabelById(user, parseInt(req.params.id));
  if (!label) return res.status(404).json({ error: 'Label not found' });

  res.status(200).json(label);
};

exports.editLabel = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const labelId = parseInt(req.params.id);
  const { name, color } = req.body;

  const updated = Label.editLabel(user, labelId, { name, color });
  if (!updated) {
    return res.status(404).json({ error: 'Label not found' });
  }
  res.status(204).end();
};

exports.deleteLabel = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  const labelId = parseInt(req.params.id);
  const deleted = Label.deleteLabel(user, labelId);

  if (!deleted) {
    return res.status(404).json({ error: 'Label not found or already deleted' });
  }

  res.status(204).end();
};

exports.addMailToLabel = (req, res) => {
  const user = getLoggedInUser(req, res);
  if (!user) return;

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const labelId = parseInt(req.params.id);
  const { mailId } = req.body;

  if (typeof mailId !== 'number') {
    return res.status(400).json({ error: 'mailId must be a number' });
  }

  const added = Label.addMailToLabel(user, labelId, mailId);
  if (!added) {
    return res.status(400).json({ error: 'Failed to add mail to label. Mail may already be in label or label does not exist.' });
  }

  res.status(200).json({ message: 'Mail added to label successfully' });
};