import React, { useState, useEffect } from 'react';
import { getHeatmap } from '../services/api';
import { MousePointer2, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeatmapView = () => {
    const [pageUrl, setPageUrl] = useState('/');
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadHeatmap = async () => {
        setLoading(true);
        try {
            const data = await getHeatmap(pageUrl);
            setClicks(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadHeatmap();
    }, []);

    // Provide some preset URLs
    const presets = ['/', '/login', '/dashboard', '/profile', '/settings', '/admin'];

    return (
        <div className="dashboard-content" style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
            <div className="page-header" style={{ position: 'relative', zIndex: 10 }}>
                <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} /> Back to Admin
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Heatmap Tracking</h1>
                        <p className="page-subtitle">Visualize where your users are clicking.</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Select Page URL to Analyze:</label>
                        <select
                            value={pageUrl}
                            onChange={(e) => setPageUrl(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', minWidth: '200px' }}
                        >
                            {presets.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <button onClick={loadHeatmap} className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCcw size={16} /> Update Heatmap
                    </button>
                    {loading && <span style={{ marginTop: '1.25rem' }}>Loading clicks...</span>}
                </div>
            </div>

            {/* Simulated Window for Heatmap */}
            <div style={{
                position: 'relative',
                marginTop: '2rem',
                width: '100%',
                height: '600px',
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1, pointerEvents: 'none' }}>
                    <MousePointer2 size={100} />
                </div>

                {clicks.length === 0 && !loading && (
                    <div style={{ position: 'absolute', top: '40%', width: '100%', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No clicks recorded for this URL yet. Interaction events take about 5 seconds to sync.
                    </div>
                )}

                {/* Draw the Heatmap Layer */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', backdropFilter: 'blur(2px)' }}>
                    {clicks.map((click, i) => {
                        // Normalize slightly if viewport width differs significantly (for demo, we just place it)
                        const scaleX = click.viewportWidth ? (window.innerWidth / click.viewportWidth) : 1;
                        let x = click.x * scaleX;
                        let y = click.y;

                        return (
                            <div key={i} style={{
                                position: 'absolute',
                                top: y,
                                left: x,
                                width: '30px',
                                height: '30px',
                                background: 'radial-gradient(circle, rgba(255, 0, 0, 0.8) 0%, rgba(255, 100, 0, 0.4) 50%, rgba(255, 200, 0, 0) 100%)',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.7,
                                mixBlendMode: 'screen'
                            }}></div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HeatmapView;
