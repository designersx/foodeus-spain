export async function compressAndResizeImage(
    file: File,
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.85
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();
  
      reader.onload = (event) => {
        if (!event.target?.result) return reject("Failed to load image");
        image.src = event.target.result as string;
      };
  
      image.onload = () => {
        const canvas = document.createElement("canvas");
        let width = image.width;
        let height = image.height;
  
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context not available");
  
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Image compression failed");
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
  
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
  