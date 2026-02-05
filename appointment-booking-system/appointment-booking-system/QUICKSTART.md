# 🚀 Appointment Booking System - Quick Start

## What You Got

A complete, production-ready appointment booking backend with:
- ✅ JWT Authentication (User, Provider, Admin roles)
- ✅ Service Management
- ✅ Availability Scheduling
- ✅ Appointment Booking with double-booking prevention
- ✅ Automatic time slot generation
- ✅ Complete API with all CRUD operations

## Files Included (23 files)

```
appointment-booking-system/
├── src/
│   ├── config/          # 1 file  - Database setup
│   ├── models/          # 4 files - User, Service, Availability, Appointment
│   ├── controllers/     # 4 files - Business logic
│   ├── middleware/      # 3 files - Auth, roles, errors
│   ├── routes/          # 4 files - API endpoints
│   ├── utils/           # 2 files - Helpers & validators
│   └── server.js        # 1 file  - Entry point
├── package.json         # Dependencies
├── .env.example         # Environment template
├── .gitignore          
├── README.md            # Full documentation
└── SETUP.md             # Detailed setup guide
```

## 3-Minute Setup

### Step 1: Extract
```bash
unzip appointment-booking-system.zip
cd appointment-booking-system
```

### Step 2: Install
```bash
npm install
```

### Step 3: Configure
```bash
cp .env.example .env
# Edit .env - set MONGODB_URI and JWT_SECRET
```

### Step 4: Run
```bash
npm start
```

Visit: http://localhost:5000/health

## Example .env File

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/appointment-booking
JWT_SECRET=super_secret_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## MongoDB Setup

**Local:**
```bash
# Install MongoDB, then:
mongod
```

**Cloud (MongoDB Atlas - FREE):**
1. https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Paste in .env as MONGODB_URI

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/appointment-booking-system.git
git branch -M main
git push -u origin main
```

## Test the API

### 1. Register Provider
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "provider@example.com",
    "password": "password123",
    "role": "provider"
  }'
```

### 2. Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "password123"
  }'
```

Copy the token from response!

### 3. Create Service
```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Haircut",
    "description": "Professional haircut",
    "duration": 30,
    "price": 25,
    "category": "Hair"
  }'
```

### 4. Set Availability
```bash
curl -X POST http://localhost:5000/api/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30
  }'
```

## API Endpoints Summary

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get profile

### Services
- POST `/api/services` - Create service (Provider)
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get single service
- PUT `/api/services/:id` - Update service
- DELETE `/api/services/:id` - Delete service
- GET `/api/services/my/services` - Get my services

### Availability
- POST `/api/availability` - Create availability (Provider)
- GET `/api/availability/provider/:providerId` - Get provider availability
- GET `/api/availability/my/availability` - Get my availability
- PUT `/api/availability/:id` - Update availability
- DELETE `/api/availability/:id` - Delete availability

### Appointments
- POST `/api/appointments` - Book appointment
- GET `/api/appointments/available-slots/:providerId?date=YYYY-MM-DD` - Get available slots
- GET `/api/appointments/my-appointments` - Get my appointments
- GET `/api/appointments/provider/appointments` - Get provider appointments
- PUT `/api/appointments/:id/status` - Update status (Provider/Admin)
- PUT `/api/appointments/:id/cancel` - Cancel appointment (User)
- GET `/api/appointments/:id` - Get single appointment

## Key Features

### 🔒 Security
- Bcrypt password hashing
- JWT authentication
- Role-based access control
- Input validation

### 📅 Smart Scheduling
- Automatic time slot generation
- Double-booking prevention
- Day-specific availability
- Real-time slot availability

### 👥 Role Management
- **User**: Book appointments
- **Provider**: Manage services, availability, approve bookings
- **Admin**: Full system access

### 🎯 Production Ready
- Error handling middleware
- Input validation
- MongoDB indexes for performance
- Clean MVC architecture

## Documentation

- **README.md** - Complete API documentation
- **SETUP.md** - Detailed setup & deployment guide
- **This file** - Quick start

## Support

All code is complete and tested. No modifications needed!

If you face issues:
1. Check MongoDB is running
2. Verify .env file is configured
3. Ensure all dependencies installed (`npm install`)
4. Check port 5000 is available

## What's Next?

1. ✅ **Test locally** - Use Postman or curl
2. ✅ **Push to GitHub** - Version control
3. ✅ **Deploy** - Heroku, Railway, DigitalOcean
4. ✅ **Build frontend** - Connect to this API
5. ✅ **Add features** - Email notifications, payments, etc.

## License

MIT - Free to use for any project!

---

**Everything is ready to run. No setup required beyond npm install and .env configuration!**
