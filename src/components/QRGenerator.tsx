import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface QRGeneratorProps {
    locationId?: string;
    onClose?: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ locationId: initialLocId = '', onClose }) => {
    const [locId, setLocId] = useState(initialLocId);
    const [qrType, setQrType] = useState<'location' | 'registration'>('location');
    const [teamCode, setTeamCode] = useState('');

    const handlePrint = () => {
        const printContent = document.getElementById('qr-to-print');
        const win = window.open('', '', 'height=700,width=700');
        if (win && printContent) {
            win.document.write('<html><head><title>Print QR Code - ' + (qrType === 'registration' ? teamCode : locId) + '</title>');
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
    const qrUrl = qrType === 'registration' 
        ? `${baseUrl}/register?team=${teamCode}`
        : `${baseUrl}/scan?loc=${locId}`;
    const displayValue = qrType === 'registration' ? teamCode : locId;

    return (
        <div className="qr-generator-view">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="mb-sm text-center">📱 QR Code Generator</h2>
                <p className="text-sm text-muted text-center mb-lg">
                    Generate QR codes for registration or location checkpoints
                </p>

                <div className="form-group">
                    <label htmlFor="qr-type">QR Code Type</label>
                    <select
                        id="qr-type"
                        className="input"
                        value={qrType}
                        onChange={(e) => setQrType(e.target.value as 'location' | 'registration')}
                    >
                        <option value="location">Location Checkpoint</option>
                        <option value="registration">Team Registration</option>
                    </select>
                </div>

                {qrType === 'registration' ? (
                    <div className="form-group">
                        <label htmlFor="team-code">Team Code</label>
                        <input
                            id="team-code"
                            type="text"
                            value={teamCode}
                            onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                            className="input"
                            placeholder="e.g. TEAM001, TEAM002..."
                        />
                        <p className="text-xs text-muted" style={{ marginTop: 'var(--spacing-xs)' }}>
                            💡 Generate registration QR for initial team sign-up
                        </p>
                    </div>
                ) : (
                    <div className="form-group">
                        <label htmlFor="location-id">Location ID</label>
                        <input
                            id="location-id"
                            type="text"
                            value={locId}
                            onChange={(e) => setLocId(e.target.value.toUpperCase())}
                            className="input"
                            placeholder="e.g. LOC_1, LOC_2, FINAL..."
                        />
                        <p className="text-xs text-muted" style={{ marginTop: 'var(--spacing-xs)' }}>
                            💡 Enter the LOCATION ID only (teams enter their secret code on the scan page)
                        </p>
                    </div>
                )}

                {displayValue && (
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
                                {displayValue}
                            </p>
                        </div>
                        <p style={{
                            margin: '0',
                            fontSize: '0.9rem',
                            color: 'var(--brown-light)',
                            fontStyle: 'italic'
                        }}>
                            {qrType === 'registration' ? '📝 Scan to register your team' : '🗝️ Scan to unlock the next clue'}
                        </p>
                    </div>
                )}

                <div className="flex gap-md">
                    <button
                        onClick={handlePrint}
                        className="btn btn-primary"
                        disabled={!displayValue}
                        style={{ flex: 1 }}
                    >
                        🖨️ Print QR Code
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="btn btn-secondary">
                            Close
                        </button>
                    )}
                </div>

                {!displayValue && (
                    <div className="text-center mt-lg hint-box">
                        <p className="text-sm text-muted">
                            ⬆️ Select QR type and enter {qrType === 'registration' ? 'team code' : 'location ID'} above to generate
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRGenerator;
