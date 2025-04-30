// 📂 services/apiService.ts
import axios from "axios";
import React from "react";
// Base API URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"; //locals
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://foodeus.truet.net"; 
// Create an Axios instance with default 
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// ✅ Function to get all restaurants with menus
export const getRestaurantsWithMenus = async () => {
  try {
    const response = await apiClient.get("/enduser/getRestaurantsWithMenus");
    return response.data;

  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return { success: false, data: [] };
  }
};
// ✅ Function to get a single restaurant by ID
export const getRestaurantById = async (id: string) => {
  try {
    const response = await apiClient.get(`/enduser/getRestaurantWithMenus/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching restaurant:", error);
    return { success: false, data: null };
  }
};
export const getRestaurantMenuById = async (id: string) => {
  try {
    const response = await apiClient.get(`/menu/getRestaurantMenuItemList/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching restaurant:", error);
    return { success: false, data: null };
  }
};
// ✅ Function to search restaurants by name
export const searchRestaurants = async (query: string) => {
  try {
    const response = await apiClient.get(`/enduser/searchRestaurants`, {
      params: { query }, // Passing query as a URL parameter
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error searching restaurants:", error);
    return { success: false, data: [] };
  }
};
export const getRestaurantListforAdmin = async () => {
  try {
    const response = await apiClient.get(`/restaurants/`);
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}

export const getRestaurantByIdforAdmin = async (id: number) => {
  try {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}

const addRestaurant = async (data: any) => {
  try {
    const response = await apiClient.post(`/restaurants/add`, data);
    return response.data; // The data returned from the API
  } catch (error) {
    console.error('Error adding restaurant:', error);
    return { success: false, data: [] }; // Return a fallback value on error
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/admin/login', { email, password });

    // Store the received token in localStorage (or any other storage mechanism)
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, data: [] };
  }
};

