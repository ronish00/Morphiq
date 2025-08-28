import { compressTransformedCanvas } from "./ImageCompression";

type Options = {
  blurRadius?: number;      // px for blur of inverted image (higher -> stronger pencil lines)
  sharpenAmount?: number;   // multiplier for sharpening kernel (1 = neutral, >1 = stronger)
  contrast?: number;        // -100..100 (0 = no change)
  quality?: number;         // passed to compressTransformedCanvas (if supported)
};

export const applySketchFilter = (
  imageUrl: string,
  callback: (dataUrl: string) => void,
  options: Options = {}
) => {
  const {
    blurRadius = 6,      // sensible default for sketches
    sharpenAmount = 1.0, // moderate sharpening
    contrast = 10,       // slight contrast boost
    quality = 0.9,
  } = options;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  img.onload = async () => {
    const width = img.width;
    const height = img.height;

    // --- helper functions ---
    const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

    function adjustContrast(imageData: ImageData, contrastValue: number) {
      // contrastValue between -100..100
      const factor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = clamp(factor * (d[i] - 128) + 128);
        d[i + 1] = clamp(factor * (d[i + 1] - 128) + 128);
        d[i + 2] = clamp(factor * (d[i + 2] - 128) + 128);
      }
      return imageData;
    }

    function convolve(input: ImageData, kernel: number[], kw: number, kh: number, divisor = 1, bias = 0) {
      const src = input.data;
      const w = input.width;
      const h = input.height;
      const output = new ImageData(w, h);
      const dst = output.data;
      const halfW = Math.floor(kw / 2);
      const halfH = Math.floor(kh / 2);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let r = 0, g = 0, b = 0;
          for (let ky = 0; ky < kh; ky++) {
            for (let kx = 0; kx < kw; kx++) {
              const sx = x + kx - halfW;
              const sy = y + ky - halfH;
              if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
                const srcIdx = (sy * w + sx) * 4;
                const kval = kernel[ky * kw + kx];
                r += src[srcIdx] * kval;
                g += src[srcIdx + 1] * kval;
                b += src[srcIdx + 2] * kval;
              }
            }
          }
          const dstIdx = (y * w + x) * 4;
          dst[dstIdx] = clamp(r / divisor + bias);
          dst[dstIdx + 1] = clamp(g / divisor + bias);
          dst[dstIdx + 2] = clamp(b / divisor + bias);
          dst[dstIdx + 3] = src[dstIdx + 3]; // copy alpha
        }
      }
      return output;
    }

    // --- prepare canvases ---
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = width;
    baseCanvas.height = height;
    const baseCtx = baseCanvas.getContext("2d")!;
    baseCtx.drawImage(img, 0, 0);

    // 1) convert to grayscale (and keep as base)
    const baseImageData = baseCtx.getImageData(0, 0, width, height);
    const base = baseImageData.data;
    for (let i = 0; i < base.length; i += 4) {
      const gray = 0.3 * base[i] + 0.59 * base[i + 1] + 0.11 * base[i + 2];
      base[i] = base[i + 1] = base[i + 2] = gray;
    }
    baseCtx.putImageData(baseImageData, 0, 0);

    // 2) make inverted image from grayscale
    const invCanvas = document.createElement("canvas");
    invCanvas.width = width;
    invCanvas.height = height;
    const invCtx = invCanvas.getContext("2d")!;
    invCtx.putImageData(baseImageData, 0, 0);

    const invImageData = invCtx.getImageData(0, 0, width, height);
    const inv = invImageData.data;
    for (let i = 0; i < inv.length; i += 4) {
      inv[i] = 255 - inv[i];
      inv[i + 1] = 255 - inv[i + 1];
      inv[i + 2] = 255 - inv[i + 2];
    }
    invCtx.putImageData(invImageData, 0, 0);

    // 3) blur the inverted image using canvas filter (high-quality and fast)
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = width;
    blurCanvas.height = height;
    const blurCtx = blurCanvas.getContext("2d")!;
    // Use canvas filter for Gaussian-like blur; fallback to small loop if not supported
    try {
      blurCtx.filter = `blur(${blurRadius}px)`; // tweak this to make lines thinner/thicker
      blurCtx.drawImage(invCanvas, 0, 0);
      blurCtx.filter = "none";
    } catch (e) {
      // If browser doesn't support ctx.filter, fallback to drawing the inverted canvas multiple times (less ideal)
      blurCtx.globalAlpha = 0.5;
      for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
          blurCtx.drawImage(invCanvas, x, y);
        }
      }
      blurCtx.globalAlpha = 1.0;
    }

    // 4) dodge blend between base grayscale and blurred inverted (division dodge)
    const blurredData = blurCtx.getImageData(0, 0, width, height).data;
    const baseData = baseCtx.getImageData(0, 0, width, height).data; // grayscale base
    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext("2d")!;
    const outImage = resultCtx.createImageData(width, height);
    const out = outImage.data;
    for (let i = 0; i < out.length; i += 4) {
      // dodge formula: out = min(255, (base * 255) / (255 - blurred + 1))
      for (let c = 0; c < 3; c++) {
        const b = baseData[i + c];
        const blurV = blurredData[i + c];
        const val = Math.min(255, (b * 255) / (255 - blurV + 1));
        out[i + c] = clamp(val);
      }
      out[i + 3] = 255;
    }
    resultCtx.putImageData(outImage, 0, 0);

    // 5) optional contrast boost
    let finalImage = resultCtx.getImageData(0, 0, width, height);
    if (contrast !== 0) {
      finalImage = adjustContrast(finalImage, contrast);
    }

    // 6) unsharp mask (sharpen) using a simple kernel scaled by sharpenAmount
    // Basic sharpen kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
    const baseKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    // scale the center value according to sharpenAmount:
    const centerIndex = 4;
    const kernel = baseKernel.map((k, idx) => (idx === centerIndex ? k * sharpenAmount : k));
    const divisor = kernel.reduce((s, v) => s + v, 0) || 1;

    const sharpenedImage = convolve(finalImage, kernel, 3, 3, divisor);
    resultCtx.putImageData(sharpenedImage, 0, 0);

    // 7) compress and callback (keeps your compressTransformedCanvas usage)
    try {
      const compressedBlob = await compressTransformedCanvas(resultCanvas, quality, "webp");
      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);
      reader.onloadend = () => {
        const compressedDataUrl = reader.result as string;
        callback(compressedDataUrl);
      };
    } catch (err) {
      console.error("Compression failed:", err);
      // Fallback: directly return the canvas PNG dataURL
    }
    callback(resultCanvas.toDataURL());
  };

  img.onerror = (err) => console.error("Image load failed:", err);
};
