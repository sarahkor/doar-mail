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
  const [mailLabels, setMailLabels] = useState([]);    // ← labels state
  const [error, setError] = useState('');

  // 1) fetch the mail
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

  // 2) fetch all labels & filter down to this mail
  const fetchMailLabels = useCallback(async () => {
    try {
      const all = await getLabels();
      setMailLabels(all.filter(l => l.mailIds?.includes(Number(mailId))));
    } catch (err) {
      console.error('Failed to fetch labels:', err);
    }
  }, [mailId]);

  useEffect(() => {
    fetchMail();
    fetchMailLabels();
  }, [fetchMail, fetchMailLabels]);


  // --- action handlers (star, trash, spam, etc) ---
  const toggleStar = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/starred/${mail.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setMail(m => ({ ...m, starred: !m.starred }));
    } catch {
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

  const markSpam = async () => { /* ... same as above, navigate back ... */ };
  const unmarkSpam = async () => { /* ... */ };
  const restoreTrash = async () => { /* ... */ };

  if (error) return <div className="mail-detail-error">{error}</div>;
  if (!mail) return <div className="mail-detail-loading">Loading…</div>;

  // build the toolbar buttons exactly like your MailItem iconsByFolder
  const icons = [];
  icons.push(
    <button key="star" className="toolbar-btn" onClick={toggleStar}
      title={mail.starred ? 'Unstar mail' : 'Star mail'}>
      <img src={mail.starred ? fullStarIcon : starIcon} alt="" />
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

        {/* ← right next to the subject */}
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
        <div>
          <strong>From:</strong>{' '}
          <span className="mail-detail-address"
            onClick={() => onCompose(mail.from)}>
            {fromFull} &lt;{mail.from}&gt;
          </span>
        </div>
        {mail.to && (
          <div>
            <strong>To:</strong>{' '}
            <span className="mail-detail-address"
              onClick={() => onCompose(mail.to)}>
              {toFull} &lt;{mail.to}&gt;
            </span>
          </div>
        )}
        <div><strong>Date:</strong> {formattedDate}</div>
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
