import React, { useState } from 'react';
import Navbar from './Navbar';
import LabelSidebar from './LabelSidebar';
import ComposeDialog from './ComposeDialog'; // adjust path if needed

function AppLayout({ children }) {
  const [showCompose, setShowCompose] = useState(false);

  const openCompose = () => setShowCompose(true);
  const closeCompose = () => setShowCompose(false);

  return (
    <div className="App">
      <Navbar onComposeClick={openCompose} />
      <div className="app-content" style={{ display: "flex" }}>
        <LabelSidebar />
        <div style={{ flexGrow: 1, padding: "20px" }}>
          {children}
        </div>
      </div>
      {showCompose && <ComposeDialog onClose={closeCompose} />}
    </div>
  );
}

export default AppLayout;
