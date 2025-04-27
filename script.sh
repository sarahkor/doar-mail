#!/usr/bin/env bash
docker build -f Dockerfile.app -t gmail_app .
docker volume create bloomdata  
docker run -it -v bloomdata:/app/data gmail_app bash