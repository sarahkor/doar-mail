import React, { useEffect, useState } from 'react';
import './LabelSidebar.css';
import LabelItem from './LabelItem';
import NewLabelDialog from './NewLabelDialog';
import { getLabels } from '../api/labelsApi';
import { renameLabel } from '../api/labelsApi';

const buildTree = (items) => {
    console.log('🌳 Building tree from labels:', items);
    console.log('🌳 Raw items before processing:', items.map(l => ({ id: l.id, name: l.name, parentId: l.parentId })));

    const map = new Map();
    // Ensure all IDs are treated as numbers for consistency
    items.forEach(l => {
        const processedLabel = { ...l, id: Number(l.id), parentId: l.parentId ? Number(l.parentId) : null, children: [] };
        console.log(`🏷️ Processing label "${l.name}": original parentId=${l.parentId}, processed parentId=${processedLabel.parentId}`);
        map.set(Number(l.id), processedLabel);
    });

    console.log('📋 Map contents:', Array.from(map.entries()));

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

    const fetchLabels = async () => {
        try {
            console.log('🔄 Fetching labels from API...');
            const fetchedLabels = await getLabels();
            console.log('✅ Fetched labels:', fetchedLabels);
            setLabels(fetchedLabels);
        } catch (err) {
            console.error('Failed to fetch labels:', err);
        }
    };

    /* ───────────── טעינת לייבלים בתחילה ───────────── */
    useEffect(() => {
        fetchLabels();
    }, []);

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
    const handleLabelUpdate = async (updatedLabel) => {
        console.log('🔄 handleLabelUpdate called with:', updatedLabel);
        // For label updates that might involve hierarchy changes, refetch all data
        try {
            await fetchLabels();
            console.log('✅ Labels refreshed after update');
        } catch (error) {
            console.error('Failed to refresh labels after update:', error);
            // Fallback to local update only
            setLabels(prev =>
                prev.map(l => (l.id === updatedLabel.id ? updatedLabel : l))
            );
        }
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

    // Test function to directly test the API
    const testLabelHierarchy = async () => {
        console.log('🧪 Starting direct API test...');
        if (labels.length < 2) {
            alert('Need at least 2 labels to test hierarchy. Create some labels first.');
            return;
        }

        const label1 = labels[0];
        const label2 = labels[1];

        console.log(`🧪 Testing: Setting "${label2.name}" as child of "${label1.name}"`);

        try {
            // Test 1: Set label2 as child of label1
            const result = await renameLabel(label2.id, label2.name, label1.id);
            console.log('🧪 API call result:', result);

            // Refresh labels to see if it worked
            await fetchLabels();

            alert(`Test completed! Check console for details. Expected: "${label2.name}" should be child of "${label1.name}"`);
        } catch (error) {
            console.error('🧪 Test failed:', error);
            alert('Test failed! Check console for error details.');
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
                    <button
                        onClick={testLabelHierarchy}
                        style={{
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            fontSize: '12px'
                        }}
                    >
                        Test API
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
