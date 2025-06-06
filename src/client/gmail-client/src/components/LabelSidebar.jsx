import React, { useEffect, useState } from 'react';
import './LabelSidebar.css';
import LabelItem from './LabelItem';
import NewLabelDialog from './NewLabelDialog';
import { getLabels } from '../api/labelsApi';

function LabelSidebar() {
    const [showModal, setShowModal] = useState(false);
    const [labels, setLabels] = useState([]);
    const [selectedLabelId, setSelectedLabelId] = useState(null);

    /* ───────────── טעינת לייבלים בתחילה ───────────── */
    useEffect(() => {
        fetchLabels();
    }, []);

    const fetchLabels = async () => {
        try {
            const fetchedLabels = await getLabels();
            setLabels(fetchedLabels);
        } catch (err) {
            console.error('Failed to fetch labels:', err);
        }
    };

    /* ───────────── יצירת לייבל חדש ───────────── */
    const handleCreateLabel = (newLabel) => {
        setLabels(prev => [...prev, newLabel]);
        setShowModal(false);
    };

    /* ───────────── שינוי צבע לייבל קיים ───────────── */
    const updateLabelColor = (id, color) => {
        setLabels(prev =>
            prev.map(l => (l.id === id ? { ...l, color } : l))
        );
    };

    /* ───────────── עדכון לייבל קיים ───────────── */
    const handleLabelUpdate = (updatedLabel) => {
        setLabels(prev =>
            prev.map(l => (l.id === updatedLabel.id ? updatedLabel : l))
        );
    };

    /* ───────────── מחיקת לייבל ───────────── */
    const handleLabelDelete = (id) => {
        setLabels(prev => prev.filter(l => l.id !== id));
        if (selectedLabelId === id) {
            setSelectedLabelId(null);
        }
    };

    /* ───────────── JSX ───────────── */
    return (
        <div className="label-sidebar">
            <div className="label-header">
                <span>Labels</span>
                <div className="add-label-wrapper">
                    <button
                        className="add-button"
                        onClick={() => setShowModal(true)}
                    >
                        +
                    </button>
                    <span className="tooltip">Create new label</span>
                </div>
            </div>

            <ul className="label-list">
                {labels.map((label) => (
                    <li key={label.id}>
                        <LabelItem
                            label={label}
                            isSelected={label.id === selectedLabelId}
                            onSelect={() => setSelectedLabelId(label.id)}
                            onColorChange={updateLabelColor}
                            onLabelUpdate={handleLabelUpdate}
                            onLabelDelete={handleLabelDelete}
                            existingLabels={labels.filter(l => l.id !== label.id)}
                        />
                    </li>
                ))}
            </ul>

            {showModal && (
                <NewLabelDialog
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreateLabel}
                    existingLabels={labels}
                />
            )}
        </div>
    );
}

export default LabelSidebar;
