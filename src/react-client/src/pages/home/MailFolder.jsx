import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MailItem from '../../components/MailItem';
import ComposeDialog from '../../components/ComposeDialog';

function MailFolder({ endpoint, title, folder }) {
  const [mails, setMails] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const location = useLocation();

  const refreshMails = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch mails');
      const data = await response.json();
      setMails(data.mails || []);
      setError('');
    } catch (err) {
      setError(err.message);
      setMails([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Refresh on folder change
  useEffect(() => {
    setMails([]);
    refreshMails();
  }, [location.pathname, refreshMails]);

  useEffect(() => {
    refreshMails();
    const interval = setInterval(refreshMails, 2000);
    return () => clearInterval(interval);
  }, [refreshMails]);

  const handleDraftClick = (mail) => {
    setEditingDraft(mail);
    setShowCompose(true);
  };

  return (
    <div className="folder-wrapper">
      {/* Error message, if any */}
      {error && <p className="text-danger">{error}</p>}

      {/* Folder title */}
      <h2>{title}</h2>

      {/* “No mails found” message when loaded but empty */}
      {!loading && mails.length === 0 && (
        <p className="no-mails">No mails found.</p>
      )}

      {/* Scrollable list of mails */}
      <div className="folder-scroll-container">
        {mails.map((mail) => (
          <MailItem
            key={mail.id}
            mail={mail}
            folder={folder}
            onClick={
              (folder === 'drafts' || (folder === 'starred' && mail.status === 'draft') || (folder === 'trash' && mail.status === 'draft'))
                ? () => handleDraftClick(mail)
                : undefined
            }
            onStarToggle={refreshMails}
            onTrash={refreshMails}
          />
        ))}
      </div>

      {/* Compose dialog for editing drafts */}
      {showCompose && editingDraft && (
        <ComposeDialog
          onClose={() => {
            setShowCompose(false);
            setEditingDraft(null);
          }}
          draft={editingDraft}
          refreshInbox={refreshMails}
        />
      )}
    </div>
  );

}

export default MailFolder;
