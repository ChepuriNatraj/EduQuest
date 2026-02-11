import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateTeamScan, getTeamByCode, getTeamBySecretCode, subscribeToEventState, EventState } from '../utils/firebase-helpers';
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

    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        riddle?: string;
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

        if (!teamCode.trim()) {
            triggerShake();
            return;
        }

        if (!locationId) {
            setResult({
                success: false,
                message: 'Invalid QR code - no location specified.'
            });
            return;
        }

        setLoading(true);
        setResult(null);
        setShowCurrentClue(false);

        try {
            const validationResult = await validateTeamScan(teamCode, locationId);

            setResult({
                success: validationResult.success,
                message: validationResult.message,
                riddle: validationResult.nextRiddle,
                isCompleted: validationResult.isCompleted
            });

            if (!validationResult.success) {
                triggerShake();
            }
        } catch (err) {
            console.error(err);
            setResult({
                success: false,
                message: 'An error occurred. Please try again.'
            });
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container-sm">
                <div className={`card fade-in ${shake ? 'shake-anim' : ''}`}>
                    <div className="brand-header">
                        <div className="brand-logos">
                            <img
                                className="brand-logo brand-logo--sm brand-logo--soft"
                                src="/assets/width_193.png"
                                alt="EduMoon"
                            />
                            <img
                                className="brand-logo brand-logo--lg"
                                src="/assets/width_800.png"
                                alt="EduMoon Student Clubs"
                            />
                            <img
                                className="brand-logo brand-logo--md brand-logo--soft"
                                src="/assets/width_500.png"
                                alt="EduMoon"
                            />
                        </div>

                        <h1 className="gradient-text mb-sm">Treasure Hunt</h1>
                    </div>

                    {locationId && (
                        <div className="badge badge-warning" style={{ marginBottom: 'var(--spacing-md)' }}>
                            📍 Location: {locationId.toUpperCase()}
                        </div>
                    )}

                    {/* Main Content */}
                    {!result && locationId && (
                        <div className="scan-form">
                            <p className="text-center mb-lg" style={{ fontSize: '1.05rem', color: 'var(--brown-dark)' }}>
                                Enter your <strong>Secret Code</strong> to verify this checkpoint
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="teamCode">Secret Code (4 digits + 1 letter)</label>
                                    <input
                                        id="teamCode"
                                        type="text"
                                        className="input"
                                        value={teamCode}
                                        onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. 1234A"
                                        maxLength={5}
                                        disabled={loading}
                                        required
                                        style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.2em' }}
                                    />
                                </div>

                                <div className="flex flex-col gap-sm">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full"
                                        disabled={loading}
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

                                {result.success && result.riddle && !result.isCompleted && (
                                    <div className="notice" style={{ marginTop: 'var(--spacing-lg)' }}>
                                        <h3 className="mb-sm notice-title">
                                            🗝️ Next Clue
                                        </h3>
                                        <p className="notice-body" style={{ marginBottom: 0 }}>
                                            "{result.riddle}"
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
                                            TREASURE FOUND!
                                        </h3>
                                    </div>
                                )}

                                <div className="flex flex-col gap-sm mt-lg">
                                    <button
                                        onClick={() => {
                                            setResult(null);
                                            setTeamCode('');
                                            setShowCurrentClue(false);
                                        }}
                                        className="btn btn-secondary w-full"
                                    >
                                        ← Scan Another
                                    </button>

                                    {!result.success && result.message.includes('WRONG LOCATION') && (
                                        <button
                                            onClick={() => {
                                                setResult(null); // Clear error
                                                handleFetchCurrentClue(); // Fetch clue
                                            }}
                                            className="btn btn-primary w-full"
                                        >
                                            📜 Check My Clue
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!locationId && (
                        <div className="text-center" style={{ padding: 'var(--spacing-lg) var(--spacing-md)' }}>
                            {teamCode ? (
                                <>
                                    <h2 className="mb-md" style={{ color: 'var(--brown-darkest)' }}>Ready for Adventure?</h2>

                                    <div className={`badge ${eventState?.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', width: '100%', justifyContent: 'center' }}>
                                        {eventState?.status === 'active' ? '🟢 EVENT IS LIVE' : '🔴 EVENT NOT STARTED'}
                                    </div>

                                    <p className="mb-lg" style={{ color: 'var(--brown-dark)', fontSize: '1.1rem' }}>
                                        {eventState?.status === 'active'
                                            ? "The hunt is on! Read instructions and start."
                                            : "Please wait for the admin to start the event."}
                                    </p>

                                    <div className="flex flex-col gap-md">
                                        <button
                                            type="button"
                                            onClick={() => setShowInstructions(true)}
                                            className="btn btn-secondary w-full"
                                            style={{ fontSize: '1.1rem' }}
                                        >
                                            📖 Read Instructions
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleFetchCurrentClue}
                                            className={`btn w-full ${eventState?.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                                            disabled={loading || eventState?.status !== 'active'}
                                            style={{
                                                fontSize: '1.2rem',
                                                padding: '1rem',
                                                opacity: eventState?.status === 'active' ? 1 : 0.6,
                                                cursor: eventState?.status === 'active' ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {loading ? '⏳ Loading...' : eventState?.status === 'active' ? '🚀 START ADVENTURE!' : '⏳ Waiting for Start...'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📷</div>
                                    <h2 className="mb-md">No Location Scanned</h2>
                                    <p className="mb-lg" style={{ color: 'var(--brown-light)' }}>Please scan a QR code to begin your treasure hunt adventure!</p>
                                    <button
                                        onClick={() => setShowInstructions(true)}
                                        className="btn btn-secondary w-full"
                                    >
                                        Read Instructions
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
        </div>
    );
};

export default ScanPage;
