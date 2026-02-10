import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { registerTeam, TeamMember } from '../utils/firebase-helpers';

const RegistrationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const teamCode = searchParams.get('team') || '';

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { name: '', mobile: '', branch: '', year: '' },
        { name: '', mobile: '', branch: '', year: '' },
        { name: '', mobile: '', branch: '', year: '' },
        { name: '', mobile: '', branch: '', year: '' },
        { name: '', mobile: '', branch: '', year: '' }
    ]);
    const [secretCode, setSecretCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
        const updated = [...teamMembers];
        updated[index][field] = value;
        setTeamMembers(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Validate all members filled
        const allFilled = teamMembers.every(
            member => member.name && member.mobile && member.branch && member.year
        );

        if (!allFilled) {
            setResult({ success: false, message: 'Please fill in all team member details.' });
            setLoading(false);
            return;
        }

        // Validate secret code format
        const codePattern = /^[0-9]{4}[A-Z]$/;
        if (!codePattern.test(secretCode.toUpperCase())) {
            setResult({
                success: false,
                message: 'Secret code must be 4 digits followed by 1 letter (e.g., 1234A)'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await registerTeam(teamCode, teamMembers, secretCode);
            setResult(response);
        } catch (error) {
            setResult({
                success: false,
                message: 'An error occurred. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container-sm">
                <div className="card fade-in">
                    <div className="brand-header">
                        <div className="brand-logos">
                            <img
                                className="brand-logo brand-logo--sm brand-logo--soft"
                                src="/assets/width_193.png"
                                alt="EduMoon"
                            />
                            <img
                                className="brand-logo brand-logo--lg"
                                src="/assets/width_800.png"
                                alt="EduMoon Student Clubs"
                            />
                            <img
                                className="brand-logo brand-logo--md brand-logo--soft"
                                src="/assets/width_500.png"
                                alt="EduMoon"
                            />
                        </div>

                        <h1 className="gradient-text mb-sm">Team Registration</h1>
                        <p className="brand-subtitle">Complete your registration to participate</p>
                    </div>

                    {teamCode && (
                        <div className="badge badge-warning" style={{ marginBottom: 'var(--spacing-md)' }}>
                            📍 {teamCode}
                        </div>
                    )}

                    {!result && (
                        <form onSubmit={handleSubmit}>
                            <div className="divider mb-lg"></div>

                            <h3 className="mb-md" style={{ color: 'var(--gold-dark)' }}>
                                👥 Team Members (5 Required)
                            </h3>

                            {teamMembers.map((member, index) => (
                                <div key={index} className="panel panel-tight mb-md">
                                    <h4 className="mb-sm" style={{ color: 'var(--brown-medium)' }}>
                                        Member {index + 1}
                                    </h4>

                                    <div className="form-group">
                                        <label htmlFor={`name-${index}`}>Full Name *</label>
                                        <input
                                            id={`name-${index}`}
                                            type="text"
                                            className="input"
                                            value={member.name}
                                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                            placeholder="Enter full name"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor={`mobile-${index}`}>Mobile Number *</label>
                                        <input
                                            id={`mobile-${index}`}
                                            type="tel"
                                            className="input"
                                            value={member.mobile}
                                            onChange={(e) => handleMemberChange(index, 'mobile', e.target.value)}
                                            placeholder="10-digit mobile"
                                            pattern="[0-9]{10}"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor={`branch-${index}`}>Branch *</label>
                                        <input
                                            id={`branch-${index}`}
                                            type="text"
                                            className="input"
                                            value={member.branch}
                                            onChange={(e) => handleMemberChange(index, 'branch', e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor={`year-${index}`}>Year of Study *</label>
                                        <select
                                            id={`year-${index}`}
                                            className="input"
                                            value={member.year}
                                            onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                </div>
                            ))}

                            <div className="divider mb-lg"></div>

                            <h3 className="mb-md" style={{ color: 'var(--gold-dark)' }}>
                                🔐 Create Your Secret Code
                            </h3>

                            <div className="hint-box mb-md">
                                <p className="text-sm" style={{ marginBottom: 0 }}>
                                    <strong>⚠️ Important:</strong> This secret code is for your team only. 
                                    You'll need it to scan QR codes at each location. 
                                    Format: 4 digits + 1 letter (e.g., <code className="code-pill">1234A</code>)
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="secretCode">Secret Code *</label>
                                <input
                                    id="secretCode"
                                    type="text"
                                    className="input"
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., 1234A"
                                    pattern="[0-9]{4}[A-Z]"
                                    maxLength={5}
                                    required
                                    disabled={loading}
                                    style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.2em' }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mb-md"
                                disabled={loading}
                            >
                                {loading ? '⏳ Registering...' : '✓ Complete Registration'}
                            </button>

                            <div className="notice">
                                <p className="text-sm text-center" style={{ marginBottom: 0 }}>
                                    📞 <strong>Need Help?</strong><br />
                                    Call Moderator: <a href="tel:8309223139" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>8309223139</a> or <a href="tel:8309302507" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>8309302507</a>
                                </p>
                            </div>
                        </form>
                    )}

                    {result && (
                        <div className={`result-box fade-in ${result.success ? 'result-box--success' : 'result-box--error'}`}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>
                                {result.success ? '✅' : '❌'}
                            </div>

                            <h2
                                className={`mb-md ${result.success ? 'result-title--success' : 'result-title--error'}`}
                                style={{ fontSize: '1.8rem' }}
                            >
                                {result.success ? 'Registration Complete!' : 'Registration Failed'}
                            </h2>

                            <p className="mb-lg" style={{ fontSize: '1.1rem', color: 'var(--brown-dark)', lineHeight: 1.7 }}>
                                {result.message}
                            </p>

                            {result.success && (
                                <div className="notice mb-lg">
                                    <h3 className="notice-title mb-sm">🗝️ Your Secret Code</h3>
                                    <p style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.3em',
                                        color: 'var(--gold-dark)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        {secretCode}
                                    </p>
                                    <p className="text-sm text-muted" style={{ marginBottom: 0 }}>
                                        Remember this code! You'll need it for all location scans.
                                    </p>
                                </div>
                            )}

                            {result.success ? (
                                <Link to="/scan?loc=LOC_1" className="btn btn-primary w-full">
                                    🎯 Start Treasure Hunt
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setResult(null)}
                                    className="btn btn-secondary w-full"
                                >
                                    ← Try Again
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
