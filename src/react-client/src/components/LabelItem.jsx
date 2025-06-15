import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LabelItem.css';
import { renameLabel, deleteLabel, updateLabelColor } from '../api/labelsApi';
import EditLabelDialog from './EditLabelDialog';
import DeleteLabelDialog from './DeleteLabelDialog';
import NewLabelDialog from './NewLabelDialog';
import labelIcon from '../assets/icons/label2.svg';

const COLOR_OPTIONS = [
  '#f28b82', '#fbbc04', '#fff475', '#ccff90',
  '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb',
  '#fdcfe8', '#e6c9a8', '#e8eaed',
];



function LabelItem({ label, depth = 0, hasChildren = false, isSelected, onSelect, onColorChange, onLabelUpdate, onLabelDelete, existingLabels, onLabelAdd, allLabels = [] }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const colorPickerRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both menu and color picker
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      const isOutsideColorPicker = colorPickerRef.current && !colorPickerRef.current.contains(event.target);

      if (isOutsideMenu && isOutsideColorPicker) {
        setMenuOpen(false);
        setShowColors(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLabelClick = () => {
    navigate(`/home/labels/${label.id}`);
    if (onSelect) onSelect();
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
    setShowColors(false);
  };

  const handleColorMenuClick = () => {
    if (!showColors && menuRef.current) {
      // Calculate position for color picker
      const menuRect = menuRef.current.getBoundingClientRect();
      const menuItemHeight = 40; // Approximate height of menu item
      const colorMenuItemIndex = 0; // "Label color" is the first item

      setColorPickerPosition({
        top: menuRect.top + (colorMenuItemIndex * menuItemHeight),
        left: menuRect.right + 8 // 8px gap from menu
      });
    }
    setShowColors(!showColors);
  };

  const handleColorChange = async (color) => {
    console.log('Changing color to:', color, 'for label:', label.name);
    try {
      await updateLabelColor(label.id, color);
      if (onColorChange) onColorChange(label.id, color);

      // Dispatch a custom event to notify other components about the label update
      window.dispatchEvent(new CustomEvent('labelUpdated', {
        detail: { labelId: label.id, color: color }
      }));

      setShowColors(false);
      setMenuOpen(false);
      console.log('Color changed successfully');
    } catch (error) {
      console.error('Failed to update label color:', error);
    }
  };

  const handleColorClick = (e, color) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Color clicked:', color);
    handleColorChange(color);
  };

  // Calculate indentation - account for arrow space so parent and children don't align
  // Base padding: 24px, then 24px per depth level
  // Arrow takes up 24px (16px width + 8px margin), so we need to account for this
  const baseIndentation = 24;
  const depthIndentation = depth * 24;
  const indentationPx = baseIndentation + depthIndentation;

  console.log(`🏷️ Label "${label.name}" - Depth: ${depth}, HasChildren: ${hasChildren}, Indentation: ${indentationPx}px, ParentID: ${label.parentId || 'none'}`);

  return (
    <div className={`label-item-container ${isSelected ? 'selected' : ''}`}>
      <div
        className="label-item"
        onClick={handleLabelClick}
        style={{ paddingLeft: `${indentationPx}px` }}
      >
        <div className="label-content">
          <div
            className="label-icon"
            style={{
              width: 20,
              height: 20,
              marginRight: 12,
              verticalAlign: 'middle',
              backgroundColor: label.color,
              maskImage: `url(${labelIcon})`,
              WebkitMaskImage: `url(${labelIcon})`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center'
            }}
          />
          <span className={`label-name ${isSelected ? 'bold' : ''}`}>
            {label.name}
          </span>
        </div>

        <div
          className="more-button-wrapper"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          ref={menuRef}
        >
          <button className="more-button" onClick={toggleMenu}>⋮</button>
          {showTooltip && !menuOpen && (
            <div className="label-tooltip">{label.name}</div>
          )}

          {menuOpen && (
            <div className="label-menu">
              <div
                className={`label-menu-item ${showColors ? 'active' : ''}`}
                onClick={handleColorMenuClick}
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
            </div>
          )}
        </div>
      </div>

      {showColors && (
        <div
          ref={colorPickerRef}
          className="color-picker-popup"
          style={{
            top: `${colorPickerPosition.top}px`,
            left: `${colorPickerPosition.left}px`
          }}
        >
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

      {showEditModal && (
        <EditLabelDialog
          label={label}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedLabel) => {
            console.log('🔄 LabelItem received updated label:', updatedLabel);
            onLabelUpdate(updatedLabel);
          }}
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
          onCreate={onLabelAdd}                    // NEW – the real "add" handler
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
