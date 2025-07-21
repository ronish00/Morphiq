export const applyCanvasGrayscale = (
  imgUrl: string,
  callback: (dataUrl: string) => void
) => {
  const img = new Image();
  img.crossOrigin = "anonymous"; // Needed if from a different origin
  img.src = imgUrl;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);
    const transformedUrl = canvas.toDataURL("image/png");
    callback(transformedUrl);
  };
};
