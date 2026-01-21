# Backend MongoDB  – Online Appointment Booking System



---

## 1. Database Overview

**Database Name:** `appointmentDB`

**Collections Used:**

- `users`
- `services`
- `availability`
- `appointments`

MongoDB Atlas (Free Tier – M0) is used.

---

## 2. Environment Setup

### Required Tools

- Node.js (v18 or above recommended)
- npm
- MongoDB Atlas account access

### Install Dependencies

```bash
npm install mongoose dotenv
```

---

## 3. Environment Variables

Create a `.env` file (DO NOT COMMIT THIS FILE):

pass\:ur password



mongodb+srv://username:\<db\_password>@appointment-booking.yejltrj.mongodb.net/?appName=appointment-booking\
\
don;t commit with pass 



```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 5. Collection Schemas (Reference)

### users

```json
{
  "name": "string",
  "email": "string",
  "password": "hashed string",
  "role": "user | provider",
  "createdAt": "ISO date"
}
```

### services

```json
{
  "providerId": "ObjectId",
  "serviceName": "string",
  "description": "string",
  "duration": "number",
  "price": "number",
  "isActive": true,
  "createdAt": "ISO date"
}
```

### availability

```json
{
  "providerId": "ObjectId",
  "date": "YYYY-MM-DD",
  "timeSlots": ["HH:mm"]
}
```

### appointments

```json
{
  "userId": "ObjectId",
  "providerId": "ObjectId",
  "serviceId": "ObjectId",
  "date": "YYYY-MM-DD",
  "timeSlot": "HH:mm",
  "status": "Pending | Approved | Cancelled",
  "createdAt": "ISO date"
}
```

---

## 6. Important Index (Prevent Double Booking)

Create this index once in MongoDB Atlas:

```js
{
  providerId: 1,
  date: 1,
  timeSlot: 1
}
```

Set as **UNIQUE**.

---

## 7. Backend Rules

- Passwords must be hashed using `bcrypt`
- JWT should be used for authentication
- Role-based access control:
  - `provider`: manage services & appointments
  - `user`: book & view appointments

---

## 8. Git Workflow Rules

- Do NOT push `.env`
- Do NOT modify production database directly
- Use feature branches
- All changes go through Pull Requests

---

##

---

✅ This document is the single source of truth for backend–database interaction.

