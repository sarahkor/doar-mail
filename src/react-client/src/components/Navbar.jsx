import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import ProfileMenu from './ProfileMenu';
import './Navbar.css';
import doarLogo from '../assets/images/doar-logo.svg';

function Navbar({ onComposeClick, onSearch, searchResults, isSearching, onClearSearch }) {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const savedTheme = sessionStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setUserLoading(false);
                    return;
                }
                const response = await fetch('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const toggleDarkMode = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            sessionStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            sessionStorage.setItem('theme', 'light');
        }
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleLogoClick = () => {
        // Clear any active search when logo is clicked
        if (onClearSearch) {
            onClearSearch();
        }
        navigate('/home/inbox');
    };

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileMenu && !event.target.closest('.profile-menu') && !event.target.closest('.avatar-circle')) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showProfileMenu]);

    const getProfileImageUrl = (user) => {
        if (user && user.picture && user.picture.startsWith('/uploads/')) {
            return `http://localhost:8080${user.picture}`;
        }
        if (user && user.firstName) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || '')}+${encodeURIComponent(user.lastName || '')}&background=f69fd5&color=fff&size=32`;
        }
        return `https://ui-avatars.com/api/?name=User&background=1a73e8&color=fff&size=32`;
    };

    return (
        <div className="navbar">
            <div className="navbar-left">
                <div className="gmail-logo" onClick={handleLogoClick}>
                    <img src={doarLogo} alt="Doar" height="160" className="logo" />
                </div>
            </div>
            <div className="navbar-center">
                <SearchBar
                    onSearch={onSearch}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onClearSearch={onClearSearch}
                />
            </div>
            <div className="navbar-right">
                <button
                    className="navbar-icon-button dark-mode-toggle"
                    onClick={toggleDarkMode}
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDarkMode ? (
                        <svg width="24" height="24" viewBox="0 0 24 24">Add commentMore actions
                            <path d="M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" fill="currentColor" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24">Add commentMore actions
                            <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z" fill="currentColor" />
                        </svg>
                    )}
                </button>
                <div className="user-avatar">
                    <div className="avatar-circle" onClick={toggleProfileMenu}>
                        {userLoading ? (
                            <span>?</span>
                        ) : (
                            <img
                                src={getProfileImageUrl(user)}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=User&background=1a73e8&color=fff&size=32`;
                                }}
                            />
                        )}
                    </div>
                </div>
                {showProfileMenu && (
                    <ProfileMenu
                        user={user}
                        isLoading={userLoading}
                        onClose={() => setShowProfileMenu(false)}
                    />
                )}
            </div>
        </div >
    );
}

export default Navbar;
