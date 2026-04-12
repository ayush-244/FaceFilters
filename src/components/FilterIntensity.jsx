/**
 * FilterIntensity.jsx
 * ===================
 * Slider to adjust filter opacity/intensity.
 */

import { useEffect, useState } from "react";

export default function FilterIntensity({ activeFilter, onIntensityChange }) {
  const [intensity, setIntensity] = useState(100);

  // Reset intensity when filter changes
  useEffect(() => {
    setIntensity(100);
    onIntensityChange?.(100);
  }, [activeFilter, onIntensityChange]);

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setIntensity(val);
    onIntensityChange?.(val);
  };

  if (!activeFilter) return null;

  return (
    <div className="filter-intensity-panel">
      <span className="intensity-label">Filter Intensity</span>
      <div className="intensity-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={handleChange}
          className="intensity-slider"
        />
        <span className="intensity-value">{intensity}%</span>
      </div>
    </div>
  );
}
