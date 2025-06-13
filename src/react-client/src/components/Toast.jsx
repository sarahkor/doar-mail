import React from 'react';
import './Toast.css';

function Toast({ children }) {
  return <div className="toast-container">{children}</div>;
}

export default Toast;
