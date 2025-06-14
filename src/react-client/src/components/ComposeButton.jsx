import React from 'react';
import './ComposeButton.css';
import composeIcon from '../assets/icons/compose.svg';

function ComposeButton({ onClick }) {
  return (
    <button className="compose-button" onClick={onClick}>
      <img src={composeIcon} alt="Compose" className="compose-icon" />
      <span className="compose-text">Compose</span>
    </button>
  );
}

export default ComposeButton;