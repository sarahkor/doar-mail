import React from 'react';
import './ComposeButton.css';
import composeIcon from '../../assets/icons/compose.svg';

/**
 * A styled button for opening the "Compose Mail" dialog.
 * The actual behavior (opening the dialog) is controlled by the homePage
 * via the `onClick` prop.
 */
function ComposeButton({ onClick }) {
  return (
    <button className="compose-button" onClick={onClick}>
      <img src={composeIcon} alt="Compose" className="compose-icon" />
      <span className="compose-text">Compose</span>
    </button>
  );
}

export default ComposeButton;