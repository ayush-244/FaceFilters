/**
 * GamificationPanel.jsx
 * ------------------
 * Shows progress, unlocks, badges, and achievements
 * Makes the app feel rewarding and fun!
 */

import { useState, useEffect } from 'react';
import '../styles/gamification.css';

export function ProgressBar({ activeFilter, totalFilters = 28 }) {
  const [tried, setTried] = useState(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activeFilter) {
      setTried(prev => new Set([...prev, activeFilter]));
    }
  }, [activeFilter]);

  useEffect(() => {
    setProgress(Math.round((tried.size / totalFilters) * 100));
  }, [tried, totalFilters]);

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-icon">🎯</span>
        <span className="progress-text">Filters Explored: {tried.size}/{totalFilters}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}>
          <span className="progress-label">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

export function BadgeShowcase({ activeFilter }) {
  const badges = {
    tried_5: { emoji: '🌟', name: 'Filter Explorer', unlocked: activeFilter ? Math.random() > 0.7 : false },
    tried_10: { emoji: '👑', name: 'Filter King', unlocked: activeFilter ? Math.random() > 0.5 : false },
    tried_20: { emoji: '🔥', name: 'Filter Addict', unlocked: activeFilter ? Math.random() > 0.3 : false },
    smiled: { emoji: '😂', name: 'Smile Master', unlocked: activeFilter ? Math.random() > 0.6 : false },
    recorded: { emoji: '🎬', name: 'Content Creator', unlocked: activeFilter ? Math.random() > 0.5 : false },
  };

  return (
    <div className="badge-showcase">
      <h3 className="badge-title">🏆 Achievements</h3>
      <div className="badge-grid">
        {Object.entries(badges).map(([key, badge]) => (
          <div
            key={key}
            className={`badge ${badge.unlocked ? 'unlocked' : 'locked'}`}
            title={badge.name}
          >
            <span className="badge-emoji">{badge.emoji}</span>
            {!badge.unlocked && <div className="badge-lock">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RandomFilterButton({ onRandomSelect, totalFilters = 28 }) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    const randomId = Math.floor(Math.random() * totalFilters);
    
    setTimeout(() => {
      onRandomSelect(randomId);
      setSpinning(false);
    }, 600);
  };

  return (
    <button
      className={`random-filter-btn ${spinning ? 'spinning' : ''}`}
      onClick={handleClick}
      title="Random Filter Surprise!"
    >
      <span className="random-emoji">🎲</span>
      <span className="random-text">Surprise Me!</span>
    </button>
  );
}

export function UnlockSystem({ sessionTime }) {
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    // Unlock new filters based on time played (for fun!)
    const minutes = Math.floor(sessionTime / 60);
    const newUnlocks = Math.min(Math.floor(minutes / 5), 5);
    setUnlockedCount(newUnlocks);
  }, [sessionTime]);

  return (
    <div className="unlock-system">
      <h4 className="unlock-title">🔓 New Filters Unlocked</h4>
      <div className="unlock-display">
        {unlockedCount > 0 ? (
          <p className="unlock-text">+{unlockedCount} new filters available! 🎉</p>
        ) : (
          <p className="unlock-text">Keep playing to unlock more filters!</p>
        )}
      </div>
    </div>
  );
}

export function LevelIndicator({ filtersUsedCount }) {
  const level = Math.floor(filtersUsedCount / 5) + 1;
  const nextLevelAt = level * 5;

  return (
    <div className="level-indicator">
      <div className="level-badge">
        <span className="level-number">{level}</span>
        <span className="level-label">Level</span>
      </div>
      <div className="level-progress">
        <div
          className="level-progress-bar"
          style={{ width: `${((filtersUsedCount % 5) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function AchievementPopup({ achievement, visible }) {
  if (!visible) return null;

  return (
    <div className="achievement-popup">
      <div className="achievement-content">
        <span className="achievement-emoji">{achievement.emoji}</span>
        <p className="achievement-text">{achievement.name}</p>
        <p className="achievement-desc">{achievement.description}</p>
      </div>
    </div>
  );
}
