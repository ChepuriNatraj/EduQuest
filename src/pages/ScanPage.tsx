import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    validateTeamScan,
    getTeamByCode,
    getTeamBySecretCode,
    subscribeToEventState,
    EventState,
    subscribeToNotifications,
    logActivity
} from '../utils/firebase-helpers';
import InstructionsModal from '../components/InstructionsModal';

const ScanPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('loc');
    const initialCode = searchParams.get('code') || '';

    const [teamCode, setTeamCode] = useState(initialCode);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [showCurrentClue, setShowCurrentClue] = useState(false);
    const [currentClueText, setCurrentClueText] = useState<string>('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [eventState, setEventState] = useState<EventState | null>(null);

    // Notification State
    const [adminNotification, setAdminNotification] = useState<{ message: string, type: 'info' | 'alert' | 'success', id?: string | number } | null>(null);

    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        nextRiddle?: string;
        isCompleted?: boolean;
    } | null>(null);

    useEffect(() => {
        setResult(null);
        // Only reset if we didn't just arrive with a code
        if (!initialCode) {
            setTeamCode('');
        }
        setShowCurrentClue(false);
    }, [locationId, initialCode]);

    // Subscribe to Event State
    useEffect(() => {
        const unsubscribe = subscribeToEventState((state) => {
            setEventState(state);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to Admin Notifications
    useEffect(() => {
        const unsubscribe = subscribeToNotifications((msgs) => {
            if (msgs && msgs.length > 0) {
                const latest = msgs[0];
                // Show notification if it's recent (e.g. within last 1 minute)
                if (Date.now() - latest.timestamp < 60000) {
                    setAdminNotification(latest);
                    // Vibration for attention
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Auto-open instructions if new user and no location scan
    useEffect(() => {
        if (initialCode && !locationId) {
            setShowInstructions(true);
        }
    }, [initialCode, locationId]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleFetchCurrentClue = async () => {
        if (!teamCode.trim()) {
            triggerShake();
            alert("Please enter your Secret Code first!");
            return;
        }

        setLoading(true);
        try {
            // Try by secret code first (most common), then by team code
            let team = await getTeamBySecretCode(teamCode);
            if (!team) {
                team = await getTeamByCode(teamCode);
            }

            if (!team) {
                alert("Invalid Secret Code");
                setLoading(false);
                return;
            }

            if (team.currentRound >= 4) {
                alert("You have already completed the hunt!");
                setLoading(false);
                return;
            }

            const targetIndex = team.currentRound;
            if (targetIndex < team.route.length) {
                const currentRouteItem = team.route[targetIndex];
                // Use the riddle directly from the route
                setCurrentClueText(currentRouteItem.riddle);
                setShowCurrentClue(true);
            } else {
                alert("No clue available for your current round.");
            }
        } catch (e) {
            console.error(e);
            alert("Error fetching clue");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!locationId) {
            triggerShake();
            // Optional: Alert user to scan a QR code
            return;
        }
        if (!teamCode.trim()) {
            triggerShake();
            alert("Please enter your Secret Code!");
            return;
        }

        // Event State Check
        if (eventState && eventState.status !== 'active') {
            alert(eventState.status === 'not_started'
                ? "⏳ The event hasn't started yet! Please wait for the admin."
                : "🛑 The event has ended.");
            return;
        }

        setLoading(true);
        setResult(null);
        setShowCurrentClue(false);

        try {
            const response = await validateTeamScan(teamCode, locationId);
            setResult(response);

            if (response.success) {
                // Determine Log Type
                if (response.isCompleted) {
                    await logActivity(`🏆 TEAM FINISHED! (${teamCode})`, 'success', teamCode);
                } else if (response.nextRiddle) {
                    await logActivity(`✅ Team ${teamCode} found location!`, 'info', teamCode);
                }
            } else {
                if (response.message.includes("LOCATION MISMATCH")) {
                    await logActivity(`⚠️ Team ${teamCode} scanned WRONG location.`, 'warning', teamCode);
                }
            }

        } catch (error: any) {
            console.error(error);
            setResult({
                success: false,
                message: error.message || "Validation failed. Please try again."
            });
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page fade-in">
            {/* Admin Notification Modal/Toast */}
            {adminNotification && (
                <div className="modal-overlay" style={{ zIndex: 10000 }}>
                    <div className="modal-content bounce" style={{
                        border: '4px solid var(--gold-dark)',
                        background: 'var(--parchment-light)',
                        maxWidth: '90%'
                    }}>
                        <div className="modal-header" style={{ background: 'var(--gold-dark)', color: 'white' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>📢 Admin Message</h2>
                        </div>
                        <div className="p-lg text-center">
                            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--brown-darkest)' }}>
                                {adminNotification.message}
                            </p>
                            <button
                                onClick={() => setAdminNotification(null)}
                                className="btn btn-primary mt-lg"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container" style={{ maxWidth: '600px' }}>
                <header className="text-center mb-lg">
                    <img
                        src="/assets/width_500.png"
                        alt="EduMoon Student Clubs"
                        className="brand-logo"
                        style={{ maxWidth: '180px', marginBottom: '1rem' }}
                    />
                    <h1 className="mt-sm site-title" style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>EDUQUEST</h1>
                    <p className="text-muted text-sm">Find the locations, solve the riddles!</p>
                </header>

                {/* Event Status Banner (if not active) */}
                {eventState && eventState.status !== 'active' && (
                    <div className="card mb-lg text-center" style={{ border: '2px solid var(--gold-dark)', background: '#fff3cd', color: '#856404' }}>
                        <h3>
                            {eventState.status === 'not_started' ? '⏳ Event Not Started' : '🛑 Event Ended'}
                        </h3>
                        <p style={{ marginBottom: 0 }}>
                            {eventState.status === 'not_started' ? 'Please wait for the admin to start the game.' : 'Thanks for playing!'}
                        </p>
                    </div>
                )}


                {showInstructions && (
                    <InstructionsModal
                        onClose={() => setShowInstructions(false)}
                    />
                )}

                {!result && !locationId && (
                    <div className="notice mb-lg text-center">
                        <p className="mb-sm">👋 <strong>Welcome!</strong></p>
                        <p>Scan a QR code at a location to start verifying.</p>
                        <p className="text-sm text-muted">If you are just checking your clue, enter your code below.</p>
                    </div>
                )}

                {/* Main Form */}
                {!result && (
                    <div className="card shadow-lg">
                        <form onSubmit={handleSubmit} className={shake ? 'shake' : ''}>
                            {locationId && (
                                <div className="form-group mb-md">
                                    <label className="block text-sm font-bold mb-xs">📍 Scanned Location</label>
                                    <input
                                        type="text"
                                        value={locationId}
                                        disabled
                                        className="w-full p-sm bg-gray-100 border rounded"
                                        style={{ fontFamily: 'monospace', color: 'var(--brown-dark)' }}
                                    />
                                </div>
                            )}

                            <div className="form-group mb-lg">
                                <label className="block text-sm font-bold mb-xs">
                                    🔑 Team Secret Code
                                    <span className="text-muted font-normal ml-xs">(e.g. 123456)</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    value={teamCode}
                                    onChange={(e) => setTeamCode(e.target.value)}
                                    className="w-full p-md border rounded text-lg text-center"
                                    style={{
                                        letterSpacing: '2px',
                                        fontWeight: 'bold',
                                        color: 'var(--brown-darkest)',
                                        borderColor: 'var(--brown-medium)'
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-sm">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={loading}
                                    style={{
                                        opacity: locationId ? 1 : 0.5,
                                        cursor: locationId ? 'pointer' : 'not-allowed'
                                    }}
                                    title={!locationId ? "Scan a QR code first" : ""}
                                >
                                    {loading ? '⏳ Validating...' : '✓ Verify Location'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleFetchCurrentClue}
                                    className={`btn w-full ${eventState?.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                                    disabled={loading || eventState?.status !== 'active'}
                                    style={{
                                        opacity: eventState?.status === 'active' ? 1 : 0.7,
                                        cursor: eventState?.status === 'active' ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {eventState?.status === 'active'
                                        ? '📜 Show Current Clue'
                                        : '⏳ Waiting for Event Start...'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowInstructions(true)}
                                    className="btn btn-info w-full"
                                    style={{ background: 'var(--map-blue)', color: 'white', border: 'none' }}
                                >
                                    ℹ️ How to Play
                                </button>
                            </div>
                        </form>

                        <div className="notice" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <p className="text-sm text-center" style={{ marginBottom: 0 }}>
                                📞 <strong>Forgot your code?</strong><br />
                                Call Moderator: <a href="tel:8309223139" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>8309223139</a> or <a href="tel:8309302507" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>8309302507</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* Current Clue Display */}
                {showCurrentClue && !result && (
                    <div className="notice fade-in" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <h3 className="notice-title text-center mb-md">📜 Your Current Clue</h3>
                        <p className="notice-body text-center" style={{ marginBottom: 0 }}>
                            "{currentClueText}"
                        </p>
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className={`result-display fade-in ${result.success ? 'bounce' : ''}`}>
                        <div className={`result-box ${result.success ? 'result-box--success' : 'result-box--error'}`}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>
                                {result.success ? '✅' : '❌'}
                            </div>

                            <h2
                                className={`mb-md ${result.success ? 'result-title--success' : result.message.includes('WRONG LOCATION') ? 'result-title--warning' : 'result-title--error'}`}
                                style={{
                                    fontSize: '1.8rem',
                                    color: result.success ? 'var(--success)' : result.message.includes('WRONG LOCATION') ? 'var(--gold-dark)' : 'var(--error)'
                                }}
                            >
                                {result.success ? 'ACCESS GRANTED!' : result.message.includes('WRONG LOCATION') ? 'LOCATION MISMATCH' : 'ACCESS DENIED'}
                            </h2>

                            <p className="mb-lg" style={{
                                fontSize: '1.1rem',
                                color: 'var(--brown-dark)',
                                lineHeight: 1.7
                            }}>
                                {result.message}
                            </p>

                            {result.success && result.nextRiddle && !result.isCompleted && (
                                <div className="notice" style={{ marginTop: 'var(--spacing-lg)' }}>
                                    <h3 className="mb-sm notice-title">
                                        🗝️ Next Clue
                                    </h3>
                                    <p className="notice-body" style={{ marginBottom: 0 }}>
                                        "{result.nextRiddle}"
                                    </p>
                                </div>
                            )}

                            {result.isCompleted && (
                                <div className="completion-celebration" style={{
                                    marginTop: 'var(--spacing-lg)',
                                    padding: 'var(--spacing-md)',
                                    background: 'linear-gradient(135deg, var(--gold-bright), var(--gold-dark))',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--brown-darkest)'
                                }}>
                                    <div style={{ fontSize: '3rem' }}>🏆</div>
                                    <h3 style={{ fontWeight: 'bold', marginTop: 'var(--spacing-sm)' }}>
                                        CONGRATULATIONS!
                                    </h3>
                                    <p>You have found the Treasure!</p>
                                    <p className="text-sm mt-sm">Return to the base to claim your prize.</p>
                                </div>
                            )}

                            <button
                                onClick={() => setResult(null)}
                                className="btn btn-secondary mt-lg"
                            >
                                {result.success ? 'Continue' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ScanPage;
