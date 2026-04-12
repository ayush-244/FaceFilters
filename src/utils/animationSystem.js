/**
 * animationSystem.js
 * ------------------
 * High-performance animation framework for interactive filters.
 * Handles time-based animations, easing functions, and sprite rendering.
 */

/**
 * Easing functions for smooth animations
 */
export const easing = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t) => {
    if (t < 0.5) return 8 * t * t * t * t;
    return 1 - 8 * (t - 1) * (t - 1) * (t - 1) * (t - 1);
  },
  elastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
  },
  backOut: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  pulse: (t) => 0.5 + 0.5 * Math.sin(t * Math.PI * 4),
};

/**
 * Animation controller - manages keyframe animations with callbacks
 */
export class Animation {
  constructor(duration = 1000, easeFunc = easing.easeOut) {
    this.duration = duration;
    this.easeFunc = easeFunc;
    this.startTime = null;
    this.isRunning = false;
    this.isLooping = false;
    this.loopCount = 0;
    this.onFrame = null;
    this.onComplete = null;
  }

  start() {
    this.startTime = Date.now();
    this.isRunning = true;
  }

  update() {
    if (!this.isRunning || !this.startTime) return 0;

    const elapsed = Date.now() - this.startTime;
    let progress = Math.min(elapsed / this.duration, 1);

    if (this.isLooping) {
      if (progress >= 1) {
        this.loopCount++;
        this.startTime = Date.now();
        progress = 0;
      }
    } else if (progress >= 1) {
      this.isRunning = false;
      if (this.onComplete) this.onComplete();
    }

    const easedProgress = this.easeFunc(progress);
    if (this.onFrame) this.onFrame(easedProgress);

    return easedProgress;
  }

  loop() {
    this.isLooping = true;
    this.loopCount = 0;
    this.start();
  }

  stop() {
    this.isRunning = false;
    this.startTime = null;
  }

  reset() {
    this.stop();
    this.loopCount = 0;
  }
}

/**
 * Key-value animation store for tracking multiple animations
 */
export class AnimationManager {
  constructor() {
    this.animations = new Map();
  }

  create(key, duration, easeFunc) {
    const anim = new Animation(duration, easeFunc);
    this.animations.set(key, anim);
    return anim;
  }

  get(key) {
    return this.animations.get(key);
  }

  has(key) {
    return this.animations.has(key);
  }

  delete(key) {
    this.animations.delete(key);
  }

  updateAll() {
    const values = {};
    for (const [key, anim] of this.animations) {
      values[key] = anim.update();
    }
    return values;
  }

  clear() {
    this.animations.clear();
  }
}

/**
 * Particle system for sparkles, confetti, explosions
 */
export class Particle {
  constructor(x, y, vx, vy, lifetime = 1000, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lifetime = lifetime;
    this.age = 0;
    this.size = options.size || 5;
    this.color = options.color || '#ff6b6b';
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.friction = options.friction !== undefined ? options.friction : 0.98;
    this.gravity = options.gravity !== undefined ? options.gravity : 0.2;
  }

  update(deltaTime = 16) {
    this.age += deltaTime;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.opacity = Math.max(0, 1 - this.age / this.lifetime);
  }

  isDead() {
    return this.age >= this.lifetime;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Particle emitter for creating burst effects
 */
export class ParticleEmitter {
  constructor() {
    this.particles = [];
  }

  burst(x, y, count = 10, options = {}) {
    const angle = options.angle || 0;
    const spread = options.spread !== undefined ? options.spread : Math.PI * 2;
    const speed = options.speed || 3;

    for (let i = 0; i < count; i++) {
      const theta = angle + (Math.random() - 0.5) * spread;
      const v = speed + Math.random() * speed;
      const vx = Math.cos(theta) * v;
      const vy = Math.sin(theta) * v;
      
      this.particles.push(new Particle(x, y, vx, vy, options.lifetime || 1000, options));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }
}

/**
 * Interaction detector for smiles, blinks, mouth openings
 */
export class InteractionDetector {
  constructor() {
    this.prevMouthOpen = false;
    this.prevSmiling = false;
    this.prevBlink = false;
    this.blinkThreshold = 0.2;
    this.mouthThreshold = 0.03;
    this.smileThreshold = 0.3;
  }

  /**
   * Detect if mouth is open using lip distance
   */
  isMouthOpen(landmarks) {
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    if (!upperLip || !lowerLip) return false;
    const distance = Math.abs(lowerLip.y - upperLip.y);
    return distance > this.mouthThreshold;
  }

  /**
   * Detect smile based on face shape and cheek position
   */
  isSmiling(landmarks) {
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const nose = landmarks[1];
    
    if (!leftCheek || !rightCheek || !nose) return false;
    
    const cheekDistance = Math.abs(rightCheek.x - leftCheek.x);
    const cheekHeight = Math.abs(rightCheek.y - nose.y);
    
    return cheekDistance > cheekHeight * this.smileThreshold;
  }

  /**
   * Detect blink using eye aspect ratio
   */
  isBlink(landmarks) {
    const leftEye = landmarks[159];
    const rightEye = landmarks[386];
    
    if (!leftEye || !rightEye) return false;
    
    // Simplified eye closure detection: if eyes are close vertically
    const leftEyeOpen = landmarks[145]?.y && landmarks[144]?.y ? 
      Math.abs(landmarks[145].y - landmarks[144].y) > this.blinkThreshold : true;
    
    return !leftEyeOpen;
  }

  /**
   * Get all current interactions
   */
  detectAll(landmarks) {
    return {
      mouthOpen: this.isMouthOpen(landmarks),
      smiling: this.isSmiling(landmarks),
      blinking: this.isBlink(landmarks),
    };
  }
}

/**
 * Sprite renderer for animated overlays
 */
export class SpriteAnimator {
  constructor(image, cols = 1, rows = 1, fps = 12) {
    this.image = image;
    this.cols = cols;
    this.rows = rows;
    this.fps = fps;
    this.frameDuration = 1000 / fps;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
    this.isLooping = true;
  }

  update(deltaTime = 16) {
    if (!this.isPlaying) return;

    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= this.frameDuration) {
      this.currentFrame++;
      this.elapsedTime = 0;

      if (this.currentFrame >= this.cols * this.rows) {
        if (this.isLooping) {
          this.currentFrame = 0;
        } else {
          this.isPlaying = false;
          this.currentFrame = this.cols * this.rows - 1;
        }
      }
    }
  }

  draw(ctx, x, y, width, height) {
    if (!this.image) return;

    const frameWidth = this.image.width / this.cols;
    const frameHeight = this.image.height / this.rows;
    const col = this.currentFrame % this.cols;
    const row = Math.floor(this.currentFrame / this.cols);

    ctx.drawImage(
      this.image,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      x,
      y,
      width,
      height
    );
  }

  reset() {
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
  }
}

/**
 * Draw helper for 3D-like transformations
 */
export function drawRotatedImage(ctx, img, x, y, width, height, rotation, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

/**
 * Glow effect (used for highlighting, magical effects)
 */
export function drawGlow(ctx, x, y, radius, intensity = 0.5) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 200, 100, ${intensity})`);
  gradient.addColorStop(0.5, `rgba(255, 150, 50, ${intensity * 0.5})`);
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

/**
 * Ripple effect from a point
 */
export function drawRipple(ctx, x, y, radius, maxRadius, opacity = 0.5) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = `rgba(255, 200, 100, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
