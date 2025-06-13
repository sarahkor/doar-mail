import React, { useEffect, useState } from 'react';
import './LabelSidebar.css';
import LabelItem from './LabelItem';
import NewLabelDialog from './NewLabelDialog';
import { getLabels } from '../api/labelsApi';
import MailFoldersSidebar from './MailFoldersSidebar';

const buildTree = (items) => {
    console.log('🌳 Building tree from labels:', items);
    const map = new Map();
    // Ensure all IDs are treated as numbers for consistency
    items.forEach(l => map.set(Number(l.id), { ...l, id: Number(l.id), parentId: l.parentId ? Number(l.parentId) : null, children: [] }));
    const roots = [];
    map.forEach(l => {
        if (l.parentId) {
            console.log(`📁 Label "${l.name}" (ID: ${l.id}) is child of parent ID: ${l.parentId}`);
            const parent = map.get(Number(l.parentId));
            if (parent) {
                parent.children.push(l);
                console.log(`✅ Added "${l.name}" as child of "${parent.name}"`);
            } else {
                console.warn(`⚠️ Parent ID ${l.parentId} not found for label "${l.name}"`);
                console.warn(`Available parent IDs:`, Array.from(map.keys()));
            }
        } else {
            console.log(`🌱 Label "${l.name}" (ID: ${l.id}) is root level`);
            roots.push(l);
        }
    });
    console.log('🌳 Final tree structure:', roots);
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
                depth={depth}
                hasChildren={node.children.length > 0}
                isSelected={node.id === selectedLabelId}
                onSelect={() => setSelectedLabelId(node.id)}
                onColorChange={updateLabelColor}
                onLabelUpdate={handleLabelUpdate}
                onLabelDelete={handleLabelDelete}
                onLabelAdd={handleCreateLabel}
                existingLabels={labels.filter(l => l.id !== node.id)}
                allLabels={labels}
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
    const handleCreateLabel = async (newLabel) => {
        console.log('Adding new label to state:', newLabel);
        // Instead of just adding to state, refetch all labels to get the correct tree structure
        try {
            await fetchLabels(); // This will rebuild the tree with the new label in the correct position
        } catch (error) {
            console.error('Failed to refresh labels after creation:', error);
            // Fallback to just adding to state if fetch fails
            setLabels(prev => [...prev, newLabel]);
        }
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
    const handleLabelDelete = async (id) => {
        console.log(`🗑️ Deleting label with ID: ${id}`);
        // Refetch all labels to get the updated list after cascading delete
        try {
            await fetchLabels(); // This will rebuild the tree without the deleted labels
            console.log('✅ Labels refreshed after deletion');
        } catch (error) {
            console.error('Failed to refresh labels after deletion:', error);
            // Fallback to just removing from state if fetch fails
            setLabels(prev => prev.filter(l => l.id !== id));
        }

        if (selectedLabelId === id) {
            setSelectedLabelId(null);
        }
    };

    /* ───────────── JSX ───────────── */
    return (
        <div className="label-sidebar">
            {/* PAGE BUTTONS SECTION */}
            <MailFoldersSidebar />

            {/* Divider, optional */}
            <hr style={{ margin: "16px 0" }} />

            {/* LABELS SECTION */}
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
