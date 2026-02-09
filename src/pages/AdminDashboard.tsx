import React, { useEffect, useState } from 'react';
import {
    Location,
    Team,
    subscribeToLocations,
    subscribeToTeams,
    updateLocation,
    addLocation,
    formatTimestamp,
    getElapsedTime
} from '../utils/firebase-helpers';
import QRGenerator from '../components/QRGenerator';

const AdminDashboard: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<'tracker' | 'locations' | 'qr'>('tracker');
    const [editingLoc, setEditingLoc] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Location>>({});

    // Real-time subscriptions
    useEffect(() => {
        const unsubLoc = subscribeToLocations(setLocations);
        const unsubTeams = subscribeToTeams(setTeams);
        return () => {
            unsubLoc();
            unsubTeams();
        };
    }, []);

    // Handlers
    const handleEditClick = (loc: Location) => {
        setEditingLoc(loc.id);
        setEditForm(loc);
    };

    const handleSaveLoc = async () => {
        if (editingLoc && editForm) {
            await updateLocation(editingLoc, editForm);
            setEditingLoc(null);
            setEditForm({});
        }
    };

    const handleAddNewLoc = async () => {
        const newId = `LOC_${locations.length + 1}`;
        await addLocation({
            id: newId,
            name: `New Location ${locations.length + 1}`,
            clue: "Enter clue here...",
            sequence: locations.length + 1
        });
    };

    // Render Components
    const renderTracker = () => (
        <div className="grid-tracker">
            {teams.map(team => (
                <div key={team.teamCode} className="card team-card">
                    <div className="team-header">
                        <h3>{team.teamName} <span className="text-muted">({team.teamCode})</span></h3>
                        <span className={`badge ${team.currentRound > 4 ? 'badge-success' : 'badge-warning'}`}>
                            {team.currentRound > 4 ? 'COMPLETED' : `Round ${team.currentRound}`}
                        </span>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min((team.currentRound / 4) * 100, 100)}%` }}
                        ></div>
                    </div>

                    <p className="text-sm">
                        ⏱️ Time: {getElapsedTime(team.startTime)} <br />
                        📍 Last Scan: {team.scans.length > 0
                            ? `${team.scans[team.scans.length - 1].location} at ${formatTimestamp(team.scans[team.scans.length - 1].timestamp)}`
                            : 'Not started'}
                    </p>
                </div>
            ))}
            {teams.length === 0 && <p className="text-center">No teams registered yet.</p>}
        </div>
    );

    const renderLocations = () => (
        <div className="loc-list">
            <button onClick={handleAddNewLoc} className="btn btn-primary mb-lg">
                + Add New Location
            </button>

            {locations.map(loc => (
                <div key={loc.id} className="card mb-lg">
                    {editingLoc === loc.id ? (
                        <div className="edit-form">
                            <h3 className="mb-md">Editing {loc.id}</h3>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    className="input"
                                    value={editForm.name || ''}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Clue (Riddle)</label>
                                <textarea
                                    className="input"
                                    style={{ minHeight: '100px' }}
                                    value={editForm.clue || ''}
                                    onChange={e => setEditForm({ ...editForm, clue: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-sm">
                                <button onClick={handleSaveLoc} className="btn btn-success">Save</button>
                                <button onClick={() => setEditingLoc(null)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="loc-display">
                            <div className="flex justify-between items-center mb-sm">
                                <h3>{loc.name} <span className="text-muted">({loc.id})</span></h3>
                                <button onClick={() => handleEditClick(loc)} className="btn btn-secondary btn-sm">
                                    ✏️ Edit
                                </button>
                            </div>
                            <p className="clue-text">"{loc.clue}"</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="container">
            <div className="admin-header mb-xl">
                <h1 className="gradient-text">Admin Command Center</h1>
                <div className="nav-tabs">
                    <button
                        className={`btn ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('tracker')}
                    >
                        👥 Team Tracker
                    </button>
                    <button
                        className={`btn ${activeTab === 'locations' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('locations')}
                    >
                        📍 Locations & Clues
                    </button>
                    <button
                        className={`btn ${activeTab === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('qr')}
                    >
                        🖨️ QR Generator
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'tracker' && renderTracker()}
                {activeTab === 'locations' && renderLocations()}
                {activeTab === 'qr' && <QRGenerator />}
            </div>

            <style>{`
                .nav-tabs { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
                .grid-tracker { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .team-card { border-left: 4px solid var(--gold-medium); }
                .text-sm { font-size: 0.9rem; color: var(--brown-text); opacity: 0.8; }
                .text-muted { color: var(--brown-light); font-size: 0.8em; }
                .clue-text { font-style: italic; background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
