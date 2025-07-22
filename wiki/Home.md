# Welcome to Doar! 
Doar is a fullstack Gmail-inspired mail system developed as part of the Advanced Programming Systems course at Bar-Ilan University (2025). It features a full user-facing mail application built with React (web frontend) android (android frontend),  Node.js backend web server, and a C++ blacklist URL filtering server, all connected via Docker.

This is Exercise 5 in the course, and follows Exercises 1 through 4:

- Exercise 1: [ex-1](https://github.com/meshybb/Create-our-Gmail/tree/ex-1) branch

- Exercise 2: [ex-2](https://github.com/meshybb/Create-our-Gmail/tree/ex-2) branch

- Exercise 3: [ex-3](https://github.com/meshybb/Create-our-Gmail/tree/ex-3) branch

- Exercise 4: [ex-4](https://github.com/meshybb/Create-our-Gmail/tree/ex-4) branch

- Exercise 5: [main](https://github.com/meshybb/Create-our-Gmail/) branch

## 🔍 Explore the Wiki

This wiki is organized into dedicated sections:

- [Getting Started](./Getting-Started.md) – How to run the project with Docker

- [System Architecture](./System-Architecture.md) – Service overview and communication

- [Backend API](./Backend-API.md) – Complete reference for API endpoints

- [Frontend Features](./Frontend-Features.md) – UI functionality for android and web and example photos

- [Data Persistence](./Data-Persistence.md) – How mail and blacklist data is stored

- [Security & Validation](./Security-&-Validation.md) – JWT usage and input validation

## 🔎 What is Doar?

Doar is a complete web-based email client that replicates the key features of Gmail:

- Login, registration, password validation

- Compose, send, and receive emails

- Inbox, Sent, Drafts, Trash, Spam, Starred, and All Mails folders

- Full mail view with attachments and rich search functionality

- Custom user labels with color tagging

- File attaching and profile image upload support

- Spam and blacklist handling via an external C++ service

It also includes an optional Android client that connects to the same backend.


## Key Features 

- **User Registration & Login**:
  - Sign up with required details: first name, last name, username, password, birthdate, phone number, gender, and profile picture.
  - Password must meet security rules: minimum length, uppercase, lowercase, digit, and special character.
  - Login using username and password.
  - Profile picture and name are displayed on the main screen after login (in profile menu and profile details_.
  - JWT is issued on login and used for all protected requests.

- **Inbox & Mail Management**:
  - View inbox, sent, drafts, trash, starred, spam and All mails.
  - Open full mail content with subject, body, attachments, and sender/recipient and time details.
  - Delete mails (moved to trash).
  - Delete mails from trash (deleted permanently).
  - Restore mails from trash.
  - Mark mail as spam (blacklist all urls in the mail).
  - Unmark mail as spam (delete all urls in this mail from the blacklist).
  - Edit and resend saved drafts.
  - Mark mail as starred
  - Unmark mail as starred
  - Label a mail

- **Mail Composition**:
  - Compose and send new mails to registered users by clicking the send button. 
  - Save mails as drafts by clicking the cancel button.
  - Discard mails by clicking the trash icon
  - Add attachment to mails by clicking the attachment icon.
  - Links in mails are validated using a blacklist service.
  - attach a file to a mail using the attachment icon

- **Search Functionality**:
  - Search mails by keyword (in subject or body).
  - Instantly view search results from the inbox.

- **Labeling System**:
  - Create, update, and delete custom labels.
  - Assign mails to labels for better organization (by clicking the label icon in the mail preview).
  - Default label color is grey; optional custom colors supported.

- **Dark/Light Mode**:
  - Switch between light and dark themes using a toggle button in the top navigation.

## Technology Stack

### Frontend
- React: Building a dynamic UI with reusable components.
- Android: building a dynamic UI for android users
- JWT Authentication: Used to handle login, protect routes, and attach tokens to requests.
- File Upload (Multer): Profile pictures uploaded via form using multipart/form-data.

### Backend
- Node.js + Express: Handles all HTTP API routes for user auth, mail operations, and labels.
- Multer: Middleware for handling image uploads from forms.
- JWT: Issued upon login, used for secure access to protected endpoints.
- Custom Validation: Server-side password and input validation for secure registration.
- C++ Socket Server: External service used for validating outgoing mail URLs (blacklist).

## Quick Highlights

- Built with React, Node.js, MongoDB, android, C++, and Docker

- Secure JWT-based authentication

- Realtime blacklist validation of mail links via C++ socket server

- Fully Dockerized for easy development & testing

- Clean and responsive UI inspired by Gmail

## 🎓 Course Information

University: Bar-Ilan University

Course: Advanced Programming Systems

Assignment: Exercise 5

Year: 2025

Continue with [Getting Started](./Getting-Started.md) →
