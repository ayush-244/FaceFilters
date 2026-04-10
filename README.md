# Face Filter Studio ✨

A real-time AR face filter web application built with **React** and **MediaPipe FaceMesh**. Apply Snapchat/Instagram-style filters to your face directly in the browser — no backend required.

![React](https://img.shields.io/badge/React-18-blue) ![MediaPipe](https://img.shields.io/badge/MediaPipe-FaceMesh-green) ![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## Features

| Filter | Description |
|--------|-------------|
| 🐶 Dog | Dog ears, nose & tongue overlay that follows head tilt |
| 😎 Sunglasses | Cool shades aligned to eye position and angle |
| 👑 Crown | Golden jewelled crown floating above your head |
| 🎨 Face Paint | Blush, stars & hearts mapped to facial landmarks |
| 🌅 Warm Tone | Instagram-style warm vintage colour grading |
| ❄️ Cool Tone | Cool blue colour grading |
| 📷 Vintage | Sepia film look with vignette |
| 🤪 Funny | Big-eyes + small-nose distortion effect |

**Bonus features:**
- 📸 **Capture photo** – download the current filtered frame as PNG
- Real-time **FPS counter**
- Graceful camera-permission handling
- Responsive design (works on mobile)
- Supports up to **2 simultaneous faces**

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173 in Chrome
```

> **Note:** A webcam is required. The app asks for camera permission on first load.

---

## Project Structure

```
src/
├── components/
│   ├── Camera.jsx          # Webcam + canvas + render loop
│   ├── CaptureButton.jsx   # Photo snapshot & download
│   ├── Filters.jsx         # Active filter info badge
│   └── FilterSelector.jsx  # Bottom filter selection bar
│
├── utils/
│   ├── faceDetection.js    # MediaPipe FaceMesh initialisation & helpers
│   ├── filterRenderer.js   # Per-filter rendering functions (Canvas 2D)
│   └── assetLoader.js      # Programmatic asset generation (no external images)
│
├── App.jsx                 # Root component
├── App.css                 # Application styles
├── index.css               # Global reset
└── main.jsx                # Entry point
```

---

## How It Works

### Face Detection
The app uses **MediaPipe FaceMesh** which provides 468 3D facial landmarks in real-time. The model runs entirely in the browser via WebAssembly — no server calls.

Key landmark indices used:
- **Eyes:** 33, 133, 159, 263, 362, 386
- **Nose tip:** 1
- **Forehead:** 10
- **Chin:** 152
- **Cheeks:** 234, 454
- **Mouth:** 13, 14, 61, 291

### Filter Rendering Pipeline
1. Each frame, `requestAnimationFrame` fires the render loop
2. The video frame is drawn mirror-flipped onto a `<canvas>`
3. MediaPipe processes the frame asynchronously and provides landmarks
4. The active filter's renderer draws overlays using Canvas 2D transforms:
   - **Translate** to the landmark position
   - **Rotate** by head roll angle (computed from eye positions)
   - **Scale** proportionally to inter-eye distance
5. Color tone filters apply composite blend modes over the full frame

### Assets
All overlay images (dog ears, nose, sunglasses, crown) are **generated programmatically** using off-screen Canvas elements — no external image files are needed.

---

## Performance

| Metric | Target | How |
|--------|--------|-----|
| Frame rate | 24–30+ FPS | `requestAnimationFrame` loop decoupled from detection |
| Re-renders | Minimised | `useCallback`, `useRef` for mutable state |
| Memory | No leaks | Proper cleanup in `useEffect` return functions |
| Slow devices | Graceful | MediaPipe adjusts internally; simple Canvas ops |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `@mediapipe/face_mesh` | 468-point face landmark detection |
| `@mediapipe/camera_utils` | Webcam frame feeder for MediaPipe |
| `@mediapipe/drawing_utils` | (Optional) landmark visualisation |
| `vite` | Build tool & dev server |

All dependencies are **free and open-source**. No paid APIs.

---

## Browser Support

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Firefox (WebAssembly required)
- ✅ Safari 15.4+

---

## Build for Production

```bash
npm run build
# Output in dist/ — serve with any static file server
npx serve dist
```

---

## License

MIT
