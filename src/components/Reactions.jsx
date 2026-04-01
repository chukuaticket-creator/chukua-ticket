import React, { useState, useEffect, useRef } from 'react';
import { getReactions, sendReaction } from '../../lib/api';

const EMOJIS = ['🔥', '❤️', '🎉', '👏', '😂', '🙌', '⚡', '🎵'];

export default function Reactions({ eventId }) {
  const [counts, setCounts] = useState({});
  const [floating, setFloating] = useState([]);
  const [voted, setVoted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ct-voted-${eventId}`) || '{}'); } catch { return {}; }
  });
  const containerRef = useRef(null);
  let floatId = useRef(0);

  useEffect(() => {
    if (!eventId) return;
    getReactions(eventId).then(data => setCounts(data || {}));
    // Poll every 8s for live updates
    const iv = setInterval(() => {
      getReactions(eventId).then(data => setCounts(data || {}));
    }, 8000);
    return () => clearInterval(iv);
  }, [eventId]);

  const spawnFloat = (emoji) => {
    const id = floatId.current++;
    const x = 20 + Math.random() * 60; // % from left
    setFloating(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloating(prev => prev.filter(f => f.id !== id)), 2200);
  };

  const handleReact = async (emoji) => {
    // Optimistic update
    setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    spawnFloat(emoji);
    // Track voted
    const newVoted = { ...voted, [emoji]: (voted[emoji] || 0) + 1 };
    setVoted(newVoted);
    localStorage.setItem(`ct-voted-${eventId}`, JSON.stringify(newVoted));
    await sendReaction(eventId, emoji);
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Floating emojis */}
      {floating.map(f => (
        <div key={f.id} style={{
          position: 'absolute',
          bottom: '100%',
          left: `${f.x}%`,
          fontSize: 28,
          pointerEvents: 'none',
          animation: 'floatUp 2.2s ease forwards',
          zIndex: 10,
        }}>
          {f.emoji}
        </div>
      ))}

      <div style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            Live Reactions
          </h4>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {total.toLocaleString()} total
          </span>
        </div>

        {/* Emoji grid */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {EMOJIS.map(emoji => {
            const count = counts[emoji] || 0;
            const myCount = voted[emoji] || 0;
            const hasVoted = myCount > 0;
            return (
              <button key={emoji}
                onClick={() => handleReact(emoji)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 100,
                  background: hasVoted ? 'var(--ct-orange-dim)' : 'var(--bg-3)',
                  border: `1px solid ${hasVoted ? 'var(--ct-orange)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  transform: 'scale(1)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
              >
                <span style={{ fontSize: 20 }}>{emoji}</span>
                {count > 0 && (
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: hasVoted ? 'var(--ct-orange)' : 'var(--text-muted)',
                  }}>
                    {count >= 1000 ? `${(count/1000).toFixed(1)}k` : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Top reaction bar */}
        {total > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Community energy</p>
            <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 1 }}>
              {EMOJIS.filter(e => counts[e] > 0).map(emoji => (
                <div key={emoji} style={{
                  flex: counts[emoji] || 0,
                  background: emoji === '🔥' ? '#FF5C00'
                    : emoji === '❤️' ? '#E11D48'
                    : emoji === '🎉' ? '#7C3AED'
                    : emoji === '👏' ? '#2563EB'
                    : 'var(--bg-4)',
                  transition: 'flex 0.5s ease',
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          50%  { opacity: 0.8; transform: translateY(-60px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}
