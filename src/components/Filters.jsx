/**
 * Filters.jsx - UPDATED
 * Overlay badge showing current filter name and emoji
 */

import { ANIMATED_FILTERS } from "../utils/animatedFilters";

export default function Filters({ activeFilter }) {
  if (!activeFilter) return null;

  const filter = ANIMATED_FILTERS.find((f) => f.id === activeFilter);
  if (!filter) return null;

  return (
    <div className="filter-badge">
      <span className="filter-badge-emoji">{filter.emoji}</span>
      <span className="filter-badge-text">{filter.name}</span>
    </div>
  );
}
