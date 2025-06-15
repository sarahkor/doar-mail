import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileMenu.css';

function ProfileMenu({ user, isLoading, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
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

    // Debug logging to see what user data we're getting
    console.log('ProfileMenu received user data:', user);
    console.log('ProfileMenu isLoading:', isLoading);

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
                            backgroundColor: '#1a73e8',
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

    console.log('Display email:', displayEmail);
    console.log('Display name:', displayFirstName);

    return (
        <div className="profile-menu">
            <div className="profile-menu-content">
                <div className="profile-picture">
                    <img
                        src={getProfileImageUrl(user)}
                        alt="Profile"
                        onError={(e) => {
                            console.log('Profile menu image failed to load, using fallback');
                            e.target.src = `https://ui-avatars.com/api/?name=User&background=1a73e8&color=fff&size=80`;
                        }}
                    />
                </div>
                <div className="profile-email">{displayEmail}</div>
                <div className="profile-greeting">
                    Hi, {displayFirstName}
                </div>
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

export default ProfileMenu; 