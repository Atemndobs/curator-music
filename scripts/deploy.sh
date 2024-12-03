#!/bin/bash

# Navigate to project directory
cd /home/atem/docker/curator-music

# Reset any changes and ensure we're on main branch
git reset --hard
git checkout main
git pull origin main

# Stop and remove the existing container if it exists
docker-compose down -v --rmi all

# Start the new container
docker-compose up -d

# Clean up unused images
docker image prune -f
