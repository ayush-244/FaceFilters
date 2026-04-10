/**
 * App.jsx
 * --------
 * Root component that composes Camera, FilterSelector, Filters badge,
 * CaptureButton and the FPS counter.
 */

import { useState, useCallback } from "react";
import Camera from "./components/Camera";
import Filters from "./components/Filters";
import FilterSelector from "./components/FilterSelector";
import CaptureButton from "./components/CaptureButton";
import "./App.css";

function App() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [fps, setFps] = useState(0);

  const handleFps = useCallback((val) => setFps(val), []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>
          <span className="logo-icon">✨</span> Face Filter Studio
        </h1>
        <div className="fps-badge" title="Frames per second">
          {fps} FPS
        </div>
      </header>

      {/* Main camera view */}
      <main className="app-main">
        <div className="camera-wrapper">
          <Camera activeFilter={activeFilter} onFpsUpdate={handleFps} />
          <Filters activeFilter={activeFilter} />
          <CaptureButton />
        </div>
      </main>

      {/* Bottom filter bar */}
      <FilterSelector
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />
    </div>
  );
}

export default App;
