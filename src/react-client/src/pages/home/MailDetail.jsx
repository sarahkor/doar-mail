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

// this function displays the detailed view of a single mail, with full content, metadata, labels, and actions
export default function MailDetail({ onCompose }) {
  // Extract folder and mailId from URL parameters
  const { folder, mailId } = useParams();
  const navigate = useNavigate();

  // Component state
  const [mail, setMail] = useState(null);
  const [mailLabels, setMailLabels] = useState([]); // Labels associated with this mail
  const [error, setError] = useState('');
  const [isStarred, setIsStarred] = useState(false); // Whether the mail is starred by current user

  // Fetch mail content using the GET api/mails/:id endpoint
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

  // Fetch all labels associated with this mail
  const fetchMailLabels = useCallback(async () => {
    try {
      const all = await getLabels();
      setMailLabels(all.filter(l => l.mailIds?.includes(Number(mailId))));
    } catch (err) {
      setError(err.message);
    }
  }, [mailId]);

  // fetch per-user starred status using the GET /api/starred/:id endpoint
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
      setError(err.message);
    }
  }, [mailId]);

  useEffect(() => {
    fetchMail();
    fetchMailLabels();
    refreshStarred();
  }, [fetchMail, fetchMailLabels, refreshStarred]);

  // Toggle the star status, if the mail was starred it will get unstarred 
  // and if the mail was unstarred it will get starred when clicking on the star icon
  const toggleStar = async e => {
    e.preventDefault();
    e.stopPropagation();

    // set the mail to be the oppisite from what it was (if starred then unstarred and vise verca)
    setIsStarred(prev => !prev);
    // toggling the mail star using the POST /api/starred/:id endpoint
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/starred/${mailId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsStarred(prev => !prev);
      alert('Failed to toggle star.');
    }
  };

  // Move mail to trash (or delete permanently if already in trash)
  const moveTrash = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // if the mail is in trash then we delete permanently using the DELETE /api/trash/:id end point
      // and if the mail is not  in trash then we move it to trash using the DELETE api/mails/:id endpoint
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

  // Report mail as spam
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

  // Unspam a mail
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

  // Restore mail from trash
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

  // Build toolbar dynamically based on folder
  const icons = [];

  // Star/unstar icon for all folders
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

  // restore icon  and trash icon from the trash folder
  if (folder === 'trash') {
    icons.push(
      <button key="restore" className="toolbar-btn" onClick={restoreTrash} title="Restore">
        <img src={restoreIcon} alt="" />
      </button>,
      <button key="delete" className="toolbar-btn" onClick={moveTrash} title="Delete permanently">
        <img src={trashIcon} alt="" />
      </button>
    );

    // unspam icon and trash icon for the spam folder
  } else if (folder === 'spam') {
    icons.push(
      <button key="unspam" className="toolbar-btn" onClick={unmarkSpam} title="Not Spam">
        <img src={unspamIcon} alt="" />
      </button>,
      <button key="trash" className="toolbar-btn" onClick={moveTrash} title="Move to Trash">
        <img src={trashIcon} alt="" />
      </button>
    );

    // trash and spam icons for the rest of the folders
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

  // Format date for display
  const dateObj = new Date(mail.timestamp);
  const formattedDate = isNaN(dateObj)
    ? 'Invalid Date'
    : `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Resolve names for From and To fields
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
