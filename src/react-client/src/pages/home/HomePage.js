import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Inbox from './Inbox';
import LabelView from './LabelView';
import ComposeDialog from '../../components/ComposeDialog';
import SearchResults from './SearchResults';
import mailIcon from '../../assets/icons/mail.svg';
import Toast from '../../components/Toast';
import '../../components/Toast.css';
import MailDetail from './MailDetail';

function HomePage({ searchResults, isSearching, searchParams, onClearSearch }) {
  const [showCompose, setShowCompose] = useState(false);
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const prevMailCount = useRef(0);
  const [senderName, setSenderName] = useState('');
  const [composeTo, setComposeTo] = useState('');

  const firstLoad = useRef(true);

  const fetchInbox = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch("/api/inbox", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch inbox");
      const data = await response.json();

      // Only show toast if this isn't the first load
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
      setMails(data.mails);

      // After the first load, flip the flag so we get future notifications
      if (firstLoad.current) firstLoad.current = false;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  // Determine what to show in the main content area
  const showSearchResults = searchResults !== null;

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showCompose && (
        <ComposeDialog
          onClose={() => setShowCompose(false)}
          refreshInbox={fetchInbox}
          to={composeTo}
        />
      )}

      {showToast && (
        <Toast>
          <img src={mailIcon} alt="Mail" className="toast-icon" />
          <span>You have a new message from <strong>{senderName}</strong></span>
        </Toast>
      )}

      {loading ? (
        <p>Loading inbox...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <>
          {showSearchResults ? (
            <SearchResults
              results={searchResults}
              isSearching={isSearching}
              searchParams={searchParams}
              onClearSearch={onClearSearch}
            />
          ) : (
            <Routes>
              <Route index element={<Navigate to="inbox" />} />
              <Route path="inbox" element={<Inbox mails={mails} />} />
              <Route path="labels/:labelId" element={<LabelView />} />
              <Route
                path="inbox/:mailId"
                element={<MailDetail onCompose={(to) => {
                  setShowCompose(false);
                  setTimeout(() => {
                    setComposeTo(to);
                    setShowCompose(true);
                  }, 0);
                }} />}
              />
            </Routes>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;