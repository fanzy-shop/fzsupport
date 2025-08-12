# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy all source code first
COPY . .

# Install root dependencies
RUN npm install --production

# Install backend dependencies
RUN cd backend && npm install --production

# Install frontend dependencies
RUN cd frontend && npm install --production

# Build frontend
RUN cd frontend && npm run build

# Build backend
RUN cd backend && npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["sh", "-c", "cd backend && npm start"] 