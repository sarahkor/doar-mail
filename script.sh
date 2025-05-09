#!/usr/bin/env bash
docker build -f Dockerfile.server -t gmail_app .
docker volume create bloomdata  
docker run -it -v bloomdata:/server/data gmail_app bash