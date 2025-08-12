#!/bin/bash

echo "🚀 Starting Fanzy Shop Support Application..."

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo "🔨 Building frontend..."
npm run build
cd ..

# Install backend dependencies, build and start
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "🔨 Building backend..."
npm run build

echo "🚀 Starting server..."
npm start 