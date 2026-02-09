// Sample Firestore Data Structure
// Copy this data into your Firebase Console to create sample teams

// INSTRUCTIONS:
// 1. Go to Firebase Console > Firestore Database
// 2. Click "Start Collection"
// 3. Collection ID: "teams"
// 4. Add documents using the data below

// Team 1
{
    "teamCode": "TEAM001",
        "teamName": "Team Alpha",
            "currentRound": 1,
                "route": [
                    {
                        "round": 1,
                        "locationId": "A1",
                        "riddle": "I have keys but no locks, space but no room. You can enter but can't go outside. What am I?"
                    },
                    {
                        "round": 2,
                        "locationId": "B5",
                        "riddle": "I'm light as a feather, yet the strongest person can't hold me for long. What am I?"
                    },
                    {
                        "round": 3,
                        "locationId": "C2",
                        "riddle": "What has a head and tail but no body?"
                    },
                    {
                        "round": 4,
                        "locationId": "FINAL",
                        "riddle": "Congratulations! Head to the final destination!"
                    }
                ],
                    "scans": [],
                        "startTime": "2026-02-07T09:00:00Z",
                            "completedAt": null
}

// Team 2
{
    "teamCode": "TEAM002",
        "teamName": "Team Beta",
            "currentRound": 1,
                "route": [
                    {
                        "round": 1,
                        "locationId": "B2",
                        "riddle": "What runs but never walks, has a mouth but never talks?"
                    },
                    {
                        "round": 2,
                        "locationId": "A3",
                        "riddle": "The more you take, the more you leave behind. What am I?"
                    },
                    {
                        "round": 3,
                        "locationId": "D1",
                        "riddle": "What can travel around the world while staying in a corner?"
                    },
                    {
                        "round": 4,
                        "locationId": "FINAL",
                        "riddle": "Congratulations! Head to the final destination!"
                    }
                ],
                    "scans": [],
                        "startTime": "2026-02-07T09:00:00Z",
                            "completedAt": null
}

// Team 3
{
    "teamCode": "TEAM003",
        "teamName": "Team Gamma",
            "currentRound": 1,
                "route": [
                    {
                        "round": 1,
                        "locationId": "C5",
                        "riddle": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"
                    },
                    {
                        "round": 2,
                        "locationId": "D4",
                        "riddle": "What begins with T, ends with T, and has T in it?"
                    },
                    {
                        "round": 3,
                        "locationId": "A2",
                        "riddle": "I'm tall when I'm young, and I'm short when I'm old. What am I?"
                    },
                    {
                        "round": 4,
                        "locationId": "FINAL",
                        "riddle": "Congratulations! Head to the final destination!"
                    }
                ],
                    "scans": [],
                        "startTime": "2026-02-07T09:00:00Z",
                            "completedAt": null
}

// OPTIONAL: Locations Collection
// Collection ID: "locations"

{
    "locationId": "A1",
        "locationName": "Library Entrance",
            "description": "Main entrance to the library building"
}

{
    "locationId": "B5",
        "locationName": "Science Lab",
            "description": "Chemistry laboratory on the second floor"
}

{
    "locationId": "C2",
        "locationName": "Sports Complex",
            "description": "Basketball court area"
}

{
    "locationId": "FINAL",
        "locationName": "Auditorium",
            "description": "Main auditorium final destination"
}
