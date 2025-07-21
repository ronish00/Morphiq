export async function applySketchFilter(
  imageUrl: string
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Required for CORS
    img.src = imageUrl;

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);

      // Invert
      const invertedData = ctx.getImageData(0, 0, width, height);
      const inv = invertedData.data;
      for (let i = 0; i < inv.length; i += 4) {
        inv[i] = 255 - inv[i];
        inv[i + 1] = 255 - inv[i + 1];
        inv[i + 2] = 255 - inv[i + 2];
      }
      ctx.putImageData(invertedData, 0, 0);

      // Apply Gaussian blur using CSS-style shadow blur workaround (or consider stackblur later for more quality)
      ctx.globalAlpha = 0.5;
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          ctx.drawImage(canvas, x, y);
        }
      }
      ctx.globalAlpha = 1.0;

      // Blend original grayscale and blurred inverted
      const blended = ctx.getImageData(0, 0, width, height);
      const result = blended.data;
      for (let i = 0; i < result.length; i += 4) {
        // Division blend mode (simulate sketch lines)
        result[i] = Math.min(255, (data[i] << 8) / (256 - result[i] + 1));
        result[i + 1] = Math.min(
          255,
          (data[i + 1] << 8) / (256 - result[i + 1] + 1)
        );
        result[i + 2] = Math.min(
          255,
          (data[i + 2] << 8) / (256 - result[i + 2] + 1)
        );
      }

      ctx.putImageData(blended, 0, 0);
      resolve(canvas);
    };

    img.onerror = reject;
  });
}
