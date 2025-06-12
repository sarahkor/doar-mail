import React, { useState } from 'react';
import './ComposeDialog.css';

function ComposeDialog({ onClose }) {
  const [form, setForm] = useState({
    to: '',
    subject: '',
    bodyPreview: ''
  });
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

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
    formData.append('to', form.to);
    formData.append('subject', form.subject);
    formData.append('bodyPreview', form.bodyPreview);
    if (file) {
      formData.append('attachments', file);
    }

    try {
      const response = await fetch('/api/mails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send mail.');
      }

      onClose(); // Close on success or failure
    } catch (err) {
      alert('Network error: failed to send mail.');
    } finally {
      setIsSending(false);
    }
  };
  const handleCancel = async () => {
    const hasContent = form.to.trim() || form.subject.trim() || form.bodyPreview.trim() || file;

    // If there's no content, just close
    if (!hasContent) {
      return onClose();
    }

    // Save as draft
    const formData = new FormData();
    formData.append('to', form.to);
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
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
    } catch (err) {
      console.warn('Failed to save draft:', err);
    } finally {
      onClose(); // Close dialog regardless
    }
  };

  return (
    <div className="compose-overlay">
      <div className="compose-dialog">
        <h3 className="compose-title">New Mail</h3>
        <input
          type="email"
          name="to"
          placeholder="To"
          value={form.to}
          onChange={handleChange}
          className="compose-input"
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="compose-input"
        />
        <textarea
          name="bodyPreview"
          placeholder="Body"
          value={form.bodyPreview}
          onChange={handleChange}
          rows={6}
          className="compose-textarea"
        />

        <div className="compose-actions">
          <div className="action-buttons">
            <button onClick={handleSubmit} className="action-button send-button" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send'}
            </button>
            <button onClick={handleCancel} className=" action-button cancel-button">Cancel</button>
          </div>

          <div className="attachment-section">
            <label htmlFor="file-input" className="attachment-icon" title="Attach a file">📎</label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            {file && <span className="attached-filename">{file.name}</span>}
            <span
              className="discard-icon"
              title="Discard and close"
              onClick={onClose}
            >
              🗑️
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComposeDialog;
