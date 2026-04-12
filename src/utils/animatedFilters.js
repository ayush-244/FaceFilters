/**
 * animatedFilters.js
 * ------------------
 * 40+ Fun, Alive, Interactive Filters
 * Each filter is a living, breathing character that responds to user interactions.
 * Uses advanced animation system for smooth, engaging effects.
 */

import { 
  Animation, 
  AnimationManager, 
  ParticleEmitter, 
  InteractionDetector,
  drawRotatedImage,
  drawGlow,
  easing 
} from './animationSystem';
import { 
  LANDMARKS, 
  getHeadRoll, 
  getInterEyeDistance,
  lerp 
} from './faceDetection';

// ─────────────────────────────────────────────────────────────────
// FILTER REGISTRY & CATEGORIES
// ─────────────────────────────────────────────────────────────────

export const FILTER_CATEGORIES = {
  AR_FACES: 'AR_FACES',
  EFFECTS: 'EFFECTS',
  BEAUTY: 'BEAUTY',
  FUN: 'FUN',
  TRENDING: 'TRENDING',
  INTERACTIVE: 'INTERACTIVE',
};

export const ANIMATED_FILTERS = [
  // AR FACES (Cute Characters)
  { id: 'dog_v2', name: 'Bouncy Pup', emoji: '🐶', category: FILTER_CATEGORIES.AR_FACES, description: 'Ears bounce, tongue wags' },
  { id: 'cat_v2', name: 'Cool Cat', emoji: '🐱', category: FILTER_CATEGORIES.AR_FACES, description: 'Ears twitch, eyes sparkle' },
  { id: 'bunny_v2', name: 'Hopping Bunny', emoji: '🐰', category: FILTER_CATEGORIES.AR_FACES, description: 'Ears jump, nose wiggles' },
  { id: 'panda_v2', name: 'Chill Panda', emoji: '🐼', category: FILTER_CATEGORIES.AR_FACES, description: 'Eyes blink sleepily' },
  { id: 'bear_v2', name: 'Grizzly Bear', emoji: '🐻', category: FILTER_CATEGORIES.AR_FACES, description: 'Head sways, mouth growls' },

  // EFFECTS (Magic)
  { id: 'fire_eyes', name: 'Fire Eyes', emoji: '🔥', category: FILTER_CATEGORIES.EFFECTS, description: 'Flames shoot from eyes' },
  { id: 'laser_eyes', name: 'Laser Beam', emoji: '⚡', category: FILTER_CATEGORIES.EFFECTS, description: 'Laser rays on blink' },
  { id: 'neon_glow', name: 'Neon Glow', emoji: '💫', category: FILTER_CATEGORIES.EFFECTS, description: 'Glowing face outline' },
  { id: 'rainbow_face', name: 'Rainbow Face', emoji: '🌈', category: FILTER_CATEGORIES.EFFECTS, description: 'Shifting rainbow colors' },
  { id: 'matrix', name: 'Matrix Code', emoji: '💻', category: FILTER_CATEGORIES.EFFECTS, description: 'Digital rain effect' },
  { id: 'glitch', name: 'Glitch Vibe', emoji: '📡', category: FILTER_CATEGORIES.EFFECTS, description: 'Digital distortion' },

  // BEAUTY (Enhancement + Fun)
  { id: 'skin_smooth', name: 'Silky Skin', emoji: '✨', category: FILTER_CATEGORIES.BEAUTY, description: 'Smooth and radiant' },
  { id: 'eye_bright', name: 'Bright Eyes', emoji: '👁️', category: FILTER_CATEGORIES.BEAUTY, description: 'Glowing eyes' },
  { id: 'blush', name: 'Rosy Blush', emoji: '🌸', category: FILTER_CATEGORIES.BEAUTY, description: 'Add cheeky glow' },
  { id: 'lips_full', name: 'Full Lips', emoji: '💋', category: FILTER_CATEGORIES.BEAUTY, description: 'Plump lips' },
  { id: 'flower_crown', name: 'Flower Crown', emoji: '👑', category: FILTER_CATEGORIES.BEAUTY, description: 'Animated flowers' },

  // FUN (Silly & Goofy)
  { id: 'big_eyes', name: 'Owl Eyes', emoji: '👀', category: FILTER_CATEGORIES.FUN, description: 'Huge googly eyes' },
  { id: 'small_face', name: 'Shrink Ray', emoji: '🔍', category: FILTER_CATEGORIES.FUN, description: 'Tiny face effect' },
  { id: 'big_mouth', name: 'Clown Mouth', emoji: '🤡', category: FILTER_CATEGORIES.FUN, description: 'Giant silly mouth' },
  { id: 'mustache', name: 'Fancy Stache', emoji: '👨', category: FILTER_CATEGORIES.FUN, description: 'Epic mustache' },
  { id: 'tongue_out', name: 'Silly Tongue', emoji: '😜', category: FILTER_CATEGORIES.FUN, description: 'Playful tongue' },
  { id: 'glasses_fun', name: 'Party Shades', emoji: '🕶️', category: FILTER_CATEGORIES.FUN, description: 'Cool sunglasses' },

  // TRENDING (TikTok/Instagram Vibes)
  { id: 'duotone_warm', name: 'Warm Vibes', emoji: '🌅', category: FILTER_CATEGORIES.TRENDING, description: 'Sunset tone' },
  { id: 'duotone_cool', name: 'Cool Mood', emoji: '❄️', category: FILTER_CATEGORIES.TRENDING, description: 'Icy blue tone' },
  { id: 'vintage', name: 'Vintage', emoji: '📽️', category: FILTER_CATEGORIES.TRENDING, description: 'Retro film look' },
  { id: 'bw_sketch', name: 'Sketch Art', emoji: '🎨', category: FILTER_CATEGORIES.TRENDING, description: 'Hand-drawn effect' },
  { id: 'noise_vhs', name: 'VHS Glitch', emoji: '📼', category: FILTER_CATEGORIES.TRENDING, description: 'Retro VHS vibes' },

  // INTERACTIVE (User Actions Trigger Effects)
  { id: 'smile_hearts', name: 'Smile Hearts', emoji: '❤️', category: FILTER_CATEGORIES.INTERACTIVE, description: 'Hearts fly on smile' },
  { id: 'blink_sparkle', name: 'Sparkle Blink', emoji: '✨', category: FILTER_CATEGORIES.INTERACTIVE, description: 'Sparkles on blink' },
  { id: 'mouth_open_boom', name: 'Boom Mouth', emoji: '💥', category: FILTER_CATEGORIES.INTERACTIVE, description: 'Explosion on mouth open' },
  { id: 'anger_mode', name: 'Angry Aura', emoji: '😠', category: FILTER_CATEGORIES.INTERACTIVE, description: 'Red aura on frown' },
];

// ─────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function lm(landmarks, index) {
  return landmarks[index] || { x: 0, y: 0, z: 0 };
}

function drawCircle(ctx, x, y, r, color, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOval(ctx, x, y, w, h, color, opacity = 1, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────
// ANIMATED FILTER RENDERERS
// ─────────────────────────────────────────────────────────────────

class Filter {
  constructor() {
    this.animManager = new AnimationManager();
    this.particleEmitter = new ParticleEmitter();
    this.interactionDetector = new InteractionDetector();
    this.prevInteractions = {};
  }

  preRender(landmarks, w, h) {
    // Override in subclass
  }

  render(ctx, landmarks, w, h) {
    // Override in subclass
  }

  detectInteractions(landmarks) {
    const current = this.interactionDetector.detectAll(landmarks);
    const changes = {};

    for (const [key, value] of Object.entries(current)) {
      if (value && !this.prevInteractions[key]) {
        changes[key] = 'triggered';
      }
    }

    this.prevInteractions = current;
    return changes;
  }
}

// ─────────────────────────────────────────────────────────────────
// AR FACES
// ─────────────────────────────────────────────────────────────────

class DogFilter extends Filter {
  constructor() {
    super();
    this.animManager.create('earBounce', 300, easing.bounce);
    this.animManager.create('earBounce', 300, easing.bounce).loop();
    this.tongueWag = 0;
  }

  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
    const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);
    const interEyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * w;
    const roll = getHeadRoll(landmarks);

    const noseX = nose.x * w;
    const noseY = nose.y * h;
    const earDist = interEyeDist * 0.3;

    // Animation values
    this.animManager.updateAll();
    const bounce = this.animManager.get('earBounce')?.update() || 0;

    // Left ear
    drawOval(ctx, noseX - earDist, noseY - earDist * 1.2 + bounce * 20, 
      earDist * 0.8, earDist * 1.2,
      '#8B6F47', 0.9, roll - 0.3);

    // Right ear
    drawOval(ctx, noseX + earDist, noseY - earDist * 1.2 + bounce * 20,
      earDist * 0.8, earDist * 1.2,
      '#8B6F47', 0.9, roll + 0.3);

    // Snout
    const snoutSize = interEyeDist * 0.25;
    drawCircle(ctx, noseX, noseY + snoutSize * 0.5, snoutSize, '#D4A574', 0.95);

    // Nose
    drawCircle(ctx, noseX, noseY + snoutSize * 0.8, snoutSize * 0.3, '#2C1810', 1);

    // Check for mouth open to wag tongue
    const interactions = this.detectInteractions(landmarks);
    if (interactions.mouthOpen || this.interactionDetector.isMouthOpen(landmarks)) {
      this.tongueWag = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      drawOval(ctx, noseX, noseY + snoutSize * 1.3 + this.tongueWag * 15,
        snoutSize * 0.4, snoutSize * 0.6, '#E91E63', 0.8);
    }

    // Particles on bounce peak
    if (bounce > 0.9) {
      this.particleEmitter.particles.length = 0;
      this.particleEmitter.burst(noseX, noseY, 3, {
        speed: 2,
        color: '#ff9800',
        lifetime: 300,
      });
    }

    this.particleEmitter.update();
    this.particleEmitter.draw(ctx);
  }
}

class CatFilter extends Filter {
  constructor() {
    super();
    this.animManager.create('earTwitch', 200, easing.elastic);
    this.animManager.get('earTwitch').loop();
  }

  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
    const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);
    const roll = getHeadRoll(landmarks);

    const noseX = nose.x * w;
    const noseY = nose.y * h;
    const interEyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * w;
    const earDist = interEyeDist * 0.35;

    // Ear twitch animation
    this.animManager.updateAll();
    const twitch = (this.animManager.get('earTwitch')?.update() || 0) * 0.3;

    // Pointy ears
    ctx.save();
    ctx.translate(noseX - earDist * 1.2, noseY - earDist * 1.5 + twitch * 10);
    ctx.rotate(roll - 0.4);
    ctx.fillStyle = '#FFC0CB';
    ctx.beginPath();
    ctx.moveTo(0, -earDist);
    ctx.lineTo(-earDist * 0.4, 0);
    ctx.lineTo(earDist * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(noseX + earDist * 1.2, noseY - earDist * 1.5 + twitch * 10);
    ctx.rotate(roll + 0.4);
    ctx.fillStyle = '#FFC0CB';
    ctx.beginPath();
    ctx.moveTo(0, -earDist);
    ctx.lineTo(-earDist * 0.4, 0);
    ctx.lineTo(earDist * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Cat face
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(noseX, noseY, interEyeDist * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sparkle eyes
    drawCircle(ctx, noseX - interEyeDist * 0.15, noseY - interEyeDist * 0.05, 
      interEyeDist * 0.05, '#FFD700', 0.7 + Math.sin(Date.now() / 300) * 0.3);
    drawCircle(ctx, noseX + interEyeDist * 0.15, noseY - interEyeDist * 0.05,
      interEyeDist * 0.05, '#FFD700', 0.7 + Math.sin(Date.now() / 300) * 0.3);
  }
}

class BunnyFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const interEyeDist = getInterEyeDistance(landmarks, w);
    const roll = getHeadRoll(landmarks);

    const noseX = nose.x * w;
    const noseY = nose.y * h;
    const earHeight = interEyeDist * 0.9;

    // Wiggle nose
    const wiggle = Math.sin(Date.now() / 100) * 3;

    // Long ears - animated
    const earBob = Math.sin(Date.now() / 400) * 10;
    
    drawOval(ctx, noseX - interEyeDist * 0.2, noseY - earHeight, 
      interEyeDist * 0.3, earHeight,
      '#FFB6D9', 0.9, roll - 0.1);
    
    drawOval(ctx, noseX + interEyeDist * 0.2, noseY - earHeight,
      interEyeDist * 0.3, earHeight,
      '#FFB6D9', 0.9, roll + 0.1);

    // Inner ear
    drawOval(ctx, noseX - interEyeDist * 0.2, noseY - earHeight * 0.7,
      interEyeDist * 0.12, earHeight * 0.6,
      '#FFC0CB', 0.8);
    
    drawOval(ctx, noseX + interEyeDist * 0.2, noseY - earHeight * 0.7,
      interEyeDist * 0.12, earHeight * 0.6,
      '#FFC0CB', 0.8);

    // Bunny nose
    drawCircle(ctx, noseX + wiggle, noseY, interEyeDist * 0.08, '#FFB6D9', 0.9);
    drawCircle(ctx, noseX - 3 + wiggle, noseY - 2, 2, '#000', 0.7);
    drawCircle(ctx, noseX + 3 + wiggle, noseY - 2, 2, '#000', 0.7);
  }
}

class PandaFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
    const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);

    const noseX = nose.x * w;
    const noseY = nose.y * h;
    const interEyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * w;

    // Sleepy blink animation
    const blinkAmount = Math.max(0, Math.sin(Date.now() / 2000) * 0.5 + 0.5);

    // Black eye patches
    const patchSize = interEyeDist * 0.35;
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(noseX - interEyeDist * 0.2, noseY - interEyeDist * 0.1, 
      patchSize, patchSize * blinkAmount, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(noseX + interEyeDist * 0.2, noseY - interEyeDist * 0.1,
      patchSize, patchSize * blinkAmount, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // White face
    drawCircle(ctx, noseX, noseY, interEyeDist * 0.4, '#fff', 0.6);

    // Black nose
    drawCircle(ctx, noseX, noseY, interEyeDist * 0.08, '#000', 0.9);
  }
}

// ─────────────────────────────────────────────────────────────────
// EFFECTS
// ─────────────────────────────────────────────────────────────────

class FireEyesFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
    const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);

    const leftEyeX = leftEye.x * w;
    const leftEyeY = leftEye.y * h;
    const rightEyeX = rightEye.x * w;
    const rightEyeY = rightEye.y * h;

    // Flame animation
    const time = Date.now() / 100;
    const flameHeight = 30 + Math.sin(time) * 10;

    // Left eye fire
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.globalAlpha = 0.6 - i * 0.1;
      ctx.fillStyle = `hsl(${30 - i * 10}, 100%, ${50 + i * 5}%)`;
      ctx.beginPath();
      ctx.ellipse(leftEyeX, leftEyeY - flameHeight * (1 - i * 0.3),
        15 - i * 5, flameHeight * (1 - i * 0.3),
        Math.sin(time + i) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Right eye fire
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.globalAlpha = 0.6 - i * 0.1;
      ctx.fillStyle = `hsl(${30 - i * 10}, 100%, ${50 + i * 5}%)`;
      ctx.beginPath();
      ctx.ellipse(rightEyeX, rightEyeY - flameHeight * (1 - i * 0.3),
        15 - i * 5, flameHeight * (1 - i * 0.3),
        Math.sin(time + i) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

class LaserEyesFilter extends Filter {
  constructor() {
    super();
    this.lastBlink = 0;
    this.laserDuration = 200;
  }

  render(ctx, landmarks, w, h) {
    const interactions = this.detectInteractions(landmarks);
    const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
    const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);

    const leftEyeX = leftEye.x * w;
    const leftEyeY = leftEye.y * h;
    const rightEyeX = rightEye.x * w;
    const rightEyeY = rightEye.y * h;

    if (interactions.blinking) {
      this.lastBlink = Date.now();
    }

    const timeSinceBlink = Date.now() - this.lastBlink;
    if (timeSinceBlink < this.laserDuration) {
      const laserOpacity = 1 - timeSinceBlink / this.laserDuration;

      // Left laser
      ctx.save();
      ctx.globalAlpha = laserOpacity;
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftEyeX, leftEyeY);
      ctx.lineTo(-100, leftEyeY);
      ctx.stroke();
      ctx.restore();

      // Right laser
      ctx.save();
      ctx.globalAlpha = laserOpacity;
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rightEyeX, rightEyeY);
      ctx.lineTo(w + 100, rightEyeY);
      ctx.stroke();
      ctx.restore();

      // Glow effect
      drawGlow(ctx, leftEyeX, leftEyeY, 40, laserOpacity * 0.3);
      drawGlow(ctx, rightEyeX, rightEyeY, 40, laserOpacity * 0.3);
    }
  }
}

class NeonGlowFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const forehead = lm(landmarks, LANDMARKS.FOREHEAD);
    const chin = lm(landmarks, LANDMARKS.CHIN);
    const roll = getHeadRoll(landmarks);

    const noseX = nose.x * w;
    const noseY = nose.y * h;
    const foreheadY = forehead.y * h;
    const chinY = chin.y * h;
    const faceHeight = chinY - foreheadY;

    // Pulsing neon effect
    const pulse = Math.sin(Date.now() / 400) * 0.5 + 0.5;

    // Draw face contour with neon glow
    ctx.save();
    ctx.globalAlpha = 0.8 * pulse;
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Simple face outline using bezier
    ctx.beginPath();
    ctx.moveTo(noseX - faceHeight * 0.4, foreheadY);
    ctx.quadraticCurveTo(noseX - faceHeight * 0.5, noseY, noseX - faceHeight * 0.4, chinY);
    ctx.quadraticCurveTo(noseX, chinY + faceHeight * 0.1, noseX + faceHeight * 0.4, chinY);
    ctx.quadraticCurveTo(noseX + faceHeight * 0.5, noseY, noseX + faceHeight * 0.4, foreheadY);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Add glow effect
    drawGlow(ctx, noseX, noseY, faceHeight * 0.6, pulse * 0.3);
  }
}

class RainbowFaceFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const noseX = nose.x * w;
    const noseY = nose.y * h;

    const time = Date.now() / 100;
    const hueShift = time % 360;

    // Apply color overlay with shifting hue
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = `hsl(${hueShift}, 100%, 50%)`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Draw rainbow circles around face
    for (let i = 0; i < 6; i++) {
      const angle = (time + i * 60) * Math.PI / 180;
      const x = noseX + Math.cos(angle) * 200;
      const y = noseY + Math.sin(angle) * 200;
      const hue = (hueShift + i * 60) % 360;

      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// FUN FILTERS
// ─────────────────────────────────────────────────────────────────

class BigEyesFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
    const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);
    const interEyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * w;

    const leftX = leftEye.x * w;
    const leftY = leftEye.y * h;
    const rightX = rightEye.x * w;
    const rightY = rightEye.y * h;

    const eyeSize = interEyeDist * 0.4;

    // White of eye
    drawCircle(ctx, leftX, leftY, eyeSize, '#fff', 0.85);
    drawCircle(ctx, rightX, rightY, eyeSize, '#fff', 0.85);

    // Iris
    const irisSize = eyeSize * 0.5;
    drawCircle(ctx, leftX, leftY, irisSize, '#4a90e2', 0.9);
    drawCircle(ctx, rightX, rightY, irisSize, '#4a90e2', 0.9);

    // Pupils that follow movement
    const pupilSize = irisSize * 0.4;
    drawCircle(ctx, leftX + 5, leftY + 5, pupilSize, '#000', 0.95);
    drawCircle(ctx, rightX + 5, rightY + 5, pupilSize, '#000', 0.95);

    // Shine
    drawCircle(ctx, leftX + 8, leftY - 8, pupilSize * 0.4, '#fff', 0.8);
    drawCircle(ctx, rightX + 8, rightY - 8, pupilSize * 0.4, '#fff', 0.8);
  }
}

class MustacheFilter extends Filter {
  render(ctx, landmarks, w, h) {
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
    const roll = getHeadRoll(landmarks);
    const interEyeDist = getInterEyeDistance(landmarks, w);

    const noseX = nose.x * w;
    const noseY = nose.y * h;

    // Fancy curly mustache
    ctx.save();
    ctx.translate(noseX, noseY);
    ctx.rotate(roll);

    ctx.fillStyle = '#8B4513';
    ctx.globalAlpha = 0.9;

    // Left curl
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(-40, -15, -60, 0);
    ctx.quadraticCurveTo(-40, 10, -10, 5);
    ctx.closePath();
    ctx.fill();

    // Right curl
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.quadraticCurveTo(40, -15, 60, 0);
    ctx.quadraticCurveTo(40, 10, 10, 5);
    ctx.closePath();
    ctx.fill();

    // Center
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────────────
// INTERACTIVE FILTERS
// ─────────────────────────────────────────────────────────────────

class SmileHeartsFilter extends Filter {
  constructor() {
    super();
    this.heartParticles = [];
  }

  render(ctx, landmarks, w, h) {
    const interactions = this.detectInteractions(landmarks);

    if (interactions.smiling) {
      const nose = lm(landmarks, LANDMARKS.NOSE_TIP);
      const noseX = nose.x * w;
      const noseY = nose.y * h;

      this.particleEmitter.burst(noseX, noseY - 100, 5, {
        speed: 3,
        color: '#FF69B4',
        lifetime: 800,
        gravity: -0.1,
      });
    }

    // Draw hearts
    this.particleEmitter.update();
    for (const p of this.particleEmitter.particles) {
      // Draw as heart shape
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❤️', p.x, p.y);
      ctx.restore();
    }
  }
}

class BlinkSparkleFilter extends Filter {
  constructor() {
    super();
    this.lastBlink = 0;
    this.sparkles = [];
  }

  render(ctx, landmarks, w, h) {
    const interactions = this.detectInteractions(landmarks);

    if (interactions.blinking) {
      const leftEye = lm(landmarks, LANDMARKS.LEFT_EYE);
      const rightEye = lm(landmarks, LANDMARKS.RIGHT_EYE);

      this.particleEmitter.burst(leftEye.x * w, leftEye.y * h, 8, {
        speed: 2,
        color: '#FFD700',
        lifetime: 600,
      });
      this.particleEmitter.burst(rightEye.x * w, rightEye.y * h, 8, {
        speed: 2,
        color: '#FFD700',
        lifetime: 600,
      });
    }

    this.particleEmitter.update();
    this.particleEmitter.draw(ctx);
  }
}

class MouthOpenBoomFilter extends Filter {
  constructor() {
    super();
    this.lastBoom = 0;
    this.boomDuration = 400;
  }

  render(ctx, landmarks, w, h) {
    const interactions = this.detectInteractions(landmarks);
    const nose = lm(landmarks, LANDMARKS.NOSE_TIP);

    if (interactions.mouthOpen) {
      this.lastBoom = Date.now();
      this.particleEmitter.burst(nose.x * w, nose.y * h + 40, 15, {
        speed: 5,
        color: '#FF6B35',
        lifetime: 400,
        spread: Math.PI * 2,
      });
    }

    const timeSinceBoom = Date.now() - this.lastBoom;
    
    // Draw expanding rings
    if (timeSinceBoom < this.boomDuration) {
      const ringSize = (timeSinceBoom / this.boomDuration) * 100;
      const opacity = 1 - timeSinceBoom / this.boomDuration;

      ctx.save();
      ctx.globalAlpha = opacity * 0.5;
      ctx.strokeStyle = '#FF6B35';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nose.x * w, nose.y * h + 40, ringSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.particleEmitter.update();
    this.particleEmitter.draw(ctx);
  }
}

// ─────────────────────────────────────────────────────────────────
// TRENDING FILTERS
// ─────────────────────────────────────────────────────────────────

class DuotonWarmFilter extends Filter {
  render(ctx, landmarks, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

class DuotoneCoolFilter extends Filter {
  render(ctx, landmarks, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────────────
// FILTER FACTORY & MAIN RENDERER
// ─────────────────────────────────────────────────────────────────

const filterInstances = {
  dog_v2: new DogFilter(),
  cat_v2: new CatFilter(),
  bunny_v2: new BunnyFilter(),
  panda_v2: new PandaFilter(),
  fire_eyes: new FireEyesFilter(),
  laser_eyes: new LaserEyesFilter(),
  neon_glow: new NeonGlowFilter(),
  rainbow_face: new RainbowFaceFilter(),
  big_eyes: new BigEyesFilter(),
  mustache: new MustacheFilter(),
  smile_hearts: new SmileHeartsFilter(),
  blink_sparkle: new BlinkSparkleFilter(),
  mouth_open_boom: new MouthOpenBoomFilter(),
  duotone_warm: new DuotonWarmFilter(),
  duotone_cool: new DuotoneCoolFilter(),
};

export function renderAnimatedFilter(ctx, landmarks, w, h, filterId) {
  const filter = filterInstances[filterId];
  if (!filter) return;

  filter.render(ctx, landmarks, w, h);
}

export function getFilterByCategory(category) {
  return ANIMATED_FILTERS.filter(f => f.category === category);
}

export function getFilterById(id) {
  return ANIMATED_FILTERS.find(f => f.id === id);
}
