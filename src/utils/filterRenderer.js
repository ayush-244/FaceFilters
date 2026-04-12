/**
 * filterRenderer.js
 * ------------------
 * Realistic filter renderers using real PNG overlay images from the
 * Snapchat-Filters-main asset pack.
 *
 * Each renderer receives (ctx, landmarks, canvasW, canvasH, assets)
 * and draws onto the provided Canvas 2D context with proper
 * alpha-blended overlays, rotation, and scaling.
 *
 * Filters implemented:
 *   1. Dog Face       – full Snapchat-style dog face overlay
 *   2. Sunglasses     – real glasses PNG aligned to eyes
 *   3. Cowboy Hat      – hat above forehead, follows head
 *   4. Mustache        – mustache on upper lip
 *   5. Fire Eyes       – flame effects on eyes
 *   6. Face Paint      – blush + decorations via landmarks
 *   7. Color Tone      – Instagram-style colour grading
 *   8. Funny Distortion – big-eyes / small-nose warp
 */

import { LANDMARKS, getHeadRoll, getInterEyeDistance, getHeadOrientation, getFaceScale } from "./faceDetection";

// ─── helpers ────────────────────────────────────────────────────────

/** Convert normalised landmark to canvas pixel coords */
function lm(landmarks, idx, w, h) {
  const p = landmarks[idx];
  return { x: p.x * w, y: p.y * h };
}

/**
 * Draw an image centred at (cx, cy) with given size, rotated by angle.
 * **IMPROVED**: Uses proper canvas transforms for clean rotation.
 */
function drawRotatedImage(ctx, img, cx, cy, width, height, angle) {
  if (!img || img.width === 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

/**
 * Advanced transform draw using full 3D-like transforms.
 * Supports roll, pitch, yaw for better alignment.
 */
function drawWithTransform(ctx, img, cx, cy, width, height, roll, pitch = 0, yaw = 0) {
  if (!img || img.width === 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(roll);
  // Note: Canvas 2D doesn't support 3D transforms natively.
  // For pitch/yaw, we apply slight scale adjustments instead.
  const pitchScale = Math.cos(pitch) * 0.95 + 0.05; // Reduce height when pitched away
  const yawScale = Math.cos(yaw) * 0.95 + 0.05;
  ctx.scale(yawScale, pitchScale);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

/**
 * Get the bounding box centre and dimensions from a set of landmark indices.
 * Mirrors the Python getSize() + overlay() approach.
 * **IMPROVED**: More stable bounds calculation with padding.
 */
function getLandmarkBounds(landmarks, indices, w, h, padding = 0) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const idx of indices) {
    const p = lm(landmarks, idx, w, h);
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const padX = (maxX - minX) * padding;
  const padY = (maxY - minY) * padding;
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    width: maxX - minX + padX * 2,
    height: maxY - minY + padY * 2,
    minX: minX - padX, minY: minY - padY,
    maxX: maxX + padX, maxY: maxY + padY,
  };
}

// MediaPipe FACEMESH_FACE_OVAL landmark indices (same as Python mp_face_mesh.FACEMESH_FACE_OVAL)
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

// Left eye region
const LEFT_EYE = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
];

// Right eye region
const RIGHT_EYE = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398,
];

// Lips region
const LIPS = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78,
];

// ─── 1. Dog Face Filter (Real PNG) ─────────────────────────────────

export function renderDogFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.dogFace) return;

  const angle = getHeadRoll(landmarks);
  const bounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);

  // Scale the dog face to cover the full face oval (matching Python's 2.1x height scale)
  const faceHeight = bounds.height * 2.1;
  const aspectRatio = assets.dogFace.width / assets.dogFace.height;
  const faceWidth = faceHeight * aspectRatio;

  drawRotatedImage(ctx, assets.dogFace, bounds.cx, bounds.cy, faceWidth, faceHeight, angle);
}

// ─── 2. Sunglasses Filter (Real PNG) ───────────────────────────────

export function renderSunglassesFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.sunglasses) return;

  const angle = getHeadRoll(landmarks);

  // Use left eye outer bounds – similar to Python using FACEMESH_LEFT_EYE
  const leftEyeBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const rightEyeBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);

  // The glasses should span from left eye to right eye
  const cx = (leftEyeBounds.cx + rightEyeBounds.cx) / 2;
  const cy = (leftEyeBounds.cy + rightEyeBounds.cy) / 2;

  // Python scales by face_part_height * 13, but we use eye-span approach
  const eyeSpan = Math.abs(rightEyeBounds.cx - leftEyeBounds.cx);
  const glassW = eyeSpan * 1.8;
  const aspectRatio = assets.sunglasses.width / assets.sunglasses.height;
  const glassH = glassW / aspectRatio;

  drawRotatedImage(ctx, assets.sunglasses, cx, cy, glassW, glassH, angle);
}

// ─── 3. Cowboy Hat Filter (Real PNG) ────────────────────────────────

export function renderCowboyHatFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.cowboyHat) return;

  const angle = getHeadRoll(landmarks);
  const forehead = lm(landmarks, LANDMARKS.FOREHEAD, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);

  // Hat should be wider than face
  const hatW = eyeDist * 3.0;
  const aspectRatio = assets.cowboyHat.width / assets.cowboyHat.height;
  const hatH = hatW / aspectRatio;

  // Position above forehead
  drawRotatedImage(
    ctx,
    assets.cowboyHat,
    forehead.x,
    forehead.y - hatH * 0.35,
    hatW,
    hatH,
    angle
  );
}

// ─── 4. Mustache Filter (Real PNG) ─────────────────────────────────

export function renderMustacheFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.mustache) return;

  const angle = getHeadRoll(landmarks);

  // Position on upper lip area (matching Python's MOUTH / LIPS region)
  const lipBounds = getLandmarkBounds(landmarks, LIPS, w, h);
  const nose = lm(landmarks, LANDMARKS.NOSE_TIP, w, h);

  // Mustache goes between nose and upper lip
  const cx = lipBounds.cx;
  const cy = (nose.y + lipBounds.cy) / 2;

  // Scale to lip width × 3 (Python uses face_part_height * 3)
  const mustacheW = lipBounds.width * 2.2;
  const aspectRatio = assets.mustache.width / assets.mustache.height;
  const mustacheH = mustacheW / aspectRatio;

  drawRotatedImage(ctx, assets.mustache, cx, cy, mustacheW, mustacheH, angle);
}

// ─── 5. Fire Eyes Filter (Real PNG) ────────────────────────────────

export function renderFireEyesFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.leftEye || !assets?.rightEye) return;

  const angle = getHeadRoll(landmarks);

  // Left eye overlay
  const leftBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const leftH = leftBounds.height * 5;
  const leftAR = assets.leftEye.width / assets.leftEye.height;
  const leftW = leftH * leftAR;
  drawRotatedImage(ctx, assets.leftEye, leftBounds.cx, leftBounds.cy, leftW, leftH, angle);

  // Right eye overlay
  const rightBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);
  const rightH = rightBounds.height * 5;
  const rightAR = assets.rightEye.width / assets.rightEye.height;
  const rightW = rightH * rightAR;
  drawRotatedImage(ctx, assets.rightEye, rightBounds.cx, rightBounds.cy, rightW, rightH, angle);
}

// ─── 6. Face Paint Filter ──────────────────────────────────────────

export function renderFacePaintFilter(ctx, landmarks, w, h) {
  const angle = getHeadRoll(landmarks);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const scale = eyeDist / 80;

  const leftCheek = lm(landmarks, LANDMARKS.LEFT_CHEEK, w, h);
  const rightCheek = lm(landmarks, LANDMARKS.RIGHT_CHEEK, w, h);
  const nose = lm(landmarks, LANDMARKS.NOSE_TIP, w, h);
  const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE_OUTER, w, h);
  const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE_OUTER, w, h);

  const radius = 22 * scale;

  // Soft pink blush on both cheeks
  ctx.save();
  ctx.globalAlpha = 0.35;

  for (const cheek of [leftCheek, rightCheek]) {
    const grad = ctx.createRadialGradient(cheek.x, cheek.y, 0, cheek.x, cheek.y, radius);
    grad.addColorStop(0, "#ff69b4");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cheek.x, cheek.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Gold stars near eyes
  drawStar(ctx, leftEye.x - 14 * scale, leftEye.y - 10 * scale, 5, 7 * scale, 3.5 * scale, "#FFD700", angle);
  drawStar(ctx, rightEye.x + 14 * scale, rightEye.y - 10 * scale, 5, 7 * scale, 3.5 * scale, "#FFD700", angle);

  // Hearts on cheeks
  drawHeart(ctx, leftCheek.x + 10 * scale, leftCheek.y - 12 * scale, 8 * scale, "#ff1493", angle);
  drawHeart(ctx, rightCheek.x - 10 * scale, rightCheek.y - 12 * scale, 8 * scale, "#ff1493", angle);

  // Nose highlight
  ctx.save();
  ctx.globalAlpha = 0.3;
  const noseGrad = ctx.createRadialGradient(nose.x, nose.y, 0, nose.x, nose.y, 8 * scale);
  noseGrad.addColorStop(0, "#ffffff");
  noseGrad.addColorStop(1, "transparent");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, 8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR, color, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.restore();
}

function drawHeart(ctx, cx, cy, size, color, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.4);
  ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.restore();
}

// ─── 7. Color Tone Filter ──────────────────────────────────────────

export function renderColorToneFilter(ctx, w, h, toneType = "warm") {
  ctx.save();

  switch (toneType) {
    case "warm":
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#ff8c00";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(0, 0, w, h);
      break;
    case "cool":
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#4169e1";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#00bfff";
      ctx.fillRect(0, 0, w, h);
      break;
    case "vintage": {
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#d4a574";
      ctx.fillRect(0, 0, w, h);
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

// ─── 8. Funny Distortion (Bonus) ───────────────────────────────────

export function renderDistortionFilter(ctx, landmarks, w, h) {
  const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE, w, h);
  const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const scale = eyeDist / 80;

  const eyeRadius = 25 * scale;
  const enlargeFactor = 1.5;

  const imageData = ctx.getImageData(0, 0, w, h);
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = w;
  tmpCanvas.height = h;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.putImageData(imageData, 0, 0);

  magnifyRegion(ctx, tmpCanvas, leftEye.x, leftEye.y, eyeRadius, enlargeFactor);
  magnifyRegion(ctx, tmpCanvas, rightEye.x, rightEye.y, eyeRadius, enlargeFactor);

  const nose = lm(landmarks, LANDMARKS.NOSE_TIP, w, h);
  shrinkRegion(ctx, tmpCanvas, nose.x, nose.y, 15 * scale, 0.7);
}

function magnifyRegion(ctx, srcCanvas, cx, cy, radius, factor) {
  const srcR = radius / factor;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(srcCanvas, cx - srcR, cy - srcR, srcR * 2, srcR * 2, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

function shrinkRegion(ctx, srcCanvas, cx, cy, radius, factor) {
  const destR = radius * factor;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(srcCanvas, cx - radius, cy - radius, radius * 2, radius * 2, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.drawImage(srcCanvas, cx - radius, cy - radius, radius * 2, radius * 2, cx - destR, cy - destR, destR * 2, destR * 2);
  ctx.restore();
}
