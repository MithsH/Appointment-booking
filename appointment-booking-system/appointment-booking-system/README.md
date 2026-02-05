# Appointment Booking System - Backend API

A production-ready appointment booking system built with Node.js, Express, and MongoDB. Features complete authentication, role-based access control, and appointment management.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Provider, Admin)
  - Secure password hashing with bcrypt

- **User Management**
  - User registration and login
  - Profile management
  - Role-based permissions

- **Service Management**
  - Providers can create and manage services
  - Service categorization
  - Pricing and duration management

- **Availability Management**
  - Providers set weekly availability
  - Configurable time slots
  - Day-specific scheduling

- **Appointment Booking**
  - Real-time slot availability
  - Automatic slot generation
  - Double-booking prevention
  - Appointment status management
  - User and provider dashboards

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Bcrypt for password hashing

## Project Structure

```
src/
├── config/          # Database configuration
├── models/          # Mongoose models
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── utils/           # Helper functions
└── server.js        # Application entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appointment-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Service Endpoints

#### Create Service (Provider only)
```http
POST /services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Haircut",
  "description": "Professional haircut service",
  "duration": 30,
  "price": 25.00,
  "category": "Hair"
}
```

#### Get All Services
```http
GET /services
```

#### Get Service by ID
```http
GET /services/:id
```

#### Update Service
```http
PUT /services/:id
Authorization: Bearer <token>
```

#### Delete Service
```http
DELETE /services/:id
Authorization: Bearer <token>
```

#### Get My Services (Provider)
```http
GET /services/my/services
Authorization: Bearer <token>
```

### Availability Endpoints

#### Create Availability (Provider only)
```http
POST /availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30
}
```
Note: dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

#### Get Provider Availability
```http
GET /availability/provider/:providerId
```

#### Get My Availability (Provider)
```http
GET /availability/my/availability
Authorization: Bearer <token>
```

#### Update Availability
```http
PUT /availability/:id
Authorization: Bearer <token>
```

#### Delete Availability
```http
DELETE /availability/:id
Authorization: Bearer <token>
```

### Appointment Endpoints

#### Create Appointment
```http
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "serviceId": "service_id",
  "date": "2024-12-25",
  "timeSlot": "10:00",
  "notes": "Optional notes"
}
```

#### Get Available Slots (Public)
```http
GET /appointments/available-slots/:providerId?date=2024-12-25
```

#### Get My Appointments
```http
GET /appointments/my-appointments
Authorization: Bearer <token>
```

#### Get Provider Appointments (Provider)
```http
GET /appointments/provider/appointments
Authorization: Bearer <token>
```

#### Update Appointment Status (Provider/Admin)
```http
PUT /appointments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "cancelReason": "Optional reason"
}
```
Status values: pending, approved, cancelled, completed

#### Cancel Appointment (User)
```http
PUT /appointments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancelReason": "Unable to attend"
}
```

#### Get Single Appointment
```http
GET /appointments/:id
Authorization: Bearer <token>
```

## Database Models

### User
- name, email, password
- role: user | provider | admin
- phone, isActive

### Service
- provider (ref: User)
- name, description
- duration (minutes), price
- category, isActive

### Availability
- provider (ref: User)
- dayOfWeek (0-6)
- startTime, endTime (HH:MM)
- slotDuration (minutes)
- isActive

### Appointment
- user, provider, service (refs)
- date, timeSlot
- status: pending | approved | cancelled | completed
- notes, cancelReason

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

Error Response Format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Protected routes
- CORS enabled

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Testing the API

You can test the API using:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Any HTTP client

Example workflow:
1. Register as a provider
2. Login to get JWT token
3. Create services
4. Set availability
5. Register as a user
6. View available slots
7. Book appointment
8. Provider approves appointment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
