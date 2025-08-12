const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try to load .env file
const envPath = path.resolve(__dirname, '.env');
console.log(`Checking .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

if (fs.existsSync(envPath)) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File content:');
    console.log(content);
    
    // Check for BOM character
    const hasBOM = content.charCodeAt(0) === 0xFEFF;
    console.log(`Has BOM character: ${hasBOM}`);
    
    // Try to parse manually
    const envVars = {};
    content.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          envVars[key] = value;
        }
      }
    });
    
    console.log('Parsed variables:');
    console.log(envVars);
  } catch (error) {
    console.error('Error reading .env file:', error);
  }
}

// Load with dotenv
dotenv.config({ path: envPath });

console.log('\nEnvironment variables loaded by dotenv:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set (hidden)' : 'Not set');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);

// Try loading directly from process.env
console.log('\nDirect from process.env:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN);

// Create a test bot
try {
  const { Telegraf } = require('telegraf');
  const token = process.env.TELEGRAM_BOT_TOKEN || '8403478259:AAFF9TqAR4ymyGAue3aBAMh00HRSWEkrV4k';
  console.log('\nCreating test bot with token:', token);
  
  const bot = new Telegraf(token);
  console.log('Bot created successfully!');
  
  // Try a simple API call
  bot.telegram.getMe()
    .then(botInfo => {
      console.log('Bot info:', botInfo);
    })
    .catch(error => {
      console.error('Error getting bot info:', error);
    });
} catch (error) {
  console.error('Error creating bot:', error);
} 