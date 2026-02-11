// Sample Firestore Data Structure
// Copy this data into your Firebase Console to create sample teams

// INSTRUCTIONS:
// 1. Go to Firebase Console > Firestore Database
// 2. Click "Start Collection"
// 3. Collection ID: "teams"
// 4. Add documents using the data below (or write a script to import this array)

/*
  NOTE: 
  - Location IDs are set to TEAMx_LOCy (e.g., T1_L1) for uniqueness.
  - The final location is set to "FINAL_LOC" for all teams as they share the same final riddle.
  - You (Admin) will need to print QR codes for these Location IDs (T1_L1, T1_L2, etc.) 
    and place them at the spots described by the riddles.
*/

export const sampleTeams = [
    // Team 1
    {
        "teamCode": "TEAM001",
        "teamName": "Team 1",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "If (hunger == true)\n{\n   Go where chairs wait,\n   Plates smile,\n   And the name itself calls you in.\n}" },
            { "round": 2, "locationId": "LOC_2", "riddle": "Exam time lo students andariki common destination \nOriginals ki rest,duplicates ki full duty.\nFood kosam kaadu,papers kosam famous ayina place ekkada?" },
            { "round": 3, "locationId": "LOC_3", "riddle": "I start with go but never move\n  I end with sip but I dont drink\n  yet everyone come to taste, talk, monger." },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 2
    {
        "teamCode": "TEAM002",
        "teamName": "Team 2",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "It kadhu core kadhu\n rendu sides ki passport una branch." },
            { "round": 2, "locationId": "LOC_2", "riddle": "music kadhu kani instruments full \nKasta padaru Kani readings cheptaru ee dept lo mistake ki chance zero" },
            { "round": 3, "locationId": "LOC_3", "riddle": "circles touch the sky,\nfield that never plays a match,\nhighest arrivals-yet \nIn AU its the best shortcut to many depts" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 3
    {
        "teamCode": "TEAM003",
        "teamName": "Team 3",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "High voltage dreams low voltage of concentration" },
            { "round": 2, "locationId": "LOC_2", "riddle": "Class kaadu, canteen kaadu on these cement benches moments turn into stories. Lunch, laughter, late hours—ee contrast place ekkada undo cheppu." },
            { "round": 3, "locationId": "LOC_3", "riddle": "Near the main gate where the place is meant to get the students placed." },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 4
    {
        "teamCode": "TEAM004",
        "teamName": "Team 4",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Gears everywhere ;girls are rare\n if u spot one u are already there(girls are limited)." },
            { "round": 2, "locationId": "LOC_2", "riddle": "2 letters 1 court many games 1 spot." },
            { "round": 3, "locationId": "LOC_3", "riddle": "Big names await, inspiration wall lo. chinna spot lo.  NCRC ku samipe. Look and inspire to dream . Next clue ikkadey, memory keep! 😉" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 5
    {
        "teamCode": "TEAM005",
        "teamName": "Team 5",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "My job is safety, rules and care ignoring me leads to chemical danger." },
            { "round": 2, "locationId": "LOC_2", "riddle": "Morning time lo plates full, tables meeda college updates full. \nIkkada tiffins soft ga untayi, gossip matram strong ga untadi. \nStudents kanna professors ekkuva kanipinche aa spot ni vethuku." },
            { "round": 3, "locationId": "LOC_3", "riddle": "Where knowledge speaks and echoes roam. Big hall, buddha calm, feels like home. Sneaky path links Mech to gallery side. Students pass fast, no need to hide.  Treasure waits ikkadey, just step inside!" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 6
    {
        "teamCode": "TEAM006",
        "teamName": "Team 6",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Straight line vesina marks ravu curve lo logic petii frame build chestaru dust lo dreams helmet lo hope where place contains drawings more than letters." },
            { "round": 2, "locationId": "LOC_2", "riddle": "if(classEnded)\nstudents = totalStudents / 2;\nif(hunger && students >= totalStudents/2)\norder(\"Maggie\", \"Sandwich\");\nwhile(students > 0)\nstay_here();" },
            { "round": 3, "locationId": "LOC_3", "riddle": "Out gate daggara, unique building wait chestundi. Events anni ikkadey, excitement spread chestundi. Freshers to TEDx, stage lo stars shine, Crowd, lights, energy—feel the vibe fine. Treasure ikkadey hide, seek before time!" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 7
    {
        "teamCode": "TEAM007",
        "teamName": "Team 7",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "this dept speak 0s and 1s." },
            { "round": 2, "locationId": "LOC_2", "riddle": "Two benches rest, a tree stands tall,  \nWhispers of shade welcome all.  \nOpposite hall with Cotton’s name,  \nA quiet corner hides the game.  \nSit, look, your treasure waits near the call." },
            { "round": 3, "locationId": "LOC_3", "riddle": "“If HUB = 1\nand Court = 2\nYour answer lies at (1 → behind → 2).\nFind the place where:\nNet ≠ Internet\nbut Game = Set.”" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 8
    {
        "teamCode": "TEAM008",
        "teamName": "Team 8",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "this dept has maps on walls and the gl0bes that spin,\n millions of years sit silent and still decoded by those who study earth’s will \nwhere pressure and heat may change my form like this dept that studies GAIAs norm" },
            { "round": 2, "locationId": "LOC_2", "riddle": "Ikkada plates lo puff, dil pasand, untayi😋\nLanguage thoda different, smiles soft 😄\nForeign friends hangout spot,\nEe adda kanukko" },
            { "round": 3, "locationId": "LOC_3", "riddle": "\"Where chemicals brew and experiments play,\nPakkana nilabadi, a silent figure stays.\nBank kuda daggara, keeping its eyes,\nNext step waits, right before your eyes!\"" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 9
    {
        "teamCode": "TEAM009",
        "teamName": "Team 9",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Cash matramey kadhu trust kuda safe ga unde place lo me next clue waiting." },
            { "round": 2, "locationId": "LOC_2", "riddle": "First timers matrame ikkada untaru 😏\nUniversity journey start avutundi, \nNavigate Carefully Rising-learners Classrooms await" },
            { "round": 3, "locationId": "LOC_3", "riddle": "student dresscode always changes\n but veela dress code unchangeable bcoz its inevitable for them for us to recognize" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 10
    {
        "teamCode": "TEAM010",
        "teamName": "Team 10",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "classes kosam building katti chilling kosam famous aindi" },
            { "round": 2, "locationId": "LOC_2", "riddle": "time=afternoon\n       hunger=yes\n       budget=small\n       food=tasty and fast\n       location=vijay+wada" },
            { "round": 3, "locationId": "LOC_3", "riddle": "Big hall lo fitness wait chestundi,  \nPakkana courts lo players busy untaru.  \nKani chala mandhi ki place  undhi ani teladu,  \nNext clue ikkade hide, just take a look around! 😉" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 11
    {
        "teamCode": "TEAM011",
        "teamName": "Team 11",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Where metals melt the hunt gets hot find me" },
            { "round": 2, "locationId": "LOC_2", "riddle": "Ee dept lo bugs code lo kadhu attendance lo ekkuva." },
            { "round": 3, "locationId": "LOC_3", "riddle": "Entry=true exit=true but only through one structure which when crossed meets the ignited minds inside the loop" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 12
    {
        "teamCode": "TEAM012",
        "teamName": "Team 12",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Born from lines and life on sheets before buildings rise I am where ideas meet" },
            { "round": 2, "locationId": "LOC_2", "riddle": "if(club == true && coding == true)\nlocation = assigned_room;\n(hint=edoc+I+AM)" },
            { "round": 3, "locationId": "LOC_3", "riddle": "Ideas puttina chotu pakkana,\nAakali teerina sound kuda vinipistundi.\nLopala antha control,\nEe line cross ayithe freedom full OUT\nEe boundary ekkada?" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 13
    {
        "teamCode": "TEAM013",
        "teamName": "Team 13",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Water kanapadadhu Kani ocean dreams full ga untundi" },
            { "round": 2, "locationId": "LOC_2", "riddle": "C – Concepts  \nC – Creativity  \nR – Rows  \nC – Chalkboards  \nDecode C-C-R-C, your next treasure awaits there!" },
            { "round": 3, "locationId": "LOC_3", "riddle": "Debugging inside deparking outside. Which dept🤔" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 14
    {
        "teamCode": "TEAM014",
        "teamName": "Team 14",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Chadavadam kosam kadhu time pass and couples kosam famous place" },
            { "round": 2, "locationId": "LOC_2", "riddle": "Hunger vastey mind lo bing ani 1st ring aye place Enti???" },
            { "round": 3, "locationId": "LOC_3", "riddle": "Akali ni apesey place dagra,racket sound vinipinche chotu" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    },

    // Team 15
    {
        "teamCode": "TEAM015",
        "teamName": "Team 15",
        "currentRound": 0,
        "route": [
            { "round": 1, "locationId": "LOC_1", "riddle": "Tc and certificates line,\n ee building patience full time signature matram chala prime" },
            { "round": 2, "locationId": "LOC_2", "riddle": "Main junction daggara, kani chinna secret gate, physics minds matrame notice chestaru — treasure ikkadey!" },
            { "round": 3, "locationId": "LOC_3", "riddle": "Deeniki peru ledu purpose ledu but its a booming on-going building  in the boundaries of AUCE" },
            { "round": 4, "locationId": "LOC_4", "riddle": "Feet lo dust, heart lo fire,\nFinal clue untadi… open sky under desire! 🌤️" }
        ],
        "scans": [],
        "startTime": null,
        "completedAt": null
    }
];
