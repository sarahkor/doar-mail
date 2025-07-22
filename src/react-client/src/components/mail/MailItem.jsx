import React, { useState, useEffect } from 'react';
import './MailItem.css';
import { Link } from 'react-router-dom';
import LabelEmailDialog from '../labels/LabelEmailDialog';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import { getLabels } from '../../api/labelsApi';
import starIcon from '../../assets/icons/star.svg';
import fullStarIcon from '../../assets/icons/fullStar.svg';
import trashIcon from '../../assets/icons/trash.svg';
import spamIcon from '../../assets/icons/spam.svg';
import unspamIcon from '../../assets/icons/unspam.svg';
import labelIcon from '../../assets/icons/label3.svg';
import restoreIcon from '../../assets/icons/untrash.svg';

/**
 * Renders a single mail row inside any folder.
 * Supports:
 * - Star/unstar
 * - Trash/delete
 * - Spam/unspam
 * - Labeling
 * - Draft edit click
 * - shows time 
 * - Shows label tags, sunbjuct, content, read/unread status, and icons conditionally by folder
 */
function MailItem({ mail, folder = 'inbox', onClick, onStarToggle, onTrash, onRestore }) {
  const username = sessionStorage.getItem('username');
  const isIncoming = mail.to?.toLowerCase() === username;
  const isSentMail = mail.from?.toLowerCase() === username;
  const showStar = folder !== 'trash';

  // Determines if the current view should render the mail as "sent" 
  const showAsSent = (folder === 'sent' ||
    (folder === 'all' && isSentMail) ||
    (folder === 'starred' && isSentMail) ||
    (folder === 'spam' && isSentMail) ||
    (folder === 'trash' && isSentMail)
  );

  // State
  const [mailLabels, setMailLabels] = useState([]);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isStarred, setIsStarred] = useState(false);

  const isDraft = mail.status === 'draft';
  // Determines if the current mail should have unread style 
  const showUnread = !mail.read && !isDraft && (
    folder === 'inbox' ||
    (folder === 'all' && isIncoming) ||
    (folder === 'starred' && isIncoming) ||
    (folder === 'spam' && isIncoming)
  );

  // Fetch the mail starred status
  useEffect(() => {
    if (!mail._id) return;
    (async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`/api/starred/${mail._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { starred } = await res.json();
        setIsStarred(starred);
      } catch (e) { console.error(e); }
    })();
  }, [mail._id]);

  // Fetch labels once per mail
  useEffect(() => {
    (async () => {
      try {
        const all = await getLabels();
        setMailLabels(all.filter(lbl => lbl.mailIds?.includes(mail._id)));
      } catch (e) {
        console.error('Failed to fetch labels:', e);
      }
    })();
  }, [mail._id]);

  // Compute display time or date
  const mailDate = new Date(mail.timestamp);
  const isToday = mailDate.toDateString() === new Date().toDateString();
  const formattedTime = mailDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedDate = mailDate.toLocaleDateString();
  const timeOrDate = isToday ? formattedTime : formattedDate;

  // Helpers to render addresses
  const renderFromLine = () => {
    const fromLower = (mail.from || '').toLowerCase().trim();
    if ((folder === 'inbox' || folder === 'starred') && fromLower === username?.toLowerCase()) {
      return 'Me';
    }
    return mail.fromName || mail.from;
  };
  const renderToLine = () => {
    if (!mail.to) return '';
    const toLower = mail.to.toLowerCase().trim();
    return (toLower === username?.toLowerCase() || toLower === (mail.from || '').toLowerCase())
      ? 'To: Me'
      : `To: ${mail.to}`;
  };

  // Manually refresh star state
  const refreshStarred = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/starred/${mail._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { starred } = await res.json();
      setIsStarred(starred);
    } catch (e) {
      console.error(e);
    }
  };

  // on mount, fetch once
  useEffect(() => {
    if (mail._id) refreshStarred();
  }, [mail._id]);

  const handleStarClick = async e => {
    e.preventDefault();
    e.stopPropagation();

    setIsStarred(prev => !prev);

    try {
      const res = await fetch(`/api/starred/${mail._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (res.ok && onStarToggle) onStarToggle();
      else {
        // if it actually failed, flip it back:
        setIsStarred(prev => !prev);
      }
    } catch {
      // on network error, undo the flip:
      setIsStarred(prev => !prev);
      alert('Failed to toggle star.');
    }
  };

  const handleRestoreClick = async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/trash/${mail._id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (res.ok && onRestore) {
        onRestore();
      } else {
        console.error('Restore failed', res.status);
      }
    } catch (err) {
      console.error('Restore request error:', err);
      alert('Failed to restore mail from trash.');
    }
  };

  const handleTrashClick = e => {
    e.preventDefault(); e.stopPropagation();

    if (folder === 'trash') {
      // open custom dialog
      setPendingDeleteId(mail._id);
      setConfirmOpen(true);
      return;
    }

    // move to trash
    fetch(`/api/mails/${mail._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    })
      .then(res => res.ok && onTrash && onTrash())
      .catch(() => alert('Failed to move mail to trash.'));
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      const res = await fetch(`/api/trash/${pendingDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (res.ok && onTrash) onTrash();
    } catch {
      alert('Failed to permanently delete mail.');
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleSpamClick = async e => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await fetch(`/api/spam/${mail._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (res.ok && onTrash) onTrash();
    } catch {
      alert('Failed to mark mail as spam.');
    }
  };


  const handleUnspamClick = async e => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await fetch(`/api/spam/${mail._id}/unspam`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (res.ok && onTrash) onTrash();
    } catch {
      alert('Failed to unmark as spam.');
    }
  };

  const handleLabelClick = e => {
    e.preventDefault(); e.stopPropagation();
    setShowLabelDialog(true);
  };

  const handleLabelSuccess = async () => {
    try {
      const all = await getLabels();
      setMailLabels(all.filter(lbl => lbl.mailIds?.includes(mail._id)));
    } catch {
      console.error('Failed to refresh labels');
    }
  };

  // Icon components
  const star = (
    <button
      className="star-button"
      onClick={handleStarClick}
      aria-label={isStarred ? 'Unstar mail' : 'Star mail'}
    >
      <img
        src={isStarred ? fullStarIcon : starIcon}
        alt=""
        className="star-icon"
        draggable={false}
      />
    </button>
  );

  const restore = (
    <div className="tooltip-container">
      <img
        src={restoreIcon}
        alt="Restore"
        className="untrash-icon"
        onClick={handleRestoreClick}
        draggable={false}
      />
      <div className="tooltip-text right-align">Restore from Trash</div>
    </div>
  );

  const trash = (
    <div className="tooltip-container">
      <img
        src={trashIcon}
        alt="Trash"
        className="trash-icon"
        onClick={handleTrashClick}
        draggable={false}
      />
      <div className="tooltip-text right-align">
        {folder === 'trash' ? 'Delete permanently' : 'Move to Trash'}
      </div>
    </div>
  );

  const spam = (
    <div className="tooltip-container">
      <img
        src={spamIcon}
        alt="Spam"
        className="spam-icon"
        onClick={handleSpamClick}
        draggable={false}
      />
      <div className="tooltip-text">Report as Spam</div>
    </div>
  );

  const unspam = (
    <div className="tooltip-container">
      <img
        src={unspamIcon}
        alt="Unspam"
        className="unspam-icon"
        onClick={handleUnspamClick}
        draggable={false}
      />
      <div className="tooltip-text">unspam</div>
    </div>
  );

  const label = (
    <div className="tooltip-container">
      <img
        src={labelIcon}
        alt="Label"
        className="label-icon"
        onClick={handleLabelClick}
        draggable={false}
      />
      <div className="tooltip-text">Label Mail</div>
    </div>
  );

  // Folder-based icon sets
  const iconsByFolder = () => {
    const isDraft = mail.status === 'draft';

    switch (folder) {
      case 'trash':
        return [restore, trash];
      case 'spam':
        return [unspam, trash];
      case 'drafts':
        return [label, trash];
      case 'starred':
      case 'sent':
        if (isDraft) {
          return [label, trash];
        } else {
          const spamToggle = mail.status === 'spam' ? unspam : spam;
          return [label, spamToggle, trash];
        }
      default:
        if (isDraft) {
          return [label, trash];
        } else {
          const spamToggle = mail.status === 'spam' ? unspam : spam;
          return [label, spamToggle, trash];
        }
    }
  };

  return (
    <>
      {/* Custom confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Permanently delete"
        message="Are you sure you want to permanently delete this mail?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className={`mail-item ${showUnread ? 'unread' : 'read'}`}>
        {(mail.status === 'draft') ? (
          // Drafts & starred-draft: clickable row
          <div
            onClick={onClick}
            tabIndex={0}
            className="mail-link"
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            {showStar && star}
            {mail.status === 'draft' && <span className="draft-label">Draft</span>}
            <div className="mail-from-draft">{renderToLine()}</div>
            <div className="mail-content">
              <div className="mail-subject-row-draft">
                <div className="mail-subject-draft">{mail.subject}</div>
                {mailLabels.length > 0 && (
                  <div className="mail-labels">
                    {mailLabels.map(l => (
                      <span key={l._id} className="mail-label-tag" style={{ backgroundColor: l.color }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mail-preview-draft">{mail.bodyPreview}</div>
            </div>
            <div className="mail-right">
              <div className="mail-time">{timeOrDate}</div>
              <div className="mail-actions">
                {iconsByFolder().map((icn, i) => React.cloneElement(icn, { key: i }))}
              </div>
            </div>
          </div>
        ) : (
          // All other folders: Link wrapper
          <Link to={`/home/${folder}/${mail._id}`} className="mail-link">
            {showStar && star}
            <div className="mail-from">{showAsSent ? renderToLine() : renderFromLine()}</div>
            <div className="mail-content">
              <div className="mail-subject-row">
                <div className="mail-subject">{mail.subject}</div>
                {mailLabels.length > 0 && (
                  <div className="mail-labels">
                    {mailLabels.map(l => (
                      <span key={l._id} className="mail-label-tag" style={{ backgroundColor: l.color }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mail-preview">{mail.bodyPreview}</div>
            </div>
            <div className="mail-right">
              <div className="mail-time">{timeOrDate}</div>
              <div className="mail-actions">
                {iconsByFolder().map((icn, i) => React.cloneElement(icn, { key: i }))}
              </div>
            </div>
          </Link>
        )}

        {showLabelDialog && (
          <LabelEmailDialog mail={mail} onClose={() => setShowLabelDialog(false)} onSuccess={handleLabelSuccess} />
        )}
      </div>
    </>
  );
}

export default MailItem;
