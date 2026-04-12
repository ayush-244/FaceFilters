/**
 * App.jsx - AR FILTER STUDIO
 * --------
 * Clean, professional AR filter experience with:
 * - Full-screen camera feed
 * - Smooth filter selection
 * - Intuitive controls
 * - Professional styling
 */

import { useState, useCallback, useRef } from "react";
import Camera from "./components/Camera";
import Filters from "./components/Filters";
import FilterSelector from "./components/FilterSelector";
import CaptureButton from "./components/CaptureButton";
import ProFeatures from "./components/ProFeatures";
import FilterIntensity from "./components/FilterIntensity";
import "./App.css";

function App() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [fps, setFps] = useState(0);
  const [filterIntensity, setFilterIntensity] = useState(100);
  const cameraRef = useRef(null);

  const handleFps = useCallback((val) => setFps(val), []);

  return (
    <div className="app premium-theme">
      {/* Header */}
      <header className="app-header premium">
        <div className="header-left">
          <h1 className="app-title">
            <span className="logo-icon">🎬</span>
            <span className="title-text">AR Filter Studio</span>
          </h1>
        </div>
        <div className="header-right">
          <div className="fps-badge" title="Frames per second">
            <span className="fps-emoji">⚡</span>
            {fps} FPS
          </div>
        </div>
      </header>

      {/* Main camera view - FULL SCREEN */}
      <main className="app-main">
        <div className="camera-wrapper premium" ref={cameraRef}>
          <Camera 
            ref={cameraRef}
            activeFilter={activeFilter} 
            onFpsUpdate={handleFps}
            filterIntensity={filterIntensity}
          />
          <Filters activeFilter={activeFilter} />
          <CaptureButton />
          <ProFeatures canvasRef={cameraRef} />
        </div>
      </main>

      {/* Bottom control bar - Filter selector + intensity */}
      <div className="app-controls">
        <FilterSelector
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />
        <FilterIntensity activeFilter={activeFilter} onIntensityChange={setFilterIntensity} />
      </div>
    </div>
  );
}

export default App;
