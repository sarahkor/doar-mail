# Create-Our-Mail: Multi-Service REST API with Node.js & C++ 
 -  This project is the third stage of the Create-Our-Mail system.
 -  It was developed for the "Advanced Programming Systems" course at Bar-Ilan University.
- It extends Assignment 2 by transforming the C++ blacklist server into a socket-connected service,
- integrated into a RESTful Node.js API that simulates Mail-system-like functionality.

---

## 🧠 Project Overview
- REST API server built with Node.js and Express
- Integrates with a C++ socket server for blacklist validation
- Supports user registration, login, and token-based authorization
- Implements Gmail-like functionality: inbox, labels, sending and managing mail
- Validates links in outgoing emails using the external C++ blacklist service



## 💻 Supported API Endpoints

| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| POST   | `/api/users`            | Register a new user            | `201 Created`    | Requires `username`, `fullName`, `password` (min 6 chars) |
| POST   | `/api/tokens`           | Log in and get token           | `200 OK`         | Requires `username` and `password` |
| GET    | `/api/users/:id`        | Get user information           | `200 OK`         | Use token header `id: <user-id>` |
| GET    | `/api/mails`            | Get inbox mails                | `200 OK`         | Auth required |
| POST   | `/api/mails`            | Send new mail                  | `201 Created`    | Requires `to`, `subject`, `body` |
| GET    | `/api/mails/:id`        | Get a specific mail            | `200 OK`         | Auth required |
| PATCH  | `/api/mails/:id`        | Update a mail (partial)        | `200 OK`         | Auth required |
| DELETE | `/api/mails/:id`        | Delete a mail                  | `204 No Content` | Auth required |
| GET    | `/api/labels`           | List all labels                | `200 OK`         | Auth required |
| POST   | `/api/labels`           | Create a new label             | `201 Created`    | Requires `name` field |
| PATCH  | `/api/labels/:id`       | Update a label                 | `200 OK`         | Requires updated `name` |
| DELETE | `/api/labels/:id`       | Delete a label                 | `204 No Content` | |
| POST   | `/api/blacklist`        | Add URL to blacklist           | `201 Created`    | `{ "url": "http://..." }` |
| DELETE | `/api/blacklist/:id`    | Remove URL from blacklist      | `204 No Content` | |

> All requests should use `Content-Type: application/json` and must include `id: <user-id>` header where required.

##  System Overview

- `server`: C++ server providing blacklist verification via TCP socket.
- `web_server`: Node.js server exposing RESTful endpoints (Gmail-like functionality).

## How to Run Using Docker

 📌 **note: All commands and scripts should be run from the root of the project (create-our-gmail), as paths and dependencies are relative to it.**

### Tools nedded: 
- ⁠ ⁠Docker Engine ≥ 20.10
-  ⁠please make sure your Docker desktop is running

###  Step 1 – Build and Launch Containers

Run the following command to build images and start both the C++ and Node.js servers:

```bash
docker-compose up --build
```

This will launch the Node.js REST API on `http://localhost:8080`

### Step 2 -  REST API – How to Use:

Once the system is up, you can send HTTP requests via `curl` :


### 👤 Register a new user

``` bash
  curl -i -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
        "username": "john@example.com",
        "fullName": "John Doe",
        "password": "secure123",
        "phone": "0501234567"
      }'
  ```
- `username`: must be a valid email
- `password`: must be at least 6 characters
- `phone`: optional (Israeli mobile format like `05XXXXXXXX`)

### 🔑 Log in (get user ID)

``` bash
 curl -i -X POST http://localhost:8080/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
        "username": "john@example.com",
        "password": "secure123"
      }'
  ```
> **Returns:**  
> ```json
> { "id": "<logged-in user ID>" }
> ```
- Use this `id` in the `id:` header for all authorized requests

** you have to resign in order to login

### Get User Info by ID
Fetch user details (name, email, etc.) using the ID returned at login:

``` bash
curl -i -X GET http://localhost:8080/api/users/<user-id>

  ```

Replace <user-id> with the ID returned from the login response.

### 📬 Get Inbox

``` bash
curl -i -X GET http://localhost:8080/api/mails \
  -H "id: <user-id>"

  ```

Retrieves the last 50 emails that you either received or sent.
Requirement: You must include your user-id in the header.

### Send Mail
Sends a new email to another registered user.

``` bash
curl -i -X POST http://localhost:8080/api/mails \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{
        "to": "other@example.com",
        "subject": "Hello",
        "body": "How are you?"
      }'


  ```

Required fields in JSON:

"to": recipient’s email

"subject": subject of the message

"body": the actual message content

** Important: If the email contains a blacklisted URL, the send will fail.

### Delete Mail
Deletes the email with the specified ID.
``` bash
curl -i -X DELETE http://localhost:8080/api/mails/<mail-id> \
  -H "id: <user-id>"
  ```
** Requirement: You must provide your user ID in the header.

### Update mail
Updates the subject or body of an existing mail
``` bash
curl -i -X PATCH http://localhost:8080/api/mails/<mail-id> \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{ "subject": "Updated", "body": "New content" }'

  ```

### Get mail by id
Fetches full details of a single email

``` bash
curl -i -X GET http://localhost:8080/api/mails/<mail-id> \
  -H "id: <user-id>"

  ```

### Get mail by query
Searches emails where <query> string appears in subject, body, or sender
``` bash
curl -i -X GET http://localhost:8080/api/mails/search/<query> \
  -H "id: <user-id>"

  ```


### 🏷️ Create Label
Creates a new custom label (like “Work” or “Personal”).
``` bash
curl -i -X POST http://localhost:8080/api/labels \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{ "name": "label_name" }
  ```
** Required: A JSON field with "name": "label-name"
Header: Must include user ID.

### 🏷️ GET /api/labels – List Labels
Returns all labels created by the logged-in user.
``` bash
curl -i -X GET http://localhost:8080/api/labels \
  -H "id: <user-id>
  ```
** Header: Requires user ID.

### Update label
Changes the name of an existing label
``` bash
curl -i -X PATCH http://localhost:8080/api/labels/<label-id> \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{ "name": "new name" }'

  ```

### Delete label
Deletes a label
``` bash
curl -i -X DELETE http://localhost:8080/api/labels/<label-id> \
  -H "id: <user-id>"

  ```

### 🚫 POST /api/blacklist – Add to Blacklist
Adds a URL (e.g., http://phishing.com) to the blacklist used to filter spam/malicious messages.
This blacklist is managed by the C++ server, which maintains a Bloom Filter to store and validate URLs efficiently.

``` bash
curl -i -X POST http://localhost:8080/api/blacklist \
  -H "Content-Type: application/json" \
  -d '{ "url": "http://phishing.com" }'
  ```

** Once a URL is blacklisted, any attempt to send an email containing it will fail with a 400 error.

### 🧹 Remove from Blacklist
Removes a URL from the blacklist maintained by the C++ server
``` bash
curl -i -X DELETE "http://localhost:8080/api/blacklist/http%3A%2F%2Fphishing.com"
  ```


## 📁 Data Persistence

- All saved data (e.g., mails, labels, blacklist) are stored in a Docker volume named `gmaildata`.
- This volume ensures that data remains even after containers are stopped or rebuilt.

---

## 🔁 Example Session

### creating server and client containers:

![image](https://github.com/user-attachments/assets/9c706ee0-3b27-4fe6-9adc-e0ff987181c5)


### :examples
![image](https://github.com/user-attachments/assets/d8c8aa96-b17f-4406-8e8c-a0e0902395da)


## Summary:
The system evolves from a simple C++ CLI into a multi-service Gmail-like REST API using Docker, Node.js, and the original C++ blacklist server.

Input/output was redirected from local console to TCP socket communication between the Node.js and C++ containers.

The Node.js server exposes RESTful endpoints (POST, GET, DELETE, etc.) while delegating blacklist operations to the C++ server via socket.

Instead of raw true/false responses, the system now returns HTTP-style status codes (201 Created, 404 Not Found, etc.) for clarity and integration with modern APIs.

The system is modular and extensible, currently supporting one client, but easily adaptable for concurrent connections.

This upgrade reflects good software engineering practices, including separation of concerns, reuse of existing logic, and open/closed design for future improvements.



###  🎓 Course Information

 Bar-Ilan University
 
 "Advanced Programming Systems" course
 
Assignment 3 — Multi-Service REST API with Node.js & C++ 

Year: 2025

