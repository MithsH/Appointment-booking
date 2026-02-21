# 📅 BookMe - Full-Stack Appointment Booking System

A complete appointment booking web application built with:
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Tokens)

---

## 📁 Project Structure

```
appointment-booking/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Me
│   │   ├── providerController.js  # Services, Availability, Bookings
│   │   └── appointmentController.js # Slots, Book, My Appointments
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + role authorize
│   │   └── error.js               # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema (user/provider)
│   │   ├── Service.js             # Services schema
│   │   ├── Availability.js        # Weekly schedule schema
│   │   └── Appointment.js         # Booking schema
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── providers.js           # /api/providers/*
│   │   └── appointments.js        # /api/appointments/*
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── css/
│   │   └── style.css              # Full responsive stylesheet
│   ├── js/
│   │   ├── main.js                # Shared utilities, API fetch, auth
│   │   ├── provider-dashboard.js  # Provider-specific logic
│   │   ├── user-dashboard.js      # User appointment management
│   │   └── booking.js             # 4-step booking wizard
│   ├── index.html                 # Landing page
│   ├── login.html                 # Login page
│   ├── register.html              # Registration page
│   ├── provider-dashboard.html    # Provider dashboard
│   ├── user-dashboard.html        # User dashboard
│   └── booking.html               # Booking wizard
│
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas account (or local MongoDB)
- A modern web browser

---

### Step 1: Setup Backend

```bash
cd appointment-booking/backend
npm install
```

### Step 2: Configure Environment Variables

Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

> 💡 **MongoDB URI:** Get this from [MongoDB Atlas](https://cloud.mongodb.com). Go to your cluster → Connect → Connect your application → Copy the connection string. Replace `<password>` with your actual password.

### Step 3: Start Backend

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster.mongodb.net
```

### Step 4: Open Frontend

Since the frontend uses `fetch` to call the backend API, you need to serve it properly (not just open the HTML file directly from disk, as some features may not work with `file://` protocol due to CORS).

**Option A: Use VS Code Live Server extension**
1. Install the "Live Server" extension in VS Code
2. Right-click on `frontend/index.html`
3. Click "Open with Live Server"

**Option B: Use a simple HTTP server**
```bash
cd appointment-booking/frontend
npx serve .
# or
python3 -m http.server 3000
```

Then open: `http://localhost:3000` (or the port shown)

---

## 🔌 API Endpoints

### Auth Routes `/api/auth`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/register` | Register new user/provider | Public |
| POST | `/login` | Login | Public |
| GET | `/me` | Get current user | Private |

### Provider Routes `/api/providers`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/` | Get all providers | Public |
| GET | `/:id` | Get provider by ID | Public |
| GET | `/:providerId/services` | Get provider's services | Public |
| GET | `/:providerId/availability` | Get provider's availability | Public |
| GET | `/services/my` | Get my services | Provider |
| POST | `/services` | Create service | Provider |
| PUT | `/services/:id` | Update service | Provider |
| DELETE | `/services/:id` | Delete service | Provider |
| GET | `/availability/my` | Get my availability | Provider |
| POST | `/availability` | Set/update availability | Provider |
| DELETE | `/availability/:dayOfWeek` | Remove availability day | Provider |
| GET | `/bookings/all` | View all my bookings | Provider |
| PUT | `/bookings/:id` | Approve/cancel/complete booking | Provider |

### Appointment Routes `/api/appointments`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/slots/:providerId?date=YYYY-MM-DD` | Get available slots | Public |
| POST | `/` | Book appointment | User |
| GET | `/my` | Get my appointments | User |
| PUT | `/:id/cancel` | Cancel appointment | User |

---

## 👤 User Roles

### Customer (role: user)
- Browse all providers
- View services per provider
- Check available slots by date
- Book appointments
- View & cancel their bookings

### Provider (role: provider)
- Create/edit/delete services
- Set weekly availability schedule
- View all incoming bookings
- Approve, cancel, or mark appointments as complete

---

## 🔐 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens stored in **localStorage**
- Token auto-attached to all API requests via `Authorization: Bearer <token>` header
- Role-based route protection (middleware)
- Double-booking prevented via database index
- Past date/time bookings blocked

---

## 🗜️ Zipping the Project

### On macOS/Linux:
```bash
cd appointment-booking
zip -r appointment-booking.zip . --exclude "*/node_modules/*" --exclude "*/.env"
```

### On Windows (PowerShell):
```powershell
Compress-Archive -Path appointment-booking -DestinationPath appointment-booking.zip
```

> **Note:** The `node_modules` folder is excluded to keep the zip small. Run `npm install` after unzipping.

---

## 🌐 Deployment Tips

### Backend (Render, Railway, Heroku, etc.)
1. Push backend folder to GitHub
2. Set environment variables (MONGO_URI, JWT_SECRET, PORT)
3. Set start command: `npm start`

### Frontend (Netlify, Vercel, GitHub Pages)
1. Update `API_BASE` in `frontend/js/main.js` to your deployed backend URL:
   ```javascript
   const API_BASE = 'https://your-backend-url.com/api';
   ```
2. Deploy the `frontend/` folder

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Dev Tools | nodemon, dotenv |

---

Built with ❤️ — BookMe Appointment System
