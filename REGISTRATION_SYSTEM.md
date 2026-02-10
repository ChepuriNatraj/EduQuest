# Treasure Hunt - Registration & Secret Code System

## 🔐 Anti-Cheating Architecture

### Registration Flow (First 15 Teams)

1. **Admin generates 15 registration QR codes** (TEAM001 - TEAM015)
   - In Admin Dashboard → QR Generator tab
   - Select "Team Registration" 
   - Enter team code (TEAM001, TEAM002, etc.)
   - Print and distribute ONE QR per team

2. **Teams scan their unique registration QR**
   - Goes to `/register?team=TEAM001`
   - Must fill in ALL 5 team members:
     - Full Name
     - Mobile Number (10 digits)
     - Branch
     - Year of Study
   
3. **Teams create their SECRET CODE**
   - Format: 4 digits + 1 letter (e.g., `1234A`)
   - This code is ONLY for their team
   - Used for all future location scans

### Location Scanning Flow

1. **Admin places location QR codes** at physical checkpoints
   - Generate in Admin Dashboard → QR Generator
   - Select "Location Checkpoint"
   - Enter location ID (e.g., LOC_1, LOC_2, FINAL)

2. **Teams scan location QR codes**
   - Enter their SECRET CODE (not team code)
   - System validates:
     - Team is registered
     - Secret code is correct
     - Location matches their assigned route
   
3. **Anti-Cheating Features**
   - Each team has unique route/riddles (configured in admin)
   - Secret codes prevent impersonation
   - Must be registered to participate
   - Only moderators know which code belongs to which team

### Helpline System

**Moderator Numbers (displayed on all pages):**
- 8309223139
- 8309302507

**Teams call if they:**
- Forget their secret code
- Have technical issues
- Need assistance

### Admin Dashboard Features

#### 📋 Registrations Tab
- View all registered teams
- See team member details
- View secret codes
- Download CSV of all registrations
- Track pending registrations

#### 👥 Teams & Riddles Tab
- Configure custom routes per team
- Edit riddles for each round
- Track progress
- Download progress report

#### 📱 QR Generator Tab
- Generate registration QR codes (for initial signup)
- Generate location QR codes (for checkpoints)

### Security Benefits

1. **No Cheating Between Teams**: Each secret code is unique
2. **Route Enforcement**: Teams can't skip locations
3. **Registration Required**: Only registered teams can participate
4. **Moderator Oversight**: Admin can see all secret codes and registrations
5. **Audit Trail**: All scans are timestamped and recorded

### Data Downloads

Admin can download TWO types of CSV reports:

1. **Registration Report** (`treasure_hunt_registrations_YYYY-MM-DD.csv`)
   - All team member details
   - Secret codes
   - Registration times
   
2. **Progress Report** (`treasure_hunt_progress_YYYY-MM-DD.csv`)
   - Team progress through rounds
   - Completion status
   - Total scans

### Setup Checklist

- [ ] Initialize 15 teams in Admin Dashboard
- [ ] Generate 15 registration QR codes (one per team)
- [ ] Print and label registration QRs (TEAM001-TEAM015)
- [ ] Configure custom routes/riddles for each team
- [ ] Generate location QR codes (LOC_1, LOC_2, etc.)
- [ ] Place location QRs at physical checkpoints
- [ ] Distribute registration QRs to teams
- [ ] Monitor registrations in Admin Dashboard
- [ ] Have moderator phone ready for support calls

### URLs

- **Registration**: `https://your-domain.com/register?team=TEAM001`
- **Location Scan**: `https://your-domain.com/scan?loc=LOC_1`
- **Admin Dashboard**: `https://your-domain.com/admin` (PIN: 1234)

---

**Remember**: Secret codes are the KEY to preventing cheating. Only the team and moderators should know each team's code!
