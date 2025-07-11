const mongoose = require('mongoose');
const Label = require('../models/labels');
const labelService = require('../services/labelsService');

exports.listLabels = async (req, res) => {
  try {
    const username = req.user.username;
    const labels = await labelService.listLabelsByUser(username);
    res.status(200).json(labels);
  } catch (err) {
    console.error('Error listing labels:', err);
    res.status(500).json({ error: 'Failed to list labels.' });
  }
};

exports.createLabel = async (req, res) => {
  try {
    const username = req.user.username;
    const body = req.body || {};
    const fields = Object.keys(body);
    const unexpected = fields.filter(k => !Label.ALLOWED_FIELDS.includes(k));
    const missing = Label.REQUIRED_FIELDS.filter(f => !body[f]);

    if (unexpected.length)
      return res.status(400).json({
        error: `Unexpected fields: ${unexpected.join(', ')}`,
        allowedFields: Label.ALLOWED_FIELDS,
        requiredFields: Label.REQUIRED_FIELDS
      });

    if (missing.length)
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(', ')}`,
        allowedFields: Label.ALLOWED_FIELDS,
        requiredFields: Label.REQUIRED_FIELDS
      });

    const { name, color = 'gray', parentId } = body;

    if (color && !Label.ALLOWED_COLORS.includes(color))
      return res.status(400).json({
        error: `Invalid color: '${color}'. Allowed colors: ${Label.ALLOWED_COLORS.join(', ')}`
      });

    // ensure parent exists (if given)
    if (parentId) {
      const parent = await labelService.getLabelById(username, parentId);
      if (!parent) {
        return res.status(400).json({ error: `Parent label '${parentId}' not found.` });
      }
    }

    // no duplicate names
    if (await labelService.labelNameExists(username, name)) {
      return res.status(400).json({ error: `A label named '${name}' already exists.` });
    }

    const newLabel = await labelService.createLabel(username, { name, color, parentId });
    res.status(201)
      .location(`/api/labels/${newLabel._id}`)
      .json({
        id: newLabel._id,
        name: newLabel.name,
        color: newLabel.color,
        parentId: newLabel.parent
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create label.' });
  }
};

exports.getLabel = async (req, res) => {
  try {
    const username = req.user.username;
    const labelId = req.params.id;

    const label = await labelService.getLabelWithMails(username, labelId);
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.status(200).json(label);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch label.' });
  }
};

exports.editLabel = async (req, res) => {
  try {
    const username = req.user.username;
    const labelId = req.params.id;
    const body = req.body || {};

    // Validate body keys
    const unexpected = Object.keys(body).filter(f => !Label.ALLOWED_FIELDS.includes(f));
    if (unexpected.length) {
      return res.status(400).json({
        error: `Unexpected fields: ${unexpected.join(', ')}`,
        allowedFields: Label.ALLOWED_FIELDS
      });
    }

    // Delegate to service
    const updated = await labelService.editLabel(username, labelId, body);
    if (!updated) {
      return res.status(404).json({ error: 'Label not found.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.error || err.message || 'Failed to edit label.' });
  }
};

exports.deleteLabel = async (req, res) => {
  try {
    const username = req.user.username;
    const labelId = req.params.id;

    const success = await labelService.deleteLabelById(username, labelId);
    if (!success) {
      return res.status(404).json({ error: 'Label not found or already deleted.' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete label.' });
  }
};

exports.addMailToLabel = async (req, res) => {
  try {
    const username = req.user.username;
    const body = req.body || {};
    const labelId = req.params.id;
    const mailId = req.body.mailId;

    if (!mailId) {
      return res.status(400).json({ error: 'Missing required field: mailId' });
    }
    if (!mongoose.Types.ObjectId.isValid(mailId)) {
      return res.status(400).json({ error: 'mailId must be a valid ObjectId' });
    }

    const added = await labelService.addMailToLabel(username, labelId, mailId);

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

exports.removeFromLabel = async (req, res) => {
  try {
    const username = req.user.username;
    const { labelId, mailId } = req.params;

    const success = await labelService.removeMailFromLabel(
      username,
      labelId,
      mailId
    );

    if (!success) {
      return res
        .status(404)
        .json({ error: 'Label not found or mail not in that label.' });
    }

    res.status(204).end();
  } catch (err) {
    console.error('Error removing mail from label:', err);
    res.status(500).json({ error: 'Failed to remove mail from label.' });
  }
};