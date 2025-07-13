import React, { useState } from 'react';
import Navbar from './Navbar';
import ComposeButton from '../mail/ComposeButton';
import ComposeDialog from '../mail/ComposeDialog';
import LabelSidebar from './LabelSidebar';
import './AppLayout.css';

/**
 * AppLayout defines the main layout structure of the app.
 * It includes:
 * - Navbar (top bar with search, logo, and profile menu)
 * - Sidebar with Compose button and label navigation
 * - Main content area for routed pages
 * - ComposeDialog popup
 *
 * Props:
 * - children: the main content to render (inbox, sent, etc.)
 * - onSearch, searchResults, isSearching, onClearSearch: search handling passed from parent (e.g., HomePage)
 */
function AppLayout({ children, onSearch, searchResults, isSearching, onClearSearch }) {
  // Compose dialog visibility state
  const [showCompose, setShowCompose] = useState(false);

  // Functions to toggle dialog
  const openCompose = () => setShowCompose(true);
  const closeCompose = () => setShowCompose(false);

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onComposeClick={openCompose}
        onSearch={onSearch}
        searchResults={searchResults}
        isSearching={isSearching}
        onClearSearch={onClearSearch}
      />

      <div className="app-content">
        <aside className="sidebar-wrapper">
          <div className="compose-container">
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