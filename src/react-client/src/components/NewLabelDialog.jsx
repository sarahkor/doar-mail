import React, { useState, useEffect } from 'react';
import './NewLabelDialog.css';
import { addLabel } from '../api/labelsApi';

function NewLabelDialog({ onClose, onCreate, existingLabels = [], defaultParentId = '', forceNested = false }) {
  const [labelName, setLabelName] = useState('');
  const [isNested, setIsNested] = useState(forceNested);
  const [parentId, setParentId] = useState(defaultParentId);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // Check for duplicate names whenever labelName changes
  useEffect(() => {
    if (labelName.trim() === '') {
      setNameError('');
      return;
    }

    const isDuplicate = existingLabels.some(
      label => label.name.toLowerCase() === labelName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setNameError('The label name you have chosen already exists. Please try another name:');
    } else {
      setNameError('');
    }
  }, [labelName, existingLabels]);

  const handleSubmit = async () => {
    if (labelName.trim() === '' || loading || nameError) return;

    setLoading(true);
    try {
      const parentIdToSend = isNested ? parentId : null;
      const newLabel = await addLabel(labelName, 'gray', parentIdToSend); // Pass parent ID
      onCreate(newLabel);
      onClose();
    } catch (error) {
      alert('Failed to create label: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setLabelName(e.target.value);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">New label</h2>
        </div>

        <div className="dialog-content">
          <div className="form-group">
            <label className="form-label" htmlFor="label-input">
              Please enter a new label name:
            </label>
            {nameError && (
              <div className="error-message">
                {nameError}
              </div>
            )}
            <input
              id="label-input"
              className={`form-input ${nameError ? 'error' : ''}`}
              value={labelName}
              onChange={handleNameChange}
              placeholder="Enter label name"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="nest-checkbox"
                className="checkbox-input"
                checked={isNested}
                onChange={() => setIsNested(!isNested)}
                disabled={forceNested}
              />
              <label className="checkbox-label" htmlFor="nest-checkbox">
                Nest label under:
              </label>
            </div>
          </div>

          {isNested && (
            <div className="form-group">
              <select
                id="parent-select"
                className="form-select"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={!isNested || forceNested}
              >
                <option value="" disabled>
                  Please select a parent…
                </option>
                {existingLabels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button className="dialog-button dialog-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="dialog-button dialog-button-primary"
            disabled={labelName.trim() === '' || loading || nameError || (isNested && !parentId)}
            onClick={handleSubmit}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewLabelDialog;
