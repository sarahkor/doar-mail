import React from 'react';
import './NewLabelDialog.css';
import { deleteLabel } from '../api/labelsApi';

function DeleteLabelDialog({ label, onClose, onDelete, allLabels = [] }) {
    const [loading, setLoading] = React.useState(false);

    // Get all child labels that will be deleted
    const getChildLabels = (parentId, labels) => {
        let children = [];
        labels.forEach(l => {
            if (l.parentId === parentId) {
                children.push(l);
                children = children.concat(getChildLabels(l.id, labels)); // Recursively get grandchildren
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
            console.log('🗑️ Deleting label:', label.id);
            await deleteLabel(label.id);
            console.log('✅ Label deleted successfully');
            if (onDelete) onDelete(label.id);
            onClose();
        } catch (error) {
            console.error('❌ Failed to delete label:', error);
            alert('Failed to delete label: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="new-label-modal" style={{ width: '300px', padding: '20px' }}>
                <h2 className="title">Remove label</h2>

                {allLabelsToDelete.length === 1 ? (
                    <p style={{
                        fontSize: '14px',
                        color: '#5f6368',
                        margin: '20px 0 30px 0',
                        padding: '0 10px'
                    }}>
                        Delete the label "{label.name}"?
                    </p>
                ) : (
                    <div style={{
                        fontSize: '14px',
                        color: '#5f6368',
                        margin: '20px 0 30px 0',
                        padding: '0 10px'
                    }}>
                        <p style={{ margin: '0 0 10px 0' }}>
                            The following labels will be deleted:
                        </p>
                        <ul style={{
                            margin: '0',
                            paddingLeft: '20px',
                            color: '#000000',
                            fontWeight: 'bold'
                        }}>
                            {allLabelsToDelete.map(labelToDelete => (
                                <li key={labelToDelete.id} style={{ marginBottom: '4px' }}>
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
                        className="create-button"
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                            backgroundColor: '#1a73e8',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteLabelDialog; 