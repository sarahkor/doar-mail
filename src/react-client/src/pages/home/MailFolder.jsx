import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MailItem from '../../components/MailItem';
import ComposeDialog from '../../components/ComposeDialog';
import './LabelView.css';
import emptyTrashIcon from '../../assets/icons/empty-trash.svg';
import ConfirmDialog from '../../components/ConfirmDialog';
import leftArrow from '../../assets/icons/left-arrow.svg';
import rightArrow from '../../assets/icons/right-arrow.svg';

/**
 * MailFolder component displays paginated list of mails from a specific folder (like trash, inbox, etc.). 
 * Supports pagination, draft editing, and trash emptying functionality.
 * the function recives the folder, title and endpoint from the homepage and showes the folder respectively
 */
function MailFolder({ endpoint, title, folder, refreshTrigger }) {
  const [mails, setMails] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const location = useLocation();

  // Function to fetch mails from the server with paging (i have api/{folder-name} endpoint for each folder)
  const refreshMails = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${endpoint}?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch mails');
      const { mails: fetched = [], total: totalCount = 0 } = await res.json();
      setTotal(totalCount);
      setMails(fetched);
      setError('');
    } catch (err) {
      setError(err.message);
      setMails([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page]);

  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  // Function to permanently delete all mails in Trash using the DELETE api/trash/empty endpoint from the web-server
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
      alert('Failed to empty trash.');
    } finally {
      setConfirmEmptyOpen(false);
    }
  };

  useEffect(() => {
    refreshMails();
  }, [location.pathname, page, refreshTrigger, refreshMails]);

  // refresh mails every 2 seconds (for live updates)
  useEffect(() => {
    const interval = setInterval(refreshMails, 2000);
    return () => clearInterval(interval);
  }, [refreshMails]);

  // When clicking on a draft mail, open it in the Compose dialog and not the mail detail
  const handleDraftClick = mail => {
    setEditingDraft(mail);
    setShowCompose(true);
  };

  if (error) return <p className="text-danger">{error}</p>;

  // Handle paging logic, we check if there is a previous page or next page
  const canPrev = page > 0;
  const canNext = (page + 1) * 30 < total;

  return (
    <div className="label-view-wrapper">
      <div className="label-header">
        <div className="label-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2>{title}</h2>
          {/* Show "Empty Trash" icon only when the current folder is 'trash' */}
          {folder === 'trash' && (
            <div className="tooltip-container">
              <img
                src={emptyTrashIcon}
                alt="Empty Trash"
                className="empty-trash-icon"
                onClick={() => setConfirmEmptyOpen(true)} // Open confirm dialog on click that valdiate with the user that he wants to delete
                draggable={false}
              />
              {/* a massage near the trash icon the explain what it does*/}
              <div className="tooltip-text">Empty Trash</div>
            </div>
          )}
        </div>
        <div className="label-count">
          Showing {mails.length} of {total}
        </div>
        {/* back and next buttons with page counter that are abaled only if the page exists */}
        <div className="pagination-controls">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Previous page"
            className="pagination-btn"
          >
            <img
              src={leftArrow}
              alt="Previous"
              className={canPrev ? 'arrow-icon' : 'arrow-icon disabled'}
            />
          </button>
          <span>Page {page + 1}</span>
          <button
            onClick={() => canNext && setPage(p => p + 1)}
            disabled={!canNext}
            aria-label="Next page"
            className="pagination-btn"
          >
            <img
              src={rightArrow}
              alt="Next"
              className={canNext ? 'arrow-icon' : 'arrow-icon disabled'}
            />
          </button>
        </div>
      </div>

      {/* Main content: either list of MailItems or a "No mails" message */}
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
              onClick={mail.status === 'draft' ? () => handleDraftClick(mail) : undefined} // Allow editing only for drafts
              onStarToggle={refreshMails}
              onTrash={refreshMails}
              onRestore={refreshMails}
            />
          ))
        )}
      </div>

      {showCompose && editingDraft && (
        <ComposeDialog
          onClose={() => { setShowCompose(false); setEditingDraft(null); }}
          draft={editingDraft}
          refreshInbox={refreshMails}
        />
      )}

      {/* Confirmation dialog for permanently emptying the trash */}
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
