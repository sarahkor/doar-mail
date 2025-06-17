// src/pages/home/MailDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLabels } from '../../api/labelsApi';
import starIcon from '../../assets/icons/star.svg';
import fullStarIcon from '../../assets/icons/fullStar.svg';
import spamIcon from '../../assets/icons/spam.svg';
import unspamIcon from '../../assets/icons/unspam.svg';
import trashIcon from '../../assets/icons/trash.svg';
import restoreIcon from '../../assets/icons/untrash.svg';
import './MailDetail.css';

export default function MailDetail({ onCompose }) {
  const { folder, mailId } = useParams();
  const navigate = useNavigate();

  const [mail, setMail] = useState(null);
  const [mailLabels, setMailLabels] = useState([]);
  const [error, setError] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  const fetchMail = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/mails/${mailId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load mail');
      setMail(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }, [mailId]);

  const fetchMailLabels = useCallback(async () => {
    try {
      const all = await getLabels();
      setMailLabels(all.filter(l => l.mailIds?.includes(Number(mailId))));
    } catch (err) {
    }
  }, [mailId]);

  // fetch per-user starred status
  const refreshStarred = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/starred/${mailId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const { starred } = await res.json();
      setIsStarred(starred);
    } catch (err) {
    }
  }, [mailId]);

  useEffect(() => {
    fetchMail();
    fetchMailLabels();
    refreshStarred();
  }, [fetchMail, fetchMailLabels, refreshStarred]);

  const toggleStar = async e => {
    e.preventDefault();
    e.stopPropagation();

    // optimistic flip
    setIsStarred(prev => !prev);

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/starred/${mailId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
    } catch {
      // rollback on error
      setIsStarred(prev => !prev);
      alert('Failed to toggle star.');
    }
  };

  const moveTrash = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const url = folder === 'trash'
        ? `/api/trash/${mail.id}`
        : `/api/mails/${mail.id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      navigate(`/home/${folder}`);
    } catch {
      alert('Failed to delete mail.');
    }
  };

  const markSpam = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/spam/${mailId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      navigate(`/home/${folder}`);
    } catch {
      alert('Failed to report as spam.');
    }
  };

  const unmarkSpam = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/spam/${mailId}/unspam`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      navigate(`/home/${folder}`);
    } catch {
      alert('Failed to unmark spam.');
    }
  };

  const restoreTrash = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/trash/${mailId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      navigate(`/home/${folder}`);
    } catch {
      alert('Failed to restore mail from trash.');
    }
  };

  if (error) return <div className="mail-detail-error">{error}</div>;
  if (!mail) return <div className="mail-detail-loading"></div>;

  // build the toolbar buttons exactly like your MailItem iconsByFolder
  const icons = [];

  icons.push(
    <button
      key="star"
      className="toolbar-btn"
      onClick={toggleStar}
      title={isStarred ? 'Unstar mail' : 'Star mail'}
      aria-pressed={isStarred}
    >
      <img src={isStarred ? fullStarIcon : starIcon} alt="" />
    </button>
  );

  if (folder === 'trash') {
    icons.push(
      <button key="restore" className="toolbar-btn" onClick={restoreTrash} title="Restore">
        <img src={restoreIcon} alt="" />
      </button>,
      <button key="delete" className="toolbar-btn" onClick={moveTrash} title="Delete permanently">
        <img src={trashIcon} alt="" />
      </button>
    );
  } else if (folder === 'spam') {
    icons.push(
      <button key="unspam" className="toolbar-btn" onClick={unmarkSpam} title="Not Spam">
        <img src={unspamIcon} alt="" />
      </button>,
      <button key="trash" className="toolbar-btn" onClick={moveTrash} title="Move to Trash">
        <img src={trashIcon} alt="" />
      </button>
    );
  } else {
    icons.push(
      <button key="spam" className="toolbar-btn" onClick={markSpam} title="Report as Spam">
        <img src={spamIcon} alt="" />
      </button>,
      <button key="trash" className="toolbar-btn" onClick={moveTrash} title="Move to Trash">
        <img src={trashIcon} alt="" />
      </button>
    );
  }

  const dateObj = new Date(mail.timestamp);
  const formattedDate = isNaN(dateObj)
    ? 'Invalid Date'
    : `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const username = sessionStorage.getItem('username');
  const toFull = mail.to === username ? 'Me' : mail.toName || mail.to;
  const fromFull = mail.from === username ? 'Me' : mail.fromName || mail.from;

  return (
    <div className="mail-detail-card">
      <div className="mail-detail-toolbar">
        {icons}
      </div>

      <div className="mail-detail-header">
        <h1 className="mail-detail-subject">
          {mail.subject || '(no subject)'}
        </h1>

        {mailLabels.length > 0 && (
          <div className="mail-detail-labels">
            {mailLabels.map(lbl => (
              <span
                key={lbl.id}
                className="mail-detail-label"
                style={{ backgroundColor: lbl.color }}
              >
                {lbl.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mail-detail-meta">
        <div className="mail-detail-meta-line">
          <strong>From:</strong>{' '}
          <span className="mail-detail-name">{fromFull}</span>{' '}
          <span
            className="mail-detail-email"
            onClick={() => onCompose(mail.from)}
          >
            &lt;{mail.from}&gt;
          </span>
        </div>

        {mail.to && (
          <div className="mail-detail-meta-line">
            <strong>To:</strong>{' '}
            <span className="mail-detail-name">{toFull}</span>{' '}
            <span
              className="mail-detail-email"
              onClick={() => onCompose(mail.to)}
            >
              &lt;{mail.to}&gt;
            </span>
          </div>
        )}

        <div className="mail-detail-meta-line">
          <strong>Date:</strong>{' '}
          <span className="mail-detail-value">{formattedDate}</span>
        </div>
      </div>

      <hr className="mail-detail-divider" />

      <div className="mail-detail-body">
        {mail.bodyPreview?.trim() || 'No content.'}
      </div>

      {mail.attachments?.length > 0 && (
        <>
          <hr className="mail-detail-divider" />
          <div className="mail-detail-attachments">
            <strong>Attachments</strong>
            <ul>
              {mail.attachments.map((att, i) => (
                <li key={i}>
                  <a
                    href={`data:${att.mimetype};base64,${att.buffer}`}
                    download={att.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {att.originalName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );

}
