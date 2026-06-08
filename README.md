# StreePath

A women-safety-first cab booking and ride-hailing platform.  StreePath combines real-time ride matching with a dedicated safety layer — SOS alerts, emergency contacts, incident reporting, and a route danger score — all in one app.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Socket Events](#socket-events)
- [Contributing](#contributing)

---

## Overview

 StreePath is a full-stack monorepo with a **React + TypeScript** frontend (`/client`) and a **Node.js + Express + TypeScript** backend (`/server`). Three distinct portals are served from the same frontend: **User**, **Driver**, and **Admin**.

The platform's defining feature is its ** StreePath safety layer** — a set of endpoints and UI components that sit on top of the core ride-booking flow and let users trigger SOS alerts, manage trusted emergency contacts, report incidents with GPS coordinates, and check a danger score for any route before they travel.

---

## Features

### User
- Sign up / log in with email-password or Google OAuth (via Firebase)
- Government ID verification (Aadhaar image upload)
- Request rides by picking a vehicle type and entering pickup/drop-off locations (Google Maps + Mapbox)
- Real-time ride status updates over WebSocket
- In-ride chat with driver
- Pay via wallet or Stripe
- View ride history and give feedback/ratings
- **Safety Hub** — one screen that surfaces all safety tools:
  - One-tap **SOS button** that captures GPS location and emails every registered emergency contact instantly
  - **Emergency Contacts** manager (add, view, delete trusted contacts with name, phone, email, relationship)
  - **Report Incident** form (type, description, severity, GPS location)
  - **Safe Route** panel with a danger score for the current route

### Driver
- Multi-step signup with Aadhaar, license, and vehicle RC upload (AWS S3 / CloudFront)
- Google OAuth login
- Real-time ride request notifications (Socket.IO)
- 6-digit PIN-based ride verification
- Dashboard with earnings, completed and cancelled ride counts
- Availability toggle
- Profile management

### Admin
- Dashboard with platform-wide stats
- Driver management: view pending / verified / blocked drivers, approve or reject with notes
- User management: same lifecycle controls
- View driver ride history and user feedbacks
- **Safety Panel**: view all active and resolved SOS alerts, all incident reports, update incident status with admin notes, view heatmap data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, DaisyUI, Chakra UI, MUI, Ant Design |
| State management | Redux Toolkit, Redux Persist |
| Maps | Google Maps JS API (`@react-google-maps/api`), Mapbox GL, `react-map-gl` |
| Auth (client) | Firebase Auth, Google OAuth (`@react-oauth/google`) |
| Forms | Formik + Yup |
| HTTP client | Axios (separate instances for user, driver, and admin with interceptors) |
| Payments | Stripe.js |
| Real-time | Socket.IO client |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB via Mongoose |
| Auth (server) | JWT (`jsonwebtoken`) |
| File uploads | Multer → AWS S3 (served via CloudFront) |
| Email | Nodemailer (Gmail SMTP) |
| Real-time | Socket.IO server |
| Password hashing | bcrypt |

---

## Project Structure

```
saferoute-ai/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin UI components (dashboard, driver/user/safety panels)
│   │   │   ├── driver/         # Driver UI components
│   │   │   └── user/           # User UI components + Safety Hub sub-components
│   │   ├── pages/              # Route-level page components (user / driver / admin)
│   │   ├── routes/             # Protected route wrappers for each portal
│   │   ├── services/
│   │   │   ├── axios/          # axiosUser.ts, axiosDriver.ts, axiosAdmin.ts
│   │   │   ├── firebase.ts
│   │   │   └── redux/          # Store + slices (auth, ride data, modals, safety)
│   │   └── utils/
│   │       └── Interfaces.ts
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── server/                     # Express backend
    └── src/
        ├── config/             # MongoDB connection
        ├── entities/           # Mongoose models (User, Driver, Ride, SOSAlert, IncidentReport, EmergencyContact)
        ├── interfaces/
        │   ├── controllers/    # adminController, driverController, userController, safetyController
        │   └── routes/         # Express routers
        ├── middlewares/        # JWT auth, Multer
        ├── repositories/       # DB query helpers for user and driver
        ├── services/           # AWS S3, bcrypt, Nodemailer, Socket.IO
        ├── usecases/           # Business logic (login, registration) for user and driver
        ├── utilities/          # Referral code generator
        └── index.ts            # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A running MongoDB instance (local or Atlas)
- AWS S3 bucket + CloudFront distribution for image storage
- Firebase project (for Google OAuth on the client)
- Gmail account with an App Password for Nodemailer
- Stripe account (for payment processing)
- Google Maps API key and Mapbox access token

### Environment Variables

Create a `.env` file in `server/` with the following keys:

```env
# MongoDB
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# CORS / Socket.IO
SOCKET_FRONTEND_URL=http://localhost:5173

# AWS
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
CLOUDFRONT_URL=https://your-cloudfront-domain/

# Email (Nodemailer)
NODEMAILER_USER=youraddress@gmail.com
NODEMAILER_PASS=your-gmail-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
```

Create a `.env` file in `client/` with the following keys:

```env
# Firebase
VITE_GOOGLE_API_KEY=AIza...
VITE_HDOMAIN=your-app.firebaseapp.com
VITE_JECTID=your-project-id
VITE_RAGEBUCKET=your-app.appspot.com
VITE_SAGING_SENDER_ID=1234567890
VITE_ID=1:1234567890:web:abc123

# Maps
VITE_GOOGLE_MAPS_KEY=AIza...
VITE_MAPBOX_TOKEN=pk.eyJ...

# Backend URL
VITE_BASE_URL=http://localhost:3000
```

### Running Locally

**Backend**

```bash
cd server
npm install
npm start          # runs tsc -w in parallel with nodemon dist/index.js
```

The server starts on `http://localhost:3000`. Hit `/health` to confirm it is up.

**Frontend**

```bash
cd client
npm install
npm start          # vite dev server, default port 5173
```

---

## API Reference

All routes that require authentication expect a `Bearer <token>` header.

### User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create a new user account |
| POST | `/checkUser` | — | Check if email/mobile is already registered |
| POST | `/identification` | — | Upload government ID image |
| POST | `/uploadUserImage` | — | Upload profile photo |
| POST | `/checkLoginUser` | — | Email/password login |
| POST | `/checkGoogleLoginUser` | — | Google OAuth login |
| GET | `/userData` | ✓ | Get logged-in user's data |
| GET | `/getCurrentRide` | ✓ | Get active ride details |
| POST | `/payment` | ✓ | Wallet payment for a ride |
| POST | `/payment-stripe` | ✓ | Stripe payment for a ride |
| GET | `/getAllrides` | ✓ | Full ride history |
| GET | `/getRideDetails` | ✓ | Details of a specific ride |
| POST | `/feedback` | ✓ | Submit ride feedback and rating |
| POST | `/profileUpdate` | ✓ | Update profile info |
| POST | `/addWalletBalance` | ✓ | Top up wallet |

### Driver

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/driver/checkDriver` | — | Check if driver email exists |
| POST | `/driver/registerDriver` | — | Create driver account |
| POST | `/driver/identification` | — | Upload Aadhaar and license images |
| POST | `/driver/uploadDriverImage` | — | Upload driver profile photo |
| POST | `/driver/location` | — | Set driver's base location |
| POST | `/driver/vehicleDetails` | — | Upload vehicle RC and car image |
| POST | `/driver/checkLoginDriver` | — | Email/password login |
| POST | `/driver/checkGoogleLoginDriver` | — | Google OAuth login |
| GET | `/driver/getCurrentRide` | ✓ | Get active ride |
| GET | `/driver/getAllrides` | ✓ | Ride history |
| GET | `/driver/getRideDetails` | ✓ | Details of a specific ride |
| GET | `/driver/dashboardData` | ✓ | Earnings and ride stats |
| GET | `/driver/driverData` | ✓ | Driver profile data |
| POST | `/driver/profileUpdate` | ✓ | Update profile |
| GET | `/driver/updateStatus` | ✓ | Toggle availability |

### Safety

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/safety/sos/trigger` | ✓ | Trigger SOS — emails all emergency contacts |
| GET | `/safety/sos/history` | ✓ | Get user's SOS alert history |
| GET | `/safety/contacts` | ✓ | List emergency contacts |
| POST | `/safety/contacts` | ✓ | Add emergency contact |
| DELETE | `/safety/contacts/:contactId` | ✓ | Remove emergency contact |
| POST | `/safety/incidents` | ✓ | Report an incident with location |
| GET | `/safety/heatmap` | ✓ | Incident heatmap data |
| GET | `/safety/danger-score` | ✓ | Route danger score |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/login` | — | Admin login |
| GET | `/admin/pendingDrivers` | ✓ | List drivers awaiting verification |
| GET | `/admin/verifiedDrivers` | ✓ | List verified drivers |
| GET | `/admin/blockedDrivers` | ✓ | List blocked drivers |
| GET | `/admin/driverData` | ✓ | Driver details by ID |
| GET | `/admin/verifyDriver` | ✓ | Approve a driver |
| POST | `/admin/rejectDriver` | ✓ | Reject a driver |
| POST | `/admin/updateDriverStatus` | ✓ | Block / warn / reinstate a driver |
| GET | `/admin/verifiedUsers` | ✓ | List verified users |
| GET | `/admin/pendingUsers` | ✓ | List pending users |
| GET | `/admin/blockedUsers` | ✓ | List blocked users |
| GET | `/admin/userData` | ✓ | User details by ID |
| GET | `/admin/verifyUser` | ✓ | Approve a user |
| POST | `/admin/rejectUser` | ✓ | Reject a user |
| POST | `/admin/updateUserStatus` | ✓ | Block / warn / reinstate a user |
| GET | `/admin/getDashboardData` | ✓ | Platform stats |
| GET | `/admin/driverFeedbacks` | ✓ | All driver feedback and ratings |
| GET | `/admin/getDriverRides` | ✓ | Ride history for a driver |
| GET | `/admin/safety/sos` | ✓ | All SOS alerts |
| POST | `/admin/safety/sos/resolve` | ✓ | Resolve an SOS alert |
| GET | `/admin/safety/incidents` | ✓ | All incident reports |
| POST | `/admin/safety/incidents/status` | ✓ | Update incident status + admin notes |

---

## Socket Events

The backend runs a Socket.IO server on the same HTTP server as Express.

| Event (client → server) | Payload | Description |
|---|---|---|
| `getNearByDrivers` | `RideDetails` | Broadcast a ride request to nearby drivers |
| `driverLocation` | `latitude, longitude` | Driver sends live location; triggers `newRideRequest` if within 5 km of pickup |
| `acceptRide` | `RideDetails` | Driver accepts a ride; creates a Ride document and emits `driverConfirmation` |
| `forUser` | `ride_id` | Relay confirmation to the user side (`userConfirmation`) |
| `verifyRide` | `pin` | Validate 6-digit ride PIN; emits `rideConfirmed` on success |
| `driverRideFinish` | — | Driver ends the ride; triggers `userPaymentPage` |
| `paymentCompleted` | `paymentMode, amount` | User confirms payment; emits `driverPaymentSuccess` |
| `rideCancelled` | `ride_id` | Cancel a ride, update DB, free the driver |
| `chat` | `chatObject` | Relay in-ride chat message to all connected clients |

---

 