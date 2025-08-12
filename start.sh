#!/bin/bash

echo "🚀 Starting Fanzy Shop Support Application..."

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Build and start backend
echo "🔨 Building backend..."
cd backend
npm run build

echo "🚀 Starting server..."
npm start 