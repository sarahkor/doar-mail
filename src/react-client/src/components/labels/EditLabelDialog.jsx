import React, { useState } from 'react';
import './EditLabelDialog.css';
import { renameLabel } from '../api/labelsApi';

/**
 * EditLabelDialog allows users to rename a label and optionally nest it under another label.
 * Prevents cycles by disallowing a label to be nested under itself or its descendants.
 *
 * Props:
 * - label: the label to edit (object with id, name, and optionally parentId)
 * - onClose: function to close the dialog
 * - onUpdate: callback after successful update, passed the updated label
 * - existingLabels: full list of label objects for nesting validation
 */
function EditLabelDialog({ label, onClose, onUpdate, existingLabels = [] }) {
    const [labelName, setLabelName] = useState(label.name);
    const [parentId, setParentId] = useState(label.parentId ? label.parentId.toString() : '');
    const [isNested, setIsNested] = useState(!!label.parentId);
    const [loading, setLoading] = useState(false);

    // Filter out current label and its descendants to prevent circular references
    const getAvailableParents = () => {
        const getDescendantIds = (labelId, labels) => {
            const descendants = [];
            const children = labels.filter(l => l.parentId === labelId);
            children.forEach(child => {
                descendants.push(child._id);
                descendants.push(...getDescendantIds(child._id, labels));
            });
            return descendants;
        };

        const excludeIds = [label._id, ...getDescendantIds(label._id, existingLabels)];
        const available = existingLabels.filter(l => !excludeIds.includes(l._id));
        return available;
    };

    const availableParents = getAvailableParents();

    const saveDisabled = loading || labelName.trim() === '' || (isNested && !parentId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saveDisabled) {
            return;
        }
        setLoading(true);
        try {
            const parentIdToSend = isNested ? parentId : null;
            const updatedLabel = await renameLabel(label._id, labelName, parentIdToSend);
            if (onUpdate) onUpdate(updatedLabel);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleNestedChange = (e) => {
        const checked = e.target.checked;
        setIsNested(checked);
        if (!checked) {
            setParentId('');
        }
    };

    const handleParentChange = (e) => {
        const newParentId = e.target.value;
        setParentId(newParentId);
    };

    return (
        <div className="modal-overlay">
            <div className="new-label-modal">
                <h2 className="title">Edit label</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <label className="input-label" htmlFor="edit-label-name" style={{ marginBottom: 0 }}>Label name:</label>
                        <input
                            id="edit-label-name"
                            type="text"
                            className="input-text"
                            value={labelName}
                            onChange={(e) => setLabelName(e.target.value)}
                            placeholder="Enter label name"
                            autoFocus
                        />
                    </div>
                    <div className="checkbox-row" style={{ marginTop: 16 }}>
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="nest-label"
                                checked={isNested}
                                onChange={handleNestedChange}
                            />
                            <label htmlFor="nest-label" className="nest-label">
                                Nest label under:
                            </label>
                        </div>
                    </div>
                    <select
                        id="parent-select"
                        className="select-dropdown"
                        value={parentId}
                        onChange={handleParentChange}
                        style={{ marginTop: 8 }}
                        disabled={!isNested}
                    >
                        <option value="">Please select a parent...</option>
                        {availableParents.map((l) => (
                            <option key={l._id} value={l._id}>
                                {l.name}
                            </option>
                        ))}
                    </select>
                    <div className="action-buttons">
                        <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-button"
                            disabled={saveDisabled}
                        >
                            {isNested && !parentId && (
                                <span className="spinner-fast" style={{
                                    width: 18, height: 18, display: 'inline-block', verticalAlign: 'middle', marginRight: 8
                                }}>
                                    <svg viewBox="0 0 50 50" style={{ width: 18, height: 18 }}>
                                        <circle cx="25" cy="25" r="20" fill="none" stroke="#1a73e8" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                                            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.4s" repeatCount="indefinite" />
                                        </circle>
                                    </svg>
                                </span>
                            )}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditLabelDialog;
