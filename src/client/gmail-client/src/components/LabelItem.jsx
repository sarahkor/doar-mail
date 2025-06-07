import React, { useState } from 'react';
import './LabelItem.css';
import { renameLabel, deleteLabel, updateLabelColor } from '../api/labelsApi';
import EditLabelDialog from './EditLabelDialog';
import DeleteLabelDialog from './DeleteLabelDialog';
import NewLabelDialog from './NewLabelDialog';

const COLOR_OPTIONS = [
  '#f28b82', '#fbbc04', '#fff475', '#ccff90',
  '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb',
  '#fdcfe8', '#e6c9a8', '#e8eaed',
];

function LabelItem({ label, depth = 0, hasChildren = false, isSelected, onSelect, onColorChange, onLabelUpdate, onLabelDelete, existingLabels, onLabelAdd, allLabels = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
    setShowColors(false);
  };

  const handleColorChange = async (color) => {
    try {
      await updateLabelColor(label.id, color);
      if (onColorChange) onColorChange(label.id, color);
      setShowColors(false);
      setMenuOpen(false);
    } catch (error) {
      console.error('Failed to update label color:', error);
    }
  };

  const handleColorClick = (e, color) => {
    e.stopPropagation();
    handleColorChange(color);
  };

  console.log(`Label "${label.name}" at depth ${depth} with ${depth * 24}px padding`);

  return (
    <div className={`label-item-container ${isSelected ? 'selected' : ''}`} style={{ paddingLeft: depth * 24 }}>
      <div className="label-item" onClick={onSelect}>
        {hasChildren && (
          <span className="label-arrow">▸</span>
        )}
        <span
          className="label-color"
          style={{ backgroundColor: label.color }}
        ></span>
        <span className={`label-name ${isSelected ? 'bold' : ''}`}>
          {label.name}
        </span>

        <div
          className="more-button-wrapper"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button className="more-button" onClick={toggleMenu}>⋮</button>
          {showTooltip && !menuOpen && (
            <div className="label-tooltip">{label.name}</div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="label-menu">
          <div
            className={`label-menu-item ${showColors ? 'active' : ''}`}
            onClick={() => setShowColors(!showColors)}
          >
            Label color {showColors ? '▾' : '▸'}
          </div>

          <div
            className="label-menu-item"
            onClick={() => {
              setShowEditModal(true);
              setMenuOpen(false);
            }}
          >
            Edit
          </div>
          <div
            className="label-menu-item"
            onClick={() => {
              setShowDeleteModal(true);
              setMenuOpen(false);
            }}
          >
            Remove label
          </div>

          <div
            className="label-menu-item"
            onClick={() => {
              setShowAddModal(true);
              setMenuOpen(false);
            }}
          >
            Add sublabel
          </div>

          {showColors && (
            <div className="color-picker-popup">
              {COLOR_OPTIONS.map((color) => (
                <div
                  key={color}
                  className="label-color-circle"
                  style={{ backgroundColor: color }}
                  onClick={(e) => handleColorClick(e, color)}
                >
                  <span className="label-color-letter">a</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEditModal && (
        <EditLabelDialog
          label={label}
          onClose={() => setShowEditModal(false)}
          onUpdate={onLabelUpdate}
          existingLabels={existingLabels}
        />
      )}

      {showDeleteModal && (
        <DeleteLabelDialog
          label={label}
          onClose={() => setShowDeleteModal(false)}
          onDelete={onLabelDelete}
          allLabels={allLabels}
        />
      )}

      {showAddModal && (
        <NewLabelDialog
          onClose={() => setShowAddModal(false)}
          onCreate={onLabelAdd}                    // NEW – the real “add” handler
          // include the current label so the <select> can show it pre-selected
          existingLabels={[label, ...existingLabels]}   // NEW
          defaultParentId={label.id}
          forceNested={true}
        />
      )}

    </div>
  );
}

export default LabelItem;
