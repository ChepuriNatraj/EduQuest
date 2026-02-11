import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateTeamScan, getTeamByCode, Location, db } from '../utils/firebase-helpers';
import { doc, getDoc } from 'firebase/firestore';
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

    // Auto-fetch clue if we arrive with a code (from registration) but no location (Start of game)
    useEffect(() => {
        if (initialCode && !locationId) {
            // Small timeout to allow state to settle and UI to render
            const timer = setTimeout(() => {
                handleFetchCurrentClue();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [initialCode, locationId]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleFetchCurrentClue = async () => {
        if (!teamCode.trim()) {
            triggerShake();
            alert("Please enter your Team Code first!");
            return;
        }

        setLoading(true);
        try {
            const team = await getTeamByCode(teamCode);
            if (!team) {
                alert("Invalid Team Code");
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
                const locDoc = await getDoc(doc(db, 'locations', currentRouteItem.locationId));

                if (locDoc.exists()) {
                    setCurrentClueText((locDoc.data() as Location).clue);
                } else {
                    setCurrentClueText(currentRouteItem.riddle);
                }
                setShowCurrentClue(true);
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
                                        className="btn btn-secondary w-full"
                                        disabled={loading}
                                    >
                                        📜 Show Current Clue
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
                                    className={`mb-md ${result.success ? 'result-title--success' : 'result-title--error'}`}
                                    style={{ fontSize: '1.8rem' }}
                                >
                                    {result.success ? 'ACCESS GRANTED!' : 'ACCESS DENIED'}
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

                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setTeamCode('');
                                        setShowCurrentClue(false);
                                    }}
                                    className="btn btn-secondary w-full"
                                    style={{ marginTop: 'var(--spacing-lg)' }}
                                >
                                    ← Try Another Scan
                                </button>
                            </div>
                        </div>
                    )}

                    {!locationId && (
                        <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--brown-light)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📷</div>
                            <h2 className="mb-md">No Location Scanned</h2>
                            <p>Please scan a QR code to begin your treasure hunt adventure!</p>
                            <button
                                onClick={() => setShowInstructions(true)}
                                className="btn btn-primary mt-lg"
                            >
                                Read Instructions
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
        </div>
    );
};

export default ScanPage;
