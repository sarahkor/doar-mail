# 📡 Backend API Reference
This section provides a full reference of all available backend API endpoints in Doar, the expected request/response format, required authentication, and functional details such as mail actions, spam control, labeling, search, and more.

## 🔐 Authentication
Most endpoints require authentication via JWT (JSON Web Token).

Header Format:

``` bash
Authorization: Bearer <token>
```
Obtain the token by logging in via the /api/tokens endpoint.

## 📬 API Endpoints Overview

### 🧑‍💻 Users

| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| POST   | `/api/users`            | Register a new user            | `201 Created`    | Requires `username`, `fullName`, `password` ( that meets specific conditions) |
| POST   | `/api/tokens`           | Log in and get token           | `200 OK`         | Requires `username` and `password` | Used on Login page — server returns JWT
| GET    | `/api/users/:id`        | Get user information           | `200 OK`         | Auth required: Include JWT in `Authorization` header: `Bearer <token>` |


### 📥 Mails

| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| GET    | `/api/mails`            | Get 50 last mails                | `200 OK`         | Auth required |
| POST   | `/api/mails`            | Send new mail                  | `201 Created`    | Auth required, Requires `to`, `status : sent/draft` Optional: `subject`, `bodyPreview` , `attachments` |
| GET    | `/api/mails/:id`        | Get a specific mail            | `200 OK`         | Auth required |
| PATCH  | `/api/mails/:id`        | Update a mail (partial)        | `204 No content`         | Auth required |
| DELETE | `/api/mails/:id`        | move mail to trash                 | `204 No Content` | Auth required |
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

### 🔍 Search
| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| GET | `/api/mails/search/:query`    | get the mails that are the results of the searching query   | `200 Ok` | Auth required |

### 🏷️ Labels 
| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| GET    | `/api/labels`           | List all labels                | `200 OK`         | Auth required |
| POST   | `/api/labels`           | Create a new label             | `201 Created`    | Auth required, Requires `name` field , optional: `color` ( if not specified default color is grey) |
| PATCH  | `/api/labels/:id`       | Update a label                 | `204 No Content`         | Auth required, Requires updated `name` |
| DELETE | `/api/labels/:id`       | Delete a label                 | `204 No Content` | Auth required |

### 🚫 URL Blacklist
| Method | Endpoint                | Purpose                        | Expected Status | Notes |
|--------|-------------------------|--------------------------------|------------------|-------|
| POST   | `/api/blacklist`        | Add URL to blacklist           | `201 Created`    | url required in body `{ "url": "http://..." }` |
| DELETE | `/api/blacklist/:id`    | Remove URL from blacklist      | `204 No Content` | id is the url to be deleted | 

> All requests that require the user to be authenticated must include a valid JWT in the Token-ID header.

## 📄 Request Body Examples

### 🔐 Login

``` bash
POST /api/tokens
{
  "username": "john_doe",
  "password": "Secret123!"
}
```

### 📧 Send Mail

``` bash 
POST /api/mails
{
  "to": "jane_doe",
  "subject": "Meeting Reminder",
  "bodyPreview": "Hey, don't forget our meeting tomorrow!",
  "status": "sent"
}
```

### 🏷️ Create Label

``` bash
POST /api/labels
{
  "name": "Work",
  "color": "#ff0000"
}
```