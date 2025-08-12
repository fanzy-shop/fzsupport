# Railway Deployment Guide

This guide will help you deploy the Fanzy Shop Support Chat Application to Railway.

## Prerequisites

1. **GitHub Account**: Your code should be pushed to GitHub
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **MongoDB Database**: You'll need a MongoDB database (Railway provides MongoDB)
4. **Telegram Bot Token**: Get this from [@BotFather](https://t.me/botfather)
5. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)

## Step 1: Prepare Your Repository

Your code is already on GitHub at: `https://github.com/fanzy-shop/fzsupport`

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `fzsupport` repository

3. **Configure Environment Variables**
   - In your Railway project dashboard, go to "Variables" tab
   - Add the following environment variables:

```env
# Database (Railway will provide this)
MONGODB_URI=mongodb+srv://...

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_key

# Environment
NODE_ENV=production

# Frontend URL (will be your Railway domain)
FRONTEND_URL=https://your-app-name.railway.app
```

4. **Add MongoDB Database**
   - In Railway dashboard, click "New"
   - Select "Database" → "MongoDB"
   - Railway will automatically set the `MONGODB_URI` variable

5. **Deploy**
   - Railway will automatically detect the `railway.json` configuration
   - It will install dependencies, build the frontend, and start the server
   - Your app will be available at the provided Railway URL

### Option B: Deploy via Railway CLI

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Railway Project**
```bash
railway init
```

4. **Set Environment Variables**
```bash
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
railway variables set CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
railway variables set CLOUDINARY_API_KEY="your_cloudinary_api_key"
railway variables set CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
railway variables set JWT_SECRET="your_jwt_secret"
railway variables set NODE_ENV="production"
```

5. **Deploy**
```bash
railway up
```

## Step 3: Configure Your Domain (Optional)

1. **Custom Domain**
   - In Railway dashboard, go to "Settings" → "Domains"
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables**
   - Update `FRONTEND_URL` to your custom domain

## Step 4: Test Your Deployment

1. **Health Check**
   - Visit: `https://your-app-name.railway.app/api/health`
   - Should return: `{"status":"OK","timestamp":"...","uptime":...}`

2. **Admin Login**
   - Visit: `https://your-app-name.railway.app`
   - Login with:
     - Username: `thonewathan`
     - Password: `Facai8898@`

3. **Telegram Bot**
   - Start a conversation with your Telegram bot
   - Send `/start` to test the bot integration

## Step 5: Monitor Your Application

### Railway Dashboard
- **Logs**: View real-time logs in the Railway dashboard
- **Metrics**: Monitor CPU, memory, and network usage
- **Deployments**: Track deployment history and rollback if needed

### Health Monitoring
- Railway automatically monitors your `/api/health` endpoint
- If the health check fails, Railway will restart your application

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in Railway dashboard
   - Ensure all dependencies are properly listed in `package.json`
   - Verify TypeScript compilation

2. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Ensure no extra spaces or quotes in variable values

3. **Database Connection**
   - Verify `MONGODB_URI` is correct
   - Check if MongoDB database is accessible from Railway

4. **Telegram Bot Issues**
   - Verify `TELEGRAM_BOT_TOKEN` is correct
   - Check bot logs in Railway dashboard
   - Ensure bot is not blocked by users

### Logs and Debugging

1. **View Logs**
   - In Railway dashboard, go to "Deployments" → "View Logs"
   - Check for error messages and stack traces

2. **Debug Environment**
   - Add console.log statements to debug issues
   - Redeploy to see updated logs

3. **Database Debugging**
   - Check MongoDB connection in logs
   - Verify database schema and indexes

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Railway's secure environment variable storage
   - Rotate secrets regularly

2. **JWT Secret**
   - Use a strong, random JWT secret
   - Keep it secure and don't share it

3. **Telegram Bot Token**
   - Keep your bot token secure
   - Don't expose it in client-side code

## Scaling

### Railway Auto-scaling
- Railway automatically scales based on traffic
- No additional configuration needed

### Manual Scaling
- In Railway dashboard, you can adjust resources
- Monitor usage and adjust as needed

## Cost Optimization

1. **Resource Usage**
   - Monitor CPU and memory usage
   - Optimize your application for efficiency

2. **Database**
   - Use Railway's MongoDB for simplicity
   - Consider external MongoDB Atlas for larger scale

3. **File Storage**
   - Use Cloudinary for file storage
   - Implement proper file cleanup

## Support

If you encounter issues:

1. **Check Railway Documentation**: [docs.railway.app](https://docs.railway.app)
2. **View Application Logs**: In Railway dashboard
3. **Contact Support**: Through Railway dashboard or Discord

## Next Steps

After successful deployment:

1. **Set up monitoring**: Configure alerts for downtime
2. **Backup strategy**: Set up database backups
3. **CI/CD**: Configure automatic deployments from GitHub
4. **SSL**: Ensure HTTPS is enabled (Railway handles this automatically)
5. **Performance**: Monitor and optimize application performance 