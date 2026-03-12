import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Loader, CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            handleVerification();
        } else {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [token]);

    const handleVerification = async () => {
        try {
            const res = await verifyEmail(token);
            setStatus('success');
            setMessage(res.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ marginBottom: '1.5rem', color: status === 'loading' ? 'var(--accent-color)' : status === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                    {status === 'loading' && <Loader size={64} style={{ animation: 'spin 2s linear infinite' }} />}
                    {status === 'success' && <CheckCircle size={64} />}
                    {status === 'error' && <XCircle size={64} />}
                </div>

                <h1 className="auth-title">
                    {status === 'loading' && 'Verifying Your Email'}
                    {status === 'success' && 'Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>{message || 'Please wait while we confirm your account.'}</p>

                {status !== 'loading' && (
                    <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        Go to Sign In
                    </Link>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
