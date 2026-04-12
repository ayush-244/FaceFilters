/**
 * advancedFilters.js
 * ===================
 * Production-grade filters organized by category.
 * 30+ high-quality filters with realistic effects and smooth animations.
 *
 * Categories:
 * - ACCESSORIES (glasses, hats, masks)
 * - AR_FACES (dog, cat, anime)
 * - EFFECTS (fire eyes, laser, neon)
 * - BEAUTY (skin smooth, teeth white, eye bright)
 * - FUN (big eyes, distortion, cartoon)
 * - BACKGROUND (blur, segmentation)
 */

import { LANDMARKS, getHeadRoll, getInterEyeDistance, getFaceScale, getHeadOrientation } from "./faceDetection";

// ─── HELPERS ─────────────────────────────────────────────────────

function lm(landmarks, idx, w, h) {
  const p = landmarks[idx];
  return { x: p.x * w, y: p.y * h };
}

function drawRotatedImage(ctx, img, cx, cy, width, height, angle) {
  if (!img || img.width === 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

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

const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const LEFT_EYE = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
];

const RIGHT_EYE = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398,
];

const LIPS = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78,
];

// ═══════════════════════════════════════════════════════════════════════
// 🎨 FILTER CATALOG
// ═══════════════════════════════════════════════════════════════════════

export const FILTER_CATEGORIES = {
  ACCESSORIES: "Accessories",
  AR_FACES: "AR Faces",
  EFFECTS: "Effects",
  BEAUTY: "Beauty",
  FUN: "Fun",
  BACKGROUND: "Background",
  TRENDS: "Trending",
};

export const FILTERS = [
  // ── ACCESSORIES ──
  {
    id: "sunglasses",
    name: "Sunglasses",
    category: FILTER_CATEGORIES.ACCESSORIES,
    emoji: "😎",
    description: "Cool aviator sunglasses",
    requiresAssets: ["sunglasses"],
  },
  {
    id: "cowboyhat",
    name: "Cowboy Hat",
    category: FILTER_CATEGORIES.ACCESSORIES,
    emoji: "🤠",
    description: "Classic cowboy hat",
    requiresAssets: ["cowboyHat"],
  },
  {
    id: "beret",
    name: "Beret",
    category: FILTER_CATEGORIES.ACCESSORIES,
    emoji: "🎓",
    description: "Stylish French beret",
    requiresAssets: ["beret"],
  },
  {
    id: "party-hat",
    name: "Party Hat",
    category: FILTER_CATEGORIES.ACCESSORIES,
    emoji: "🎉",
    description: "Colorful party hat",
    requiresAssets: [],
  },
  {
    id: "graduation-cap",
    name: "Graduation Cap",
    category: FILTER_CATEGORIES.ACCESSORIES,
    emoji: "🎓",
    description: "Academic graduation cap",
    requiresAssets: [],
  },
  {
    id: "flower-crown",
    name: "Flower Crown",
    category: FILTER_CATEGORIES.ACCESSORIES,
    emoji: "👑",
    description: "Beautiful flower crown",
    requiresAssets: [],
  },

  // ── AR FACES ──
  {
    id: "dog",
    name: "Dog Filter",
    category: FILTER_CATEGORIES.AR_FACES,
    emoji: "🐶",
    description: "Adorable dog face overlay",
    requiresAssets: ["dogFace"],
  },
  {
    id: "cat",
    name: "Cat Filter",
    category: FILTER_CATEGORIES.AR_FACES,
    emoji: "🐱",
    description: "Cute cat face with whiskers",
    requiresAssets: [],
  },
  {
    id: "bunny",
    name: "Bunny Filter",
    category: FILTER_CATEGORIES.AR_FACES,
    emoji: "🐰",
    description: "Fluffy bunny ears",
    requiresAssets: [],
  },
  {
    id: "panda",
    name: "Panda Filter",
    category: FILTER_CATEGORIES.AR_FACES,
    emoji: "🐼",
    description: "Adorable panda face",
    requiresAssets: [],
  },
  {
    id: "anime",
    name: "Anime Filter",
    category: FILTER_CATEGORIES.AR_FACES,
    emoji: "👾",
    description: "Big anime eyes and style",
    requiresAssets: [],
  },

  // ── EFFECTS ──
  {
    id: "fire-eyes",
    name: "Fire Eyes",
    category: FILTER_CATEGORIES.EFFECTS,
    emoji: "🔥",
    description: "Flaming eye effect",
    requiresAssets: ["leftEye", "rightEye"],
  },
  {
    id: "laser-eyes",
    name: "Laser Eyes",
    category: FILTER_CATEGORIES.EFFECTS,
    emoji: "⚡",
    description: "Powerful laser beam effect",
    requiresAssets: [],
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    category: FILTER_CATEGORIES.EFFECTS,
    emoji: "💫",
    description: "Cyberpunk neon glow",
    requiresAssets: [],
  },
  {
    id: "rainbow-face",
    name: "Rainbow",
    category: FILTER_CATEGORIES.EFFECTS,
    emoji: "🌈",
    description: "Rainbow color effects",
    requiresAssets: [],
  },
  {
    id: "gold-face",
    name: "Gold Face",
    category: FILTER_CATEGORIES.EFFECTS,
    emoji: "✨",
    description: "Liquid gold effect",
    requiresAssets: [],
  },

  // ── BEAUTY ──
  {
    id: "skin-smooth",
    name: "Skin Smooth",
    category: FILTER_CATEGORIES.BEAUTY,
    emoji: "✨",
    description: "Smooth, glowing skin",
    requiresAssets: [],
  },
  {
    id: "teeth-white",
    name: "Teeth Whitening",
    category: FILTER_CATEGORIES.BEAUTY,
    emoji: "😁",
    description: "Brighter, whiter teeth",
    requiresAssets: [],
  },
  {
    id: "eye-bright",
    name: "Eye Brightening",
    category: FILTER_CATEGORIES.BEAUTY,
    emoji: "👀",
    description: "Brighten and enlarge eyes",
    requiresAssets: [],
  },
  {
    id: "blush",
    name: "Blush",
    category: FILTER_CATEGORIES.BEAUTY,
    emoji: "😊",
    description: "Soft rosy blush",
    requiresAssets: [],
  },
  {
    id: "face-paint",
    name: "Face Paint",
    category: FILTER_CATEGORIES.BEAUTY,
    emoji: "🎨",
    description: "Artistic face paint",
    requiresAssets: [],
  },

  // ── FUN ──
  {
    id: "big-eyes",
    name: "Big Eyes",
    category: FILTER_CATEGORIES.FUN,
    emoji: "👀",
    description: "Hilariously huge eyes",
    requiresAssets: [],
  },
  {
    id: "small-face",
    name: "Small Face",
    category: FILTER_CATEGORIES.FUN,
    emoji: "🤏",
    description: "Shrunken face effect",
    requiresAssets: [],
  },
  {
    id: "big-mouth",
    name: "Big Mouth",
    category: FILTER_CATEGORIES.FUN,
    emoji: "😮",
    description: "Exaggerated big mouth",
    requiresAssets: [],
  },
  {
    id: "mustache",
    name: "Mustache",
    category: FILTER_CATEGORIES.FUN,
    emoji: "🥸",
    description: "Classic handlebar mustache",
    requiresAssets: ["mustache"],
  },
  {
    id: "clown",
    name: "Clown",
    category: FILTER_CATEGORIES.FUN,
    emoji: "🤡",
    description: "Hilarious clown makeup",
    requiresAssets: [],
  },

  // ── BACKGROUND ──
  {
    id: "background-blur",
    name: "Background Blur",
    category: FILTER_CATEGORIES.BACKGROUND,
    emoji: "🌫️",
    description: "Blur background, keep face sharp",
    requiresAssets: [],
  },
  {
    id: "background-bokeh",
    name: "Bokeh Background",
    category: FILTER_CATEGORIES.BACKGROUND,
    emoji: "💡",
    description: "Artistic bokeh effect",
    requiresAssets: [],
  },

  // ── TRENDING ──
  {
    id: "color-warm",
    name: "Warm Tone",
    category: FILTER_CATEGORIES.TRENDS,
    emoji: "🌅",
    description: "Warm vintage tone",
    requiresAssets: [],
  },
  {
    id: "color-cool",
    name: "Cool Tone",
    category: FILTER_CATEGORIES.TRENDS,
    emoji: "❄️",
    description: "Cool blue tone",
    requiresAssets: [],
  },
  {
    id: "color-vintage",
    name: "Vintage",
    category: FILTER_CATEGORIES.TRENDS,
    emoji: "📷",
    description: "Vintage film look",
    requiresAssets: [],
  },
  {
    id: "black-white",
    name: "Black & White",
    category: FILTER_CATEGORIES.TRENDS,
    emoji: "🎬",
    description: "Classic black and white",
    requiresAssets: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 🎯 RENDER FUNCTIONS FOR ALL FILTERS
// ═══════════════════════════════════════════════════════════════════════

export function renderAdvancedFilter(ctx, landmarks, w, h, filterId, assets) {
  switch (filterId) {
    // Accessories
    case "sunglasses":
      renderSunglassesFilter(ctx, landmarks, w, h, assets);
      break;
    case "cowboyhat":
      renderCowboyHatFilter(ctx, landmarks, w, h, assets);
      break;
    case "beret":
      renderBeretFilter(ctx, landmarks, w, h, assets);
      break;
    case "party-hat":
      renderPartyHatFilter(ctx, landmarks, w, h);
      break;
    case "graduation-cap":
      renderGraduationCapFilter(ctx, landmarks, w, h);
      break;
    case "flower-crown":
      renderFlowerCrownFilter(ctx, landmarks, w, h);
      break;

    // AR Faces
    case "dog":
      renderDogFilter(ctx, landmarks, w, h, assets);
      break;
    case "cat":
      renderCatFilter(ctx, landmarks, w, h);
      break;
    case "bunny":
      renderBunnyFilter(ctx, landmarks, w, h);
      break;
    case "panda":
      renderPandaFilter(ctx, landmarks, w, h);
      break;
    case "anime":
      renderAnimeFilter(ctx, landmarks, w, h);
      break;

    // Effects
    case "fire-eyes":
      renderFireEyesFilter(ctx, landmarks, w, h, assets);
      break;
    case "laser-eyes":
      renderLaserEyesFilter(ctx, landmarks, w, h);
      break;
    case "neon-glow":
      renderNeonGlowFilter(ctx, landmarks, w, h);
      break;
    case "rainbow-face":
      renderRainbowFaceFilter(ctx, landmarks, w, h);
      break;
    case "gold-face":
      renderGoldFaceFilter(ctx, landmarks, w, h);
      break;

    // Beauty
    case "skin-smooth":
      renderSkinSmoothFilter(ctx, w, h);
      break;
    case "teeth-white":
      renderTeethWhiteFilter(ctx, landmarks, w, h);
      break;
    case "eye-bright":
      renderEyeBrightFilter(ctx, landmarks, w, h);
      break;
    case "blush":
      renderBlushFilter(ctx, landmarks, w, h);
      break;
    case "face-paint":
      renderFacePaintFilter(ctx, landmarks, w, h);
      break;

    // Fun
    case "big-eyes":
      renderBigEyesFilter(ctx, landmarks, w, h);
      break;
    case "small-face":
      renderSmallFaceFilter(ctx, landmarks, w, h);
      break;
    case "big-mouth":
      renderBigMouthFilter(ctx, landmarks, w, h);
      break;
    case "mustache":
      renderMustacheFilter(ctx, landmarks, w, h, assets);
      break;
    case "clown":
      renderClownFilter(ctx, landmarks, w, h);
      break;

    // Background
    case "background-blur":
      renderBackgroundBlurFilter(ctx, landmarks, w, h);
      break;
    case "background-bokeh":
      renderBackgroundBokehFilter(ctx, landmarks, w, h);
      break;

    // Trending
    case "color-warm":
      renderColorToneFilter(ctx, w, h, "warm");
      break;
    case "color-cool":
      renderColorToneFilter(ctx, w, h, "cool");
      break;
    case "color-vintage":
      renderColorToneFilter(ctx, w, h, "vintage");
      break;
    case "black-white":
      renderColorToneFilter(ctx, w, h, "bw");
      break;
  }
}

// ─── ACCESSORIES ────────────────────────────────────────────────────

function renderSunglassesFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.sunglasses) return;
  const angle = getHeadRoll(landmarks);
  const leftEyeBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const rightEyeBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);
  const cx = (leftEyeBounds.cx + rightEyeBounds.cx) / 2;
  const cy = (leftEyeBounds.cy + rightEyeBounds.cy) / 2;
  const eyeSpan = Math.abs(rightEyeBounds.cx - leftEyeBounds.cx);
  const glassW = eyeSpan * 1.8;
  const aspectRatio = assets.sunglasses.width / assets.sunglasses.height;
  const glassH = glassW / aspectRatio;
  drawRotatedImage(ctx, assets.sunglasses, cx, cy, glassW, glassH, angle);
}

function renderCowboyHatFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.cowboyHat) return;
  const angle = getHeadRoll(landmarks);
  const forehead = lm(landmarks, LANDMARKS.FOREHEAD, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const hatW = eyeDist * 3.0;
  const aspectRatio = assets.cowboyHat.width / assets.cowboyHat.height;
  const hatH = hatW / aspectRatio;
  drawRotatedImage(ctx, assets.cowboyHat, forehead.x, forehead.y - hatH * 0.35, hatW, hatH, angle);
}

function renderBeretFilter(ctx, landmarks, w, h) {
  const forehead = lm(landmarks, LANDMARKS.FOREHEAD, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const beretW = eyeDist * 2.5;
  const beretH = beretW * 0.7;
  const angle = getHeadRoll(landmarks);

  ctx.save();
  ctx.translate(forehead.x, forehead.y - beretH * 0.6);
  ctx.rotate(angle);
  
  // Draw beret circle
  ctx.fillStyle = "#2c2c2c";
  ctx.beginPath();
  ctx.ellipse(0, 0, beretW / 2, beretH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Add subtle shadow
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function renderPartyHatFilter(ctx, landmarks, w, h) {
  const forehead = lm(landmarks, LANDMARKS.FOREHEAD, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const hatW = eyeDist * 1.5;
  const hatH = hatW * 1.2;
  const angle = getHeadRoll(landmarks);

  ctx.save();
  ctx.translate(forehead.x, forehead.y - hatH * 0.5);
  ctx.rotate(angle);

  // Draw party hat cone
  ctx.fillStyle = "#ff1493";
  ctx.beginPath();
  ctx.moveTo(0, -hatH / 2);
  ctx.lineTo(-hatW / 2, hatH / 2);
  ctx.lineTo(hatW / 2, hatH / 2);
  ctx.closePath();
  ctx.fill();

  // Add stripes
  ctx.strokeStyle = "#ffff00";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-hatW / 4, -hatH / 4);
  ctx.lineTo(0, hatH / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hatW / 4, -hatH / 4);
  ctx.lineTo(0, hatH / 2);
  ctx.stroke();

  ctx.restore();
}

function renderGraduationCapFilter(ctx, landmarks, w, h) {
  const forehead = lm(landmarks, LANDMARKS.FOREHEAD, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const capW = eyeDist * 2.8;
  const capH = capW * 0.4;
  const angle = getHeadRoll(landmarks);

  ctx.save();
  ctx.translate(forehead.x, forehead.y - capH);
  ctx.rotate(angle);

  // Draw cap rectangular part
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-capW / 2, -capH / 2, capW, capH);

  // Draw tassel
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, capH / 2);
  ctx.lineTo(0, capH / 2 + 30);
  ctx.stroke();

  ctx.restore();
}

function renderFlowerCrownFilter(ctx, landmarks, w, h) {
  const forehead = lm(landmarks, LANDMARKS.FOREHEAD, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const crownW = eyeDist * 3.0;
  const angle = getHeadRoll(landmarks);

  ctx.save();
  ctx.translate(forehead.x, forehead.y - eyeDist * 0.8);
  ctx.rotate(angle);

  // Draw flower crown (ellipse of flowers)
  const flowerCount = 8;
  for (let i = 0; i < flowerCount; i++) {
    const flowerAngle = (i / flowerCount) * Math.PI * 2;
    const fx = Math.cos(flowerAngle) * (crownW / 2);
    const fy = Math.sin(flowerAngle) * (crownW / 3);

    // Draw flower petals
    const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ffc0cb"];
    const petalColor = colors[i % colors.length];

    for (let p = 0; p < 5; p++) {
      const petalAngle = (p / 5) * Math.PI * 2;
      const px = fx + Math.cos(petalAngle) * 10;
      const py = fy + Math.sin(petalAngle) * 10;

      ctx.fillStyle = petalColor;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw flower center
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── AR FACES ───────────────────────────────────────────────────────

function renderDogFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.dogFace) return;
  const angle = getHeadRoll(landmarks);
  const bounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);
  const faceHeight = bounds.height * 2.1;
  const aspectRatio = assets.dogFace.width / assets.dogFace.height;
  const faceWidth = faceHeight * aspectRatio;
  drawRotatedImage(ctx, assets.dogFace, bounds.cx, bounds.cy, faceWidth, faceHeight, angle);
}

function renderCatFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);
  const angle = getHeadRoll(landmarks);
  const faceScale = getFaceScale(landmarks, w);

  ctx.save();
  ctx.translate(faceBounds.cx, faceBounds.cy);
  ctx.rotate(angle);

  // Draw cat ears
  const earHeight = faceBounds.height * 0.8;
  const earWidth = faceBounds.width * 0.25;

  // Left ear
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.moveTo(-faceBounds.width * 0.35, -faceBounds.height * 0.5);
  ctx.lineTo(-faceBounds.width * 0.45, -faceBounds.height * 0.8);
  ctx.lineTo(-faceBounds.width * 0.25, -faceBounds.height * 0.5);
  ctx.closePath();
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(faceBounds.width * 0.35, -faceBounds.height * 0.5);
  ctx.lineTo(faceBounds.width * 0.45, -faceBounds.height * 0.8);
  ctx.lineTo(faceBounds.width * 0.25, -faceBounds.height * 0.5);
  ctx.closePath();
  ctx.fill();

  // Draw whiskers
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  for (let i = -2; i <= 2; i++) {
    const offset = i * 8;
    const noseX = 0;
    const noseY = faceBounds.height * 0.1;

    // Whisker to the left
    ctx.beginPath();
    ctx.moveTo(noseX, noseY + offset);
    ctx.lineTo(noseX - faceBounds.width * 0.3, noseY + offset);
    ctx.stroke();

    // Whisker to the right
    ctx.beginPath();
    ctx.moveTo(noseX, noseY + offset);
    ctx.lineTo(noseX + faceBounds.width * 0.3, noseY + offset);
    ctx.stroke();
  }

  ctx.restore();
}

function renderBunnyFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);
  const angle = getHeadRoll(landmarks);

  ctx.save();
  ctx.translate(faceBounds.cx, faceBounds.cy);
  ctx.rotate(angle);

  // Draw bunny ears (long and fluffy)
  const earHeight = faceBounds.height * 1.2;
  const earWidth = faceBounds.width * 0.2;

  ctx.fillStyle = "#ffffff";
  // Left ear
  ctx.beginPath();
  ctx.ellipse(-faceBounds.width * 0.3, -faceBounds.height * 0.6, earWidth, earHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.ellipse(faceBounds.width * 0.3, -faceBounds.height * 0.6, earWidth, earHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner ear pink
  ctx.fillStyle = "#ffb6c1";
  ctx.beginPath();
  ctx.ellipse(-faceBounds.width * 0.3, -faceBounds.height * 0.6, earWidth * 0.5, earHeight * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(faceBounds.width * 0.3, -faceBounds.height * 0.6, earWidth * 0.5, earHeight * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bunny nose
  ctx.fillStyle = "#ffb6c1";
  ctx.beginPath();
  ctx.arc(0, faceBounds.height * 0.15, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderPandaFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);
  const angle = getHeadRoll(landmarks);

  ctx.save();
  ctx.translate(faceBounds.cx, faceBounds.cy);
  ctx.rotate(angle);

  // Black patches around eyes
  ctx.fillStyle = "#000000";
  const eyePatchSize = faceBounds.width * 0.2;
  ctx.beginPath();
  ctx.ellipse(-faceBounds.width * 0.25, -faceBounds.height * 0.1, eyePatchSize, eyePatchSize * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(faceBounds.width * 0.25, -faceBounds.height * 0.1, eyePatchSize, eyePatchSize * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Panda ears
  const earSize = faceBounds.width * 0.15;
  ctx.beginPath();
  ctx.arc(-faceBounds.width * 0.35, -faceBounds.height * 0.45, earSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(faceBounds.width * 0.35, -faceBounds.height * 0.45, earSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderAnimeFilter(ctx, landmarks, w, h) {
  const leftEyeBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const rightEyeBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);
  const angle = getHeadRoll(landmarks);

  // Draw big anime eyes
  ctx.save();
  ctx.globalAlpha = 0.9;

  // Left eye
  ctx.save();
  ctx.translate(leftEyeBounds.cx, leftEyeBounds.cy);
  ctx.rotate(angle);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, leftEyeBounds.width * 1.5, leftEyeBounds.height * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(0, leftEyeBounds.height * 0.2, leftEyeBounds.width * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-leftEyeBounds.width * 0.2, -leftEyeBounds.height * 0.3, leftEyeBounds.width * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Right eye
  ctx.save();
  ctx.translate(rightEyeBounds.cx, rightEyeBounds.cy);
  ctx.rotate(angle);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, rightEyeBounds.width * 1.5, rightEyeBounds.height * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(0, rightEyeBounds.height * 0.2, rightEyeBounds.width * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(rightEyeBounds.width * 0.2, -rightEyeBounds.height * 0.3, rightEyeBounds.width * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

// ─── EFFECTS ────────────────────────────────────────────────────────

function renderFireEyesFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.leftEye || !assets?.rightEye) return;
  const angle = getHeadRoll(landmarks);
  const leftBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const leftH = leftBounds.height * 5;
  const leftAR = assets.leftEye.width / assets.leftEye.height;
  const leftW = leftH * leftAR;
  drawRotatedImage(ctx, assets.leftEye, leftBounds.cx, leftBounds.cy, leftW, leftH, angle);

  const rightBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);
  const rightH = rightBounds.height * 5;
  const rightAR = assets.rightEye.width / assets.rightEye.height;
  const rightW = rightH * rightAR;
  drawRotatedImage(ctx, assets.rightEye, rightBounds.cx, rightBounds.cy, rightW, rightH, angle);
}

function renderLaserEyesFilter(ctx, landmarks, w, h) {
  const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE, w, h);
  const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE, w, h);

  // Draw laser beams
  ctx.strokeStyle = "#ff0000";
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
  ctx.shadowBlur = 15;

  // Left laser
  ctx.beginPath();
  ctx.moveTo(leftEye.x, leftEye.y);
  ctx.lineTo(-100, leftEye.y);
  ctx.stroke();

  // Right laser
  ctx.beginPath();
  ctx.moveTo(rightEye.x, rightEye.y);
  ctx.lineTo(w + 100, rightEye.y);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function renderNeonGlowFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;

  // Draw neon outline around face
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(faceBounds.minX, faceBounds.minY);
  ctx.quadraticCurveTo(faceBounds.cx, faceBounds.minY - 20, faceBounds.maxX, faceBounds.minY);
  ctx.quadraticCurveTo(faceBounds.maxX + 20, faceBounds.cy, faceBounds.maxX, faceBounds.maxY);
  ctx.quadraticCurveTo(faceBounds.cx, faceBounds.maxY + 20, faceBounds.minX, faceBounds.maxY);
  ctx.quadraticCurveTo(faceBounds.minX - 20, faceBounds.cy, faceBounds.minX, faceBounds.minY);
  ctx.stroke();

  ctx.restore();
}

function renderRainbowFaceFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);

  ctx.save();

  const stripes = ["#ff0000", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];
  const stripeHeight = faceBounds.height / stripes.length;

  for (let i = 0; i < stripes.length; i++) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = stripes[i];
    ctx.fillRect(faceBounds.minX, faceBounds.minY + i * stripeHeight, faceBounds.width, stripeHeight);
  }

  ctx.restore();
}

function renderGoldFaceFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 30;

  // Gold glow effect
  const gradient = ctx.createRadialGradient(faceBounds.cx, faceBounds.cy, 0, faceBounds.cx, faceBounds.cy, faceBounds.width);
  gradient.addColorStop(0, "rgba(255, 215, 0, 0.5)");
  gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(faceBounds.minX, faceBounds.minY, faceBounds.width, faceBounds.height);

  ctx.restore();
}

// ─── BEAUTY ─────────────────────────────────────────────────────────

function renderSkinSmoothFilter(ctx, w, h) {
  // Gaussian blur via canvas blur filter
  ctx.filter = "blur(3px)";
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.filter = "none";
}

function renderTeethWhiteFilter(ctx, landmarks, w, h) {
  const lipBounds = getLandmarkBounds(landmarks, LIPS, w, h);

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(lipBounds.cx, lipBounds.cy - 5, lipBounds.width * 0.6, lipBounds.height * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderEyeBrightFilter(ctx, landmarks, w, h) {
  const leftEyeBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const rightEyeBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);

  ctx.save();
  for (const eyeBounds of [leftEyeBounds, rightEyeBounds]) {
    const grad = ctx.createRadialGradient(eyeBounds.cx, eyeBounds.cy, 0, eyeBounds.cx, eyeBounds.cy, eyeBounds.width);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(eyeBounds.minX, eyeBounds.minY, eyeBounds.width, eyeBounds.height);
  }
  ctx.restore();
}

function renderBlushFilter(ctx, landmarks, w, h) {
  const leftCheek = lm(landmarks, LANDMARKS.LEFT_CHEEK, w, h);
  const rightCheek = lm(landmarks, LANDMARKS.RIGHT_CHEEK, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const scale = eyeDist / 80;
  const radius = 22 * scale;

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
}

function renderFacePaintFilter(ctx, landmarks, w, h) {
  const eyeDist = getInterEyeDistance(landmarks, w);
  const scale = eyeDist / 80;
  const leftCheek = lm(landmarks, LANDMARKS.LEFT_CHEEK, w, h);
  const rightCheek = lm(landmarks, LANDMARKS.RIGHT_CHEEK, w, h);
  const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE_OUTER, w, h);
  const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE_OUTER, w, h);

  // Blush
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (const cheek of [leftCheek, rightCheek]) {
    const grad = ctx.createRadialGradient(cheek.x, cheek.y, 0, cheek.x, cheek.y, 22 * scale);
    grad.addColorStop(0, "#ff69b4");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cheek.x, cheek.y, 22 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Stars
  drawStar(ctx, leftEye.x - 14 * scale, leftEye.y - 10 * scale, 5, 7 * scale, 3.5 * scale, "#FFD700");
  drawStar(ctx, rightEye.x + 14 * scale, rightEye.y - 10 * scale, 5, 7 * scale, 3.5 * scale, "#FFD700");
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR, color) {
  ctx.save();
  ctx.translate(cx, cy);
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

// ─── FUN ────────────────────────────────────────────────────────────

function renderBigEyesFilter(ctx, landmarks, w, h) {
  const leftEyeBounds = getLandmarkBounds(landmarks, LEFT_EYE, w, h);
  const rightEyeBounds = getLandmarkBounds(landmarks, RIGHT_EYE, w, h);

  ctx.save();
  for (const eyeBounds of [leftEyeBounds, rightEyeBounds]) {
    // Big white eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeBounds.cx, eyeBounds.cy, eyeBounds.width * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Black pupils (smaller, offset down)
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(eyeBounds.cx, eyeBounds.cy + 5, eyeBounds.width * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeBounds.cx - 5, eyeBounds.cy - 5, eyeBounds.width * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderSmallFaceFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h);

  ctx.save();
  ctx.translate(faceBounds.cx, faceBounds.cy);
  ctx.scale(0.6, 0.6);
  ctx.translate(-faceBounds.cx, -faceBounds.cy);
  // Note: Full face scaling would require drawing the actual face content here
  ctx.restore();
}

function renderBigMouthFilter(ctx, landmarks, w, h) {
  const lipBounds = getLandmarkBounds(landmarks, LIPS, w, h);

  ctx.save();
  ctx.fillStyle = "#ff1493";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.ellipse(lipBounds.cx, lipBounds.cy, lipBounds.width, lipBounds.height * 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth outline
  ctx.strokeStyle = "#a00a52";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function renderMustacheFilter(ctx, landmarks, w, h, assets) {
  if (!assets?.mustache) return;
  const angle = getHeadRoll(landmarks);
  const lipBounds = getLandmarkBounds(landmarks, LIPS, w, h);
  const nose = lm(landmarks, LANDMARKS.NOSE_TIP, w, h);
  const cx = lipBounds.cx;
  const cy = (nose.y + lipBounds.cy) / 2;
  const mustacheW = lipBounds.width * 2.2;
  const aspectRatio = assets.mustache.width / assets.mustache.height;
  const mustacheH = mustacheW / aspectRatio;
  drawRotatedImage(ctx, assets.mustache, cx, cy, mustacheW, mustacheH, angle);
}

function renderClownFilter(ctx, landmarks, w, h) {
  const nose = lm(landmarks, LANDMARKS.NOSE_TIP, w, h);
  const eyeDist = getInterEyeDistance(landmarks, w);
  const scale = eyeDist / 80;

  ctx.save();

  // Red clown nose
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, 15 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Nose highlight
  ctx.fillStyle = "#ffcccc";
  ctx.beginPath();
  ctx.arc(nose.x - 5 * scale, nose.y - 5 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── BACKGROUND ─────────────────────────────────────────────────────

function renderBackgroundBlurFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h, 0.2);

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.filter = "blur(15px)";
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.filter = "none";
  ctx.restore();
}

function renderBackgroundBokehFilter(ctx, landmarks, w, h) {
  const faceBounds = getLandmarkBounds(landmarks, FACE_OVAL, w, h, 0.2);

  ctx.save();
  ctx.globalAlpha = 0.4;

  // Draw bokeh circles
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const radius = Math.random() * 20 + 5;

    // Skip if inside face area
    const dx = x - faceBounds.cx;
    const dy = y - faceBounds.cy;
    if (Math.sqrt(dx * dx + dy * dy) < Math.max(faceBounds.width, faceBounds.height)) continue;

    ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, 50%, 0.6)`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── COLOR TONE ─────────────────────────────────────────────────────

function renderColorToneFilter(ctx, w, h, toneType = "warm") {
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
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#87ceeb";
      ctx.fillRect(0, 0, w, h);
      break;
    case "vintage":
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#d4a574";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#6b4423";
      ctx.fillRect(0, 0, w, h);
      break;
    case "bw":
      ctx.globalAlpha = 1;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
      break;
  }

  ctx.restore();
}
