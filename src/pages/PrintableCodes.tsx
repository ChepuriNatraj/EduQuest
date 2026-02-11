import React from 'react';
import QRCode from 'react-qr-code';
// @ts-ignore
import { sampleTeams } from '../../sample-data';

interface RouteItem {
    round: number;
    locationId: string;
    riddle: string;
}

interface TeamData {
    teamCode: string;
    teamName: string;
    route: RouteItem[];
}

const PrintableCodes: React.FC = () => {
    const baseUrl = window.location.origin;
    const teams: TeamData[] = sampleTeams;

    return (
        <div className="printable-page" style={{ padding: '2rem', background: 'white', color: 'black' }}>
            <div className="no-print" style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
                <h1>🖨️ Printable QR Codes & Riddles</h1>
                <p>Use your browser's print function (Ctrl+P / Cmd+P) to print these cards.</p>
                <button
                    onClick={() => window.print()}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Print Now
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none; }
                    .page-break { page-break-after: always; }
                    .card-container { break-inside: avoid; }
                    body { background: white !important; color: black !important; }
                }
            `}</style>

            {teams.map((team) => (
                <div key={team.teamCode} className="team-section page-break">
                    <h2 style={{ borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        {team.teamName} ({team.teamCode})
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {team.route.map((item, index) => {
                            // Unique URL for this location
                            const scanUrl = `${baseUrl}/scan?loc=${item.locationId}`;

                            return (
                                <div key={index} className="card-container" style={{
                                    border: '1px solid #ddd',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0 }}>Round {item.round}</h3>
                                        <span style={{
                                            background: '#eee',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9rem'
                                        }}>
                                            ID: {item.locationId}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                                        <div style={{ flex: '0 0 120px' }}>
                                            <QRCode
                                                value={scanUrl}
                                                size={120}
                                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666' }}>Riddle to find this spot:</h4>
                                            <p style={{
                                                whiteSpace: 'pre-line',
                                                margin: 0,
                                                fontStyle: 'italic',
                                                fontSize: '1.1rem',
                                                lineHeight: '1.5'
                                            }}>
                                                "{item.riddle}"
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
                                        Scan to Verify Location • {team.teamCode}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PrintableCodes;
