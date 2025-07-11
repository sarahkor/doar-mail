import React, { useEffect, useState } from 'react';
import './LabelSidebar.css';
import LabelItem from '../labels/LabelItem';
import NewLabelDialog from '../NewLabelDialog';
import { getLabels } from '../../api/labelsApi';
import MailFoldersSidebar from './MailFoldersSidebar';
import labelIcon from '../assets/icons/label2.svg';
import { useLocation } from 'react-router-dom';

const buildTree = (items) => {
    // 1) Build a lookup of labelId → node
    const lookup = {};
    items.forEach(l => {
        lookup[l._id] = { ...l, children: [] };
    });

    // 2) Assemble the forest
    const roots = [];
    items.forEach(l => {
        const node = lookup[l._id];
        if (l.parent) {
            const parent = lookup[l.parent.toString()];
            if (parent) parent.children.push(node);
            else roots.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
};


/**
 * LabelSidebar component displays a sidebar combining:
 * - Mail folder navigation (Inbox, Sent, etc.)
 * - Hierarchically nested user-created labels
 * 
 * Features:
 * - Dynamically builds label hierarchy using a tree structure
 * - Supports label creation via a modal dialog
 * - Allows label selection, color updates, renaming, and deletion
 */
function LabelSidebar() {
    const [showModal, setShowModal] = useState(false);
    const [labels, setLabels] = useState([]);
    const [selectedLabelId, setSelectedLabelId] = useState(null);
    const location = useLocation();
    useEffect(() => {
        if (!location.pathname.startsWith('/home/labels')) {
            setSelectedLabelId(null);
        }
    }, [location.pathname]);

    const renderLabel = (node, depth = 0) => (
        <li key={node._id}>
            <LabelItem
                label={node}
                depth={depth}
                hasChildren={node.children.length > 0}
                isSelected={node._id === selectedLabelId}
                onSelect={() => setSelectedLabelId(node._id)}
                onColorChange={updateLabelColor}
                onLabelUpdate={handleLabelUpdate}
                onLabelDelete={handleLabelDelete}
                onLabelAdd={handleCreateLabel}
                existingLabels={labels.filter(l => l._id !== node._id)}
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
            const fetchedLabels = await getLabels();
            setLabels(fetchedLabels);
        } catch (err) {
        }
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    const handleCreateLabel = async (newLabel) => {
        // Instead of just adding to state, refetch all labels to get the correct tree structure
        try {
            await fetchLabels(); // This will rebuild the tree with the new label in the correct position
        } catch (error) {
            // Fallback to just adding to state if fetch fails
            setLabels(prev => [...prev, newLabel]);
        }
        setShowModal(false);
    };

    const updateLabelColor = (id, color) => {
        setLabels(prev =>
            prev.map(l => (l._id === id ? { ...l, color } : l))
        );
    };

    const handleLabelUpdate = async (updatedLabel) => {
        // For label updates that might involve hierarchy changes, refetch all data
        try {
            await fetchLabels();
        } catch (error) {
            // Fallback to local update only
            setLabels(prev =>
                prev.map(l => (l._id === updatedLabel._id ? updatedLabel : l))
            );
        }
    };

    const handleLabelDelete = async (id) => {
        // Refetch all labels to get the updated list after cascading delete
        try {
            await fetchLabels(); // This will rebuild the tree without the deleted labels
        } catch (error) {
            // Fallback to just removing from state if fetch fails
            setLabels(prev => prev.filter(l => l._id !== id));
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

            {/* LABELS SECTION */}
            <div className="label-header">
                <div className="label-title-with-icon">
                    <img
                        src={labelIcon}
                        alt="Labels icon"
                        className="label-section-icon"
                    />
                    <span className="label-section-title">Labels</span>
                </div>
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
