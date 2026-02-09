import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './layout/AdminLayout';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

function HomePage() {
    return (
        <div className="container-sm" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
            <div className="card fade-in" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                <img
                    src="/assets/width_500.png"
                    alt="EduMoon Student Clubs"
                    className="logo"
                    style={{ margin: '0 auto var(--spacing-md)' }}
                />

                <h1 className="gradient-text mb-sm">EduMoon Treasure Hunt</h1>

                <p className="text-muted mb-lg" style={{ fontSize: '1.1rem' }}>
                    Welcome to the treasure hunt platform
                </p>

                <div className="flex flex-col gap-md mb-lg">
                    <Link to="/scan?loc=TEST" className="btn btn-primary">
                        🔍 Scan QR Code (Test)
                    </Link>
                    <Link to="/admin" className="btn btn-secondary">
                        📊 Admin Dashboard
                    </Link>
                </div>

                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid rgba(233, 30, 99, 0.2)'
                }}>
                    <p className="text-sm text-muted">
                        💡 <strong>How it works:</strong><br />
                        QR codes should link to:<br />
                        <code style={{
                            background: 'rgba(0, 0, 0, 0.08)',
                            padding: '0.35rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            color: 'var(--brown-darkest)',
                            display: 'inline-block',
                            marginTop: 'var(--spacing-xs)'
                        }}>
                            your-domain.com/scan?loc=LOCATION_ID
                        </code>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
