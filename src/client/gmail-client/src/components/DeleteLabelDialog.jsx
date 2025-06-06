import React from 'react';
import './NewLabelDialog.css';
import { deleteLabel } from '../api/labelsApi';

function DeleteLabelDialog({ label, onClose, onDelete }) {
    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            await deleteLabel(label.id);
            if (onDelete) onDelete(label.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete label:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="new-label-modal" style={{ width: '300px', padding: '20px' }}>
                <h2 className="title">Remove label</h2>

                <p style={{
                    fontSize: '14px',
                    color: '#5f6368',
                    margin: '20px 0 30px 0',
                    padding: '0 10px'
                }}>
                    Delete the label "{label.name}"?
                </p>

                <div className="action-buttons">
                    <button type="button" className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="create-button"
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#d93025',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteLabelDialog; 