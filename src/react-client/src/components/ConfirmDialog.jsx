import React from 'react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog is a reusable modal dialog for confirming user actions, like deleting.
 *
 * Props:
 * - isOpen: boolean - controls whether the dialog is visible
 * - title: string - the heading of the dialog
 * - message: string - the confirmation message to show
 * - onConfirm: function - called when the user clicks "Yes"
 * - onCancel: function -  called when the user clicks "Cancel"
 */
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-backdrop">
      <div className="confirm-dialog">
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button className="ok-btn" onClick={onConfirm}>Yes</button>
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
