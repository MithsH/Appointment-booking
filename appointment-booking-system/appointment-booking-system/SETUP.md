# Setup and Deployment Guide

## Quick Start

### 1. Extract and Navigate
```bash
# Extract the zip file
unzip appointment-booking-system.zip
cd appointment-booking-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your settings
# Required: MONGODB_URI and JWT_SECRET
```

### 4. Start MongoDB
**Option A: Local MongoDB**
```bash
# Start MongoDB service (varies by OS)
# Linux/Mac with brew:
brew services start mongodb-community

# Linux with systemd:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in .env

### 5. Run the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 6. Test the Server
```bash
# Check health endpoint
curl http://localhost:5000/health
```

You should see:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-02-05T..."
}
```

## GitHub Deployment

### Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Complete appointment booking system"
```

### Create GitHub Repository
1. Go to https://github.com
2. Click "New Repository"
3. Name: `appointment-booking-system`
4. Don't initialize with README
5. Click "Create Repository"

### Push to GitHub
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/appointment-booking-system.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Environment Variables

### Required Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database - REQUIRED
MONGODB_URI=mongodb://localhost:27017/appointment-booking
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appointment-booking

# JWT - REQUIRED (change in production)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# CORS (optional)
CORS_ORIGIN=http://localhost:3000
```

### Generate Secure JWT Secret
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

## Testing the API

### 1. Register a Provider
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "provider@example.com",
    "password": "password123",
    "role": "provider",
    "phone": "+1234567890"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

### 3. Create a Service
```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Consultation",
    "description": "30-minute consultation",
    "duration": 30,
    "price": 50.00,
    "category": "Medical"
  }'
```

### 4. Set Availability
```bash
curl -X POST http://localhost:5000/api/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30
  }'
```

### 5. Check Available Slots
```bash
curl "http://localhost:5000/api/appointments/available-slots/PROVIDER_ID?date=2024-12-25"
```

## Deployment to Production

### Using Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create appointment-booking-api
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret_here
heroku config:set MONGODB_URI=your_mongodb_atlas_uri_here
```

5. **Deploy**
```bash
git push heroku main
```

6. **Open App**
```bash
heroku open
```

### Using Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Initialize Project**
```bash
railway init
```

4. **Set Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret
railway variables set MONGODB_URI=your_mongodb_uri
```

5. **Deploy**
```bash
railway up
```

### Using DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean App Platform
3. Create new app from GitHub repo
4. Set environment variables
5. Deploy

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# On Linux/Mac:
ps aux | grep mongod

# On Windows:
tasklist | findstr mongod
```

### Port Already in Use
```bash
# Find process using port 5000
# On Linux/Mac:
lsof -i :5000

# On Windows:
netstat -ano | findstr :5000

# Kill the process or change PORT in .env
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Issues
- Make sure JWT_SECRET is set in .env
- Token expires after 7 days by default
- Include "Bearer " prefix in Authorization header

## Project Structure Overview

```
appointment-booking-system/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User schema with roles
│   │   ├── Service.js           # Service schema
│   │   ├── Availability.js      # Availability schema
│   │   └── Appointment.js       # Appointment schema
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── serviceController.js # Service CRUD
│   │   ├── availabilityController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── roleMiddleware.js    # Role-based access
│   │   └── errorMiddleware.js   # Error handling
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── availabilityRoutes.js
│   │   └── appointmentRoutes.js
│   ├── utils/
│   │   ├── slotGenerator.js     # Time slot generation
│   │   └── validators.js        # Input validation
│   └── server.js                # Entry point
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── README.md
└── SETUP.md                     # This file
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Start MongoDB
4. ✅ Run the application
5. ✅ Test with curl/Postman
6. ✅ Push to GitHub
7. 🚀 Deploy to production

## Support

For issues or questions:
- Check the README.md for API documentation
- Review error messages in console
- Check MongoDB connection
- Verify environment variables
- Ensure all dependencies are installed

## License

MIT License - Feel free to use for personal or commercial projects
