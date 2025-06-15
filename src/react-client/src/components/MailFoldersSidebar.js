import React from 'react';
import { NavLink } from 'react-router-dom';
import './MailFoldersSidebar.css';
import inboxIcon from '../assets/icons/inbox.svg';
import sentIcon from '../assets/icons/sent.svg';
import draftsIcon from '../assets/icons/draft.svg';
import spamIcon from '../assets/icons/spam.svg';
import trashIcon from '../assets/icons/trash.svg';
import starredIcon from '../assets/icons/star.svg';
import allMailIcon from '../assets/icons/allmail.svg';

const FOLDERS = [
  { label: "Inbox", path: "/home/inbox", icon: inboxIcon },
  { label: "Sent", path: "/home/sent", icon: sentIcon },
  { label: "Drafts", path: "/home/drafts", icon: draftsIcon },
  { label: "Spam", path: "/home/spam", icon: spamIcon },
  { label: "Trash", path: "/home/trash", icon: trashIcon },
  { label: "Starred", path: "/home/starred", icon: starredIcon },
  { label: "All Mail", path: "/home/all", icon: allMailIcon },
];

export default function MailFoldersSidebar({ selected }) {
  return (
    <nav className="mail-folders-sidebar">
      <ul>
        {FOLDERS.map(folder => (
          <li key={folder.path}>
            <NavLink
              to={folder.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-folder-link active' : 'sidebar-folder-link'
              }
              end
            >
              {folder.icon && (
                <img
                  src={folder.icon}
                  alt={`${folder.label} icon`}
                  className="sidebar-folder-icon"
                  style={{ width: 20, height: 20, marginRight: 12, verticalAlign: 'middle' }}
                />
              )}
              {folder.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
