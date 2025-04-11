import imageCompression from 'browser-image-compression';

export const compressAndResizeImage = async (file:any) => {
  try {
    // Define options for compression
    const options = {
      maxWidthOrHeight: 800, // Resize the image
      maxSizeMB: 1, // Compress to a max of 1MB
      useWebWorker: true, // Use a web worker for better performance
      quality: 0.6,
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);

    // Log the compressed file MIME type and size
    console.log('Compressed file type:', compressedFile.type);
    console.log('Compressed file size:', compressedFile.size);

    // Check if the image type is valid
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(compressedFile.type)) {
      throw new Error('Unsupported image format. Only JPEG, PNG, and WebP are allowed.');
    }

    // Return the compressed file
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Image compression failed');
  }
};
