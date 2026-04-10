/**
 * Filters.jsx
 * ------------
 * Wrapper/info component that shows the name and description
 * of the currently active filter as an overlay badge.
 *
 * Props:
 *  - activeFilter {string|null}
 */

import { FILTERS } from "./FilterSelector";

export default function Filters({ activeFilter }) {
  if (!activeFilter) return null;

  const filter = FILTERS.find((f) => f.id === activeFilter);
  if (!filter) return null;

  return (
    <div className="filter-badge">
      <span className="filter-badge-emoji">{filter.emoji}</span>
      <span className="filter-badge-text">{filter.label}</span>
    </div>
  );
}
