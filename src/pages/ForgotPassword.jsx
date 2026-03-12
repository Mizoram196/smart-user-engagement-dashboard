import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await forgotPassword(email);
            setSuccess(res.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel" style={{ maxWidth: '400px' }}>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
                    <Mail size={48} />
                </div>
                <h1 className="auth-title">Forgot Password?</h1>
                <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? 'Sending link...' : (
                            <>
                                <Send size={20} />
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
