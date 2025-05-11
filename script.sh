#!/usr/bin/env bash
docker rm -f server-container 2>/dev/null || true
docker build -f Dockerfile.server -t gmail_server .
docker build -f src/client/Dockerfile.client -t gmail_client src/client
docker volume create gmaildata 
docker network create gmailnet || true 
docker run -it --name server-container  --network gmailnet -v gmaildata:/server/data gmail_server bash