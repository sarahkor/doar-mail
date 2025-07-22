# **Project Overview: Fullstack Mail Web App**

## **Welcome to Doar! 📩**
Doar is a fullstack Gmail-inspired mail system built with **React**  and **Android** (Frontend), **Node.js** (Backend), and **C++** (URL filtering microservice via sockets).
The project was built in 2025 for Bar-Ilan University’s **Advanced Programming Systems** course.

## 📖 Wiki Overview

For more information about this project please visit the [wiki](https://github.com/meshybb/Create-our-Gmail/wiki/)*.

| Page name                                      | Description                            |
| ---------------------------------------------- | -------------------------------------- |
| [Getting Started](https://github.com/meshybb/Create-our-Gmail/wiki/Getting-Started)             | Docker setup & project structure, in this page you can find a detailed guide on how to run the project using docker |
| [System Architecture](https://github.com/meshybb/Create-our-Gmail/wiki/System-Architecture)     | Services, networking & data flow       |
| [Backend API](https://github.com/meshybb/Create-our-Gmail/wiki/Backend-API)                     | All REST endpoints accesible in the backend|
| [Frontend Features](https://github.com/meshybb/Create-our-Gmail/wiki/Frontend-Features)         | Web & Android UX walkthrough with relveant scrennshots |
| [Data Persistence](https://github.com/meshybb/Create-our-Gmail/wiki/Data-Persistence)           | MongoDB & URL-blacklist volumes        |
| [Security & Validation](https://github.com/meshybb/Create-our-Gmail/wiki/Security-&-Validation) | JWT, input rules & best practices      |
| [Wiki Home](https://github.com/meshybb/Create-our-Gmail/wiki/Home)                              | The Doar project overview page                  |

*if you can not see the wiki, there is a wiki folder under the project root ([create-our-gmail/wiki](./wiki/Home.md)) that contains the same wiki pages.

## Pick branch
- Go to [main](https://github.com/meshybb/Create-our-Gmail) for Exercise 5
- Go to [ex-4](https://github.com/meshybb/Create-our-Gmail/tree/ex-4) for Exercise 4
- Go to [ex-3](https://github.com/meshybb/Create-our-Gmail/tree/ex-3) for Exercise 3
- Go to [ex-2](https://github.com/meshybb/Create-our-Gmail/tree/ex-2) for Exercise 2
- Go to [ex-1](https://github.com/meshybb/Create-our-Gmail/tree/ex-1) for Exercise 1

## Run the project using docker

For a more inforamtive set up please go to [Getting Started](https://github.com/meshybb/Create-our-Gmail/wiki/Getting-Started)

### step 1 - before creating new containers delete all (running or stopped) containers (this step is optinal):

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
- To browes the web app go to http://localhost:8080 or http://localhost:3000 
- To browes the android app open /src/android_client folder in android studio and run on an emulator

## Screenshots
please visit [Frontend Features](https://github.com/meshybb/Create-our-Gmail/wiki/Frontend-Features) in wiki (or Frontend-Features.md under create-our-gmail/wiki) to see full usage guide and screenshots of the web and android app.

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
  
##  🎓 Course Information

 Bar-Ilan University
 
 "Advanced Programming Systems" course

 Year: 2025

