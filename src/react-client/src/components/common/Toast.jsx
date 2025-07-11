import React from 'react';
import './Toast.css';

//Toast component displays a temporary notification message.
function Toast({ children }) {
  return <div className="toast-container">{children}</div>;
}

export default Toast;
