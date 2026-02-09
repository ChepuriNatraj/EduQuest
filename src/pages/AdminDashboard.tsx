import React, { useEffect, useState } from 'react';
import {
    Team,
    RouteItem,
    subscribeToTeams,
    initializeTeams,
    updateTeamRoute
} from '../utils/firebase-helpers';
import QRGenerator from '../components/QRGenerator';

const AdminDashboard: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<'teams' | 'qr'>('teams');
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

    const openEditModal = (team: Team) => {
        setEditingTeam(team);
        const route = [...team.route];
        while (route.length < 4) {
            route.push({ round: route.length + 1, locationId: '', riddle: '' });
        }
        setEditRoute(route);
    };

    const handleSaveRoute = async () => {
        if (editingTeam) {
            setSaving(true);
            try {
                await updateTeamRoute(editingTeam.teamCode, editRoute);
                setEditingTeam(null);
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
                <button onClick={handleInitTeams} className="btn btn-primary">
                    🚀 Initialize 15 Teams
                </button>
            </div>

            {teams.length === 0 ? (
                <div className="card text-center p-lg">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📋</div>
                    <h3 className="mb-sm">No Teams Found</h3>
                    <p className="text-muted mb-md">Click "Initialize 15 Teams" to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {teams.map(team => (
                        <div key={team.teamCode} className="card" style={{ padding: 'var(--spacing-md)' }}>
                            <div className="flex justify-between items-start mb-sm">
                                <div>
                                    <h4 className="mb-xs">{team.teamName}</h4>
                                    <p className="text-xs text-muted">{team.teamCode}</p>
                                </div>
                                <span className={`badge ${team.currentRound >= 4 ? 'badge-success' : 'badge-warning'}`}>
                                    {team.currentRound >= 4 ? '✓ DONE' : `Round ${team.currentRound + 1}`}
                                </span>
                            </div>

                            <div className="progress-bar mb-sm">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min((team.currentRound / 4) * 100, 100)}%` }}
                                />
                            </div>

                            <p className="text-xs text-muted mb-sm">
                                Progress: {team.currentRound} / 4 locations
                            </p>

                            <button
                                onClick={() => openEditModal(team)}
                                className="btn btn-secondary btn-sm w-full"
                            >
                                ✏️ Edit Riddles
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderEditModal = () => {
        if (!editingTeam) return null;

        return (
            <div className="modal-overlay" onClick={() => !saving && setEditingTeam(null)}>
                <div className="modal-content card fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header mb-lg">
                        <h2 className="mb-xs">Edit {editingTeam.teamName}</h2>
                        <p className="text-sm text-muted">{editingTeam.teamCode} - Configure all 4 rounds</p>
                    </div>

                    <div className="modal-body" style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        paddingRight: 'var(--spacing-xs)'
                    }}>
                        {editRoute.map((item, idx) => (
                            <div
                                key={idx}
                                className="riddle-group mb-lg"
                                style={{
                                    paddingBottom: 'var(--spacing-md)',
                                    borderBottom: idx < editRoute.length - 1 ? '2px solid var(--brown-light)' : 'none'
                                }}
                            >
                                <h4 className="mb-sm" style={{ color: 'var(--gold-dark)' }}>
                                    🔹 Round {idx + 1}
                                </h4>

                                <div className="form-group">
                                    <label htmlFor={`loc-${idx}`}>Target Location ID</label>
                                    <input
                                        id={`loc-${idx}`}
                                        className="input"
                                        value={item.locationId}
                                        onChange={e => updateRouteItem(idx, 'locationId', e.target.value.toUpperCase())}
                                        placeholder="e.g. LOC_1"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor={`riddle-${idx}`}>Riddle / Clue</label>
                                    <textarea
                                        id={`riddle-${idx}`}
                                        className="input"
                                        value={item.riddle}
                                        onChange={e => updateRouteItem(idx, 'riddle', e.target.value)}
                                        placeholder="Enter the riddle students see BEFORE finding this location..."
                                        rows={3}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="modal-footer flex gap-md justify-end mt-lg">
                        <button
                            onClick={() => setEditingTeam(null)}
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

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
            <div className="header mb-xl">
                <h1 className="gradient-text mb-sm">🎮 Game Master</h1>
                <p className="text-muted mb-md">Manage teams, riddles, and QR codes for the treasure hunt</p>

                <div className="tabs flex gap-sm">
                    <button
                        className={`btn ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('teams')}
                    >
                        👥 Teams & Riddles
                    </button>
                    <button
                        className={`btn ${activeTab === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('qr')}
                    >
                        📱 Generate QR
                    </button>
                </div>
            </div>

            {activeTab === 'teams' ? renderTeams() : <QRGenerator />}
            {renderEditModal()}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: var(--spacing-md);
                }
                
                .modal-content {
                    width: 100%;
                    max-width: 700px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(135deg, var(--parchment-lightest) 0%, var(--parchment-light) 100%);
                }

                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                }

                .modal-body::-webkit-scrollbar {
                    width: 8px;
                }

                .modal-body::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }

                .modal-body::-webkit-scrollbar-thumb {
                    background: var(--brown-medium);
                    border-radius: 4px;
                }

                .modal-body::-webkit-scrollbar-thumb:hover {
                    background: var(--brown-dark);
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
