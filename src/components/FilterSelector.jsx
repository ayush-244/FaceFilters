/**
 * FilterSelector.jsx
 * -------------------
 * Bottom bar with thumbnail buttons for each available filter.
 * Only one filter can be active at a time; clicking the active
 * filter again turns it off (returns to "no filter" / raw video).
 *
 * Props:
 *  - activeFilter {string|null}
 *  - onSelectFilter {function(id: string|null)}
 */

import { useRef, useEffect } from "react";

// Filter definitions ── id, label, emoji, description
const FILTERS = [
  {
    id: "dog",
    label: "Dog Face",
    emoji: "🐶",
    desc: "Snapchat-style dog face overlay",
    color: "#8B4513",
  },
  {
    id: "sunglasses",
    label: "Shades",
    emoji: "😎",
    desc: "Cool sunglasses",
    color: "#1a1a2e",
  },
  {
    id: "cowboyhat",
    label: "Cowboy",
    emoji: "🤠",
    desc: "Cowboy hat",
    color: "#8B6914",
  },
  {
    id: "mustache",
    label: "Mustache",
    emoji: "🥸",
    desc: "Classic mustache",
    color: "#4a3728",
  },
  {
    id: "fireeyes",
    label: "Fire Eyes",
    emoji: "🔥",
    desc: "Flaming eye effect",
    color: "#ff4500",
  },
  {
    id: "facepaint",
    label: "Face Paint",
    emoji: "🎨",
    desc: "Blush, stars & hearts",
    color: "#ff69b4",
  },
  {
    id: "color-warm",
    label: "Warm",
    emoji: "🌅",
    desc: "Warm vintage colour tone",
    color: "#ff8c00",
  },
  {
    id: "color-cool",
    label: "Cool",
    emoji: "❄️",
    desc: "Cool blue colour tone",
    color: "#4169e1",
  },
  {
    id: "color-vintage",
    label: "Vintage",
    emoji: "📷",
    desc: "Vintage film look",
    color: "#d4a574",
  },
  {
    id: "distortion",
    label: "Funny",
    emoji: "🤪",
    desc: "Big eyes, small nose",
    color: "#9b59b6",
  },
];

export default function FilterSelector({ activeFilter, onSelectFilter }) {
  const scrollRef = useRef(null);

  // Scroll active filter into view on mount
  useEffect(() => {
    if (!scrollRef.current || !activeFilter) return;
    const btn = scrollRef.current.querySelector(`[data-filter="${activeFilter}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeFilter]);

  return (
    <div className="filter-selector">
      {/* "None" button to disable all filters */}
      <button
        className={`filter-btn ${activeFilter === null ? "active" : ""}`}
        onClick={() => onSelectFilter(null)}
        title="No filter"
      >
        <span className="filter-emoji">🚫</span>
        <span className="filter-label">None</span>
      </button>

      <div className="filter-scroll" ref={scrollRef}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              data-filter={f.id}
              className={`filter-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelectFilter(isActive ? null : f.id)}
              title={f.desc}
              style={{
                "--accent": f.color,
              }}
            >
              <span className="filter-emoji">{f.emoji}</span>
              <span className="filter-label">{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { FILTERS };
