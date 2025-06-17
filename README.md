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

- Users can upload profile pictures, manage their account details, and use features such as inbox, sent, drafts, trash, labels, starred, and mail search.
 
- The UI is responsive, built with React Router and Bootstrap. The backend communicates with a C++ blacklist socket server to validate outgoing mail links.

-  The entire system runs in Docker, with persistent user data stored via volume mounting.


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
| DELETE | `/api/mails/:id`        | Delete a mail                  | `204 No Content` | Auth required |
| GET | `/api/mails/search/:query`    | get the mails that are the resulte of searchin query   | `200 Ok` | Auth required | 
| GET    | `/api/labels`           | List all labels                | `200 OK`         | Auth required |
| POST   | `/api/labels`           | Create a new label             | `201 Created`    | Auth required, Requires `name` field , optinal: `color` ( if not specified default color is pink) |
| PATCH  | `/api/labels/:id`       | Update a label                 | `204 No Content`         | Auth required, Requires updated `name` |
| DELETE | `/api/labels/:id`       | Delete a label                 | `204 No Content` | Auth required |
| POST   | `/api/blacklist`        | Add URL to blacklist           | `201 Created`    | url required in body `{ "url": "http://..." }` |
| DELETE | `/api/blacklist/:id`    | Remove URL from blacklist      | `204 No Content` | id is the url to be deleted | 

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
  - View inbox, sent, drafts, trash, and starred mails.
  - Open full mail content with subject, body, and sender/recipient details.
  - Delete mails (moved to trash).
  - Edit and resend saved drafts.

- **Mail Composition**:
  - Compose and send new mails to registered users.
  - Save mails as drafts.
  - Links in mails are validated using a blacklist service.

- **Search Functionality**:
  - Search mails by keyword (in subject or body).
  - Instantly view search results from the inbox.

- **Labeling System**:
  - Create, update, and delete custom labels.
  - Assign labels to mails for better organization.
  - Default label color is pink; optional custom colors supported.

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
**Choose a strong JWT_SECRET (e.g., a long random string). Do not use shared or example secrets in production.

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
This will: **Build**:
- cpp-server (C++)

- web-server (Node.js backend)

- react-client (React via Nginx)

**Launch**:

C++ server with ./build/server 12345 8 1 2

Backend accessible at http://localhost:8080

React client accessible at http://localhost:3000

✅ Now, you can browse the React client at: http://localhost:3000/

### Step 4 – Access Containers (Optional):
To manually access a container (for debugging or inspection):
open a new terminal and write the following commands-

For entering the C++ Server Container:

```bash
docker exec -it server-container bash
```
after that you will be inside the server container
Then inside the container, run:

```bash
./build/server 12345 8 1 2
```
Explanation of the arguments:

 12345 =   Port to listen on.     
 8 =       Bloom filter size (bit array length).                     
 1 2 =      Seeds for hash functions (can be 1 or more integers)

And for Web Server (Backend) Container:
open an new teminal and write:

```bash
docker exec -it web-container bash
```
Once everything is running, You can now test API via curl.

### Step 5 -  Stop the System
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
![image](https://github.com/user-attachments/assets/a5b5ee70-dc1e-4935-af90-4722896dd8f7)

### **Sign up Screen**
![image](https://github.com/user-attachments/assets/4f6479b4-8674-494b-aae7-8941b588d057)

![image](https://github.com/user-attachments/assets/8fdfa29f-8407-4867-b527-e790881e0092)


### **Login Screen**
![image](https://github.com/user-attachments/assets/bf26a1f5-cd6e-479d-b2a2-c640003db200)

### **Home page Screen**

![image](https://github.com/user-attachments/assets/ce2b6ed8-d7b7-4b02-bc5f-fb559f6b5ed7)

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
- Valid email and phone number formats
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

