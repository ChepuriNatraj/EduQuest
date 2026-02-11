import React, { useEffect, useState } from 'react';
import {
    Team,
    RouteItem,
    subscribeToTeams,
    initializeTeams,
    updateTeamRoute,
    db
} from '../utils/firebase-helpers';
import { doc, updateDoc } from 'firebase/firestore';
import QRGenerator from '../components/QRGenerator';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<'teams' | 'qr' | 'registrations'>('teams');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [editRoute, setEditRoute] = useState<RouteItem[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubTeams = subscribeToTeams(setTeams);
        return () => unsubTeams();
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

    const [editTeamName, setEditTeamName] = useState('');
    const [qrPreview, setQrPreview] = useState<string | null>(null);

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
                <div className="card text-center p-lg">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📋</div>
                    <h3 className="mb-sm">No Teams Found</h3>
                    <p className="text-muted mb-md">Click "Initialize 15 Teams" to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {teams.map(team => {
                        const completedRounds = team.currentRound;
                        const isComplete = completedRounds >= 4;
                        const progressPercent = Math.min((completedRounds / 4) * 100, 100);

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

                                <div className="progress-bar mb-sm">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>

                                <p className="text-xs text-muted mb-sm">
                                    {isComplete ? 'All rounds complete!' : `On Round ${completedRounds + 1} of 4`}
                                </p>

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
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
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

                <div className="tabs flex gap-sm">
                    <button
                        className={`btn ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('teams')}
                    >
                        👥 Teams & Riddles
                    </button>
                    <button
                        className={`btn ${activeTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('registrations')}
                    >
                        📋 Registrations
                    </button>
                    <button
                        className={`btn ${activeTab === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('qr')}
                    >
                        📱 Generate QR
                    </button>
                    <Link to="/print-codes" className="btn btn-warning" target="_blank">
                        🖨️ Print All Codes
                    </Link>
                </div>
            </div>

            {activeTab === 'teams' && renderTeams()}
            {activeTab === 'registrations' && renderRegistrations()}
            {activeTab === 'qr' && <QRGenerator />}
            {renderEditModal()}
        </div>
    );
};

export default AdminDashboard;
