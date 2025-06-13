import React, { useState } from 'react';
import Navbar from './Navbar';
import LabelSidebar from './LabelSidebar';
import ComposeDialog from './ComposeDialog';

function AppLayout({ children }) {
  const [showCompose, setShowCompose] = useState(false);

  const openCompose = () => setShowCompose(true);
  const closeCompose = () => setShowCompose(false);

  return (
    <div className="App" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar onComposeClick={openCompose} />
      <div
        className="app-content"
        style={{
          display: "flex",
          flex: 1,
          height: "100%",
          overflow: "hidden", // <--- Prevent scrolling here
        }}
      >
        <LabelSidebar />
        <div
          className="main-scroll-content"
          style={{
            flexGrow: 1,
            padding: "0 20px 20px 20px",
            position: "relative",
            overflowY: "auto", // <--- Only scroll this column!
            height: "100vh",   // <--- Fill vertical space under navbar
          }}
        >
          {children}
        </div>
      </div>
      {showCompose && <ComposeDialog onClose={closeCompose} />}
    </div>
  );
}

export default AppLayout;
