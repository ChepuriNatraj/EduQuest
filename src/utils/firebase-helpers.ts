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
    onSnapshot,
    Timestamp
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
    riddle: string; // This is the FALLBACK riddle logic. 
    // In dynamic mode, we should fetch from Location.clue
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

// ==========================================
// TEAM FUNCTIONS
// ==========================================

/**
 * Get team data by team code
 */
export async function getTeamByCode(teamCode: string): Promise<Team | null> {
    try {
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('teamCode', '==', teamCode.toUpperCase()));
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
        const team = await getTeamByCode(teamCode);

        if (!team) {
            return {
                success: false,
                message: 'Invalid team code. Please check and try again.'
            };
        }

        // Check if team already completed
        if (team.currentRound > 4) {
            return {
                success: false,
                message: "You've already finished the treasure hunt! Congratulations!",
                isCompleted: true,
                team
            };
        }

        // Get the expected location ID for current round
        const expectedRouteItem = team.route[team.currentRound - 1];
        const expectedLocationId = expectedRouteItem.locationId;

        // Verify the scanned location exists
        const locationDoc = await getDoc(doc(db, 'locations', scannedLocation.toUpperCase()));

        // Dynamic Check:
        // 1. Is it the correct location?
        if (scannedLocation.toUpperCase() !== expectedLocationId.toUpperCase()) {
            return {
                success: false,
                message: `This is not your next location! You should be looking for location ${expectedLocationId} (or its clue).`,
                team
            };
        }

        // 2. Correct Location Found! Update Team Progress
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('teamCode', '==', teamCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const teamDoc = querySnapshot.docs[0];
            const newRound = team.currentRound + 1;
            const newScan: ScanRecord = {
                round: team.currentRound,
                location: scannedLocation.toUpperCase(),
                timestamp: new Date().toISOString()
            };

            const updates: any = {
                currentRound: newRound,
                scans: arrayUnion(newScan)
            };

            // If this was the final location
            if (newRound > 4) {
                updates.completedAt = new Date().toISOString();
            }

            await updateDoc(doc(db, 'teams', teamDoc.id), updates);

            // Fetch Next Clue if applicable
            let nextRiddle = "";

            if (newRound <= 4) {
                // Get next location ID
                const nextLocId = team.route[newRound - 1].locationId;
                // Fetch dynamic clue from Locations collection
                const nextLocDoc = await getDoc(doc(db, 'locations', nextLocId));
                if (nextLocDoc.exists()) {
                    nextRiddle = (nextLocDoc.data() as Location).clue;
                } else {
                    // Fallback to static route riddle
                    nextRiddle = team.route[newRound - 1].riddle;
                }

                return {
                    success: true,
                    message: `Correct! You've completed round ${team.currentRound}!`,
                    nextRiddle: nextRiddle,
                    team
                };
            } else {
                return {
                    success: true,
                    message: 'Congratulations! You have completed the treasure hunt!',
                    isCompleted: true,
                    team
                };
            }
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

/**
 * Subscribe to real-time team updates (for admin dashboard)
 */
export function subscribeToTeams(callback: (teams: Team[]) => void): () => void {
    const teamsRef = collection(db, 'teams');
    return onSnapshot(teamsRef, (snapshot) => {
        const teams = snapshot.docs.map(doc => doc.data() as Team);
        callback(teams);
    });
}

// ==========================================
// LOCATION MANAGEMENT (Admin)
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
