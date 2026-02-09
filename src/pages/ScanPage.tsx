import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateTeamScan, getTeamByCode, Location, db } from '../utils/firebase-helpers';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../../assets/width_500.png';

const ScanPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('loc');

    const [teamCode, setTeamCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [showCurrentClue, setShowCurrentClue] = useState(false);
    const [currentClueText, setCurrentClueText] = useState<string>('');

    // Result state
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

    // Animation trigger
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

            if (team.currentRound > 4) {
                alert("You have already completed the hunt!");
                setLoading(false);
                return;
            }

            // Get current target location
            const currentRouteItem = team.route[team.currentRound - 1];
            // Fetch dynamic clue
            const locDoc = await getDoc(doc(db, 'locations', currentRouteItem.locationId));

            if (locDoc.exists()) {
                setCurrentClueText((locDoc.data() as Location).clue);
            } else {
                setCurrentClueText(currentRouteItem.riddle); // Fallback
            }
            setShowCurrentClue(true);

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
            } else {
                // Success sound/vibration could go here
                if (navigator.vibrate) navigator.vibrate(200);
            }

        } catch (error) {
            setResult({
                success: false,
                message: 'An error occurred. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-sm" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '2rem'
        }}>
            <div className={`card fade-in ${shake ? 'shake-anim' : ''}`} style={{ textAlign: 'center' }}>
                {/* Logo & Header */}
                <img src={logo} alt="EduMoon" className="logo" style={{ margin: '0 auto 1rem', maxWidth: '120px' }} />
                <h1 className="gradient-text" style={{ fontSize: '2rem' }}>The Quest</h1>

                {/* Location Badge */}
                {locationId ? (
                    <div className="mb-lg">
                        <span className="badge badge-warning">📍 Location Found: {locationId}</span>
                        <p className="text-muted mt-sm">Validate this stop to continue...</p>
                    </div>
                ) : (
                    <div className="mb-lg">
                        <span className="badge badge-error">❌ No Location Detected</span>
                    </div>
                )}

                {/* Main Form */}
                {!result && locationId && (
                    <div className="scan-form">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label text-left" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Verifying Team Identity:
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={teamCode}
                                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER TEAM CODE"
                                    autoComplete="off"
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? 'Communing with Spirits...' : '🔓 ATTEMPT UNLOCK'}
                            </button>
                        </form>

                        {/* Help / Reveal Section */}
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--brown-medium)', paddingTop: '1rem' }}>
                            <p className="text-sm mb-sm">Lost your way? Consult the archives.</p>
                            <button
                                type="button"
                                onClick={handleFetchCurrentClue}
                                className="btn btn-secondary btn-sm"
                                disabled={loading}
                            >
                                📜 Show Current Target Clue
                            </button>
                        </div>
                    </div>
                )}

                {/* Current Clue Modal / Reveal */}
                {showCurrentClue && (
                    <div className="fade-in mt-lg" style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '2px dashed var(--gold-dark)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <h3 className="gold-text">⚠️ Current Search</h3>
                        <p style={{ fontStyle: 'italic', fontSize: '1.2rem' }}>"{currentClueText}"</p>
                        <button onClick={() => setShowCurrentClue(false)} className="text-muted btn-link mt-sm">Hide</button>
                    </div>
                )}

                {/* Result View */}
                {result && (
                    <div className="result-view fade-in mt-lg">
                        <div className={`status-icon ${result.success ? 'bounce' : 'shake'}`} style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {result.success ? '🔓' : '🔒'}
                        </div>

                        <h2 style={{ color: result.success ? 'var(--success)' : 'var(--error)' }}>
                            {result.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                        </h2>

                        <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                            {result.message}
                        </p>

                        {/* Next Riddle Display */}
                        {result.riddle && (
                            <div className="card" style={{
                                background: 'rgba(0,0,0,0.05)',
                                border: '2px solid var(--gold-medium)',
                                marginTop: '1.5rem'
                            }}>
                                <h3 style={{ color: 'var(--gold-dark)' }}>📜 The Next Clue</h3>
                                <p className="clue-text" style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '1rem 0' }}>
                                    "{result.riddle}"
                                </p>
                                <p className="text-muted text-sm">Find this location and scan its Code!</p>
                            </div>
                        )}

                        {!result.isCompleted && (
                            <button className="btn btn-secondary mt-lg" onClick={() => setResult(null)}>
                                🔄 Scan Again
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .shake-anim { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .bounce { animation: bounce 0.5s; }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                .w-full { width: 100%; }
                .btn-link { background: none; border: none; text-decoration: underline; cursor: pointer; }
                .text-left { text-align: left; }
                .mb-sm { margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
};

export default ScanPage;
