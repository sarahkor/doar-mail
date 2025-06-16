// src/pages/home/MailFolder.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MailItem from '../../components/MailItem';
import ComposeDialog from '../../components/ComposeDialog';
import './LabelView.css';
import emptyTrashIcon from '../../assets/icons/empty-trash.svg';
import ConfirmDialog from '../../components/ConfirmDialog';

function MailFolder({ endpoint, title, folder }) {
  const [mails, setMails] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const location = useLocation();

  const refreshMails = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch mails');
      const { mails: fetched = [] } = await res.json();
      setMails(fetched);
      setError('');
    } catch (err) {
      setError(err.message);
      setMails([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  const handleEmptyTrash = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/trash/empty', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to empty trash');
      await refreshMails();
    } catch (err) {
      console.error(err);
      alert('Failed to empty trash.');
    } finally {
      setConfirmEmptyOpen(false);
    }
  };


  // refetch whenever the route changes
  useEffect(() => {
    refreshMails();
  }, [location.pathname, refreshMails]);

  const handleDraftClick = mail => {
    setEditingDraft(mail);
    setShowCompose(true);
  };

  // early returns so we *use* `error` (and hide the card)
  if (loading) return <p>Loading mails…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="label-view-wrapper">
      <div className="label-header">
        <div className="label-title">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {title}
            {folder === 'trash' && (
              <div className="tooltip-container">
                <img
                  src={emptyTrashIcon}
                  alt="Empty Trash"
                  className="empty-trash-icon"
                  onClick={() => setConfirmEmptyOpen(true)}
                  draggable={false}
                />
                <div className="tooltip-text">Empty Trash</div>
              </div>
            )}
          </h2>
        </div>
        <div className="label-count">
          {mails.length} {mails.length === 1 ? 'email' : 'emails'}
        </div>
      </div>

      {/* scrollable mail list */}
      <div className="label-mails-container">
        {mails.length === 0 ? (
          <div className="no-mails-message">
            <p>No mails found.</p>
          </div>
        ) : (
          mails.map(mail => (
            <MailItem
              key={mail.id}
              mail={mail}
              folder={folder}
              onClick={
                (folder === 'drafts' ||
                  (folder === 'starred' && mail.status === 'draft') ||
                  (folder === 'all' && mail.status === 'draft') ||
                  (folder === 'trash' && mail.status === 'draft'))
                  ? () => handleDraftClick(mail)
                  : undefined
              }
              onStarToggle={refreshMails}
              onTrash={refreshMails}
              onRestore={refreshMails}

            />
          ))
        )}
      </div>

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
      <ConfirmDialog
        isOpen={confirmEmptyOpen}
        title="Empty Trash"
        message="Are you sure you want to permanently delete all mails in Trash?"
        onConfirm={handleEmptyTrash}
        onCancel={() => setConfirmEmptyOpen(false)}
      />
    </div>
  );
}

export default MailFolder;
