/**
 * faceDetection.js
 * ----------------
 * Initializes MediaPipe FaceMesh and provides a helper to start
 * real-time face-landmark detection from a <video> element.
 *
 * Key landmark indices used throughout the app:
 *   - Nose tip        : 1
 *   - Left eye centre : 159
 *   - Right eye centre: 386
 *   - Forehead        : 10
 *   - Chin            : 152
 *   - Left cheek      : 234
 *   - Right cheek     : 454
 *   - Left ear        : 127
 *   - Right ear       : 356
 *   - Upper lip       : 13
 *   - Lower lip       : 14
 */

import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

// Landmark indices re-exported for other modules
export const LANDMARKS = {
  NOSE_TIP: 1,
  LEFT_EYE: 159,
  RIGHT_EYE: 386,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
  LEFT_EAR: 127,
  RIGHT_EAR: 356,
  UPPER_LIP: 13,
  LOWER_LIP: 14,
  LEFT_MOUTH: 61,
  RIGHT_MOUTH: 291,
  // Extra forehead points for crown positioning
  FOREHEAD_LEFT: 67,
  FOREHEAD_RIGHT: 297,
};

/**
 * Create and configure a MediaPipe FaceMesh instance.
 * @param {function} onResults – callback receiving MediaPipe results each frame
 * @returns {FaceMesh}
 */
export function createFaceMesh(onResults) {
  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 2, // Support up to 2 faces
    refineLandmarks: true, // Better accuracy for iris & lips
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults(onResults);
  return faceMesh;
}

/**
 * Start the MediaPipe Camera utility which feeds frames
 * from the given <video> element into FaceMesh.
 * @param {HTMLVideoElement} videoEl
 * @param {FaceMesh} faceMesh
 * @returns {Camera} – call camera.stop() on cleanup
 */
export function startCamera(videoEl, faceMesh) {
  const camera = new Camera(videoEl, {
    onFrame: async () => {
      await faceMesh.send({ image: videoEl });
    },
    width: 640,
    height: 480,
  });
  camera.start();
  return camera;
}

/**
 * Compute the angle of head tilt (roll) from eye landmarks.
 * @param {Array} landmarks – array of {x, y, z} normalised landmarks
 * @returns {number} angle in radians
 */
export function getHeadRoll(landmarks) {
  const leftEye = landmarks[LANDMARKS.LEFT_EYE];
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE];
  return Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
}

/**
 * Compute the inter-eye distance (used for scaling overlays).
 * @param {Array} landmarks
 * @param {number} canvasWidth
 * @returns {number} pixel distance
 */
export function getInterEyeDistance(landmarks, canvasWidth) {
  const leftEye = landmarks[LANDMARKS.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE_OUTER];
  const dx = (rightEye.x - leftEye.x) * canvasWidth;
  const dy = (rightEye.y - leftEye.y) * canvasWidth;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Exponential smoothing with lerp (linear interpolation).
 * Reduces jitter and provides smooth tracking.
 * @param {number} current – current value
 * @param {number} target – target value
 * @param {number} alpha – smoothing factor (0-1). Lower = smoother but slower
 * @returns {number} smoothed value
 */
export function lerp(current, target, alpha = 0.15) {
  return current + (target - current) * alpha;
}

/**
 * Compute head orientation using face landmarks.
 * Returns roll (head tilt), pitch (nod), and yaw (turn) in radians.
 * @param {Array} landmarks – 468 MediaPipe landmarks
 * @returns {object} { roll, pitch, yaw } in radians
 */
export function getHeadOrientation(landmarks) {
  // Key landmark indices
  const nose = landmarks[LANDMARKS.NOSE_TIP];
  const forehead = landmarks[LANDMARKS.FOREHEAD];
  const chin = landmarks[LANDMARKS.CHIN];
  const leftEye = landmarks[LANDMARKS.LEFT_EYE];
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE];

  // **ROLL** (head tilt left-right around Z axis)
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

  // **PITCH** (head nod up-down around X axis)
  // Use forehead-to-chin vertical alignment
  const faceHeight = chin.y - forehead.y;
  const noseCenterY = (forehead.y + chin.y) / 2;
  const noseDeviation = nose.y - noseCenterY;
  const pitch = Math.asin(Math.max(-1, Math.min(1, noseDeviation / faceHeight)));

  // **YAW** (head turn left-right around Y axis)
  // Use nose relative to eye centers
  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const eyeSpan = rightEye.x - leftEye.x;
  const noseDevX = nose.x - eyeCenterX;
  const yaw = Math.asin(Math.max(-1, Math.min(1, noseDevX / eyeSpan)));

  return { roll, pitch, yaw };
}

/**
 * Face scale factor based on inter-eye distance.
 * Larger distance = face closer to camera = scale up.
 * @param {Array} landmarks
 * @param {number} canvasWidth
 * @param {number} baselineDistance – reference inter-eye distance (default 140px)
 * @returns {number} scale multiplier (1.0 = baseline)
 */
export function getFaceScale(landmarks, canvasWidth, baselineDistance = 140) {
  const dist = getInterEyeDistance(landmarks, canvasWidth);
  return dist / baselineDistance;
}

/**
 * Smoothing state container for landmarks.
 * Stores previous values and applies lerp to new landmarks.
 */
export class LandmarkSmoother {
  constructor(smoothingFactor = 0.15) {
    this.smoothingFactor = smoothingFactor;
    this.prevLandmarks = null;
    this.prevOrientation = null;
  }

  /**
   * Apply smoothing to landmarks array.
   * @param {Array} landmarks – raw MediaPipe landmarks
   * @returns {Array} smoothed landmarks
   */
  smooth(landmarks) {
    if (!this.prevLandmarks) {
      this.prevLandmarks = JSON.parse(JSON.stringify(landmarks));
      return landmarks;
    }

    const smoothed = landmarks.map((lm, i) => ({
      x: lerp(this.prevLandmarks[i].x, lm.x, this.smoothingFactor),
      y: lerp(this.prevLandmarks[i].y, lm.y, this.smoothingFactor),
      z: lerp(this.prevLandmarks[i].z, lm.z, this.smoothingFactor),
    }));

    this.prevLandmarks = JSON.parse(JSON.stringify(smoothed));
    return smoothed;
  }

  /**
   * Apply smoothing to head orientation.
   * @param {object} orientation – { roll, pitch, yaw }
   * @returns {object} smoothed orientation
   */
  smoothOrientation(orientation) {
    if (!this.prevOrientation) {
      this.prevOrientation = { ...orientation };
      return orientation;
    }

    const smoothed = {
      roll: lerp(this.prevOrientation.roll, orientation.roll, this.smoothingFactor),
      pitch: lerp(this.prevOrientation.pitch, orientation.pitch, this.smoothingFactor),
      yaw: lerp(this.prevOrientation.yaw, orientation.yaw, this.smoothingFactor),
    };

    this.prevOrientation = { ...smoothed };
    return smoothed;
  }
}
