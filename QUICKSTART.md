# 🎯 EduMoon Treasure Hunt - Quick Start Guide

## ✅ What's Been Built

Your treasure hunt application is **100% complete** and ready to use! Here's what you have:

### Application Features
- 🏠 **Home Page** with EduMoon branding and navigation
- 📱 **QR Scan Page** for team code validation and riddle display
- 📊 **Real-time Admin Dashboard** with live tracking and leaderboard
- 🎨 **Premium UI** with glassmorphism effects and gradient designs
- 📱 **Mobile-Responsive** design for all devices

### Dev Server Status
✅ **Running at**: http://localhost:5173

---

## 🚀 Next Steps (Required to Use the App)

### 1. Set Up Firebase (15 minutes)

**A. Create Firebase Project**
1. Visit https://console.firebase.google.com
2. Click "Add project"
3. Name it (e.g., "edumooon-treasure-hunt")
4. Disable Google Analytics (optional)
5. Click "Create project"

**B. Enable Firestore**
1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select your region
5. Click "Enable"

**C. Get Firebase Credentials**
1. Click Settings icon (⚙️) → "Project settings"
2. Scroll down to "Your apps"
3. Click web icon (</>) to add a web app
4. Register app with nickname "Treasure Hunt"
5. Copy the `firebaseConfig` object

**D. Update Your Code**
1. Open `d:\Treasure Hunt\src\config\firebase-config.ts`
2. Replace the placeholder values with your credentials:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",          // ← Replace this
     authDomain: "...",                // ← And this
     projectId: "...",                 // ← And this
     storageBucket: "...",             // ← And this
     messagingSenderId: "...",         // ← And this
     appId: "..."                      // ← And this
   };
   ```

3. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id"   // ← Replace this
     }
   }
   ```

### 2. Add Sample Teams to Firestore

**Option A: Manual (Recommended for Learning)**
1. In Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `teams`
4. Add document with ID: `team001`
5. Copy data from `sample-data.js` and add fields manually

**Option B: Import JSON**
Use the sample data from `sample-data.js` file (contains 3 pre-configured teams)

### 3. Test the Application

**A. Test QR Scan Page**
1. Visit: http://localhost:5173/scan?loc=A1
2. Enter team code: `TEAM001`
3. Click Submit
4. You should see the riddle for round 2!

**B. Test Admin Dashboard**
1. Visit: http://localhost:5173/admin
2. You should see all teams listed
3. Try scanning from another device/tab
4. Watch the dashboard update in real-time!

### 4. Generate QR Codes

Use any QR code generator (e.g., https://qr-code-generator.com):

For TEAM001's route:
- Round 1: `https://your-domain.com/scan?loc=A1`
- Round 2: `https://your-domain.com/scan?loc=B5`
- Round 3: `https://your-domain.com/scan?loc=C2`
- Round 4: `https://your-domain.com/scan?loc=FINAL`

Print and place these at the corresponding physical locations!

---

## 📁 Project Structure

```
d:\Treasure Hunt\
├── assets/            # EduMoon logos (already integrated)
├── src/
│   ├── components/    # TeamCard component
│   ├── pages/         # ScanPage, AdminDashboard
│   ├── config/        # Firebase configuration ← UPDATE THIS
│   ├── utils/         # Firebase helper functions
│   ├── App.tsx        # Main router
│   ├── main.tsx       # React entry
│   └── index.css      # Design system
├── sample-data.js     # Sample team data to add to Firestore
├── README.md          # Detailed documentation
└── package.json       # Dependencies (already installed)
```

---

## 🎨 How to Access the App

**Right Now (Local Development):**
- Home: http://localhost:5173
- Scan: http://localhost:5173/scan?loc=TEST
- Admin: http://localhost:5173/admin

**After Deployment:**
```bash
npm run build
firebase deploy
```
Your app will be at: `https://your-project-id.web.app`

---

## 📝 Sample Teams Included

| Team Code | Team Name   | Route            |
|-----------|-------------|------------------|
| TEAM001   | Team Alpha  | A1→B5→C2→FINAL  |
| TEAM002   | Team Beta   | B2→A3→D1→FINAL  |
| TEAM003   | Team Gamma  | C5→D4→A2→FINAL  |

Each team has unique riddles for each round!

---

## 🎯 How the Hunt Works

1. **Teams arrive** and get their team code (e.g., TEAM001)
2. **Find QR code** at starting location
3. **Scan QR code** → opens `/scan?loc=A1`
4. **Enter team code** → validates they're at correct location
5. **Get next riddle** → guides them to next location
6. **Repeat** for 4 rounds total
7. **Admin watches** real-time progress on dashboard
8. **Leaderboard** shows fastest completion times

---

## 💡 Pro Tips

- **Customize Riddles**: Edit routes in `sample-data.js` before adding to Firestore
- **Add More Teams**: Just add more documents to the `teams` collection
- **Change Locations**: Update the `locationId` values in team routes
- **Adjust Rounds**: Currently set to 4 rounds, easily extensible

---

## 🆘 Need Help?

Check these files:
- **Setup Guide**: `README.md`
- **Sample Data**: `sample-data.js`
- **Implementation Details**: See artifacts in `.gemini/antigravity/brain/`

**Common Issues:**
- "Invalid team code" → Make sure you added teams to Firestore
- "Firebase not configured" → Update `firebase-config.ts` with your credentials
- Database errors → Check Firestore rules allow read/write

---

**🎉 Your treasure hunt app is ready! Just configure Firebase and start playing!**

---

*Powered by EduMoon Student Clubs*
