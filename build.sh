#!/bin/bash

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install

# Build frontend
npm run build
cd ..

echo "Build completed successfully!" 