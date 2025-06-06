import React, { useState } from 'react';
import './NewLabelDialog.css';

function NewLabelDialog({ onClose, onCreate, existingLabels = [],defaultParentId = '', forceNested = false }) {
    const [labelName, setLabelName] = useState('');
    const [isNested, setIsNested]   = useState(forceNested);
    const [parentId, setParentId]   = useState(defaultParentId);
    const handleSubmit = () => {
        if (labelName.trim() === '') return;
        const newLabel = {
        name: labelName,
        color: 'gray',
        parentId: isNested ? parentId : null,
        };
        console.log('🔵 שולחת לשרת את:', newLabel); // הדפסת בדיקה
        onCreate(newLabel);
        onClose();
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
            disabled={!isNested}                 // <- keeps it greyed-out until nested
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
            disabled={labelName.trim() === ''}
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewLabelDialog;
