import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDetails from './ProfileDetails';
import './ProfileMenu.css';

/**
 * ProfileMenu component displays a dropdown user profile menu.
 * 
 * Props:
 * - user: the current user object (contains username, firstName, picture, etc.)
 * - isLoading: boolean indicating if user data is still being loaded
 */
function ProfileMenu({ user, isLoading, onClose }) {
    const navigate = useNavigate();
    const [showProfileDetails, setShowProfileDetails] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const handleShowProfileDetails = () => {
        setShowProfileDetails(true);
    };

    const handleCloseProfileDetails = () => {
        setShowProfileDetails(false);
    };

    const getProfileImageUrl = (user) => {
        if (user && user.picture && user.picture.startsWith('/uploads/')) {
            return `http://localhost:8080${user.picture}`;
        }
        if (user && user.firstName) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || '')}+${encodeURIComponent(user.lastName || '')}&background=f69fd5&color=fff&size=80`;
        }
        return `https://ui-avatars.com/api/?name=User&background=f69fd5&color=fff&size=80`;
    };

    // Show loading state if still loading or no user data
    if (isLoading || !user) {
        return (
            <div className="profile-menu">
                <div className="profile-menu-content">
                    <div className="profile-picture">
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#f69fd5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '24px'
                        }}>
                            ?
                        </div>
                    </div>
                    <div className="profile-email">Loading...</div>
                    <div className="profile-greeting">Hi, User</div>
                    <button className="profile-details-button" onClick={handleShowProfileDetails} disabled>
                        <svg width="20" height="20" viewBox="0 0 24 24" className="profile-details-icon">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                        </svg>
                        See Profile Details
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        <svg width="20" height="20" viewBox="0 0 24 24" className="logout-icon">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                        </svg>
                        Log out
                    </button>
                </div>
            </div>
        );
    }

    // Get actual user data with proper fallback handling
    const displayEmail = user.username || user.email || 'user@doar.com';
    const displayFirstName = user.firstName || 'User';


    return (
        <div className="profile-menu">
            <div className="profile-menu-content">
                <div className="profile-picture">
                    <img
                        src={getProfileImageUrl(user)}
                        alt="Profile"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=User&background=f69fd5&color=fff&size=80`;
                        }}
                    />
                </div>
                <div className="profile-email">{displayEmail}</div>
                <div className="profile-greeting">
                    Hi, {displayFirstName}
                </div>
                <button className="profile-details-button" onClick={handleShowProfileDetails}>
                    <svg width="20" height="20" viewBox="0 0 24 24" className="profile-details-icon">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                    </svg>
                    See Profile Details
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    <svg width="20" height="20" viewBox="0 0 24 24" className="logout-icon">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                    </svg>
                    Log out
                </button>
            </div>
            <ProfileDetails
                user={user}
                isOpen={showProfileDetails}
                onClose={handleCloseProfileDetails}
            />
        </div>
    );
}

export default ProfileMenu; 