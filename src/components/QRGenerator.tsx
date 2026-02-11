import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { subscribeToTeams, Team } from '../utils/firebase-helpers';

interface QRGeneratorProps {
    onClose?: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ onClose }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState('');

    useEffect(() => {
        const unsub = subscribeToTeams(setTeams);
        return () => unsub();
    }, []);

    const handlePrint = () => {
        const printContent = document.getElementById('qr-to-print');
        const win = window.open('', '', 'height=700,width=700');
        if (win && printContent) {
            win.document.write('<html><head><title>Print QR Code - ' + selectedTeam + '</title>');
            win.document.write(`
                <style>
                    @media print {
                        @page { margin: 1cm; }
                    }
                    body { 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        min-height: 100vh; 
                        font-family: 'Georgia', serif;
                        margin: 0;
                        padding: 20px;
                    }
                    .print-wrapper {
                        text-align: center;
                        page-break-after: always;
                    }
                </style>
            `);
            win.document.write('</head><body>');
            win.document.write('<div class="print-wrapper">');
            win.document.write(printContent.innerHTML);
            win.document.write('</div>');
            win.document.write('</body></html>');
            win.document.close();
            win.print();
        }
    };

    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/register?team=${selectedTeam}`;

    // Sort teams: Unregistered first, then by name
    const sortedTeams = [...teams].sort((a, b) => {
        if (a.isRegistered === b.isRegistered) {
            return a.teamCode.localeCompare(b.teamCode);
        }
        return a.isRegistered ? 1 : -1;
    });

    return (
        <div className="qr-generator-view">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="mb-sm text-center">📱 Team QR Generator</h2>
                <p className="text-sm text-muted text-center mb-lg">
                    Generate registration QR codes for specific teams
                </p>

                <div className="form-group">
                    <label htmlFor="team-select">Select Team</label>
                    <select
                        id="team-select"
                        className="input"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                        <option value="">-- Select a Team --</option>
                        {sortedTeams.map(team => (
                            <option
                                key={team.teamCode}
                                value={team.teamCode}
                                disabled={team.isRegistered}
                            >
                                {team.teamName} ({team.teamCode}) {team.isRegistered ? '✅ Registered' : '⏳ Waiting'}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted" style={{ marginTop: 'var(--spacing-xs)' }}>
                        💡 Only unregistered teams can be selected
                    </p>
                </div>

                {selectedTeam && (
                    <div
                        id="qr-to-print"
                        className="qr-display fade-in"
                        style={{
                            padding: 'var(--spacing-lg)',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center',
                            marginBottom: 'var(--spacing-lg)',
                            border: '3px double var(--brown-medium)',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <div style={{
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <QRCode
                                value={qrUrl}
                                size={220}
                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                viewBox="0 0 220 220"
                            />
                        </div>
                        <div style={{
                            padding: 'var(--spacing-sm)',
                            background: 'linear-gradient(135deg, var(--gold-bright), var(--gold-dark))',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            <p style={{
                                margin: '0',
                                fontSize: '1.75rem',
                                fontWeight: 'bold',
                                color: 'var(--brown-darkest)',
                                fontFamily: "'Cinzel', serif",
                                letterSpacing: '0.1em'
                            }}>
                                {selectedTeam}
                            </p>
                        </div>
                        <p style={{
                            margin: '0',
                            fontSize: '0.9rem',
                            color: 'var(--brown-light)',
                            fontStyle: 'italic'
                        }}>
                            📝 Scan to register as {selectedTeam}
                        </p>
                    </div>
                )}

                <div className="flex gap-md">
                    <button
                        onClick={handlePrint}
                        className="btn btn-primary"
                        disabled={!selectedTeam}
                        style={{ flex: 1 }}
                    >
                        🖨️ Print QR
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="btn btn-secondary">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;
