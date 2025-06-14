import './MailItem.css';
import { Link } from 'react-router-dom';
import starIcon from '../assets/icons/star.svg';
import fullStarIcon from '../assets/icons/fullStar.svg';
import trashIcon from '../assets/icons/trash.svg';
import spamIcon from '../assets/icons/spam.svg';

function MailItem({ mail, folder, onClick, onStarToggle, onTrash, onRestore }) {
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
  )

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

    // not a draft, render as link
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

export default MailItem;
