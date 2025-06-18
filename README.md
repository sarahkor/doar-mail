# **Project Overview: Fullstack Mail Web App**
## **Welcome to Doar! 📩**
Doar is a fullstack Gmail-inspired mail system built with **React** (Frontend), **Node.js** (Backend), and **C++** (URL filtering microservice via sockets).  
This is **Exercise 4** in the Advanced Programming Systems course at Bar-Ilan University.

### **Table of Contents**

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [How to Run Using Docker](#how-to-run-using-docker)
5. [Screenshots](#screenshots)
6. [Important Notes](#important-notes)


---

## Project Overview
- This is a fullstack Gmail-like web app built with a React frontend and a Node.js backend. It supports user registration, login, and JWT-based authentication to securely access APIs.   

- Users can upload profile picture, see their account details, send an email and use features such as inbox, sent, drafts, trash, labels, starred, and mail search.
 
- The UI is responsive, built with React Router and Bootstrap. The backend communicates with a C++ blacklist socket server to validate outgoing mail links.

-  The entire system runs in Docker, with persistent url data stored via volume mounting.


## 💻 Supported API Endpoints

| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| POST   | `/api/users`            | Register a new user            | `201 Created`    | Requires `username`, `fullName`, `password` ( that meets specific conditions) |
| POST   | `/api/tokens`           | Log in and get token           | `200 OK`         | Requires `username` and `password` | Used on Login page — server returns JWT
| GET    | `/api/users/:id`        | Get user information           | `200 OK`         | Auth required: Include JWT in `Authorization` header: `Bearer <token>` |
| GET    | `/api/mails`            | Get inbox mails                | `200 OK`         | Auth required |
| POST   | `/api/mails`            | Send new mail                  | `201 Created`    | Auth required, Requires `to`, `status : sent/draft` Optional: `subject`, `bodyPreview` |
| GET    | `/api/mails/:id`        | Get a specific mail            | `200 OK`         | Auth required |
| PATCH  | `/api/mails/:id`        | Update a mail (partial)        | `204 No content`         | Auth required |
| DELETE | `/api/mails/:id`        | move mail to trash                 | `204 No Content` | Auth required |
| GET | `/api/mails/search/:query`    | get the mails that are the resulte of searchin query   | `200 Ok` | Auth required | 
| GET    | `/api/labels`           | List all labels                | `200 OK`         | Auth required |
| POST   | `/api/labels`           | Create a new label             | `201 Created`    | Auth required, Requires `name` field , optinal: `color` ( if not specified default color is pink) |
| PATCH  | `/api/labels/:id`       | Update a label                 | `204 No Content`         | Auth required, Requires updated `name` |
| DELETE | `/api/labels/:id`       | Delete a label                 | `204 No Content` | Auth required |
| POST   | `/api/blacklist`        | Add URL to blacklist           | `201 Created`    | url required in body `{ "url": "http://..." }` |
| DELETE | `/api/blacklist/:id`    | Remove URL from blacklist      | `204 No Content` | id is the url to be deleted | 
| GET | `/api/drafts`    | get user draft mails     | `200 Ok` | Auth required| 
| GET | `/api/inbox`    | get user received mails     | `200 Ok` | Auth required| 
| GET | `/api/sent`    | get user sent mails     | `200 Ok` | Auth required| 
| GET | `/api/spam`    | get user spammed mails     | `200 Ok` | Auth required| 
| POST | `/api/spam/:id`    | mark mail as spam    | `200 Ok` | Auth required| 
| POST | `/api/spam/:id/unspam`    | unmark mail as spam    | `200 Ok` | Auth required| 
| GET | `/api/trash`    | get user deleted mails     | `200 Ok` | Auth required| 
| DELETE | `/api/trash/:id`    | delete a mail permanently  | `204 No content` | Auth required| 
| DELETE | `/api/trash/empty`    | delete all mails in trash permanently | `204 No content` | Auth required| 
| POST | `/api/trash/:id/restore`    | reastore a mail from the trash  | `200 Ok` | Auth required| 
| GET | `/api/starred`    | get user starred mails     | `200 Ok` | Auth required| 
| GET | `/api/starred/:id`    | check if mail is starred     | `200 Ok` | Auth required| 
| POST | `/api/starred/:id`    | star a mail if not starred and unstar a mail if starred     | `200 Ok` | Auth required|
| GET | `/api/mails/all`    | get all sent, recived, and draft mails    | `200 Ok` | Auth required|

> All requests that require the user to be authenticated must include a valid JWT in the Token-ID header.

## Key Features 
### User Features

- **User Registration & Login**:
  - Sign up with required details: first name, last name, username, password, birthdate, gender, and profile picture.
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

## How to Run Using Docker

 📌 **note: All commands and scripts should be run from the root of the project (create-our-gmail), as paths and dependencies are relative to it.**

### Tools nedded: 
- ⁠ ⁠Docker Engine ≥ 20.10
-  ⁠please make sure your Docker desktop is running

### Step 1 – Create the .env File:
In the project root, create a .env file with:

``` bash
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
```
**Choose a strong JWT_SECRET (e.g., a long random string).

### Step 2 - Clean Old Containers (optional but recommended):

**optinal**: before creating new containers delete all (running or stopped) containers:

``` bash
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker volume prune -f
docker network prune -f
```

### Step 3 - Build and Run Everything with Docker Compose:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```
This will:

**Build**:
- cpp-server (C++)

- web-server (Node.js backend)

- react-client (React via Nginx)

**Launch**:

C++ server with ./build/server 12345 8 1 2

### Step 4 - Accessing the Application:

Once the Docker containers are running:

Backend (Node.js Server) is available at http://localhost:8080

Frontend (React Client) is available at http://localhost:3000

✅ You can browse the app from either port — both serve the same client interface.
Port 3000 runs the React development server, while port 8080 runs the Node.js backend server with the same interface.

### Step 5 – Access Containers (Optional):
To manually access a container (for debugging or inspection):
open a new terminal and write the following commands-

**For entering the C++ Server Container:**

```bash
docker exec -it server-container bash
```
This will give you an interactive shell inside the container.

Once inside, you can navigate to the data directory in order to see balcklisted urls:

```bash
cd data
```
Inside the data folder, you'll find the file urlsdata.txt, which contains the list of blacklisted URLs. To view its contents, run:

```bash
cat urlsdata.txt
```

**For entering the Web Server (Backend) Container:**

open an new teminal and write:

```bash
docker exec -it web-container bash
```
Once everything is running, You can now test API via curl.

### Step 6 -  Stop the System
```bash
docker compose down
```
To delete all volumes and reset data:
```bash
docker compose down -v
```


## 📁 Data Persistence

- All blacklisted urls are stored in a Docker volume named `urldata`.
- This volume ensures that data remains even after containers are stopped or rebuilt.

---

## Screenshots
Here are some screenshots of the application in action:
### **Home Screen (Before Login)**
**login page:**

<img width="1440" alt="Screenshot 2025-06-18 at 17 46 18" src="https://github.com/user-attachments/assets/826eb609-64dd-411b-828d-56ff5c396067" />

**register pages:**

<img width="1440" alt="Screenshot 2025-06-18 at 17 46 59" src="https://github.com/user-attachments/assets/569b603f-77f2-492f-b19f-fe49106b552a" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 47 18" src="https://github.com/user-attachments/assets/752fd9bf-c439-477d-a12f-1af46e4761a7" />

**loging in** 

<img width="1440" alt="Screenshot 2025-06-18 at 17 47 40" src="https://github.com/user-attachments/assets/286d69a7-6520-4cec-ab3d-418f699302d2" />

**home page:**

<img width="1440" alt="Screenshot 2025-06-18 at 17 49 52" src="https://github.com/user-attachments/assets/f75960ae-b74d-46ab-82d6-5ffb8e29433c" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 50 01" src="https://github.com/user-attachments/assets/44ed9901-0b4c-4bc5-91c9-8c96163cd8d1" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 50 20" src="https://github.com/user-attachments/assets/39215994-f3fe-42d5-8c6c-76c7b769788c" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 50 47" src="https://github.com/user-attachments/assets/0784fe64-cc01-4685-9823-67e90ae90b3b" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 50 53" src="https://github.com/user-attachments/assets/6b69b34b-dfb6-4102-b985-27cc2b087caf" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 51 09" src="https://github.com/user-attachments/assets/2308014d-bcc0-4813-a04a-7e6a37e29014" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 51 44" src="https://github.com/user-attachments/assets/8063c32b-121d-4112-91c9-11fc58e22981" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 51 51" src="https://github.com/user-attachments/assets/d29b4e92-08cb-4edc-9fde-2c27b8e50791" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 51 57" src="https://github.com/user-attachments/assets/fe94a652-14fa-47e9-b4a6-3d1f56ab4494" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 52 05" src="https://github.com/user-attachments/assets/081f352c-bf12-4c09-acfd-6c2ed347b79d" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 52 24" src="https://github.com/user-attachments/assets/2388e556-c169-4037-9d52-975cac25485b" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 53 05" src="https://github.com/user-attachments/assets/4a098631-7f04-4988-bb24-0f7509227c19" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 53 12" src="https://github.com/user-attachments/assets/7fc9a790-b1ee-45ac-a164-3b2946f9cc60" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 53 30" src="https://github.com/user-attachments/assets/25d2bfdb-2c31-41d6-81e7-41699c8e658b" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 53 37" src="https://github.com/user-attachments/assets/3f134f63-0bd8-4c97-9203-c6fab8c9f6e5" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 53 43" src="https://github.com/user-attachments/assets/4802478c-0cc2-4ee4-8c6b-267ace6382bf" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 25" src="https://github.com/user-attachments/assets/530f7537-6276-45d2-90c5-8b8dd5342b36" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 32" src="https://github.com/user-attachments/assets/8b8afe46-2a87-4702-b0d1-df8969b6a9f8" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 39" src="https://github.com/user-attachments/assets/7b0d275b-8a11-4735-b2ac-5a75749cdf85" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 46" src="https://github.com/user-attachments/assets/73434f2f-7660-430a-bd3b-c3bb4d01481b" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 54 52" src="https://github.com/user-attachments/assets/53f1aff4-9d91-4fb8-90a1-991c992017cb" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 55 38" src="https://github.com/user-attachments/assets/cef2b282-395a-4c2a-8c15-f870cf3847b7" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 55 45" src="https://github.com/user-attachments/assets/efd6e023-6953-4db8-b560-02d1f8ca43b9" />
<img width="1440" alt="Screenshot 2025-06-18 at 17 59 55" src="https://github.com/user-attachments/assets/b94f7118-4245-4cb6-afd0-501b9ee4c3ff" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 00 35" src="https://github.com/user-attachments/assets/f1fda402-7ade-41ef-8f61-c62ee3211f90" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 00 44" src="https://github.com/user-attachments/assets/ef8a9c25-0981-464f-9c4a-05107fb41b39" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 00 57" src="https://github.com/user-attachments/assets/2d9ebc31-939c-4945-a8b6-3876c07096ee" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 01 38" src="https://github.com/user-attachments/assets/9c4e1fd2-4c48-47b3-ad6c-ebc0e3c6ea06" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 01 48" src="https://github.com/user-attachments/assets/12ca6926-75ee-4cbc-b66c-60f164b6fc75" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 01 58" src="https://github.com/user-attachments/assets/1775a1c6-50ea-432b-b386-cfbb767dfde3" />
<img width="1440" alt="Screenshot 2025-06-18 at 18 03 00" src="https://github.com/user-attachments/assets/c559576d-e488-4411-9787-379b1bcfa973" />

**dark mode:**
<img width="1440" alt="Screenshot 2025-06-18 at 18 03 33" src="https://github.com/user-attachments/assets/5122d5b4-5cbe-42d6-89c6-07325e9d11e7" />

**search:**
<img width="1440" alt="Screenshot 2025-06-18 at 18 03 46" src="https://github.com/user-attachments/assets/aaa0ba28-8468-48b9-99e4-85b1eef6a42e" />

### Important Notes

### 🔐 JWT Authentication Flow
1. **Login**: After successful login, the server returns a JWT token.
2. **Token Storage**: The token is securely stored in the browser's local storage.
3. **Authenticated Requests**: For every protected request, the token is included in the `Authorization` header

### Input Validation
- All user input is validated both on the frontend and backend.
- Includes checks for:
- Name and username length
- Password strength (uppercase, lowercase, digit, special character, minimum 8 characters)
- Valid email and phone number formats.
- Valid reciver name in a new mail.
- Valid label name.
- Users receive real-time feedback for invalid inputs.

### Security
- **Passwords** are securely hashed using industry-standard algorithms before being stored.
- **JWT tokens** are signed and used to protect all API endpoints that require authentication.
- Backend verifies tokens and ensures users cannot access data they don’t own.
- Sensitive data is never exposed in responses.


###  🎓 Course Information

 Bar-Ilan University
 
 "Advanced Programming Systems" course
 
Assignment 4 — Fullstack Multi-Service Mail System using React, Node.js, and C++

Year: 2025

