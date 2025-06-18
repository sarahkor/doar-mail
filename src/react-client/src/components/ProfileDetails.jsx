import React from 'react';
import './ProfileDetails.css';

/**
 * ProfileDetails component displays user profile information in a modal dialog.
 * 
 * Props:
 * - user: the user object containing profile details (firstName, lastName, picture, etc.)
 * - isOpen: boolean indicating whether the modal should be shown
 * - onClose: function to call when the modal is closed
 */
function ProfileDetails({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  const getProfileImageUrl = (user) => {
    if (user && user.picture && user.picture.startsWith('/uploads/')) {
      return `http://localhost:8080${user.picture}`;
    }
    if (user && user.firstName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || '')}+${encodeURIComponent(user.lastName || '')}&background=f69fd5&color=fff&size=120`;
    }
    return `https://ui-avatars.com/api/?name=User&background=f69fd5&color=fff&size=120`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGender = (gender) => {
    if (!gender) return 'Not provided';
    return gender.charAt(0).toUpperCase() + gender.slice(1).replace('_', ' ');
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Not provided';
    // Format Israeli phone number (0501234567 -> 050-123-4567)
    if (phone.length === 10 && phone.startsWith('05')) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="profile-details-overlay" onClick={onClose}>
      <div className="profile-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-details-header">
          <h2>Profile Details</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="profile-details-content">
          <div className="profile-details-avatar">
            <img
              src={getProfileImageUrl(user)}
              alt="Profile"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=User&background=f69fd5&color=fff&size=120`;
              }}
            />
          </div>

          <div className="profile-details-info">
            <div className="profile-detail-item">
              <label>First Name:</label>
              <span>{user.firstName || 'Not provided'}</span>
            </div>

            <div className="profile-detail-item">
              <label>Last Name:</label>
              <span>{user.lastName || 'Not provided'}</span>
            </div>

            <div className="profile-detail-item">
              <label>Mail:</label>
              <span>{user.username || user.email || 'Not provided'}</span>
            </div>

            <div className="profile-detail-item">
              <label>Phone:</label>
              <span>{formatPhone(user.phone)}</span>
            </div>

            <div className="profile-detail-item">
              <label>Date of Birth:</label>
              <span>{formatDate(user.birthday)}</span>
            </div>

            <div className="profile-detail-item">
              <label>Gender:</label>
              <span>{formatGender(user.gender)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails; 