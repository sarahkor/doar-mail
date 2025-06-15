import React, { useState, useEffect } from 'react';
import './MailItem.css';
import { Link } from 'react-router-dom';
import LabelEmailDialog from './LabelEmailDialog';
import { getLabels } from '../api/labelsApi';
import starIcon from '../assets/icons/star.svg';
import fullStarIcon from '../assets/icons/fullStar.svg';
import trashIcon from '../assets/icons/trash.svg';
import spamIcon from '../assets/icons/spam.svg';

function MailItem({ mail, folder = 'inbox', onClick, onStarToggle, onTrash, onRestore }) {
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [mailLabels, setMailLabels] = useState([]);

  // Fetch labels and find which ones contain this mail
  useEffect(() => {
    const fetchMailLabels = async () => {
      try {
        const allLabels = await getLabels();
        const labelsForThisMail = allLabels.filter(label =>
          label.mailIds && label.mailIds.includes(mail.id)
        );
        setMailLabels(labelsForThisMail);
      } catch (error) {
        console.error('Failed to fetch labels for mail:', error);
      }
    };

    fetchMailLabels();
  }, [mail.id]);

  const mailDate = new Date(mail.timestamp);
  const now = new Date();
  const isToday = mailDate.toDateString() === now.toDateString();
  const timeOrDate = isToday ? mail.time : mail.date;
  const username = sessionStorage.getItem("username");

  const handleStarClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/starred/${mail.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      if (res.ok && onStarToggle) onStarToggle();
    } catch (err) {
      alert('Failed to toggle star.');
    }
  };

  const handleTrashClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/mails/${mail.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      if (res.ok && onTrash) onTrash();
    } catch (err) {
      alert('Failed to delete mail.');
    }
  };

  const handleSpamClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/spam/${mail.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      if (res.ok && onTrash) onTrash(); // reuse inbox refresh logic
    } catch (err) {
      alert('Failed to mark mail as spam.');
    }
  };

  const handleLabelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLabelDialog(true);
  };

  const handleLabelSuccess = () => {
    // Refresh labels after successful update
    const fetchMailLabels = async () => {
      try {
        const allLabels = await getLabels();
        const labelsForThisMail = allLabels.filter(label =>
          label.mailIds && label.mailIds.includes(mail.id)
        );
        setMailLabels(labelsForThisMail);
      } catch (error) {
        console.error('Failed to fetch labels for mail:', error);
      }
    };
    fetchMailLabels();
  };

  const star = (
    <img
      src={mail.starred ? fullStarIcon : starIcon}
      alt={mail.starred ? "Starred" : "Not starred"}
      className="star-icon"
      onClick={handleStarClick}
      style={{ cursor: "pointer", marginRight: 8, verticalAlign: "middle" }}
      draggable={false}
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleStarClick(e); }}
    />
  );

  const trash = (
    <img
      src={trashIcon}
      alt="Delete"
      className="trash-icon"
      onClick={handleTrashClick}
      style={{ cursor: "pointer", width: 16, height: 16 }}
      draggable={false}
    />
  );

  const spam = (
    <img
      src={spamIcon}
      alt="Spam"
      className="spam-icon"
      onClick={handleSpamClick}
      style={{ cursor: "pointer", width: 16, height: 16 }}
      draggable={false}
    />
  );

  const renderToLine = () => {
    if (!mail.to) return "";
    return (mail.to === username || mail.to === mail.from) ? "To: Me" : `To: ${mail.to}`;
  };

  const renderFromLine = () => {
    const user = (username || "").trim().toLowerCase();
    const from = (mail.from || "").trim().toLowerCase();

    if ((folder === 'inbox' || folder === 'starred') && from === user) {
      return "Me";
    }
    return mail.fromName || mail.from;
  };

  // Handle different folder types
  if (folder === 'trash') {
    const isDraft = mail.status === 'draft';

    if (isDraft) {
      return (
        <div
          className={`mail-item ${mail.read ? 'read' : 'unread'}`}
          onClick={onClick}
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <div className="mail-from">{renderFromLine()}</div>
          <div className="mail-content">
            <div className="mail-subject">{mail.subject}</div>
            <div className="mail-preview">{mail.bodyPreview}</div>
          </div>
          <div className="mail-time">{timeOrDate} {trash}</div>
        </div>
      );
    }

    return (
      <Link to={`/home/${folder}/${mail.id}`} className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        <div className="mail-from">{renderFromLine()}</div>
        <div className="mail-content">
          <div className="mail-subject">{mail.subject}</div>
          <div className="mail-preview">{mail.bodyPreview}</div>
        </div>
        <div className="mail-time" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {timeOrDate}
          {trash}
          {spam}
        </div>
      </Link>
    );
  }

  if (folder === 'drafts' || (folder === 'starred' && mail.status === 'draft')) {
    return (
      <div
        className={`mail-item ${mail.read ? 'read' : 'unread'}`}
        onClick={onClick}
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {star}
          {mail.status === 'draft' && (
            <span className="draft-label">Draft</span>
          )}
          <div className="mail-from">{renderToLine()}</div>
        </div>
        <div className="mail-content">
          <div className="mail-subject">{mail.subject}</div>
          <div className="mail-preview">{mail.bodyPreview}</div>
        </div>
        <div className="mail-time">{timeOrDate} {trash}</div>
      </div>
    );
  }

  if (folder === 'starred') {
    return (
      <Link to={`/home/${folder}/${mail.id}`} className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {star}
          <div className="mail-from">{renderFromLine()}</div>
        </div>
        <div className="mail-content">
          <div className="mail-subject">{mail.subject}</div>
          <div className="mail-preview">{mail.bodyPreview}</div>
        </div>
        <div className="mail-time" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {timeOrDate}
          {trash}
          {spam}
        </div>
      </Link>
    );
  }

  if (folder === 'spam') {
    return (
      <Link to={`/home/${folder}/${mail.id}`} className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {star}
          <div className="mail-from">{renderFromLine()}</div>
        </div>
        <div className="mail-content">
          <div className="mail-subject">{mail.subject}</div>
          <div className="mail-preview">{mail.bodyPreview}</div>
        </div>
        <div className="mail-time" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {timeOrDate}
          {trash}
        </div>
      </Link>
    );
  }

  if (folder === 'sent') {
    return (
      <Link to={`/home/${folder}/${mail.id}`} className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {star}
          <div className="mail-from">{renderFromLine()}</div>
        </div>
        <div className="mail-content">
          <div className="mail-subject">{mail.subject}</div>
          <div className="mail-preview">{mail.bodyPreview}</div>
        </div>
        <div className="mail-time" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {timeOrDate}
          {trash}
          {spam}
        </div>
      </Link>
    );
  }

  // Default inbox rendering with labels
  return (
    <>
      <div className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        <Link to={`/home/${folder}/${mail.id}`} className="mail-link">
          <div style={{ display: "flex", alignItems: "center" }}>
            {star}
            <div className="mail-from">{renderFromLine()}</div>
          </div>
          <div className="mail-content">
            <div className="mail-subject-row">
              <div className="mail-subject">{mail.subject}</div>
              {mailLabels.length > 0 && (
                <div className="mail-labels">
                  {mailLabels.map(label => (
                    <span
                      key={label.id}
                      className="mail-label-tag"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mail-preview">{mail.bodyPreview}</div>
          </div>
          <div className="mail-time" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {timeOrDate}
            {trash}
            {spam}
          </div>
        </Link>
        <div className="mail-actions">
          <button
            className="label-button"
            onClick={handleLabelClick}
            title="Add labels"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="-0.5 -0.5 16 16"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              height="16"
              width="16"
            >
              <path
                d="m6.862500000000001 12.62125 -4.56125 -4.56125c-0.23125 -0.23125 -0.3625 -0.54375 -0.36687499999999995 -0.8699999999999999L1.875 2.509375A0.62625 0.62625 0 0 1 2.509375 1.875l4.680625 0.059375a1.2531249999999998 1.2531249999999998 0 0 1 0.8699999999999999 0.36687499999999995l4.56125 4.56125c0.42125 0.420625 0.745 1.224375 0.265 1.704375l-4.31875 4.31875c-0.480625 0.480625 -1.284375 0.15625 -1.705 -0.26437499999999997M5.011875 4.72l-0.44187499999999996 -0.44187499999999996"
                strokeWidth="1"
              />
            </svg>
          </button>
        </div>
      </div>

      {showLabelDialog && (
        <LabelEmailDialog
          mail={mail}
          onClose={() => setShowLabelDialog(false)}
          onSuccess={handleLabelSuccess}
        />
      )}
    </>
  );
}

export default MailItem;
