/**
 * assetLoader.js
 * ---------------
 * Loads real PNG filter overlay images from /filters/ (public directory).
 * Returns a Promise that resolves with an object of loaded <img> elements
 * ready for ctx.drawImage().
 *
 * Images sourced from the Snapchat-Filters-main asset pack.
 */

/** Load a single image and return a Promise<HTMLImageElement> */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn(`Failed to load asset: ${src}`, e);
      // Return a tiny transparent fallback so the app doesn't crash
      const fallback = document.createElement("canvas");
      fallback.width = 1;
      fallback.height = 1;
      resolve(fallback);
    };
    img.src = src;
  });
}

/**
 * Load all filter assets in parallel.
 * @returns {Promise<Object>} – object with named image elements
 */
export async function loadAssets() {
  const [
    dogFace,
    sunglasses,
    glasses,
    cowboyHat,
    mustache,
    moustache,
    leftEye,
    rightEye,
  ] = await Promise.all([
    loadImage("/filters/dog_face_filter.png"),
    loadImage("/filters/sunglasses.png"),
    loadImage("/filters/glasses.png"),
    loadImage("/filters/cowboy_hat.png"),
    loadImage("/filters/mustache.png"),
    loadImage("/filters/moustache.png"),
    loadImage("/filters/left_eye.png"),
    loadImage("/filters/right_eye.png"),
  ]);

  return {
    dogFace,
    sunglasses,
    glasses,
    cowboyHat,
    mustache,
    moustache,
    leftEye,
    rightEye,
  };
}