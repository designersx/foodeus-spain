import {API_BASE_URL} from "@/services/apiService";
export const getMenuImagePath = (imagePath?: string | null): string => {

  if (!imagePath) return "/Images/fallback.jpg";

   try {
    const isValidUrl = /^https?:\/\//.test(imagePath);
    if (isValidUrl) return imagePath;

    if (imagePath.includes("/public")) {
      return `${API_BASE_URL}/${imagePath.split("/public")[1]}`;
    } else {
      return `${API_BASE_URL}/${imagePath.replace(/\\/g, "/")}`;
    }
  } catch (error) {
    return "/fallback.jpg";
  }
};