import React, { useState, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ComposeDialog from '../../components/ComposeDialog';
import mailIcon from '../../assets/icons/message.svg';
import Toast from '../../components/Toast';
import '../../components/Toast.css';
import MailDetail from './MailDetail';
import MailFolder from './MailFolder';

const FOLDER_CONFIGS = [
  { path: "inbox", endpoint: "/api/inbox", title: "Inbox" },
  { path: "sent", endpoint: "/api/sent", title: "Sent" },
  { path: "drafts", endpoint: "/api/drafts", title: "Drafts" },
  { path: "spam", endpoint: "/api/spam", title: "Spam" },
  { path: "trash", endpoint: "/api/trash", title: "Trash" },
  { path: "starred", endpoint: "/api/starred", title: "Starred" },
  { path: "all", endpoint: "/api/mails/all", title: "All Mail" }
];

function HomePage() {
  const [showCompose, setShowCompose] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [composeTo, setComposeTo] = useState('');

  // Toast: still only for inbox, but you could generalize
  const prevMailCount = useRef(0);
  const firstLoad = useRef(true);

  // For new mail notification, we just poll the inbox
  React.useEffect(() => {
    async function fetchInbox() {
      const token = sessionStorage.getItem("token");
      try {
        const response = await fetch("/api/inbox", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();

        if (!firstLoad.current && data.mails.length > prevMailCount.current) {
          const latestMail = data.mails[0];
          setSenderName(latestMail.fromName || latestMail.from);

          setShowToast(true);
          document.title = 'New mail!';
          setTimeout(() => {
            setShowToast(false);
            document.title = 'Inbox - Doar';
          }, 3000);
        }

        prevMailCount.current = data.mails.length;
        if (firstLoad.current) firstLoad.current = false;
      } catch { }
    }
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showCompose && (
        <ComposeDialog
          onClose={() => setShowCompose(false)}
          to={composeTo}
        />
      )}

      {showToast && (
        <Toast>
          <img src={mailIcon} alt="Mail" className="toast-icon" />
          <span>You have a new message from <strong>{senderName}</strong></span>
        </Toast>
      )}

      <Routes>
        <Route index element={<Navigate to="inbox" />} />
        {FOLDER_CONFIGS.map(({ path, endpoint, title }) => (
          <Route
            key={path}
            path={path}
            element={
              <MailFolder endpoint={endpoint} title={title} folder={path} />
            }
          />
        ))}
        {/* One detail route for ALL folders */}
        <Route
          path=":folder/:mailId"
          element={
            <MailDetail onCompose={(to) => {
              setShowCompose(false);
              setTimeout(() => {
                setComposeTo(to);
                setShowCompose(true);
              }, 0);
            }} />
          }
        />
      </Routes>
    </div>
  );
}

export default HomePage;
