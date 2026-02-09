import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface QRGeneratorProps {
    locationId?: string;
    onClose?: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ locationId: initialLocId = '', onClose }) => {
    const [locId, setLocId] = useState(initialLocId);

    const handlePrint = () => {
        const printContent = document.getElementById('qr-to-print');
        const win = window.open('', '', 'height=700,width=700');
        if (win && printContent) {
            win.document.write('<html><head><title>Print QR Code</title>');
            win.document.write('<style>body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }</style>');
            win.document.write('</head><body>');
            win.document.write(printContent.outerHTML);
            win.document.write('</body></html>');
            win.document.close();
            win.print();
        }
    };

    const baseUrl = window.location.origin + '/scan?loc=';

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2 className="gradient-text" style={{ textAlign: 'center' }}>QR Generator</h2>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Location ID</label>
                <input
                    type="text"
                    value={locId}
                    onChange={(e) => setLocId(e.target.value.toUpperCase())}
                    className="input"
                    placeholder="e.g. LOC_1"
                />
            </div>

            {locId && (
                <div id="qr-to-print" style={{
                    padding: '2rem',
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    border: '1px solid #ddd'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <QRCode
                            value={`${baseUrl}${locId}`}
                            size={200}
                        />
                    </div>
                    <p style={{
                        margin: '0',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'black'
                    }}>
                        {locId}
                    </p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                        Scan to unlock the next clue
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={handlePrint}
                    className="btn btn-primary"
                    disabled={!locId}
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
    );
};

export default QRGenerator;
