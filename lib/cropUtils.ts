export const getCroppedImg = async (
    imageSrc: string,
    croppedAreaPixels: { width: number; height: number; x: number; y: number }
  ): Promise<{ blob: Blob; preview: string }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");
  
    if (!ctx) throw new Error("Canvas context is null");
  
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const preview = URL.createObjectURL(blob);
        resolve({ blob, preview });
      }, "image/jpeg");
    });
  };
  
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  