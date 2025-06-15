import React, { useState } from 'react';
import './EditLabelDialog.css';          // ⬅️  קובץ CSS חדש
import { renameLabel } from '../api/labelsApi';

function EditLabelDialog({ label, onClose, onUpdate, existingLabels = [] }) {
    const [labelName, setLabelName] = useState(label.name);
    const [parentId, setParentId] = useState(label.parentId ? label.parentId.toString() : '');
    const [isNested, setIsNested] = useState(!!label.parentId);
    const [loading, setLoading] = useState(false);

    console.log(`🔧 EditLabelDialog initialized - Label: "${label.name}", Current parentId: ${label.parentId}, isNested: ${!!label.parentId}`);

    // Filter out current label and its descendants to prevent circular references
    const getAvailableParents = () => {
        const getDescendantIds = (labelId, labels) => {
            const descendants = [];
            const children = labels.filter(l => l.parentId === labelId);
            children.forEach(child => {
                descendants.push(child.id);
                descendants.push(...getDescendantIds(child.id, labels));
            });
            return descendants;
        };

        const excludeIds = [label.id, ...getDescendantIds(label.id, existingLabels)];
        const available = existingLabels.filter(l => !excludeIds.includes(l.id));
        console.log(`🔧 Available parents for "${label.name}":`, available.map(l => ({ id: l.id, name: l.name })));
        return available;
    };

    const availableParents = getAvailableParents();

    // Save is disabled only if:
    // - loading
    // - labelName is empty
    // - isNested is true and no parentId is selected
    const saveDisabled = loading || labelName.trim() === '' || (isNested && !parentId);

    console.log(`🔧 Form state - labelName: "${labelName}", parentId: "${parentId}", isNested: ${isNested}, saveDisabled: ${saveDisabled}`);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`🔧 Form submitted - labelName: "${labelName}", parentId: "${parentId}", isNested: ${isNested}`);
        if (saveDisabled) {
            console.log(`❌ Form submission blocked - saveDisabled: ${saveDisabled}`);
            return;
        }
        setLoading(true);
        try {
            const parentIdToSend = isNested ? parseInt(parentId) : null;
            console.log(`🔄 EditLabelDialog submitting: name="${labelName}", parentId=${parentIdToSend} (isNested: ${isNested}, raw parentId: "${parentId}")`);
            const updatedLabel = await renameLabel(label.id, labelName, parentIdToSend);
            console.log(`✅ EditLabelDialog received updated label:`, updatedLabel);
            if (onUpdate) onUpdate(updatedLabel);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleNestedChange = (e) => {
        const checked = e.target.checked;
        console.log(`🔧 Nested checkbox changed to: ${checked}`);
        setIsNested(checked);
        if (!checked) {
            console.log(`🔧 Clearing parentId because nested is false`);
            setParentId('');
        }
    };

    const handleParentChange = (e) => {
        const newParentId = e.target.value;
        console.log(`🔧 Parent dropdown changed to: "${newParentId}"`);
        setParentId(newParentId);
    };

    /* ---------- רינדור ---------- */
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
                            <option key={l.id} value={l.id}>
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
                            style={{ background: '#1a73e8', color: '#fff', position: 'relative', cursor: saveDisabled ? 'not-allowed' : 'pointer' }}
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
