import React, { useState, useEffect } from 'react';
import './LabelEmailDialog.css';
import { getLabels, addMailToLabel, removeMailFromLabel } from '../../api/labelsApi';
import labelIcon from '../../assets/icons/label2.svg';

/**
 * LabelEmailDialog displays a modal for assigning or removing labels from a given email.
 *
 * Props:
 * - mail: the mail object to be labeled (must contain at least `id` and `subject`)
 * - onClose: function to close the dialog
 * - onSuccess: optional callback triggered after a label is successfully updated
 */
function LabelEmailDialog({ mail, onClose, onSuccess }) {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [mailLabels, setMailLabels] = useState([]);

    useEffect(() => {
        fetchLabels();
    }, []);

    const fetchLabels = async () => {
        try {
            const fetchedLabels = await getLabels();
            setLabels(fetchedLabels);

            // Check which labels this mail is already in
            const mailLabelIds = [];
            for (const label of fetchedLabels) {
                if (label.mailIds && label.mailIds.some(id => id.toString() === mail._id)) {
                    mailLabelIds.push(label._id);
                }
            }
            setMailLabels(mailLabelIds);
        } catch (error) {
            console.error('Failed to fetch labels:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleLabelToggle = async (labelId) => {
        setUpdating(true);
        try {
            const isCurrentlyLabeled = mailLabels.includes(labelId);

            if (isCurrentlyLabeled) {
                await removeMailFromLabel(labelId, mail._id);
                setMailLabels(prev => prev.filter(id => id !== labelId));
            } else {
                await addMailToLabel(labelId, mail._id);
                setMailLabels(prev => [...prev, labelId]);
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to update label:', error);
            alert('Failed to update label: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="label-email-overlay" onClick={handleClose}>
            <div className="label-email-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="label-email-header">
                    <h3>Label "{mail.subject || 'No Subject'}"</h3>
                    <button className="close-button" onClick={handleClose}>×</button>
                </div>

                <div className="label-email-content">
                    {loading ? (
                        <div className="loading-message">Loading labels...</div>
                    ) : labels.length === 0 ? (
                        <div className="no-labels-message">
                            No labels available. Create labels first to organize your emails.
                        </div>
                    ) : (
                        <div className="labels-list">
                            {labels.map(label => (
                                <div
                                    key={label._id}
                                    className={`label-option ${mailLabels.includes(label._id) ? 'selected' : ''}`}
                                    onClick={() => handleLabelToggle(label._id)}
                                >
                                    <div className="label-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={mailLabels.includes(label._id)}
                                            onChange={() => handleLabelToggle(label._id)}
                                            disabled={updating}
                                        />
                                    </div>
                                    <div className="label-info">
                                        <div
                                            className="label-color-indicator"
                                            style={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: label.color,
                                                maskImage: `url(${labelIcon})`,
                                                WebkitMaskImage: `url(${labelIcon})`,
                                                maskSize: 'contain',
                                                WebkitMaskSize: 'contain',
                                                maskRepeat: 'no-repeat',
                                                WebkitMaskRepeat: 'no-repeat',
                                                maskPosition: 'center',
                                                WebkitMaskPosition: 'center'
                                            }}
                                        ></div>
                                        <span className="label-name">{label.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="label-email-footer">
                    <button className="done-button" onClick={handleClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LabelEmailDialog; 