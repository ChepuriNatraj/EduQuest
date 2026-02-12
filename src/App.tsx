import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './layout/AdminLayout';
import RegistrationPage from './pages/RegistrationPage';
import PrintableCodes from './pages/PrintableCodes';
import PrintableStickers from './pages/PrintableStickers';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/print-codes" element={<PrintableCodes />} />
                    <Route path="/print-stickers" element={<PrintableStickers />} />
                </Route>
            </Routes>
        </Router>
    );
}

function HomePage() {
    return (
        <div className="page page-center">
            <div className="container-sm">
                <div className="card fade-in" style={{ textAlign: 'center' }}>
                    <div className="brand-header">
                        <div className="brand-logos" style={{ justifyContent: 'center' }}>
                            <img
                                className="brand-logo"
                                src="/assets/width_500.png"
                                alt="EduMoon Student Clubs"
                                style={{ maxWidth: '250px' }}
                            />
                        </div>
                        <h1 className="gradient-text mb-sm">EDUQUEST</h1>
                        <p className="brand-subtitle">The Ultimate Student Adventure</p>
                    </div>

                    <div className="stack gap-md mb-lg">
                        <Link to="/scan?loc=TEST" className="btn btn-primary">
                            🔍 Scan QR Code (Test)
                        </Link>
                        <Link to="/admin" className="btn btn-secondary">
                            📊 Admin Dashboard
                        </Link>
                    </div>

                    <div className="hint-box">
                        <p className="text-sm text-muted" style={{ marginBottom: 0 }}>
                            💡 <strong>How it works:</strong><br />
                            QR codes should link to:<br />
                            <span className="code-pill" style={{ marginTop: 'var(--spacing-xs)' }}>
                                your-domain.com/scan?loc=LOCATION_ID
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
