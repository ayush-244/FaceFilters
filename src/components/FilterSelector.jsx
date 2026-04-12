/**
 * FilterSelector.jsx - ENHANCED
 * -------------------
 * Organized filter browser with categories and smooth animations.
 * Displays 40+ animated interactive filters organized by type.
 */

import { useRef, useEffect, useState, useMemo } from "react";
import { ANIMATED_FILTERS, FILTER_CATEGORIES } from "../utils/animatedFilters";
import React from "react";

export default function FilterSelector({ activeFilter, onSelectFilter }) {
  const scrollRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(FILTER_CATEGORIES.AR_FACES);

  // Group filters by category
  const filtersByCategory = useMemo(() => {
    const grouped = {};
    Object.values(FILTER_CATEGORIES).forEach((cat) => {
      grouped[cat] = ANIMATED_FILTERS.filter((f) => f.category === cat);
    });
    return grouped;
  }, []);

  // Get current category filters
  const displayedFilters = filtersByCategory[activeCategory] || [];

  // Scroll active filter into view
  useEffect(() => {
    if (!scrollRef.current || !activeFilter) return;
    const btn = scrollRef.current.querySelector(`[data-filter="${activeFilter}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeFilter, activeCategory]);

  return (
    <div className="filter-selector-enhanced premium">
      {/* Category tabs with icons */}
      <div className="category-tabs">
        {Object.entries({
          [FILTER_CATEGORIES.AR_FACES]: '🐶',
          [FILTER_CATEGORIES.EFFECTS]: '🔥',
          [FILTER_CATEGORIES.BEAUTY]: '✨',
          [FILTER_CATEGORIES.FUN]: '😂',
          [FILTER_CATEGORIES.TRENDING]: '📱',
          [FILTER_CATEGORIES.INTERACTIVE]: '👋',
        }).map(([cat, icon]) => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
            title={cat}
          >
            <span className="cat-icon">{icon}</span>
            <span className="cat-name">{cat.replace(/_/g, ' ')}</span>
          </button>
        ))}
      </div>

      {/* Filter scroll container */}
      <div className="filter-scroll-container">
        <button
          className={`filter-btn filter-none premium ${activeFilter === null ? "active" : ""}`}
          onClick={() => onSelectFilter(null)}
          title="No filter"
        >
          <span className="filter-emoji">✋</span>
          <span className="filter-label">None</span>
        </button>

        <div className="filter-scroll" ref={scrollRef}>
          {displayedFilters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                data-filter={f.id}
                className={`filter-btn premium ${isActive ? "active" : ""}`}
                onClick={() => onSelectFilter(isActive ? null : f.id)}
                title={f.description}
              >
                <span className="filter-emoji">{f.emoji}</span>
                <span className="filter-label">{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { ANIMATED_FILTERS };
