export const getMenuImagePath = (imagePath?: string | null): string => {
    if (!imagePath) return "/fallback.jpg";
  
    try {
      const isValidUrl = /^https?:\/\//.test(imagePath);
      if (isValidUrl) return imagePath;
  
      if (imagePath.includes("/public")) {
        return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imagePath.split("/public")[1]}`;
      }
  
      return "/Images/fallback.jpg";
    } catch (error) {
      return "/Images/fallback.jpg";
    }
  };
  