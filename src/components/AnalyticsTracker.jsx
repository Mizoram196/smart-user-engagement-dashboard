import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../services/api';
import * as rrweb from 'rrweb';

const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = generateSessionId();
            sessionStorage.setItem('analytics_session_id', sessionId);

            trackEvent({
                type: 'session_start',
                sessionId: sessionId,
                pageUrl: window.location.pathname
            });
        }

        trackEvent({
            type: 'page_visit',
            sessionId: sessionId,
            pageUrl: location.pathname
        });

        const handleBeforeUnload = () => {
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'session_end', sessionId: sessionId }),
                keepalive: true
            }).catch(console.error);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // --- Advanced Tracking (Heatmap & Replays) ---
        let replayEvents = [];

        // Collect heatmap clicks & general clicks
        const handleGlobalClick = (e) => {
            const pageUrl = window.location.pathname;

            // Track for heatmap
            trackEvent({
                type: 'heatmap_click',
                sessionId,
                pageUrl,
                x: e.clientX + window.scrollX,
                y: e.clientY + window.scrollY,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
            }).catch(() => { });

            // Generic event tracking for buttons/links
            const el = e.target.closest('button, a');
            if (el) {
                const eventType = el.tagName.toLowerCase() === 'button' ? 'button_click' : 'link_click';
                trackEvent({
                    type: 'event',
                    eventType: eventType + (el.innerText ? `: ${el.innerText.trim()}` : ''),
                    sessionId,
                    pageUrl
                });
            }
        };

        const stopRrweb = rrweb.record({
            emit(event) {
                replayEvents.push(event);
            },
            packFn: rrweb.pack,
        });

        document.addEventListener('click', handleGlobalClick);

        // Send replay chunks every 5s if there is data
        const replayInterval = setInterval(() => {
            if (replayEvents.length > 0) {
                const chunk = [...replayEvents];
                replayEvents = []; // clear
                trackEvent({
                    type: 'session_replay_chunk',
                    sessionId,
                    pageUrl: window.location.pathname,
                    events: chunk
                }).catch(() => { }); // ignore fetch errors silently on background poll
            }
        }, 5000);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleGlobalClick);
            if (stopRrweb) stopRrweb();
            clearInterval(replayInterval);
        };
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;
