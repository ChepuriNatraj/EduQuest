import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

export { db }; // Export db for use in components

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Team {
    teamCode: string;
    teamName: string;
    currentRound: number;
    route: RouteItem[];
    scans: ScanRecord[];
    startTime: string;
    completedAt: string | null;
}

export interface RouteItem {
    round: number;
    locationId: string;
    riddle: string;
}

export interface ScanRecord {
    round: number;
    location: string;
    timestamp: string;
}

export interface Location {
    id: string;      // e.g., "LOC_1"
    name: string;    // e.g., "Library Entrance"
    clue: string;    // The riddle text displayed when this is the NEXT target
    sequence?: number; // Order in the default route
}

export interface ValidationResult {
    success: boolean;
    message: string;
    nextRiddle?: string;
    team?: Team;
    isCompleted?: boolean;
}

function normalizeTeamCode(input: string): string {
    const cleaned = (input || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/-/g, '');

    const teamMatch = cleaned.match(/^TEAM(\d+)$/);
    if (teamMatch) {
        const num = teamMatch[1].padStart(3, '0');
        return `TEAM${num}`;
    }

    const digitsOnly = cleaned.match(/^(\d+)$/);
    if (digitsOnly) {
        const num = digitsOnly[1].padStart(3, '0');
        return `TEAM${num}`;
    }

    return cleaned;
}

function normalizeLocationId(input: string): string {
    const cleaned = (input || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '');

    const locMatch = cleaned.match(/^LOC[_-]?(\d+)$/);
    if (locMatch) {
        return `LOC_${locMatch[1]}`;
    }

    return cleaned.replace(/-/g, '_');
}

// ==========================================
// TEAM FUNCTIONS
// ==========================================

/**
 * Get team data by team code
 */
export async function getTeamByCode(teamCode: string): Promise<Team | null> {
    try {
        const normalizedTeamCode = normalizeTeamCode(teamCode);

        // Fast path: in this project, team docs are often stored by team code as document ID.
        const byId = await getDoc(doc(db, 'teams', normalizedTeamCode));
        if (byId.exists()) {
            return byId.data() as Team;
        }

        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('teamCode', '==', normalizedTeamCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        return querySnapshot.docs[0].data() as Team;
    } catch (error) {
        console.error('Error fetching team:', error);
        throw error;
    }
}

/**
 * Validate team scan at a location
 */
export async function validateTeamScan(
    teamCode: string,
    scannedLocation: string
): Promise<ValidationResult> {
    try {
        const normalizedTeamCode = normalizeTeamCode(teamCode);
        const normalizedScannedLocation = normalizeLocationId(scannedLocation);

        const team = await getTeamByCode(normalizedTeamCode);

        if (!team) {
            return {
                success: false,
                message: 'Invalid team code. Please check and try again.'
            };
        }

        // Check if team already completed
        if (team.currentRound >= 4) {
            return {
                success: false,
                message: "You've already finished the treasure hunt! Congratulations!",
                isCompleted: true,
                team
            };
        }

        const targetRoundIndex = team.currentRound; // 0 for Round 1
        // Safety check
        if (targetRoundIndex < 0) {
            return { success: false, message: "Invalid round state.", team };
        }

        // If route is missing or empty
        if (!team.route || targetRoundIndex >= team.route.length) {
            // Fallback: If no route, maybe allow any valid location? No, strict.
            // But if we want to allow testing, maybe we check if Location exists.
            // Sticking to strict route for now.
            return {
                success: false,
                message: "System Error: No route defined for this round. Contact Admin.",
                team
            };
        }

        const expectedRouteItem = team.route[targetRoundIndex];
        const expectedLocationId = normalizeLocationId(expectedRouteItem.locationId);

        // Dynamic Check:
        if (normalizedScannedLocation !== expectedLocationId) {
            return {
                success: false,
                message: `This is not your next location! Keep looking!`,
                team
            };
        }

        // Correct Location Found! Update Team Progress
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('teamCode', '==', normalizedTeamCode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const teamDoc = querySnapshot.docs[0];
            const newRound = team.currentRound + 1;
            const newScan: ScanRecord = {
                round: newRound,
                location: normalizedScannedLocation,
                timestamp: new Date().toISOString()
            };

            const updates: any = {
                currentRound: newRound,
                scans: arrayUnion(newScan)
            };

            // If this was the final location
            if (newRound >= 4) { // Assuming 4 rounds
                updates.completedAt = new Date().toISOString();
            }

            await updateDoc(doc(db, 'teams', teamDoc.id), updates);

            // Fetch Next Clue
            let nextRiddle = "Clue not found.";
            const isFinished = newRound >= 4; // Or team.route.length? checks 4 for now.

            if (!isFinished) {
                // Get riddle for NEXT round (which is at index 'newRound')
                if (newRound < team.route.length) {
                    const nextRouteItem = team.route[newRound];

                    // Priority 1: Team specific riddle
                    if (nextRouteItem && nextRouteItem.riddle) {
                        nextRiddle = nextRouteItem.riddle;
                    }

                    // Priority 2: Location clue (fallback)
                    if ((!nextRiddle || nextRiddle.startsWith("Default Riddle")) && nextRouteItem.locationId) {
                        const nextLocDoc = await getDoc(doc(db, 'locations', nextRouteItem.locationId));
                        if (nextLocDoc.exists()) {
                            const locData = nextLocDoc.data() as Location;
                            if (locData.clue) nextRiddle = locData.clue;
                        }
                    }
                }
            } else {
                nextRiddle = "Congratulations! You completed the hunt!";
            }

            return {
                success: true,
                message: isFinished ? 'Congratulations! You finished!' : `Correct! Proceed to Round ${newRound + 1}`,
                nextRiddle: nextRiddle,
                team,
                isCompleted: isFinished
            };
        }

        return {
            success: false,
            message: 'Error updating team progress.'
        };

    } catch (error) {
        console.error('Error validating scan:', error);
        return {
            success: false,
            message: 'An error occurred. Please try again.'
        };
    }
}

/**
 * Get all teams (for admin dashboard)
 */
export async function getAllTeams(): Promise<Team[]> {
    try {
        const teamsRef = collection(db, 'teams');
        const querySnapshot = await getDocs(teamsRef);
        return querySnapshot.docs.map(doc => doc.data() as Team);
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
}


// ==========================================
// ADMIN: TEAM MANAGEMENT
// ==========================================

export async function initializeTeams(count: number = 15) {
    const teamsRef = collection(db, 'teams');

    for (let i = 1; i <= count; i++) {
        const teamCode = `TEAM${i.toString().padStart(3, '0')}`; // TEAM001
        const docRef = doc(teamsRef, teamCode);

        // checking existence would be good, but for "Init", we might want to ensure they exist via setDoc with merge
        await setDoc(docRef, {
            teamCode: teamCode,
            teamName: `Team ${i}`,
            currentRound: 0,
            route: [
                { round: 1, locationId: `LOC_1`, riddle: "Default Riddle 1" },
                { round: 2, locationId: `LOC_2`, riddle: "Default Riddle 2" },
                { round: 3, locationId: `LOC_3`, riddle: "Default Riddle 3" },
                { round: 4, locationId: `LOC_4`, riddle: "Default Riddle 4" }
            ],
            scans: [],
            startTime: new Date().toISOString(),
            completedAt: null
        }, { merge: true });
    }
}

export async function updateTeamRoute(teamCode: string, routeData: RouteItem[]) {
    await updateDoc(doc(db, 'teams', teamCode), {
        route: routeData
    });
}

export function subscribeToTeams(callback: (teams: Team[]) => void): () => void {
    const teamsRef = collection(db, 'teams');
    return onSnapshot(teamsRef, (snapshot) => {
        const teams = snapshot.docs.map(doc => doc.data() as Team);
        callback(teams);
    });
}

// ==========================================
// LOCATION MANAGEMENT (Keep for Admin Ref or Fallback)
// ==========================================

export async function getAllLocations(): Promise<Location[]> {
    const querySnapshot = await getDocs(collection(db, 'locations'));
    return querySnapshot.docs.map(doc => doc.data() as Location);
}

export async function updateLocation(locationId: string, data: Partial<Location>) {
    await updateDoc(doc(db, 'locations', locationId), data);
}

export async function addLocation(location: Location) {
    await setDoc(doc(db, 'locations', location.id), location);
}

export function subscribeToLocations(callback: (locs: Location[]) => void): () => void {
    return onSnapshot(collection(db, 'locations'), (snapshot) => {
        const locs = snapshot.docs.map(doc => doc.data() as Location);
        // Sort by sequence if available, or ID
        locs.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        callback(locs);
    });
}

// ==========================================
// UTILS
// ==========================================

export function getElapsedTime(startTime: string): string {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}

export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
