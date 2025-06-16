// src/components/MailItem.jsx
import React, { useState, useEffect } from 'react';
import './MailItem.css';
import { Link } from 'react-router-dom';
import LabelEmailDialog from './LabelEmailDialog';
import ConfirmDialog from './ConfirmDialog';
import { getLabels } from '../api/labelsApi';
import starIcon from '../assets/icons/star.svg';
import fullStarIcon from '../assets/icons/fullStar.svg';
import trashIcon from '../assets/icons/trash.svg';
import spamIcon from '../assets/icons/spam.svg';
import unspamIcon from '../assets/icons/unspam.svg';
import labelIcon from '../assets/icons/label3.svg';
import restoreIcon from '../assets/icons/untrash.svg';

function MailItem({ mail, folder = 'inbox', onClick, onStarToggle, onTrash, onRestore }) {
  // State
  const [mailLabels, setMailLabels] = useState([]);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Fetch labels once per mail
  useEffect(() => {
    (async () => {
      try {
        const all = await getLabels();
        setMailLabels(all.filter(lbl => lbl.mailIds?.includes(mail.id)));
      } catch (e) {
        console.error('Failed to fetch labels:', e);
      }
    })();
  }, [mail.id]);

  // Compute display time or date
  const mailDate = new Date(mail.timestamp);
  const isToday = mailDate.toDateString() === new Date().toDateString();
  const timeOrDate = isToday ? mail.time : mail.date;

  // Helpers to render addresses
  const username = sessionStorage.getItem('username');
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

  // Handlers
  const handleStarClick = async e => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await fetch(`/api/starred/${mail.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (res.ok && onStarToggle) onStarToggle();
    } catch {
      alert('Failed to toggle star.');
    }
  };

  const handleRestoreClick = async e => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Restore icon clicked!');

    try {
      const res = await fetch(`/api/trash/${mail.id}/restore`, {
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
      setPendingDeleteId(mail.id);
      setConfirmOpen(true);
      return;
    }

    // move to trash
    fetch(`/api/mails/${mail.id}`, {
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
      const res = await fetch(`/api/spam/${mail.id}`, {
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
      const res = await fetch(`/api/spam/${mail.id}/unspam`, {
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
      setMailLabels(all.filter(lbl => lbl.mailIds?.includes(mail.id)));
    } catch {
      console.error('Failed to refresh labels');
    }
  };

  // Icon components
  const star = (
    <div className="tooltip-container">
      <img
        src={mail.starred ? fullStarIcon : starIcon}
        alt={mail.starred ? 'Starred' : 'Not starred'}
        className="star-icon"
        onClick={handleStarClick}
        draggable={false}
      />
      <div className="tooltip-text left-align">
        {mail.starred ? 'Unstar mail' : 'Star mail'}
      </div>
    </div>
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

  // Choose which icons show, per folder
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
        return isDraft ? [label, trash] : [label, spam, trash];
      default:
        return isDraft ? [label, trash] : [label, spam, trash];
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

      <div className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        {(mail.status === 'draft') ? (
          // Drafts & starred-draft: clickable row
          <div
            onClick={onClick}
            tabIndex={0}
            className="mail-link"
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            {star}
            {mail.status === 'draft' && <span className="draft-label">Draft</span>}
            <div className="mail-from">{renderToLine()}</div>
            <div className="mail-content">
              <div className="mail-subject-row">
                <div className="mail-subject">{mail.subject}</div>
                {mailLabels.length > 0 && (
                  <div className="mail-labels">
                    {mailLabels.map(l => (
                      <span key={l.id} className="mail-label-tag" style={{ backgroundColor: l.color }}>
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
          </div>
        ) : (
          // All other folders: Link wrapper
          <Link to={`/home/${folder}/${mail.id}`} className="mail-link">
            {star}
            <div className="mail-from">{renderFromLine()}</div>
            <div className="mail-content">
              <div className="mail-subject-row">
                <div className="mail-subject">{mail.subject}</div>
                {mailLabels.length > 0 && (
                  <div className="mail-labels">
                    {mailLabels.map(l => (
                      <span key={l.id} className="mail-label-tag" style={{ backgroundColor: l.color }}>
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
