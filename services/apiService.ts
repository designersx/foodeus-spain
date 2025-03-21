// 📂 services/apiService.ts
import axios from "axios";


// Base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://foodeus.truet.net/enduser";

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Function to get all restaurants with menus
export const getRestaurantsWithMenus = async () => {
  try {
    const response = await apiClient.get("/getRestaurantsWithMenus");
    return response.data; // Axios automatically parses JSON
  } catch (error) {
    console.error("❌ Error fetching restaurants:", error);
    return { success: false, data: [] };
  }
};

// ✅ Function to get a single restaurant by ID
export const getRestaurantById = async (id: string) => {
  try {
    const response = await apiClient.get(`/getRestaurantWithMenus/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching restaurant:", error);
    return { success: false, data: null };
  }
};

// ✅ Function to search restaurants by name
export const searchRestaurants = async (query: string) => {
  try {
    const response = await apiClient.get(`/searchRestaurants`, {
      params: { query }, // Passing query as a URL parameter
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error searching restaurants:", error);
    return { success: false, data: [] };
  }
};
