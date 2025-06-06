import React, { useEffect, useState } from 'react';
import './LabelSidebar.css';
import LabelItem from './LabelItem';
import NewLabelDialog from './NewLabelDialog';
import { getLabels } from '../api/labelsApi';

const buildTree = (items) => {
  const map = new Map();
  items.forEach(l => map.set(l.id, { ...l, children: [] }));
  const roots = [];
  map.forEach(l => {
    if (l.parentId) {
      map.get(l.parentId)?.children.push(l);
    } else {
      roots.push(l);
    }
  });
  return roots;
};


function LabelSidebar() {
    const [showModal, setShowModal] = useState(false);
    const [labels, setLabels] = useState([]);
    const [selectedLabelId, setSelectedLabelId] = useState(null);

    const renderLabel = (node, depth = 0) => (
        <li key={node.id}>
            <LabelItem
            label={node}
            depth={depth}                     // NEW
            isSelected={node.id === selectedLabelId}
            onSelect={() => setSelectedLabelId(node.id)}
            onColorChange={updateLabelColor}
            onLabelUpdate={handleLabelUpdate}
            onLabelDelete={handleLabelDelete}
            onLabelAdd={handleCreateLabel}    // the add handler you wired earlier
            existingLabels={labels.filter(l => l.id !== node.id)}
            />
            {node.children.length > 0 && (
            <ul className="label-sublist">
                {node.children.map(child => renderLabel(child, depth + 1))}
            </ul>
            )}
        </li>
    );

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
                {buildTree(labels).map(root => renderLabel(root))}
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
