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
        <div className="printable-stickers-page" style={{
            padding: '2rem',
            background: 'var(--parchment-light)',
            backgroundImage: 'radial-gradient(circle at center, var(--parchment-light) 0%, var(--parchment-base) 100%)',
            minHeight: '100vh',
            color: 'var(--brown-text)',
            fontFamily: "'Cinzel', serif"
        }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 0.5cm; }
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact; 
                        background-image: none !important;
                    }
                    .printable-stickers-page {
                        padding: 0 !important;
                        background: white !important;
                        background-image: none !important;
                    }
                    .sticker-card {
                        border-color: #000 !important; /* High contrast for cutting */
                    }
                }
                .sticker-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    page-break-inside: auto;
                }
                .sticker-card {
                    border: 3px dashed var(--brown-dark); /* Themed dashed border */
                    background: white; /* Keep white for QR contrast */
                    padding: 15px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 310px;
                    box-sizing: border-box;
                    page-break-inside: avoid;
                    border-radius: 8px;
                    position: relative;
                }
                /* Decorative corner styling */
                .sticker-card::after {
                    content: '✦';
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    color: var(--gold-dark);
                    font-size: 1.5rem;
                    opacity: 0.5;
                }
                .sticker-card::before {
                    content: '✦';
                    position: absolute;
                    bottom: 5px;
                    left: 5px;
                    color: var(--gold-dark);
                    font-size: 1.5rem;
                    opacity: 0.5;
                }

                .team-label {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    color: var(--brown-darkest);
                    font-family: 'Cinzel', serif;
                    letter-spacing: 0.05em;
                    border-bottom: 2px solid var(--gold-dark);
                    padding-bottom: 2px;
                }
                .location-label {
                    margin-top: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    font-family: monospace;
                    background: var(--parchment-light);
                    color: var(--brown-darkest);
                    padding: 4px 12px;
                    border-radius: 4px;
                    border: 1px solid var(--brown-light);
                }
            `}</style>

            <div className="no-print" style={{
                marginBottom: '30px',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '12px',
                border: '3px double var(--brown-medium)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{
                            margin: '0 0 10px 0',
                            fontSize: '2.5rem',
                            color: 'var(--brown-darkest)',
                            textShadow: '2px 2px 0px rgba(212, 175, 55, 0.2)'
                        }}>
                            📜 Wall Stickers
                        </h1>
                        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--brown-dark)' }}>
                            <strong>Paper Saver Mode:</strong> Fits ~6 stickers (2 Teams) per page.<br />
                            Themed for your Treasure Hunt adventure.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => window.print()}
                            className="btn btn-primary"
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, var(--gold-bright), var(--gold-dark))',
                                color: 'var(--brown-darkest)',
                                border: '2px solid var(--brown-dark)',
                                borderRadius: '6px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            🖨️ Print Stickers
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="btn btn-secondary"
                            style={{
                                marginLeft: '15px',
                                padding: '12px 24px',
                                background: 'transparent',
                                color: 'var(--brown-dark)',
                                border: '2px solid var(--brown-dark)',
                                borderRadius: '6px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="sticker-grid">
                {teams.flatMap((team) =>
                    // Only Rounds 1, 2, 3
                    team.route.filter(item => item.round < 4).map((item) => ({ team, item }))
                ).map(({ team, item }) => {
                    const scanUrl = `${baseUrl}/scan?loc=${item.locationId}`;
                    return (
                        <div key={`${team.teamCode}-${item.round}`} className="sticker-card">
                            <div className="team-label">{team.teamCode} • {team.teamName} • R{item.round}</div>
                            <QRCode
                                value={scanUrl}
                                size={220}
                                style={{ height: 'auto', maxWidth: '100%', width: '220px' }}
                            />
                            <div className="location-label">{item.locationId}</div>
                        </div>
                    );
                })}
            </div>

            {/* Common Final Location QR */}
            <div style={{
                marginTop: '40px',
                borderTop: '4px double var(--brown-dark)',
                paddingTop: '40px',
                pageBreakBefore: 'always'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        margin: '0 0 20px 0',
                        color: 'var(--brown-darkest)',
                        fontFamily: "'Cinzel Decorative', serif"
                    }}>
                        🏁 FINAL LOCATION
                    </h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '30px', color: 'var(--brown-dark)' }}>
                        Details for the <strong>Final Treasure</strong>.<br />
                        Common for all hunting parties.
                    </p>

                    <div className="sticker-card" style={{
                        margin: '0 auto',
                        maxWidth: '500px',
                        height: 'auto',
                        minHeight: '600px',
                        border: '4px dashed var(--brown-darkest)',
                        background: 'white'
                    }}>
                        <div className="team-label" style={{ fontSize: '40px', borderBottom: '3px solid var(--gold-dark)' }}>
                            FINAL DESTINATION
                        </div>
                        <QRCode
                            value={`${baseUrl}/scan?loc=LOC_4`}
                            size={400}
                            style={{ height: 'auto', maxWidth: '100%', width: '400px', margin: '40px 0' }}
                        />
                        <div className="location-label" style={{
                            fontSize: '30px',
                            padding: '10px 30px',
                            background: 'var(--parchment-dark)',
                            color: 'white'
                        }}>
                            LOC_4
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableStickers;
