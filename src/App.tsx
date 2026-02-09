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

                {/* Admin Routes */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

// Simple home page with navigation
function HomePage() {
    return (
        <div className="container-sm" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card fade-in" style={{ textAlign: 'center' }}>
                <img src="/assets/width_500.png" alt="EduMoon Student Clubs" className="logo" style={{ margin: '0 auto 1.5rem' }} />

                <h1 className="gradient-text">EduMoon Treasure Hunt</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Welcome to the treasure hunt platform
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <Link to="/scan?loc=TEST" className="btn btn-primary" style={{ textDecoration: 'none', display: 'block' }}>
                        🔍 Scan QR Code (Test)
                    </Link>
                    <Link to="/admin" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'block' }}>
                        📊 Admin Dashboard
                    </Link>
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(233, 30, 140, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(233, 30, 140, 0.3)'
                }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        💡 To scan a real location, your QR codes should link to:<br />
                        <code style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                        }}>
                            https://your-domain.com/scan?loc=LOCATION_ID
                        </code>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
