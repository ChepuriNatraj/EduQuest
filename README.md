# EduMoon Treasure Hunt Application

A Firebase-based treasure hunt web application with QR code scanning, team registration, real-time progress tracking, and admin dashboard.

## 🎯 How It Works

### **Event Flow Overview**

```
1. Admin Setup → 2. Team Registration → 3. Treasure Hunt → 4. Completion → 5. Admin Review
```

---

## 📋 Complete Event Process

### **Phase 1: Admin Preparation (Before Event)**

1. **Initialize Teams**
   - Admin visits `/admin`
   - Clicks "🚀 Initialize 15 Teams" to create TEAM001 - TEAM015
   - Each team gets unique routes and riddles (from `sample-data.js`)

2. **Generate QR Codes**
   - Admin goes to "QR Codes" tab
   - Generates **4 QR codes per team** (LOC_1, LOC_2, LOC_3, LOC_4)
   - Prints QR codes and places them at physical locations

3. **Generate Registration QRs**
   - Admin goes to "Registrations" tab
   - Generates registration QR codes for each team (TEAM001 - TEAM015)
   - Distributes these QR codes to participants

### **Phase 2: Team Registration (Event Start)**

1. **Scan Registration QR**
   - Participants scan their team's registration QR code
   - Redirects to `/register?team=TEAM001`

2. **Fill Registration Form**
   - Enter 5 team members' details (Name, Mobile, Branch, Year)
   - Create a unique **Secret Code** (4 digits + 1 letter, e.g., `1234A`)
   - Submit registration

3. **Auto-Start**
   - Upon successful registration, team is redirected to `/scan?code=SECRET_CODE`
   - **First clue appears automatically** (Round 1)
   - Team progress is reset to Round 0

### **Phase 3: Treasure Hunt (Main Gameplay)**

1. **Read Clue**
   - Team sees their current riddle/clue
   - They solve the riddle to find the location

2. **Navigate to Location**
   - Team physically moves to the location described by the riddle
   - They find the QR code placed there (e.g., LOC_1)

3. **Scan QR Code**
   - Open the QR scanner app and scan
   - Redirects to `/scan?loc=LOC_1`
   - Enter their **Secret Code**

4. **Validation**
   - **Correct Location**: ✅ "ACCESS GRANTED!" → Next clue appears
   - **Wrong Location**: ⚠️ "LOCATION MISMATCH" → Helpful error message
   - **Already Visited**: ⚠️ "You've already visited this spot..."
   - **Invalid Code**: ❌ "Invalid code. Please check..."

5. **Progress Through Rounds**
   - Repeat steps 1-4 for all 4 rounds
   - Each successful scan advances to the next round

6. **Final Round**
   - After completing Round 3, team gets the **Final Clue** (Round 4)
   - Scan the final location (LOC_4)
   - 🏆 **TREASURE FOUND!** → Hunt completed

### **Phase 4: Real-Time Admin Monitoring**

**Admin Dashboard** (`/admin`) provides:

- **Live Team Progress**
  - Current round for each team
  - Completion status
  - Time tracking

- **Real-Time Notifications**
  - 🚀 Toast popup when a team completes a round
  - 🏆 Toast popup when a team finishes the hunt

- **Registration Tracking**
  - View all registered teams
  - Download registration details as CSV

- **Progress Export**
  - Download progress report as CSV
  - See total scans, completion times, current rounds

- **Team Management**
  - Edit team routes and riddles
  - Reset all teams to initial state (for testing)

---

## 👥 User Roles & Access

### **Participants (Teams)**

**Access:**
- Registration Page (`/register?team=TEAMXXX`)
- Scan Page (`/scan?loc=LOC_X&code=SECRET_CODE`)
- Instructions Modal (How to Play)

**Capabilities:**
- Register with team details
- Create secret code
- Scan QR codes at locations
- View current clue
- See next riddle after successful scan
- Track own progress (via clues)

**Restrictions:**
- Cannot view other teams' progress
- Cannot access admin dashboard
- Cannot edit routes or riddles

### **Admin**

**Access:**
- Admin Dashboard (`/admin`)
  - Teams Tab
  - QR Codes Tab
  - Registrations Tab

**Capabilities:**
- **Team Management**
  - Initialize 15 teams
  - Edit team names
  - Edit routes and riddles for each team
  - Reset all teams to Round 0

- **QR Code Generation**
  - Generate location QR codes (LOC_1 to LOC_4)
  - Generate registration QR codes
  - Print view for easy printing

- **Live Monitoring**
  - View all teams' current round
  - See completion status in real-time
  - Receive toast notifications for progress updates

- **Data Export**
  - Download registration details (CSV)
  - Download progress report (CSV)

- **Event Control**
  - Reset teams for testing
  - Update routes mid-event if needed

**Restrictions:**
- Cannot scan QRs on behalf of teams
- Cannot view teams' secret codes (security)

---

## 🛤️ User Journey Paths

### **Path 1: New Team (First Time)**

```
Registration QR Scan
  ↓
/register?team=TEAM001
  ↓
Fill Form + Create Secret Code
  ↓
"Registration Complete!"
  ↓
/scan?code=1234A (Auto-redirect)
  ↓
First Clue Auto-Displays
  ↓
[Solve Riddle → Find Location → Scan LOC_1]
  ↓
/scan?loc=LOC_1
  ↓
Enter Secret Code → Validate
  ↓
✅ Next Clue → Repeat for Rounds 2, 3, 4
  ↓
🏆 TREASURE FOUND!
```

### **Path 2: Returning Team (Already Registered)**

```
Registration QR Scan
  ↓
/register?team=TEAM001
  ↓
"Already Registered!" → Shows Secret Code
  ↓
Click "Continue Treasure Hunt"
  ↓
/scan?loc=LOC_1&code=1234A
  ↓
[Continue from current round]
```

### **Path 3: Wrong Location Scanned**

```
Scan LOC_4 (Final) while at Round 1
  ↓
/scan?loc=LOC_4
  ↓
Enter Secret Code
  ↓
⚠️ "LOCATION MISMATCH: You are at Round 4, but need Round 1"
  ↓
Click "📜 Check My Clue"
  ↓
Current Clue Displayed
  ↓
[Navigate to correct location]
```

### **Path 4: Admin Monitoring**

```
Open /admin
  ↓
View "Teams" Tab
  ↓
[Live updates as teams scan QRs]
  ↓
🚀 Toast: "Team 1 completed Round 2!"
  ↓
🏆 Toast: "Team 5 FINISHED the hunt!"
  ↓
Download Progress Report
```

---

## 🔧 Setup Instructions

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

### 3. Initialize Teams

1. Run the development server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:5173/admin`
3. Click "🚀 Initialize 15 Teams"
4. Teams TEAM001 - TEAM015 are created in Firestore

### 4. Generate QR Codes

1. Go to "QR Codes" tab in Admin Dashboard
2. Generate location QR codes (LOC_1, LOC_2, LOC_3, LOC_4)
3. Print and place at physical locations
4. Generate registration QR codes for teams
5. Distribute to participants

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## 📱 Pages & Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Home/Landing Page | Public |
| `/register?team=TEAMXXX` | Team Registration | Participants |
| `/scan?loc=LOC_X&code=SECRET` | QR Validation & Clue Display | Participants |
| `/admin` | Admin Dashboard | Admin Only |
| `/qr-stickers` | Printable QR Stickers | Admin Only |

---

## 🎨 Key Features

- ✅ **Fuzzy Location Matching**: LOC_1, LOC_2, etc. work across all teams
- ✅ **Auto-Clue Display**: First clue appears after registration
- ✅ **Progress Reset**: Re-registration clears previous testing data
- ✅ **Wrong Location Feedback**: Specific warnings for wrong scans
- ✅ **Real-Time Notifications**: Admin sees live progress updates
- ✅ **Mobile Responsive**: Works on all screen sizes
- ✅ **Premium UI**: Glassmorphism design with EduMoon branding

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase login
firebase deploy
```

---

## 💻 Technology Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase Firestore (Real-time Database)
- **Hosting**: Firebase Hosting
- **Routing**: React Router DOM
- **QR Codes**: react-qr-code library

---

## 📞 Support

For event support, contact:
- **Phone**: 8309223139 or 8309302507

---

**Powered by EduMoon Student Clubs**
