import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('admin@dashboard.com'); // Pre-fill for demo
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const trimmedEmail = email.trim();
            const user = await login(trimmedEmail, password);
            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/user');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message === 'Failed to fetch' ? 'Connection error. Is the backend running?' : (err.message || 'Invalid email or password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <Activity size={48} />
                </div>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Enter your credentials to access your dashboard</p>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <Link to="/register" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>Sign Up</Link>
                </div>

                <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <p style={{ marginBottom: '0.25rem', fontWeight: '600' }}>Demo Accounts:</p>
                    <p>Admin: admin@dashboard.com / password123</p>
                    <p>User: john@example.com / password123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
