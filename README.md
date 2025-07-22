# **Project Overview: Fullstack Mail Web App**

## **Welcome to Doar! 📩**
Doar is a fullstack Gmail-inspired mail system built with **React**  and **Android** (Frontend), **Node.js** (Backend), and **C++** (URL filtering microservice via sockets).
The priject was built in 2025 for Bar-Ilan University’s **Advanced Programming Systems** course.

## 📖 Wiki Overview

For more information about this project please visit the [wiki](https://github.com/meshybb/Create-our-Gmail/Wiki).

| Page name                                      | Description                            |
| ---------------------------------------------- | -------------------------------------- |
| [Getting Started](Getting-Started)             | Docker setup & project structure, in this page you can find a detailed guide on how to run the project using docker |
| [System Architecture](System-Architecture)     | Services, networking & data flow       |
| [Backend API](Backend-API)                     | All REST endpoints accesible in the backend|
| [Frontend Features](Frontend-Features)         | Web & Android UX walkthrough with relveant scrennshots |
| [Data Persistence](Data-Persistence)           | MongoDB & URL-blacklist volumes        |
| [Security & Validation](Security-&-Validation) | JWT, input rules & best practices      |
| [Wiki Home](Home)                              | The Doar project overview page                  |


## Pick branch
- Go to main for Exercise 5
- Go to ex-4 for Exercise 4
- Go to ex-3 for Exercise 3
- Go to ex-2 for Exercise 2
- Go to ex-1 for Exercise 1

## Run the project using docker

### step one - before creating new containers delete all (running or stopped) containers (this step is optinal):

``` bash
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker volume prune -f
docker network prune -f
```

### Step 2 - Build and Run Everything with Docker Compose:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```
### step 3 - Browse:
- go to http://localhost:8080 or http://localhost:3000 to browes the web app 
- open /src/android_client folder in android stodiu and run on an emulator to run the android app


## Key Features 

- **User Registration & Login**:
  - Sign up with required details: first name, last name, username, password, birthdate, phone number, gender, and profile picture.
  - Password must meet security rules: minimum length, uppercase, lowercase, digit, and special character.
  - Login using username and password.
  - Profile picture and name are displayed on the main screen after login.
  - JWT is issued on login and used for all protected requests.

- **Inbox & Mail Management**:
  - View inbox, sent, drafts, trash, starred , and All mails.
  - Open full mail content with subject, body, and sender/recipient details.
  - Delete mails (moved to trash).
  - Delete mails from trash (deleted permanently).
  - Restore mails from trash.
  - Mark mail as spam (blacklist all urls in the mail).
  - Unmark mail as spam (delete all urls in this mail from the blacklist).
  - Edit and resend saved drafts.
  - Mark mail as starred
  - Unmark mail as starred

- **Mail Composition**:
  - Compose and send new mails to registered users by clicking the send button. 
  - Save mails as drafts by clicking the cancel button.
  - Discard mails by clicking the trash icon
  - Add attachment to mails by clicking the attachment icon.
  - Links in mails are validated using a blacklist service.

- **Search Functionality**:
  - Search mails by keyword (in subject or body).
  - Instantly view search results from the inbox.

- **Labeling System**:
  - Create, update, and delete custom labels.
  - Assign mails to labels for better organization (by clicking the label icon in the mail preview).
  - Default label color is grey; optional custom colors supported.

- **Dark/Light Mode**:
  - Switch between light and dark themes using a toggle button in the top navigation.
 
  
## Screenshots
to see screenshots of the web and android apps and a usage guide plesae visit the [Frontend Features](Frontend-Features) wiki page

## Technology Stack

### Frontend
- React: Building a dynamic UI with reusable components.
- React Router: Client-side routing for navigation between views.
- Bootstrap (via CDN): For responsive and styled components.
- JWT Authentication: Used to handle login, protect routes, and attach tokens to requests.
- File Upload (Multer): Profile pictures uploaded via form using multipart/form-data.

### Backend
- Node.js + Express: Handles all HTTP API routes for user auth, mail operations, and labels.
- Multer: Middleware for handling image uploads from forms.
- JWT: Issued upon login, used for secure access to protected endpoints.
- Custom Validation: Server-side password and input validation for secure registration.
- C++ Socket Server: External service used for validating outgoing mail URLs (blacklist).
  
##  🎓 Course Information

 Bar-Ilan University
 
 "Advanced Programming Systems" course
 
Assignment 5 — Fullstack Multi-Service Mail System using React, Node.js, and C++

Year: 2025

