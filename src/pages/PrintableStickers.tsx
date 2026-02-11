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

const PrintableStickers: React.FC = () => {
    const baseUrl = window.location.origin;
    const teams: TeamData[] = sampleTeams;

    return (
        <div className="printable-stickers-page" style={{ padding: '1cm', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 0.5cm; }
                    .no-print { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                }
                .sticker-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    page-break-inside: avoid;
                    margin-bottom: 20px;
                }
                .sticker-card {
                    border: 1px dashed #ccc;
                    padding: 10px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 220px; /* Fixed height for consistency */
                    box-sizing: border-box;
                }
                .team-label {
                    font-size: 10px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                .location-label {
                    margin-top: 5px;
                    font-size: 12px;
                    font-weight: bold;
                    font-family: monospace;
                    background: #eee;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
            `}</style>

            <div className="no-print" style={{ marginBottom: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0' }}>🖨️ Printable Stickers / Compact View</h1>
                        <p style={{ margin: 0 }}>
                            Optimized for printing cut-out QR codes. <br />
                            Each row represents one team's route (Round 1, 2, 3, Final).
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => window.print()}
                            style={{
                                padding: '12px 24px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Print Stickers
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            style={{
                                marginLeft: '10px',
                                padding: '12px 24px',
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>

            {teams.map((team) => (
                <div key={team.teamCode} style={{ marginBottom: '20px', breakInside: 'avoid' }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        borderBottom: '2px solid black',
                        display: 'inline-block',
                        paddingRight: '20px'
                    }}>
                        {team.teamName} ({team.teamCode})
                    </div>
                    <div className="sticker-grid">
                        {team.route.map((item, index) => {
                            const scanUrl = `${baseUrl}/scan?loc=${item.locationId}`;
                            return (
                                <div key={index} className="sticker-card">
                                    <div className="team-label">{team.teamCode} • R{item.round}</div>
                                    <QRCode
                                        value={scanUrl}
                                        size={120}
                                        style={{ height: 'auto', maxWidth: '100%', width: '120px' }}
                                    />
                                    <div className="location-label">{item.locationId}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PrintableStickers;
