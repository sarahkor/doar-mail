# Create-Our-Mail: Multi-Service REST API with Node.js & C++ 
 -  This project is the third stage of the Create-Our-Mail system.
 -  It was developed for the "Advanced Programming Systems" course at Bar-Ilan University.
- It extends Assignment 2 by transforming the C++ blacklist server into a socket-connected service,
- integrated into a RESTful Node.js API that simulates Mail-system-like functionality.
- the code of exercise 3 is in branch ex-3
- the code of exercise 2 is in branch ex-2
- the code of exercise 1 is in branch ex-1

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
| GET    | `/api/users/:id`        | Get user information           | `200 OK`         | Auth required: Use token header `id: <looged -in user-id>` |
| GET    | `/api/mails`            | Get inbox mails                | `200 OK`         | Auth required |
| POST   | `/api/mails`            | Send new mail                  | `201 Created`    | Auth required, Requires `to`, `status : sent/draft` Optional: `subject`, `bodyPreview` |
| GET    | `/api/mails/:id`        | Get a specific mail            | `200 OK`         | Auth required |
| PATCH  | `/api/mails/:id`        | Update a mail (partial)        | `204 No content`         | Auth required |
| DELETE | `/api/mails/:id`        | Delete a mail                  | `204 No Content` | Auth required |
| GET | `/api/mails/search/:query`    | get the mails that are the resulte of searchin query   | `200 Ok` | Auth required | 
| GET    | `/api/labels`           | List all labels                | `200 OK`         | Auth required |
| POST   | `/api/labels`           | Create a new label             | `201 Created`    | Auth required, Requires `name` field , optinal: `color` ( if not specified default color is pink) |
| PATCH  | `/api/labels/:id`       | Update a label                 | `204 No Content`         | Auth required,Requires updated `name` |
| DELETE | `/api/labels/:id`       | Delete a label                 | `204 No Content` | Auth required |
| POST   | `/api/blacklist`        | Add URL to blacklist           | `201 Created`    | url required in body `{ "url": "http://..." }` |
| DELETE | `/api/blacklist/:id`    | Remove URL from blacklist      | `204 No Content` | id is the url to be deleted | 

> All requests should use `Content-Type: application/json` and must include `id: <user-id>` header where required.

##  System Overview

- `server`: C++ server providing blacklist verification via TCP socket.
- `web_server`: Node.js server exposing RESTful endpoints (Gmail-like functionality).

## How to Run Using Docker

 📌 **note: All commands and scripts should be run from the root of the project (create-our-gmail), as paths and dependencies are relative to it.**

### Tools nedded: 
- ⁠ ⁠Docker Engine ≥ 20.10
-  ⁠please make sure your Docker desktop is running

###  Step 1 – Build and Launch c++ server:

**optinal**: before creating new containers delete all (running or stopped) containers:

``` bash
docker rm -f $(docker ps -aq)
```

Run the following command to build the c++ server build a volume and network and run it:

please run the following commands: 

```bash
docker rm -f server-container 2>/dev/null || true
docker build -f Dockerfile.server -t url_server .
docker volume create urldata || true
docker network create urlnet || true 
docker run -it --name server-container  --network urlnet -v urldata:/server/data url_server bash
```

if you can run a script on your environment you can run the script instead ( contains the exact same commands ) :

```bash
./script.sh
```
after that you will be inside the server container

### Step 2 - inside the server container, run the server manually using:

**Usage:**

./build/server 12345 \<bloom_size\> \<seed1\> [\<seed2\> ... \<seedN\>]

**Arguments:**
- \<port\>  → Port number the server will listen on ( if you are willing to change the port number to be a diffrent port then 12345 you may go to src/web_server/utils/mailUtils.js and change this line "const PORT = 12345;" as you wish )
- \<bloom_size\>  → Bloom filter size
- \<seed1\> → At least one integer seed for a hash function
- [\<seed2\> ... \<seedN\>] → Optional additional integer seeds for more hash functions

**Description:**
  - the default port number is 12345 please do not change that unless you change the port number in mailUtil.js as well
  - The port number must be a valid TCP port in the range **1024–65535.**
  - You must provide at least one hash function seed, but you may provide as many as you like.
  - All arguments must be valid positive integers.
  - If the arguments are missing or invalid, the server will not start.

**Example:**

  ``` bash
  ./build/server 12345 8 1 2
  ```

### Optional:
**Inspect the persistent data in the volume:**

go to the server terminal exit the cotainer (Ctrl + c ) go to the data dir (cd data) then type: cat urlsdata.txt, then type cd .. and after that you can run the server again (./build/server 12345 8 1 2)

**exit the server and container:**

to exit the server press: Ctrl + c 

**re-run the server inside the container (after exiting it):**

``` bash
  ./build/server 12345 8 1 2
  ```

to exit the server container press: Ctrl + d

**re- running the server container (after exiting it):**

``` bash
docker run -it --name server-container  --network urlnet -v urldata:/server/data url_server bash
```

**Delete data:**
Exit the container (Ctrl + c / Ctrl + z), cd data, rm urlsdata.txt, rm bloomfilterdata.bin, cd .. 
o.w the data will be kept because it is inside a volume

**Data persistance:**
the data will be kept even after deleting the container and the image, you can exit the container and image, delete them  
make the run command again and the data will persiste, the only way the data can be deleted is manually



### Step 3 -  build and run the web server:

**open a second terminal window**

in the new terminal window build the web server container:

``` bash
docker build -f Dockerfile.web-server -t gmail_web .
```
and run the web server:

``` bash
docker run -d --name web-container --network urlnet -p 8080:8080 gmail_web
```

### Step 4 -  REST API – How to Use:

Now that the system is up, you can send HTTP requests via `curl`. 

open a third terminal window (you may open more terminal windows for each user or you can run all users in the same terminal window), and run this commands: 


### 👤 Register a new user

``` bash
  curl -i -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
        "username": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "password": "secure123",
        "phone": "0501234567"
      }'
  ```

**Required fields in JSON:**

- `firstName`: user's name ( cannot be empty )

- `lastNmae`: user's last name ( cannot be empty )

- `username`: user's user name ( must be in a valid mail format )

- `password` : chosen password ( must contain at least 6 characters )

**Optional fields:**

- `picture`: a link to a picture

- `phone`: must be israeli phone format `05XXXXXXXX`

- `birthday`: must be a valid past date in YYYY-MM-DD format

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
- you have to register in order to login

### Get User Info by ID
Fetch user details (name, email, etc.) using the ID returned at login:

``` bash
curl -i -X GET http://localhost:8080/api/users/<user-id> \
  -H "id: <user-id>"
  ```

Replace <user-id> with the ID returned from the login response.

- only a logged in user can see its details, and a user's details can be seen only by himself

### 📬 Get Inbox

``` bash
curl -i -X GET http://localhost:8080/api/mails \
  -H "id: <user-id>"

  ```

- Retrieves the last 50 sent, received or drafts emails 
- Requirement: You must include your user-id in the header.

### Send Mail
Sends a new email to another registered user.

``` bash
curl -i -X POST http://localhost:8080/api/mails \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{
        "to": "recipient@example.com",
        "subject": "Hello",
        "bodyPreview": "This is a test email",
        "status": "sent"
      }'

  ```

**Required fields in JSON:**

`to`: recipient’s email

`status` : must be "sent" or "draft"

**Optional fields:**

`subject`: subject of the message

`body`: the actual message content

- Important: If the email contains a blacklisted URL, the send will fail.

### Delete Mail
Deletes the email with the specified ID.
``` bash
curl -i -X DELETE http://localhost:8080/api/mails/<mail-id> \
  -H "id: <user-id>"
  ```
- Requirement: You must provide your user ID in the header.

### Update mail
Updates the subject or body of an existing mail
``` bash
curl -i -X PATCH http://localhost:8080/api/mails/<mail-id> \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{ "subject": "Updated", "bodyPreview": "New content" }'

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

- **please notice that if you want to search for a string that contains spacec, you will need to replace every space in the query with `%20` for example, if you want to search for hello bob you will need to enter the query in this way: `hello%20bob`**
- the search is not case sensitive


### 🏷️ Create Label
Creates a new custom label (like “Work” or “Personal”).
``` bash
curl -i -X POST http://localhost:8080/api/labels \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{ "name": "label_name", "color": "blue" }'
  ```

- Required: A JSON field with "name": "label-name"
- Optional : A JSON field with "color": "color-you-want-for-the-label"
- if a color is not specified it will be defaulted to pink
- Header: Must include user ID.

### 🏷️ GET /api/labels – List Labels
Returns all labels created by the logged-in user.
``` bash
curl -i -X GET http://localhost:8080/api/labels \
  -H "id: <user-id>"
  ```
- Header: Requires user ID.

### Update label
Changes the name or color of an existing label

``` bash
curl -i -X PATCH http://localhost:8080/api/labels/<label-id> \
  -H "Content-Type: application/json" \
  -H "id: <user-id>" \
  -d '{ "name": "new name" }'

  ```
### Get label by id 
 get the details of the lebal that has this id 

 ``` bash
curl -i -X GET http://localhost:8080/api/labels/<label-id> \
  -H "id: <user-id>"
 ```
 
### Delete label
Deletes a label

``` bash
curl -i -X DELETE http://localhost:8080/api/labels/<label-id> \
  -H "id: <user-id>"

  ```

### POST /api/blacklist – Add to Blacklist
Adds a URL (e.g., http://phishing.com) to the blacklist used to filter spam/malicious messages.
This blacklist is managed by the C++ server, which maintains a Bloom Filter to store and validate URLs efficiently.

``` bash
curl -i -X POST http://localhost:8080/api/blacklist \
  -H "Content-Type: application/json" \
  -d '{ "url": "http://example.com" }'
  ```

- Once a URL is blacklisted, any attempt to send an email containing it will fail with a 400 error.

### 🧹 Remove from Blacklist
Removes a URL from the blacklist maintained by the C++ server
``` bash
curl -i -X DELETE "http://localhost:8080/api/blacklist/http%3A%2F%2Fexample.com"
  ```
- **please notice* if a url contains '/' or ':' please replace the '/' with '%2F' and the ':' with '%3A'. without it being replaced the url wont be deleted from blacklist.**

## 📁 Data Persistence

- All saved data (e.g., mails, labels, blacklist) are stored in a Docker volume named `urldata`.
- This volume ensures that data remains even after containers are stopped or rebuilt.

---

## 🔁 Example Session

### creating c++ server container:
<img width="1217" alt="Screenshot 2025-06-03 at 19 18 03" src="https://github.com/user-attachments/assets/818a9150-66cb-42c1-8c0a-fdd76d7b815d" />

### creating web server container:

<img width="1217" alt="Screenshot 2025-06-03 at 19 18 10" src="https://github.com/user-attachments/assets/f09a81ac-b45f-4093-9b91-fcc6a7a55ab6" />

### :run examples

<img width="1217" alt="Screenshot 2025-06-03 at 19 18 30" src="https://github.com/user-attachments/assets/299c9dd0-606c-4db4-9f29-a9024c4ce61b" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 19 29" src="https://github.com/user-attachments/assets/ad7d029c-95cc-428f-b1ed-4d38c50c5fb3" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 20 07" src="https://github.com/user-attachments/assets/92a41fba-7810-4959-b4db-a8d66a5ff2db" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 20 35" src="https://github.com/user-attachments/assets/df835d45-7616-433a-832f-077690841d5d" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 21 00" src="https://github.com/user-attachments/assets/a9326d82-d4c3-4089-a1ed-d53b6827cc88" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 21 30" src="https://github.com/user-attachments/assets/1aae9fc8-ee15-466d-833a-a56fcc3c166b" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 21 54" src="https://github.com/user-attachments/assets/abf39fb3-7233-4326-9798-db11ab88618e" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 22 54" src="https://github.com/user-attachments/assets/c5068119-53e1-4c5b-b24d-c9fdedd7d6de" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 23 10" src="https://github.com/user-attachments/assets/8ca141e9-4c99-4eed-b58c-d504fb7b7145" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 23 21" src="https://github.com/user-attachments/assets/a72938e0-df8a-4993-bd0b-dc1698c7a02d" />
<img width="1217" alt="Screenshot 2025-06-03 at 19 24 06" src="https://github.com/user-attachments/assets/ea112f1c-dbea-45c3-9603-854d8dfe66e2" />



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

