# MissionConnect

**MissionConnect** is a mobile application designed to enhance the efficiency and organization of LDS missionaries. By replacing paper planners with a digital tool, MissionConnect helps missionaries manage contacts, record visit histories, and visualize their schedules on an interactive map. This app simplifies their daily activities, making missionary work more accessible, organized, and efficient.

## Table of Contents
- [Purpose](#purpose)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Purpose

The primary purpose of **MissionConnect** is to provide a digital solution for LDS missionaries to organize their contacts, visits, and tasks more efficiently. The app eliminates the reliance on physical notebooks and paper planners, offering a streamlined and secure platform to track interactions, store contact information, and plan future visits.

## Features

### 1. User Authentication & Profiles
- Secure authentication via JWT tokens.
- Each user has a personal profile to store and view their data and preferences.
- Ensures data privacy, syncing only to the logged-in user.

### 2. Contact Management System
- Ability to create, edit, and delete contact information (name, address, phone, etc.).
- Tracks contact status (e.g., interested, teaching, not interested).
- Option to upload profile pictures or assign tags for better contact management.

### 3. Map Integration & Location Marking
- Integrated map using Google Maps API or Mapbox for visualizing contact locations.
- Pin specific locations for each contact for efficient visit planning.
- View clusters of contacts and navigate easily between appointments.

### 4. Notes & Visit History
- Record detailed notes for each contact, including lessons taught and follow-up plans.
- Timestamped and editable visit history for continuity.
- Helps maintain a clear history of interactions between companions and transfers.

### 5. Search, Sort, and Filter Options
- Search contacts by name, status, or other parameters.
- Sort and filter contacts based on criteria such as location or status to prioritize tasks.

### 6. Calendar & Visit Scheduling
- Interactive calendar view showing all scheduled visits.
- Schedule, edit, and delete visits with intuitive date and time pickers.
- Visual clock interface for selecting visit times.

## Technology Stack

- **Frontend**: React Native with Expo for cross-platform mobile support (iOS & Android).
- **Backend**: Node.js and Express.js for the server-side logic.
- **Database**: MongoDB for storing user and contact data securely.
- **Map Integration**: Google Maps API or Mapbox for mapping and location services.
- **Authentication**: JWT (JSON Web Tokens) for secure user authentication.
- **Testing**: Jest for unit and integration testing on the backend.
- **Containerization**: Docker & Docker Compose for easy local and production deployment.

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **Docker & Docker Compose** (recommended for running MongoDB)
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Verify installation: `docker --version` and `docker-compose --version`

4. **MongoDB** (optional - use Docker Compose instead)
   - If not using Docker, install from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Verify installation: `mongosh --version`

5. **Java & Android SDK** (optional - for Android development)
   - Android Studio includes both Java and Android SDK
   - Download from [android.com](https://developer.android.com/studio)

6. **Xcode** (optional - for iOS development on macOS)
   - Download from App Store or [apple.com](https://developer.apple.com/xcode/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/imarenco/MissionConnect.git
cd MissionConnect
```

### Step 2: Set Up Environment Variables

Copy the example environment file and create your own `.env` file:

```bash
cp env.example .env
```

Edit the `.env` file with your preferred settings. Default values work for local development:

```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://mongodb:27017/missionconnect
MONGO_DATABASE=missionconnect
JWT_SECRET=your-secret-key-change-in-production
ALLOWED_ORIGINS=*
```

**Important**: For production, change `JWT_SECRET` to a secure random string and set `ALLOWED_ORIGINS` to your specific domain.

### Step 3: Set Up MongoDB

#### Option A: Using Docker Compose (Recommended)

```bash
# Start MongoDB and the backend server together
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose -f docker-compose.dev.yml ps
```

#### Option B: Local MongoDB Installation

If you have MongoDB installed locally:

```bash
# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Or on Windows/Linux, follow MongoDB documentation
```

Then update `.env`:
```env
MONGO_URI=mongodb://localhost:27017/missionconnect
```

### Step 4: Install Server Dependencies

```bash
cd server
npm install
cd ..
```

### Step 5: Install Mobile Dependencies

```bash
cd mobile
npm install
cd ..
```

### Step 6: Create Test User Accounts (Optional)

When you first run the app, you can create an account via the registration screen. Test credentials can be:
- **Email**: missionary@example.com
- **Password**: TestPassword123
- **Name**: Test Missionary

## Running the Application

### Running the Backend Server

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start both MongoDB and backend server
docker-compose -f docker-compose.dev.yml up

# To run in the background
docker-compose -f docker-compose.dev.yml up -d

# To stop the services
docker-compose -f docker-compose.dev.yml down

# View server logs
docker-compose -f docker-compose.dev.yml logs backend -f

# View MongoDB logs
docker-compose -f docker-compose.dev.yml logs mongodb -f
```

#### Option 2: Manual Start (No Docker)

```bash
cd server
npm run dev
```

The server will run at `http://localhost:3001`

### Running the Mobile App

#### Option 1: Using Expo Go (Easiest)

```bash
cd mobile
npx expo start
```

Follow the terminal instructions to:
- Scan QR code with Expo Go app (available on iOS/Android app stores)
- Or press `a` for Android Emulator or `i` for iOS Simulator

#### Option 2: Android Emulator

```bash
cd mobile
npm run android
```

Requires Android Studio and an emulator setup.

#### Option 3: iOS Simulator (macOS only)

```bash
cd mobile
npm run ios
```

Requires Xcode and iOS toolchain.

### Connecting Mobile App to Backend

The mobile app needs to know where the backend server is running. Update the API configuration in `mobile/services/api.ts`:

**For Local Development:**
- iOS Simulator: `http://localhost:3001/api`
- Android Emulator: `http://10.0.2.2:3001/api`
- Physical Device: `http://<YOUR_COMPUTER_IP>:3001/api`

To find your computer's IP address:
- **macOS/Linux**: Run `ifconfig` and look for `inet` address
- **Windows**: Run `ipconfig` and look for "IPv4 Address"

The app currently uses `http://localhost:3001/api` by default. Update if needed:

```typescript
// In mobile/services/api.ts
const API_BASE_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api')
  : (process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com/api');
```

## Testing

This project uses Jest for unit and integration testing on the backend server.

### Backend Testing

Navigate to the `server` directory and run:

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- **Backend tests**: Located in `server/src/**/__tests__/**/*.test.js` or `server/src/**/*.test.js`

The backend tests use MongoDB Memory Server for isolated database testing, ensuring tests don't affect your development database.

### Example Test Files

- `server/src/controllers/__tests__/authController.test.js`
- `server/src/controllers/__tests__/contactController.test.js`
- `server/src/controllers/__tests__/visitController.test.js`
- `server/src/middleware/__tests__/auth.test.js`

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Error

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
- Ensure MongoDB is running: `docker-compose -f docker-compose.dev.yml ps`
- If using local MongoDB: `brew services start mongodb-community` (macOS)
- Check `.env` file has correct `MONGO_URI`

#### 2. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Find process using port 3001
# macOS/Linux
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# Kill the process and try again
kill -9 <PID>  # or stop the process in Task Manager
```

#### 3. Mobile App Can't Connect to Backend

**Error**: `Network Error` when trying to login

**Solution**:
- Ensure backend is running: `docker-compose -f docker-compose.dev.yml logs backend`
- Check API URL in `mobile/services/api.ts` matches your setup
- Use correct IP address for physical devices: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Ensure mobile device is on same network as backend

#### 4. Docker Issues

**Error**: `docker: command not found`

**Solution**:
- Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- Ensure Docker daemon is running

**Error**: `docker-compose: command not found`

**Solution**:
- Docker Desktop for Mac/Windows includes Docker Compose
- For Linux, install separately: `sudo apt-get install docker-compose`

#### 5. Node Modules Issues

**Error**: `Cannot find module` errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf server/node_modules mobile/node_modules
npm install  # in both server and mobile directories
```

#### 6. Expo/React Native Issues

**Error**: `Unable to resolve dependencies`

**Solution**:
```bash
cd mobile
npm install --legacy-peer-deps
```

### Getting Help

If you encounter issues not listed above:

1. Check the terminal/console for detailed error messages
2. Review Docker logs: `docker-compose logs -f`
3. Ensure all prerequisites are installed and updated
4. Try clearing cache and reinstalling dependencies
5. Check that ports 3001 (backend) and 27017 (MongoDB) are available

## Project Structure

```
MissionConnect/
├── mobile/                 # React Native Expo mobile app
│   ├── app/               # App screens and routes
│   ├── components/        # Reusable UI components
│   ├── services/          # API service layer
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── package.json
├── server/                # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration files
│   │   └── index.js       # Server entry point
│   ├── Dockerfile         # Production container
│   ├── Dockerfile.dev     # Development container
│   └── package.json
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Development compose
├── env.example            # Environment variables template
└── README.md             # This file
```


## Ignacio Favorite quote

2 Nefi 2:25: "Adam fell that men might be; and men are, that they might have joy."

## Chandler Favorite quote
"I can do this all day." - Captain America

## Josue Neiculeo
"Best pick-up lines come from programmers" - Programmers 
