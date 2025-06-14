import React, { useState } from 'react';
import Navbar from './Navbar';
import ComposeButton from './ComposeButton';
import ComposeDialog from './ComposeDialog';
import LabelSidebar from './LabelSidebar';
import './AppLayout.css';

function AppLayout({ children }) {
  const [showCompose, setShowCompose] = useState(false);
  const openCompose = () => setShowCompose(true);
  const closeCompose = () => setShowCompose(false);

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="app-content">
        <aside className="sidebar-wrapper">
          <div className="compose-container"> {/* ✅ now inside sidebar */}
            <ComposeButton onClick={openCompose} />
          </div>
          <LabelSidebar />
        </aside>

        <main className="main-scroll-content">
          {children}
        </main>
      </div>
      {showCompose && <ComposeDialog onClose={closeCompose} />}
    </div>
  );
}

export default AppLayout;