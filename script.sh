#!/usr/bin/env bash
docker rm -f server-container 2>/dev/null || true
docker build -f Dockerfile.server -t url_server .
docker volume create urldata || true
docker network create urlnet || true 
docker run -it --name server-container  --network urlnet -v urldata:/server/data url_server bash