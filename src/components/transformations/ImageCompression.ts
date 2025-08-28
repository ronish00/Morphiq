
export async function compressTransformedCanvas(
  canvas: HTMLCanvasElement,
  quality: number = 0.8,
  format: "jpeg" | "webp" = "webp",
  opts?: { maxDimension?: number }
): Promise<Blob> {
  const desiredMime = `image/${format}`;

  // Helper: check if the canvas can actually produce requested mime (some browsers don't support webp)
  function supportsMime(c: HTMLCanvasElement, mime: string): boolean {
    try {
      const data = c.toDataURL(mime);
      return data.indexOf(`data:${mime}`) === 0;
    } catch {
      return false;
    }
  }

  // Pick the actual mime type to use (fall back if necessary)
  let mime = desiredMime;
  if (!supportsMime(canvas, mime)) {
    // Try fallback order: webp -> jpeg -> png
    const fallbacks = ["image/webp", "image/jpeg", "image/png"];
    const preferred = mime;
    const ordered = [preferred, ...fallbacks.filter((f) => f !== preferred)];
    const found = ordered.find((m) => supportsMime(canvas, m));
    mime = found ?? "image/png"; // last resort
  }

  // If requested, downscale large canvases to limit final size (preserve aspect)
  let workingCanvas: HTMLCanvasElement = canvas;
  const maxDim = opts?.maxDimension;
  if (maxDim && Math.max(canvas.width, canvas.height) > maxDim) {
    const scale = maxDim / Math.max(canvas.width, canvas.height);
    const w = Math.round(canvas.width * scale);
    const h = Math.round(canvas.height * scale);

    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const ctx = tmp.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    // imageSmoothingQuality accepts 'low' | 'medium' | 'high' — use high for better downscale quality
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, w, h);
    workingCanvas = tmp;
  }

  // Create blob via toBlob (quality used only for webp/jpeg)
  return new Promise<Blob>((resolve, reject) => {
    try {
      // For 'image/png' quality parameter will be ignored by browsers.
      workingCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression produced no blob"));
        },
        mime,
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
}
