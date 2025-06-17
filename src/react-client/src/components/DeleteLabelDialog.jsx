import React from 'react';
import './DeleteLabelDialog.css';
import { deleteLabel } from '../api/labelsApi';

function DeleteLabelDialog({ label, onClose, onDelete, allLabels = [] }) {
    const [loading, setLoading] = React.useState(false);

    const getChildLabels = (parentId, labels) => {
        let children = [];
        labels.forEach(l => {
            if (l.parentId === parentId) {
                children.push(l);
                children = children.concat(getChildLabels(l.id, labels));
            }
        });
        return children;
    };

    const childLabels = getChildLabels(label.id, allLabels);
    const allLabelsToDelete = [label, ...childLabels];

    const handleDelete = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        try {
            await deleteLabel(label.id);
            if (onDelete) onDelete(label.id);
            onClose();
        } catch (error) {
            alert('Failed to delete label: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="delete-label-modal">
                <h2 className="title">Remove label</h2>

                {allLabelsToDelete.length === 1 ? (
                    <p className="single-label-msg">
                        Delete the label "{label.name}"?
                    </p>
                ) : (
                    <div className="multi-label-msg">
                        <p className="multi-label-text">
                            The following labels will be deleted:
                        </p>
                        <ul className="multi-label-list">
                            {allLabelsToDelete.map(labelToDelete => (
                                <li key={labelToDelete.id} className="multi-label-item">
                                    {labelToDelete.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="action-buttons">
                    <button type="button" className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="delete-button"
                        onClick={handleDelete}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteLabelDialog;
