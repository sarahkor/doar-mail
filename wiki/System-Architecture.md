# 🧱 System Architecture
This page explains the structure of the Doar fullstack mail system and how its components interact within a Dockerized environment.

## Components Overview
The system is composed of four main services:

| Component             | Description                                                               |
|-----------------------|---------------------------------------------------------------------------|
| React Frontend        | User web interface built in React, served by Nginx                        | 
| Node.js Backend       | RESTful API server handling business logic, users labels and mail storage | 
| C++ Blacklist Server  | Custom TCP socket server that filters blacklisted URLs                    | 
| MongoDB               | NoSQL database used to persist user accounts, mails, and labels           | 
| Android App	        | Native Android client that consumes the backend API and provides mobile access to Doar |

## 🔗 Docker Networking
All services are connected through a dedicated Docker network called urlnet.

This allows the frontend to communicate with the backend, and the backend to communicate with:

- MongoDB (via hostname mongo)

- C++ server (via server-container on port 12345)

## Port Mapping

| Service               |  Container/App |Container Port | Host Port | 	Protocol    | Notes                 |
|-----------------------|-----------------|----------------|-----------|--------------|-----------------------|
| React Client (Nginx)  | client-container| 3000           | 3000      | HTTP         | Accessible via browser|
| Node.js Backend       | web-container   |8080            | 8080      | HTTP         | REST API server       |
| C++ Server            | server-container| 12345          | 12345     | TCP          | Handles URL blacklist filtering |
| MongoDB               | mongo           |27017           | internal  | N/A          | Used internally by backend|
| Android App           | (Mobile device) | -              | -         |  HTTP         | Connects to backend (8080) via host IP|

## URL Filtering via C++ Server

To ensure security and prevent phishing:

1. When a mail is created, the backend extracts all URLs from its content.

2. For each URL:

  - The Node.js backend connects to the C++ server over TCP (port 12345) and sends a GET <url> request.

  - The C++ server checks the Bloom filter and blacklist file (urlsdata.txt in urldata volume).

3. If a URL is blacklisted c++ server sends true true message, so the backend classifies the mail as spam.

4. Users can also report or unreport spam, updating the blacklist using POST and DELETE TCP commands to the C++ server. if they report a mail as spam all urls in the mail get blacklisted via POST command, similarly when a user reports a mail as unspam all urls in the mail are removed from blacklist via DELETE command to the c++ server. 

This modular separation allows the URL filtering logic to remain lightweight and performant, and it can be reused across other projects.




