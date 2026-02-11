import React from 'react';

interface InstructionsModalProps {
    onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    return (
        <div className="modal-overlay fade-in" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header bg-gold">
                    <h2 className="text-center" style={{ fontFamily: 'Cinzel Decorative', color: 'var(--brown-darkest)' }}>
                        📜 Hunter's Code
                    </h2>
                </div>

                <div className="panel-pad">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                        {/* DO'S */}
                        <div className="card" style={{ borderColor: 'var(--success)', background: 'rgba(45, 80, 22, 0.05)' }}>
                            <h3 className="text-center" style={{ color: 'var(--success)' }}>✅ DO's</h3>
                            <ul className="text-sm" style={{ listStyle: 'none', padding: 0 }}>
                                <li className="mb-sm">🏃‍♂️ <strong>Move Quickly:</strong> Time is ticking!</li>
                                <li className="mb-sm">🤝 <strong>Work Together:</strong> Share clues with your team.</li>
                                <li className="mb-sm">📱 <strong>Scan Carefully:</strong> Ensure QR codes are readable.</li>
                                <li className="mb-sm">💧 <strong>Stay Hydrated:</strong> It's a physical hunt!</li>
                            </ul>
                        </div>

                        {/* DON'TS */}
                        <div className="card" style={{ borderColor: 'var(--error)', background: 'rgba(139, 0, 0, 0.05)' }}>
                            <h3 className="text-center" style={{ color: 'var(--error)' }}>❌ DON'Ts</h3>
                            <ul className="text-sm" style={{ listStyle: 'none', padding: 0 }}>
                                <li className="mb-sm">🚫 <strong>Don't Cheat:</strong> Sharing answers ruins the fun.</li>
                                <li className="mb-sm">🏚️ <strong>Don't Damage Property:</strong> Respect the campus.</li>
                                <li className="mb-sm">🏃 <strong>Don't Run Inside:</strong> Safety first!</li>
                                <li className="mb-sm">🔊 <strong>Don't Be Loud:</strong> Determine quietly near classes.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="notice mt-lg text-center">
                        <p className="text-muted text-sm">
                            "The true treasure is the journey... and the prize at the end!"
                        </p>
                    </div>

                    <div className="flex justify-center mt-lg">
                        <button onClick={onClose} className="btn btn-primary w-full">
                            I Understand, Let's Hunt! 🏴‍☠️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructionsModal;
