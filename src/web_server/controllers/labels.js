const Label = require('../models/labels');

const ALLOWED_FIELDS = ['name', 'color', 'parentId'];
const REQUIRED_FIELDS = ['name'];
const ALLOWED_COLORS = [
  "red", "blue", "green", "yellow", "orange", "purple", "pink",
  "black", "white", "gray", "brown",
  "#f28b82", "#fbbc04", "#fff475", "#ccff90",
  "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb",
  "#fdcfe8", "#e6c9a8", "#e8eaed"
];

exports.listLabels = (req, res) => {
  try {
    const user = req.user;
    const labels = Label.listLabelsByUser(user);
    res.status(200).json(labels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list labels.' });
  }
};

exports.createLabel = (req, res) => {
  try {
    const user = req.user;
    const body = req.body || {};

    const fields = Object.keys(body);
    const unexpected = fields.filter(k => !ALLOWED_FIELDS.includes(k));
    const missing = REQUIRED_FIELDS.filter(f => !body[f]);

    if (unexpected.length > 0) {
      return res.status(400).json({
        error: `Unexpected fields: ${unexpected.join(', ')}`,
        allowedFields: ALLOWED_FIELDS,
        requiredFields: REQUIRED_FIELDS
      });
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(', ')}`,
        allowedFields: ALLOWED_FIELDS,
        requiredFields: REQUIRED_FIELDS
      });
    }

    const { name, color, parentId } = body;

    if (color && !ALLOWED_COLORS.includes(color)) {
      return res.status(400).json({
        error: `Invalid color: '${color}'. Allowed colors are: ${ALLOWED_COLORS.join(', ')}`
      });
    }

    if (parentId) {
      const parentLabel = Label.getLabelById(user, parseInt(parentId));
      if (!parentLabel) {
        return res.status(400).json({ error: `Parent label with ID ${parentId} not found.` });
      }
    }

    if (Label.labelNameExists(user, name)) {
      return res.status(400).json({ error: `A label named '${name}' already exists.` });
    }

    const newLabel = Label.createLabel(user, { name, color, parentId });
    res.status(201)
      .location(`/api/labels/${newLabel.id}`)
      .json({
        id: newLabel.id,
        name: newLabel.name,
        color: newLabel.color,
        parentId: newLabel.parentId
      });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create label.' });
  }
};

exports.getLabel = (req, res) => {
  try {
    const user = req.user;
    const label = Label.getLabelWithMails(user, parseInt(req.params.id));
    if (!label) return res.status(404).json({ error: 'Label not found' });

    res.status(200).json(label);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch label.' });
  }
};

exports.editLabel = (req, res) => {
  try {
    const user = req.user;
    const body = req.body || {};

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: 'Missing or invalid request body.' });
    }

    const fields = Object.keys(body);
    const unexpected = fields.filter(k => !ALLOWED_FIELDS.includes(k));
    if (unexpected.length > 0) {
      return res.status(400).json({
        error: `Unexpected fields: ${unexpected.join(', ')}`,
        allowedFields: ALLOWED_FIELDS,
        requiredFields: []
      });
    }

    if (body.color && !ALLOWED_COLORS.includes(body.color)) {
      return res.status(400).json({
        error: `Invalid color: '${body.color}'. Allowed colors are: ${ALLOWED_COLORS.join(', ')}`
      });
    }

    const labelId = parseInt(req.params.id);
    const existingLabel = Label.getLabelById(user, labelId);
    if (!existingLabel) {
      return res.status(404).json({ error: 'Label not found' });
    }

    if (body.name && Label.labelNameExists(user, body.name, labelId)) {
      return res.status(400).json({ error: `A label named '${body.name}' already exists.` });
    }

    const updated = Label.editLabel(user, labelId, body);
    if (!updated) return res.status(404).json({ error: 'Label not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit label.' });
  }
};

exports.deleteLabel = (req, res) => {
  try {
    const user = req.user;
    const labelId = parseInt(req.params.id);
    const deleted = Label.deleteLabel(user, labelId);

    if (!deleted) {
      return res.status(404).json({ error: 'Label not found or already deleted' });
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete label.' });
  }
};

exports.addMailToLabel = (req, res) => {
  try {
    const user = req.user;
    const body = req.body || {};

    if (typeof body.mailId !== 'number') {
      return res.status(400).json({ error: 'mailId must be a number' });
    }

    const labelId = parseInt(req.params.id);
    const added = Label.addMailToLabel(user, labelId, body.mailId);

    if (!added) {
      return res.status(400).json({
        error: 'Failed to add mail to label. Mail may already be in label or label does not exist.'
      });
    }

    res.status(200).json({ message: 'Mail added to label successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add mail to label.' });
  }
};

exports.removeFromLabel = (req, res) => {
  const user = req.user;
  const labelId = parseInt(req.params.labelId);
  const mailId = parseInt(req.params.mailId);

  const success = Label.removeMailFromLabel(user, labelId, mailId);
  if (!success) {
    return res.status(404).json({ error: 'Label or Mail not found in label.' });
  }

  res.status(204).end();
};