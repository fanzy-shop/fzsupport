# Development Setup Guide

## Local Development

### Option 1: Use MongoDB Atlas (Recommended)
1. Create a free MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Get your connection string
4. Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram-chat-app
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Option 2: Install MongoDB Locally
1. Download and install MongoDB Community Server
2. Start MongoDB service
3. The default connection string will work: `mongodb://localhost:27017/telegram-chat-app`

### Option 3: Use Docker for MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Running the Application

### Backend Only
```bash
cd backend
npm run dev
```

### Frontend Only
```bash
cd frontend
npm start
```

### Both (from root directory)
```bash
npm run dev
```

## Environment Variables

Make sure you have these environment variables set:

- `MONGODB_URI`: MongoDB connection string
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to 'development' for local development

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check your connection string
- Verify network connectivity
- Try using MongoDB Atlas for easier setup

### Telegram Bot Issues
- Verify your bot token is correct
- Make sure the bot is not blocked
- Check bot permissions

### Cloudinary Issues
- Verify your Cloudinary credentials
- Check if your account is active
- Ensure proper permissions 