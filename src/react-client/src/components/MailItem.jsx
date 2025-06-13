import React, { useState, useEffect } from 'react';
import './MailItem.css';
import { Link } from 'react-router-dom';
import LabelEmailDialog from './LabelEmailDialog';
import { getLabels } from '../api/labelsApi';

function MailItem({ mail }) {
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

  return (
    <>
      <div className={`mail-item ${mail.read ? 'read' : 'unread'}`}>
        <Link to={`/home/inbox/${mail.id}`} className="mail-link">
          <div className="mail-from">{mail.fromName || mail.from}</div>
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
          <div className="mail-time">{timeOrDate}</div>
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
