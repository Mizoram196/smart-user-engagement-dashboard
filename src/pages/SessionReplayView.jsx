import React, { useState, useEffect, useRef } from 'react';
import { getReplays, getReplayData } from '../services/api';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, Calendar, ArrowLeft, MousePointer2, Film } from 'lucide-react';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

const SessionReplayView = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [events, setEvents] = useState([]);
    const [playing, setPlaying] = useState(false);

    // Playback state
    const replayContainerRef = useRef(null);
    const playerInst = useRef(null);

    useEffect(() => {
        getReplays().then(data => {
            setSessions(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleSelectSession = async (session) => {
        if (playing) stopPlayback();
        setSelectedSession(session);
        setEvents([]); // clearing

        try {
            const data = await getReplayData(session.sessionId);
            setEvents(data || []);
        } catch (e) {
            console.error("Fetch replay err", e);
        }
    };

    const startPlayback = () => {
        if (!events || events.length < 2) return;
        setPlaying(true);

        if (playerInst.current) {
            // Already initialized, just play
            playerInst.current.play();
        } else if (replayContainerRef.current) {
            // New instance
            // We need to pass rrweb valid events. Our server returns exactly what stopRrweb packed.
            try {
                // Rrweb player strictly requires sorting and needs at least a DOM snapshot
                // (which rrweb sent when it started).
                playerInst.current = new rrwebPlayer({
                    target: replayContainerRef.current,
                    props: {
                        events: events,
                        width: replayContainerRef.current.clientWidth,
                        height: replayContainerRef.current.clientHeight,
                    },
                });
            } catch (err) {
                console.error("rrweb player error", err);
                setPlaying(false);
            }
        }
    };

    const stopPlayback = () => {
        setPlaying(false);
        if (playerInst.current) {
            playerInst.current.pause();
        }
    };

    // Whenever we select a NEW session, destroy the old player instance
    useEffect(() => {
        if (playerInst.current) {
            playerInst.current.$destroy(); // rrweb-player destruct
            playerInst.current = null;
        }
        setPlaying(false);
    }, [selectedSession]);

    useEffect(() => {
        return () => stopPlayback();
    }, []);

    return (
        <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: '100vh', padding: '1rem' }}>
            {/* Sidebar List */}
            <div className="glass-panel" style={{ overflowY: 'auto' }}>
                <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
                <h2 className="chart-title">Recorded Sessions</h2>
                {loading && <p>Loading sessions...</p>}
                {!loading && sessions.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No sessions found.</p>}

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {sessions.map(s => (
                        <li
                            key={s.sessionId}
                            onClick={() => handleSelectSession(s)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                backgroundColor: selectedSession?.sessionId === s.sessionId ? 'var(--bg-secondary)' : 'transparent',
                                borderRadius: '4px',
                                transition: '0.2s',
                                marginBottom: '0.5rem'
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{s.sessionId.substring(0, 12)}...</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {s.duration || '?'}s</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(s.startTime).toLocaleTimeString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Replay Viewer */}
            <div className="glass-panel" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="chart-title" style={{ margin: 0 }}>Replay Viewer</h2>
                        {selectedSession && <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{events.length} interaction chunks loaded.</p>}
                    </div>

                    {selectedSession && (
                        <button
                            onClick={playing ? stopPlayback : startPlayback}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            disabled={events.length === 0}
                        >
                            <PlayCircle size={18} /> {playing ? 'Stop' : 'Play Session'}
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', position: 'relative', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                    {!selectedSession ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            <Film size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Select a session to view the replay.</p>
                        </div>
                    ) : (
                        <div
                            ref={replayContainerRef}
                            style={{
                                position: 'absolute',
                                inset: '1rem',
                                backgroundColor: 'var(--bg-primary)'
                            }}
                        >
                            {/* Rrweb player will inject itself here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionReplayView;
