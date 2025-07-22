# Getting Started and running the project
Welcome to Doar — your fullstack Gmail-inspired mail system!
This page will walk you through everything you need to set up and run the project.

## Prerequisites

To run this system successfully, make sure you have:

✅ Docker Engine version 20.10 or higher

✅ Docker Compose (included in Docker Desktop)

✅ Android Studio (to run the Android app, optional)

✅ A terminal with access to bash and git

**Make sure Docker Desktop is running before continuing.**

## Cloning the Repository

``` bash
git clone <your-git-repo-url>
cd create-our-gmail
```

This will land you in the root folder of the project.

📌 **note: All commands and scripts should be run from the root of the project (create-our-gmail), as paths and dependencies are relative to it.**

## Project Structure

- src/web_server/ — Node.js backend

- src/react-client/ — React frontend

- src/server/ — C++ socket server (URL filtering)

- src/android_client/ — Android app

## Docker - Based Setup
### Step 1: Clean Previous Containers (Optional but recommended)

``` bash
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker volume prune -f
docker network prune -f
```
### Step 2: Build & Run All Services

``` bash
docker compose down -v --remove-orphans
docker compose up --build
```
This command will:

- Build:
  * cpp-server (C++)
  * web-server (Node.js backend)
  * react-client (React via Nginx)

- Launch:

  * C++ server with ./build/server 12345 8 1 2 (it is possible to change the args in the docker compose cpp-server service)
  * Web server container, running node src/web_server/app.js on port 8080
  * React client container  serving the doar app on port 3000
  * the cpp url server data stored in the urldata volume

- Start MongoDB with data persistence volume named mongodata

All containers are connected to the custom Docker network urlnet, which allows them to communicate via container names (e.g., server-container, mongo, web-container).

### step 3: Accessing the web app

- React App: http://localhost:3000/

- Node.js API Server: http://localhost:8080/

All components run in Docker, connected via the custom urlnet network.

Browse the app from either port — both serve the same client interface.
Port 3000 runs the React development server, while port 8080 runs the Node.js backend server with the same interface.

### step 4: Accessing the Android app

- Open Android Studio

- Open the folder: src/android_client/

- Run the app on an emulator

### Step 5: Access Containers (Optional)

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

for example:

``` bash
  curl -i -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
        "username": "john@doar.com",
        "firstName": "John",
        "lastName": "Doe",
        "password": "Secure123!",
        "phone": "0501234567"
      }'
```

### Step 6:  Stop the System

If you’re still in the terminal where docker compose up is running, just hit Ctrl +C.

Or from any shell in your project root:

```bash
docker compose down
```
To delete all volumes and reset data:

```bash
docker compose down -v
```

Ready? Let’s explore how to use the system in the [Usage Guide](./Frontend-Features.md) →