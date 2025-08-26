export async function compressTransformedCanvas(
  canvas: HTMLCanvasElement,
  quality: number = 0.8,
  format: "jpeg" | "webp" | "png" = "webp" // default to WebP
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject("Compression failed");
      },
      `image/${format}`, // webp or jpeg
      quality
    );
  });
}
