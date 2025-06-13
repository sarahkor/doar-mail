import './MailItem.css';
import { Link } from 'react-router-dom';

function MailItem({ mail, folder }) {
  const mailDate = new Date(mail.timestamp);
  const now = new Date();
  const isToday = mailDate.toDateString() === now.toDateString();
  const timeOrDate = isToday ? mail.time : mail.date;

  return (
    <Link to={`/home/${folder}/${mail.id}`} className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
      <div className="mail-from">{mail.fromName || mail.from}</div>
      <div className="mail-content">
        <div className="mail-subject">{mail.subject}</div>
        <div className="mail-preview">{mail.bodyPreview}</div>
      </div>
      <div className="mail-time">{timeOrDate}</div>
    </Link>
  );
}

export default MailItem;
