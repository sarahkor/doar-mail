import React, { useState } from 'react';
import './NewLabelDialog.css';
import { addLabel } from '../api/labelsApi';

function NewLabelDialog({ onClose, onCreate, existingLabels = [], defaultParentId = '', forceNested = false }) {
  const [labelName, setLabelName] = useState('');
  const [isNested, setIsNested] = useState(forceNested);
  const [parentId, setParentId] = useState(defaultParentId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (labelName.trim() === '' || loading) return;

    setLoading(true);
    try {
      console.log('🔵 Creating label:', labelName);
      const newLabel = await addLabel(labelName, 'pink'); // Default color
      console.log('✅ Label created:', newLabel);
      onCreate(newLabel);
      onClose();
    } catch (error) {
      console.error('❌ Failed to create label:', error);
      alert('Failed to create label: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="modal-overlay">
      <div className="new-label-modal">
        <h2 className="modal-title">New label</h2>
        <label className="modal-subtitle" htmlFor="label-input">
          Please enter a new label name:
        </label>
        <input
          id="label-input"
          className="input-text"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
        />

        <div className="checkbox-row">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isNested}
              onChange={() => setIsNested(!isNested)}
            />
            <span className="checkmark"></span>
          </label>
          <label className="nest-label" htmlFor="parent-select">
            Nest label under:
          </label>
        </div>

        <select
          id="parent-select"
          className="select-dropdown"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={!isNested || forceNested}               // <- keeps it greyed-out until nested
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


        <div className="action-buttons">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-button"
            disabled={labelName.trim() === '' || loading}
            onClick={handleSubmit}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewLabelDialog;
