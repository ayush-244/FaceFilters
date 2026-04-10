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
