import React, { useEffect, useState } from 'react';
import {
    Team,
    RouteItem,
    subscribeToTeams,
    initializeTeams,
    updateTeamRoute,
    EventState,
    getEventState,
    updateEventState,
    subscribeToEventState,
    subscribeToActivity,
    ActivityLogItem,
    sendNotification,
    db
} from '../utils/firebase-helpers';
import { doc, updateDoc } from 'firebase/firestore';
import QRGenerator from '../components/QRGenerator';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    // Existing State
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'questions' | 'notifications' | 'activity' | 'qr' | 'registrations'>('overview');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [editRoute, setEditRoute] = useState<RouteItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [eventState, setEventState] = useState<EventState | null>(null);
    const [expandedTeamInQuestions, setExpandedTeamInQuestions] = useState<string | null>(null);

    // New State for Activity & Broadcast
    const [notifications, setNotifications] = useState<{ id: number, message: string, type: 'success' | 'info' | 'error' }[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Refs
    const prevTeamsRef = React.useRef<Team[]>([]);

    useEffect(() => {
        const unsubTeams = subscribeToTeams(setTeams);
        // Load event state (initial)
        getEventState().then(setEventState);
        // Subscribe to event state
        const unsubEvent = subscribeToEventState(setEventState);
        // Subscribe to activity log
        const unsubActivity = subscribeToActivity(setActivityLog);

        return () => {
            unsubTeams();
            unsubEvent();
            unsubActivity();
        };
    }, []);

    const handleInitTeams = async () => {
        if (confirm("This will create/reset 15 Teams (TEAM001 - TEAM015). Continue?")) {
            await initializeTeams(15);
        }
    };

    const handleDownloadRegistrations = () => {
        const registeredTeams = teams.filter(t => t.isRegistered);

        if (registeredTeams.length === 0) {
            alert('No registered teams yet!');
            return;
        }

        // Create CSV content
        let csv = 'Team Code,Secret Code,Member 1 Name,Member 1 Mobile,Member 1 Branch,Member 1 Year,Member 2 Name,Member 2 Mobile,Member 2 Branch,Member 2 Year,Member 3 Name,Member 3 Mobile,Member 3 Branch,Member 3 Year,Member 4 Name,Member 4 Mobile,Member 4 Branch,Member 4 Year,Member 5 Name,Member 5 Mobile,Member 5 Branch,Member 5 Year,Registration Time,Current Round,Completed\n';

        registeredTeams.forEach(team => {
            const members = team.teamMembers || [];
            const row = [
                team.teamCode,
                team.secretCode || '',
                ...members.flatMap(m => [m.name, m.mobile, m.branch, m.year]),
                team.startTime,
                team.currentRound,
                team.completedAt ? 'Yes' : 'No'
            ];
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `treasure_hunt_registrations_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Notifications Helper
    const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000); // Auto dismiss after 5s
    };

    // Event Control Functions
    const handleStartEvent = async () => {
        if (confirm('🚀 Start the treasure hunt event? Teams will be able to scan QR codes and play.')) {
            await updateEventState('active');
            const newState = await getEventState();
            setEventState(newState);
            addNotification('🚀 Event Started! Teams can now play.', 'success');
        }
    };

    const handleStopEvent = async () => {
        if (confirm('🛑 Stop the event? Teams will no longer be able to scan QR codes.')) {
            await updateEventState('ended');
            const newState = await getEventState();
            setEventState(newState);
            addNotification('🛑 Event Stopped.', 'info');
        }
    };

    useEffect(() => {
        if (prevTeamsRef.current.length === 0) {
            prevTeamsRef.current = teams;
            return;
        }

        teams.forEach(team => {
            const prevTeam = prevTeamsRef.current.find(t => t.teamCode === team.teamCode);
            if (!prevTeam) return;

            // Check for Round Completion
            if (team.currentRound > prevTeam.currentRound) {
                const isFinished = team.currentRound >= 4; // Assuming 4 rounds
                if (isFinished) {
                    addNotification(`🏆 ${team.teamName} has FINISHED the Treasure Hunt!`, 'success');
                    // Play sound?
                } else {
                    addNotification(`🚀 ${team.teamName} completed Round ${team.currentRound} and moved to Round ${team.currentRound + 1}!`, 'info');
                }
            }
        });

        prevTeamsRef.current = teams;
    }, [teams]);


    const handleDownloadProgress = () => {
        if (teams.length === 0) {
            alert('No teams yet!');
            return;
        }

        // Create CSV content
        let csv = 'Team Code,Team Name,Secret Code,Current Round,Completed,Completion Time,Total Scans\n';

        teams.forEach(team => {
            const row = [
                team.teamCode,
                team.teamName,
                team.secretCode || 'Not Registered',
                team.currentRound,
                team.completedAt ? 'Yes' : 'No',
                team.completedAt || 'In Progress',
                team.scans.length
            ];
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `treasure_hunt_progress_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openEditModal = (team: Team) => {
        setEditingTeam(team);
        setEditTeamName(team.teamName);
        const route = [...team.route];
        while (route.length < 4) {
            route.push({ round: route.length + 1, locationId: '', riddle: '' });
        }
        setEditRoute(route);
        setQrPreview(null);
    };

    const handleSaveRoute = async () => {
        if (editingTeam) {
            setSaving(true);
            try {
                // Update both route and team name
                await updateTeamRoute(editingTeam.teamCode, editRoute);
                if (editTeamName !== editingTeam.teamName) {
                    const teamDocRef = doc(db, 'teams', editingTeam.teamCode);
                    await updateDoc(teamDocRef, { teamName: editTeamName });
                }
                setEditingTeam(null);
                setQrPreview(null);
            } finally {
                setSaving(false);
            }
        }
    };

    const updateRouteItem = (index: number, field: keyof RouteItem, value: any) => {
        const newRoute = [...editRoute];
        newRoute[index] = { ...newRoute[index], [field]: value };
        setEditRoute(newRoute);
    };

    const renderTeams = () => (
        <div className="teams-view">
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h2 className="mb-xs">Team Management</h2>
                    <p className="text-sm text-muted">Configure riddles and routes for each team</p>
                </div>
                <div className="flex gap-sm">
                    <button onClick={handleDownloadProgress} className="btn btn-secondary">
                        📊 Download Progress
                    </button>
                    <button onClick={handleInitTeams} className="btn btn-primary">
                        🚀 Initialize 15 Teams
                    </button>
                </div>
            </div>

            {teams.length === 0 ? (
                <>
                    <Link to="/print-codes" className="card hover-lift" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🖨️</div>
                        <h3>Print Riddles</h3>
                        <p className="text-sm text-muted">Print riddles and QR codes for all teams</p>
                    </Link>

                    <Link to="/print-stickers" className="card hover-lift" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🏷️</div>
                        <h3>Print Stickers</h3>
                        <p className="text-sm text-muted">Compact 4-per-row QRs for sticker sheets</p>
                    </Link>
                </>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {teams.map(team => {
                        const completedRounds = team.currentRound;
                        const isComplete = completedRounds >= 4;

                        return (
                            <div key={team.teamCode} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-start mb-sm">
                                    <div>
                                        <h4 className="mb-xs">{team.teamName}</h4>
                                        <p className="text-xs text-muted">{team.teamCode}</p>
                                        {team.secretCode && (
                                            <p className="text-xs" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>
                                                🔐 {team.secretCode}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`badge ${isComplete ? 'badge-success' : 'badge-warning'}`}>
                                        {isComplete ? '✓ DONE' : `${completedRounds}/4`}
                                    </span>
                                </div>

                                {/* Checklist Progress */}
                                <div className="progress-checklist mb-sm" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--spacing-xs)'
                                }}>
                                    {[1, 2, 3, 4].map(round => {
                                        const completed = team.currentRound >= round;
                                        const current = team.currentRound + 1 === round;
                                        const scan = team.scans.find(s => s.round === round);

                                        return (
                                            <div
                                                key={round}
                                                className="checklist-item"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-xs)',
                                                    padding: 'var(--spacing-xs)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: completed ? 'rgba(40, 167, 69, 0.1)' : current ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                                    border: current ? '1px solid var(--gold-dark)' : '1px solid transparent'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2rem' }}>
                                                    {completed ? '✅' : current ? '▶️' : '⬜'}
                                                </span>
                                                <span style={{ fontWeight: current ? '600' : '400', flex: 1 }}>
                                                    Round {round}
                                                </span>
                                                {scan && (
                                                    <span className="text-xs text-muted">
                                                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => openEditModal(team)}
                                    className="btn btn-secondary btn-sm w-full"
                                >
                                    ✏️ Edit Team
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderEditModal = () => {
        if (!editingTeam) return null;

        const baseUrl = window.location.origin;
        const locations = Array.from({ length: 12 }, (_, i) => `LOC_${i + 1}`);

        return (
            <div className="modal-overlay" onClick={() => !saving && setEditingTeam(null)}>
                <div
                    className="modal-content card fade-in"
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxWidth: '1000px' }}
                >
                    <div className="modal-header mb-md">
                        <h2 className="mb-xs">Edit Team Configuration</h2>
                        <p className="text-sm text-muted">{editingTeam.teamCode}</p>
                    </div>

                    {/* Team Name */}
                    <div className="form-group mb-lg">
                        <label htmlFor="team-name">Team Name</label>
                        <input
                            id="team-name"
                            className="input"
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                            placeholder="Team Name"
                            disabled={saving}
                            style={{ fontSize: '1.1rem', fontWeight: '600' }}
                        />
                    </div>

                    <div className="divider mb-md"></div>

                    {/* Compact 2-Column Grid for All 4 Rounds */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-lg">
                        {editRoute.map((item, idx) => (
                            <div
                                key={idx}
                                className="panel panel-tight"
                                style={{ background: 'rgba(212, 175, 55, 0.05)' }}
                            >
                                <h4 className="mb-sm" style={{ color: 'var(--gold-dark)', fontSize: '1rem' }}>
                                    🔹 Round {idx + 1}
                                </h4>

                                {/* Location Dropdown */}
                                <div className="form-group">
                                    <label htmlFor={`loc-${idx}`} className="text-sm">Target Location</label>
                                    <div className="flex gap-xs items-center">
                                        <select
                                            id={`loc-${idx}`}
                                            className="input"
                                            value={item.locationId}
                                            onChange={e => updateRouteItem(idx, 'locationId', e.target.value)}
                                            disabled={saving}
                                            style={{ flex: 1, padding: '0.5rem' }}
                                        >
                                            <option value="">Select Location</option>
                                            {locations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>

                                        {/* Inline QR Preview Button */}
                                        {item.locationId && (
                                            <button
                                                type="button"
                                                onClick={() => setQrPreview(item.locationId)}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '0.5rem', minWidth: 'auto' }}
                                                title="Preview QR"
                                            >
                                                📱
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Compact Riddle */}
                                <div className="form-group">
                                    <label htmlFor={`riddle-${idx}`} className="text-sm">Riddle / Clue</label>
                                    <textarea
                                        id={`riddle-${idx}`}
                                        className="input"
                                        value={item.riddle}
                                        onChange={e => updateRouteItem(idx, 'riddle', e.target.value)}
                                        placeholder="Enter riddle..."
                                        rows={3}
                                        disabled={saving}
                                        style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* QR Preview Panel */}
                    {qrPreview && (
                        <div className="notice mb-lg" style={{ textAlign: 'center' }}>
                            <h4 className="mb-sm notice-title">QR Code Preview: {qrPreview}</h4>
                            <div style={{
                                background: 'white',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                display: 'inline-block'
                            }}>
                                <QRCode
                                    value={`${baseUrl}/scan?loc=${qrPreview}`}
                                    size={150}
                                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                />
                            </div>
                            <p className="text-sm text-muted mt-sm">
                                URL: {baseUrl}/scan?loc={qrPreview}
                            </p>
                            <button
                                type="button"
                                onClick={() => setQrPreview(null)}
                                className="btn btn-secondary btn-sm mt-sm"
                            >
                                Close Preview
                            </button>
                        </div>
                    )}

                    <div className="modal-footer flex gap-md justify-end">
                        <div className="flex gap-sm items-center">
                            <button
                                onClick={async () => {
                                    if (window.confirm("WARNING: This will RESET all 15 teams to their initial state. Scans will be lost. Are you sure?")) {
                                        await initializeTeams(15);
                                        alert("Teams reset successfully! Please refresh.");
                                    }
                                }}
                                className="btn btn-primary"
                                style={{ background: 'var(--error)', borderColor: 'var(--brown-darkest)' }}
                            >
                                ⚠️ Reset All Teams
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setEditingTeam(null);
                                setQrPreview(null);
                            }}
                            className="btn btn-secondary"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRoute}
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? '💾 Saving...' : '✓ Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRegistrations = () => {
        const registeredTeams = teams.filter(t => t.isRegistered);
        const unregisteredTeams = teams.filter(t => !t.isRegistered);

        return (
            <div className="registrations-view">
                <div className="flex justify-between items-center mb-lg">
                    <div>
                        <h2 className="mb-xs">Team Registrations</h2>
                        <p className="text-sm text-muted">
                            {registeredTeams.length} of {teams.length} teams registered
                        </p>
                    </div>
                    <button onClick={handleDownloadRegistrations} className="btn btn-primary" disabled={registeredTeams.length === 0}>
                        📥 Download Registrations
                    </button>
                </div>

                {registeredTeams.length === 0 ? (
                    <div className="card text-center p-lg">
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📋</div>
                        <h3 className="mb-sm">No Registrations Yet</h3>
                        <p className="text-muted">Teams will appear here once they complete registration</p>
                    </div>
                ) : (
                    <>
                        <h3 className="mb-md" style={{ color: 'var(--gold-dark)' }}>✅ Registered Teams</h3>
                        <div className="grid grid-cols-1 gap-md mb-xl">
                            {registeredTeams.map(team => (
                                <div key={team.teamCode} className="card">
                                    <div className="flex justify-between items-start mb-md">
                                        <div>
                                            <h4 className="mb-xs">{team.teamName} ({team.teamCode})</h4>
                                            <p className="text-sm" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>
                                                Secret Code: {team.secretCode}
                                            </p>
                                        </div>
                                        <span className={`badge ${team.completedAt ? 'badge-success' : 'badge-warning'}`}>
                                            Round {team.currentRound >= 4 ? '4/4 ✓' : `${team.currentRound + 1}/4`}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-sm">
                                        {team.teamMembers?.map((member, idx) => (
                                            <div key={idx} className="panel panel-tight">
                                                <p className="text-xs text-muted mb-xs">Member {idx + 1}</p>
                                                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{member.name}</p>
                                                <p className="text-xs text-muted">{member.mobile}</p>
                                                <p className="text-xs text-muted">{member.branch} - Year {member.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {unregisteredTeams.length > 0 && (
                            <>
                                <h3 className="mb-md" style={{ color: 'var(--brown-medium)' }}>⏳ Pending Registration</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-sm">
                                    {unregisteredTeams.map(team => (
                                        <div key={team.teamCode} className="badge badge-warning" style={{ padding: 'var(--spacing-sm)' }}>
                                            {team.teamCode}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderQuestions = () => (
        <div className="questions-view">
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h2 className="mb-xs">📜 Team Questions & Riddles</h2>
                    <p className="text-sm text-muted">View all riddles for each team</p>
                </div>
            </div>

            {teams.length === 0 ? (
                <div className="card text-center p-lg">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📋</div>
                    <h3 className="mb-sm">No Teams Yet</h3>
                    <p className="text-muted">Initialize teams first to view riddles</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-md">
                    {teams.map(team => (
                        <div key={team.teamCode} className="card">
                            <div
                                className="flex justify-between items-center p-md"
                                style={{ cursor: 'pointer', borderBottom: expandedTeamInQuestions === team.teamCode ? '2px solid var(--gold-dark)' : 'none' }}
                                onClick={() => setExpandedTeamInQuestions(
                                    expandedTeamInQuestions === team.teamCode ? null : team.teamCode
                                )}
                            >
                                <div>
                                    <h4 className="mb-xs">{team.teamName}</h4>
                                    <p className="text-xs text-muted">{team.teamCode}</p>
                                </div>
                                <div className="flex items-center gap-sm">
                                    <span className={`badge ${team.isRegistered ? 'badge-success' : 'badge-warning'}`}>
                                        {team.isRegistered ? '✅ Registered' : '⏳ Pending'}
                                    </span>
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {expandedTeamInQuestions === team.teamCode ? '▼' : '▶'}
                                    </span>
                                </div>
                            </div>

                            {expandedTeamInQuestions === team.teamCode && (
                                <div className="p-md" style={{ background: 'rgba(212, 175, 55, 0.03)' }}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                                        {team.route && team.route.map((routeItem, idx) => (
                                            <div key={idx} className="panel panel-tight">
                                                <div className="flex justify-between items-center mb-sm">
                                                    <h5 style={{ color: 'var(--gold-dark)', margin: 0 }}>
                                                        🔹 Round {routeItem.round}
                                                    </h5>
                                                    <span className="text-xs text-muted">{routeItem.locationId}</span>
                                                </div>
                                                <p style={{
                                                    fontStyle: 'italic',
                                                    color: 'var(--brown-dark)',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.5',
                                                    marginBottom: 0,
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    "{routeItem.riddle}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
            {/* Three Logo Display */}
            <div className="brand-logos" style={{ marginBottom: 'var(--spacing-md)', gap: 'var(--spacing-sm)' }}>
                <img
                    src="/assets/width_193.png"
                    alt="EduMoon"
                    className="brand-logo brand-logo--sm brand-logo--soft"
                />
                <img
                    src="/assets/width_800.png"
                    alt="EduMoon Student Clubs"
                    className="brand-logo brand-logo--lg"
                />
                <img
                    src="/assets/width_500.png"
                    alt="EduMoon"
                    className="brand-logo brand-logo--md brand-logo--soft"
                />
            </div>

            <div className="header mb-xl">
                <h1 className="gradient-text mb-sm text-center">🎮 Game Master</h1>
                <p className="text-muted mb-md text-center">Manage teams, riddles, and QR codes for the treasure hunt</p>

                {/* Event Control Panel */}
                <div className="card mb-lg" style={{
                    background: eventState?.status === 'active'
                        ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05))'
                        : 'linear-gradient(135deg, rgba(108, 117, 125, 0.1), rgba(108, 117, 125, 0.05))',
                    borderColor: eventState?.status === 'active' ? 'var(--success)' : 'var(--brown-medium)'
                }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="mb-xs" style={{ fontSize: '1.2rem' }}>🎮 Event Control</h3>
                            <p className="text-sm text-muted mb-xs">
                                Status: <strong style={{
                                    color: eventState?.status === 'active' ? 'var(--success)' :
                                        eventState?.status === 'ended' ? 'var(--error)' : 'var(--brown-medium)'
                                }}>
                                    {eventState?.status === 'active' ? '🟢 ACTIVE' :
                                        eventState?.status === 'ended' ? '🔴 ENDED' : '⚫ NOT STARTED'}
                                </strong>
                            </p>
                            {eventState?.startedAt && (
                                <p className="text-xs text-muted" style={{ marginBottom: 0 }}>
                                    Started: {new Date(eventState.startedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-sm">
                            {eventState?.status !== 'active' ? (
                                <button
                                    onClick={handleStartEvent}
                                    className="btn btn-primary"
                                    style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                                >
                                    🚀 Start Event
                                </button>
                            ) : (
                                <button
                                    onClick={handleStopEvent}
                                    className="btn btn-primary"
                                    style={{ background: 'var(--error)', borderColor: 'var(--error)' }}
                                >
                                    🛑 Stop Event
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="tabs flex gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        className={`btn ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('teams')}
                    >
                        👥 Teams
                    </button>
                    <button
                        className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('questions')}
                    >
                        📜 Riddles
                    </button>
                    <button
                        className={`btn ${activeTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('registrations')}
                    >
                        📋 Registrations
                    </button>
                    <button
                        className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        📢 Broadcast
                    </button>
                    <button
                        className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        � Activity
                    </button>
                    <button
                        className={`btn ${activeTab === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('qr')}
                    >
                        📱 QR Codes
                    </button>
                    <Link to="/print-codes" className="btn btn-warning" target="_blank" style={{ marginRight: '5px' }}>
                        🖨️ Riddles
                    </Link>
                    <Link to="/print-stickers" className="btn btn-info" target="_blank" style={{ background: '#17a2b8', color: 'white', border: 'none' }}>
                        🏷️ Stickers
                    </Link>
                </div>
            </div>

            <div className="tab-content mt-lg">
                {activeTab === 'teams' && renderTeams()}
                {activeTab === 'questions' && renderQuestions()}
                {activeTab === 'registrations' && renderRegistrations()}
                {activeTab === 'qr' && <QRGenerator />}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="container-sm">
                        <div className="card">
                            <h2 className="mb-md">📢 Broadcast Message</h2>
                            <p className="mb-md text-muted">Send a message to ALL active players immediately.</p>

                            <div className="form-group mb-md">
                                <textarea
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full p-sm border rounded"
                                    style={{ minHeight: '100px', width: '100%', fontSize: '1.1rem' }}
                                />
                            </div>

                            <button
                                onClick={async () => {
                                    if (!broadcastMsg.trim()) return;
                                    setIsSending(true);
                                    await sendNotification(broadcastMsg, 'alert');
                                    addNotification(`📢 Broadcast sent: "${broadcastMsg}"`, 'success');
                                    setBroadcastMsg('');
                                    setIsSending(false);
                                }}
                                className="btn btn-primary w-full"
                                disabled={isSending || !broadcastMsg.trim()}
                            >
                                {isSending ? 'Sending...' : '📢 Send Broadcast'}
                            </button>
                        </div>

                        <div className="mt-lg">
                            <h3>Recent Alerts</h3>
                            {notifications.length === 0 && <p className="text-muted">No recent alerts.</p>}
                            <div className="flex flex-col gap-sm mt-sm">
                                {notifications.map(n => (
                                    <div key={n.id} className={`p-sm rounded border ${n.type === 'success' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        {n.message} <span className="text-xs text-muted ml-sm">{new Date(n.id).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIVITY LOG TAB */}
                {activeTab === 'activity' && (
                    <div className="container-sm">
                        <div className="card">
                            <div className="flex justify-between items-center mb-md">
                                <h2>📜 Activity Log</h2>
                                <span className="badge badge-warning">Live</span>
                            </div>

                            <div className="activity-feed" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {activityLog.length === 0 ? (
                                    <p className="text-muted text-center p-lg">No activity recorded yet.</p>
                                ) : (
                                    activityLog.map((log) => (
                                        <div key={log.id} className="p-md mb-sm border-bottom flex gap-md items-start" style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '1.5rem' }}>
                                                {log.type === 'success' ? '🏆' : log.type === 'warning' ? '⚠️' : 'ℹ️'}
                                            </div>
                                            <div>
                                                <p className="mb-xs" style={{ fontSize: '1.05rem' }}>{log.text}</p>
                                                <p className="text-xs text-muted">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                    {log.teamCode && <span className="ml-sm font-bold">• Team {log.teamCode}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* Notification Toast Container */}
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {notifications.map(n => (
                        <div key={n.id} className="card fade-in" style={{
                            background: n.type === 'success' ? 'var(--success)' : 'var(--gold-dark)',
                            color: 'white',
                            padding: '1rem',
                            minWidth: '300px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            border: 'none'
                        }}>
                            <div className="flex justify-between items-start">
                                <span>{n.message}</span>
                                <button
                                    onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {renderEditModal()}
            </div>
        </div>
    );
};

export default AdminDashboard;
