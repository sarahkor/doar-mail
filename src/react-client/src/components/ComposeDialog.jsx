import React, { useState } from 'react';
import './ComposeDialog.css';
import trashIcon from '../assets/icons/trash.svg';
import attachmentIcon from '../assets/icons/attachment.svg';

function ComposeDialog({ onClose, refreshInbox, to = '' }) {
  const [form, setForm] = useState({
    to: to || '',
    subject: '',
    bodyPreview: ''
  });
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState({ to: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsSending(true);
    const formData = new FormData();
    formData.append('to', form.to.trim());
    formData.append('subject', form.subject);
    formData.append('bodyPreview', form.bodyPreview);
    formData.append('status', 'sent');
    if (file) {
      formData.append('attachments', file);
    }

    try {
      const response = await fetch('/api/mails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error.toLowerCase();

        if (response.status === 400) {
          if (message.includes("missing required") && message.includes("to")) {
            setError({ to: "Please enter a recipient email address." });
          } else if (message.includes("recipient does not exist")) {
            setError({ to: "The recipient was not found. Please check the address." });
          } else if (message.includes("@doar.com")) {
            setError({ to: "You can only send mail to Doar users (e.g. user@doar.com)." });
          } else {
            alert(data.error || "Failed to send mail.");
          }
        } else {
          alert(data.error || "Failed to send mail.");
        }
        return;
      }

      refreshInbox?.();  // Refresh inbox if provided
      onClose();         // Close dialog after successful send

    } catch (err) {
      alert('Network error: failed to send mail.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = async () => {
    const hasContent = form.to.trim() || form.subject.trim() || form.bodyPreview.trim() || file;
    if (!hasContent) return onClose();

    const formData = new FormData();
    formData.append('to', form.to.trim());
    formData.append('subject', form.subject);
    formData.append('bodyPreview', form.bodyPreview);
    formData.append('status', 'draft');
    if (file) {
      formData.append('attachments', file);
    }

    try {
      await fetch('/api/mails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });
    } catch (err) {
      console.warn('Failed to save draft:', err);
    } finally {
      onClose();
    }
  };

  return (
    <div className="compose-overlay">
      <div className="compose-dialog">
        <h3 className="compose-title">New Mail</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          encType="multipart/form-data"
        >
          <label htmlFor="to" className="visually-hidden">To</label>
          <input
            id="to"
            type="email"
            name="to"
            placeholder="To"
            value={form.to}
            onChange={(e) => {
              if (!to) {
                handleChange(e);
                setError({ to: "" });
              }
            }}
            className={`compose-input ${error.to ? "is-invalid" : ""}`}
            aria-invalid={!!error.to}
            aria-describedby="to-error"
            readOnly={!!to}
          />
          {error.to && <div id="to-error" className="input-error">{error.to}</div>}

          <label htmlFor="subject" className="visually-hidden">Subject</label>
          <input
            id="subject"
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            className="compose-input"
          />

          <label htmlFor="bodyPreview" className="visually-hidden">Body</label>
          <textarea
            id="bodyPreview"
            name="bodyPreview"
            placeholder="Body"
            value={form.bodyPreview}
            onChange={handleChange}
            rows={6}
            className="compose-textarea"
          />

          <div className="compose-actions">
            <div className="action-buttons">
              <button type="submit" className="action-button send-button" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={handleCancel} className="action-button cancel-button">
                Cancel
              </button>
            </div>

            <div className="attachment-section">
              {file && (
                <a
                  className="attached-filename"
                  href={URL.createObjectURL(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.name}
                </a>
              )}
              <label htmlFor="file-input" title="Attach a file">
                <img src={attachmentIcon} alt="Attach" className="attachment-icon" />
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <img
                src={trashIcon}
                alt="Discard"
                className="discard-icon"
                title="Discard and close"
                onClick={onClose}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeDialog;
