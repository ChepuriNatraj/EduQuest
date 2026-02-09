import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateTeamScan, getTeamByCode, Location, db } from '../utils/firebase-helpers';
import { doc, getDoc } from 'firebase/firestore';

const ScanPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('loc');

    const [teamCode, setTeamCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [showCurrentClue, setShowCurrentClue] = useState(false);
    const [currentClueText, setCurrentClueText] = useState<string>('');

    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        riddle?: string;
        isCompleted?: boolean;
    } | null>(null);

    useEffect(() => {
        setResult(null);
        setTeamCode('');
        setShowCurrentClue(false);
    }, [locationId]);

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
        <div className="container-sm" style={{ minHeight: '100vh', paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
            <div className={`card fade-in ${shake ? 'shake-anim' : ''}`} style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Three Logo Display */}
                <div className="logo-trio mb-lg" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-md)',
                    flexWrap: 'wrap'
                }}>
                    <img
                        src="/assets/width_193.png"
                        alt="EduMoon"
                        style={{
                            maxWidth: '80px',
                            height: 'auto',
                            filter: 'sepia(0.3) brightness(0.9)',
                            opacity: 0.85
                        }}
                    />
                    <img
                        src="/assets/width_800.png"
                        alt="EduMoon Student Clubs"
                        style={{
                            maxWidth: '200px',
                            height: 'auto',
                            filter: 'sepia(0.3) brightness(0.9)'
                        }}
                    />
                    <img
                        src="/assets/width_500.png"
                        alt="EduMoon"
                        style={{
                            maxWidth: '120px',
                            height: 'auto',
                            filter: 'sepia(0.3) brightness(0.9)',
                            opacity: 0.85
                        }}
                    />
                </div>

                <h1 className="gradient-text text-center mb-sm">Treasure Hunt</h1>

                {locationId && (
                    <div className="badge badge-warning" style={{ display: 'inline-block', marginBottom: 'var(--spacing-md)' }}>
                        📍 Location: {locationId.toUpperCase()}
                    </div>
                )}

                {/* Main Content */}
                {!result && locationId && (
                    <div className="scan-form">
                        <p className="text-center mb-lg" style={{ fontSize: '1.05rem', color: 'var(--brown-dark)' }}>
                            Enter your <strong>Team Code</strong> to verify this checkpoint
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="teamCode">Team Code</label>
                                <input
                                    id="teamCode"
                                    type="text"
                                    className="input"
                                    value={teamCode}
                                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. TEAM001"
                                    disabled={loading}
                                    required
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
                            </div>
                        </form>
                    </div>
                )}

                {/* Current Clue Display */}
                {showCurrentClue && !result && (
                    <div className="clue-display fade-in" style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '2px solid var(--gold-medium)',
                        borderRadius: 'var(--radius-md)',
                        marginTop: 'var(--spacing-lg)'
                    }}>
                        <h3 className="text-center mb-md" style={{ color: 'var(--gold-dark)' }}>
                            📜 Your Current Clue
                        </h3>
                        <p className="text-center" style={{
                            fontSize: '1.1rem',
                            fontStyle: 'italic',
                            color: 'var(--brown-darkest)',
                            lineHeight: 1.8
                        }}>
                            "{currentClueText}"
                        </p>
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className={`result-display fade-in ${result.success ? 'bounce' : ''}`}>
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-lg)',
                            background: result.success
                                ? 'rgba(45, 80, 22, 0.1)'
                                : 'rgba(139, 0, 0, 0.1)',
                            border: `3px solid ${result.success ? 'var(--success)' : 'var(--error)'}`,
                            borderRadius: 'var(--radius-lg)',
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>
                                {result.success ? '✅' : '❌'}
                            </div>

                            <h2 className="mb-md" style={{
                                color: result.success ? 'var(--success)' : 'var(--error)',
                                fontSize: '1.8rem'
                            }}>
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
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(212, 175, 55, 0.15)',
                                    border: '2px solid var(--gold-medium)',
                                    borderRadius: 'var(--radius-md)',
                                    marginTop: 'var(--spacing-lg)'
                                }}>
                                    <h3 className="mb-sm" style={{ color: 'var(--gold-dark)' }}>
                                        🗝️ Next Clue
                                    </h3>
                                    <p style={{
                                        fontSize: '1.05rem',
                                        fontStyle: 'italic',
                                        color: 'var(--brown-darkest)',
                                        lineHeight: 1.8
                                    }}>
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
                    <div className="text-center" style={{
                        padding: 'var(--spacing-xl)',
                        color: 'var(--brown-light)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📷</div>
                        <h2 className="mb-md">No Location Scanned</h2>
                        <p>Please scan a QR code to begin your treasure hunt adventure!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanPage;
