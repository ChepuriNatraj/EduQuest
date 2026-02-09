# EduMoon Treasure Hunt Application

A Firebase-based treasure hunt web application with QR code scanning, team tracking, and real-time admin dashboard.

## Features

- 🔍 **QR Code Scanning**: Teams scan QR codes at locations to validate their progress
- 🎯 **Riddle Display**: Progressive riddles guide teams through the hunt
- 📊 **Real-time Admin Dashboard**: Live tracking of all teams' progress
- 🏆 **Leaderboard**: Automatic ranking by completion time
- 📱 **Mobile-Optimized**: Responsive design for all devices
- 🎨 **Premium UI**: Modern glassmorphism design with EduMoon branding

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy your Firebase configuration
4. Update `src/config/firebase-config.ts` with your credentials
5. Update `.firebaserc` with your project ID

### 3. Set Up Firestore Database

In the Firebase Console, create a `teams` collection with sample documents:

```javascript
{
  teamCode: "TEAM001",
  teamName: "Team Alpha",
  currentRound: 1,
  route: [
    { round: 1, locationId: "A1", riddle: "I have keys but no locks. What am I?" },
    { round: 2, locationId: "B5", riddle: "I'm light as a feather, yet the strongest person can't hold me for long. What am I?" },
    { round: 3, locationId: "C2", riddle: "What has a head and tail but no body?" },
    { round: 4, locationId: "FINAL", riddle: "Congratulations! Head to the final destination!" }
  ],
  scans: [],
  startTime: "2026-02-07T14:00:00Z",
  completedAt: null
}
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## Pages

- **Home** (`/`): Landing page with navigation
- **Scan** (`/scan?loc=LOCATION_ID`): QR code validation page
- **Admin** (`/admin`): Real-time dashboard and leaderboard

## QR Code Setup

Generate QR codes that link to:
```
https://your-domain.com/scan?loc=A1
https://your-domain.com/scan?loc=B5
https://your-domain.com/scan?loc=C2
https://your-domain.com/scan?loc=FINAL
```

Place these QR codes at the corresponding physical locations.

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase login
firebase deploy
```

## Technology Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Routing**: React Router DOM

## License

MIT

---

Powered by **EduMoon Student Clubs**
