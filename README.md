# Fanzy Shop Support Chat Application

A real-time chat application that integrates with Telegram for customer support, built with React, Node.js, and Socket.io.

## Features

- **Real-time Chat**: Instant messaging between admin and customers
- **Telegram Integration**: Seamless connection with Telegram bot
- **File Upload**: Support for images, videos, audio, and documents
- **Message Actions**: Reply, copy, and delete messages
- **Authentication**: Secure login system for admin access
- **Responsive Design**: Works on desktop and mobile devices
- **Image Preview**: Full-screen image preview with download option

## Tech Stack

### Frontend
- React.js with TypeScript
- Styled Components for styling
- Socket.io client for real-time communication
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- TypeScript
- Socket.io for real-time communication
- Mongoose for MongoDB ORM
- Telegraf for Telegram bot integration
- Cloudinary for file storage and optimization
- JWT for authentication

### Database
- MongoDB

## Prerequisites

- Node.js (>= 18.0.0)
- npm (>= 8.0.0)
- MongoDB database
- Telegram Bot Token
- Cloudinary account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for production)
FRONTEND_URL=https://your-domain.com

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fzsupport
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables (see above)

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Production Deployment

### Railway Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Set up the following environment variables in Railway:
   - `MONGODB_URI`
   - `TELEGRAM_BOT_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `JWT_SECRET`
   - `NODE_ENV=production`

4. Railway will automatically:
   - Install dependencies
   - Build the frontend
   - Start the production server

### Manual Deployment

1. Build the frontend:
```bash
npm run build
```

2. Build the backend:
```bash
npm run build:backend
```

3. Start the production server:
```bash
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Messages
- `GET /api/messages/users` - Get users with latest messages
- `GET /api/messages/users/:userId` - Get messages for a user
- `POST /api/messages/users/:userId` - Send message to user
- `PUT /api/messages/users/message/:messageId` - Delete message
- `PUT /api/messages/users/:userId/read` - Mark messages as read

### File Upload
- `POST /api/upload` - Upload file

## Admin Login

Default admin credentials:
- Username: `thonewathan`
- Password: `Facai8898@`

## Project Structure

```
fzsupport/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── scripts/        # Database scripts
│   └── package.json
├── package.json            # Root package.json
├── railway.json           # Railway configuration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or create an issue in the repository. 