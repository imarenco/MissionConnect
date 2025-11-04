# MissionConnect

**MissionConnect** is a mobile application designed to enhance the efficiency and organization of LDS missionaries. By replacing paper planners with a digital tool, MissionConnect helps missionaries manage contacts, record visit histories, and visualize their schedules on an interactive map. This app simplifies their daily activities, making missionary work more accessible, organized, and efficient.

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

## Technology Stack

- **Frontend**: React Native for cross-platform mobile support (iOS & Android).
- **Backend**: Node.js and Express.js for the server-side logic.
- **Database**: MongoDB for storing user and contact data securely.
- **Map Integration**: Google Maps API or Mapbox for mapping and location services.
- **Authentication**: JWT (JSON Web Tokens) for secure user authentication.

## Ignacio Favorite quote

2 Nefi 2:25: "Adam fell that men might be; and men are, that they might have joy."