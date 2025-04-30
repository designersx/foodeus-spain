// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// interface Menu {
//   title: { en: string; es: string };
//   description: { en: string; es: string };
//   image: string;
//   items?: string;
//   menu_type: any;
//   updated_at?: any;
// }

// interface Restaurant {
//   id: string;
//   name: string;
//   location: string;
//   coordinates: { lat: number; lng: number };
//   menu: Menu;
//   distance?: number;
//   rating?: string | number;
//   updatedToday?: boolean;
// }

// interface RestaurantState {
//   restaurants: Restaurant[];
//   hasFetched: boolean;
//   setRestaurants: (data: Restaurant[]) => void;
//   setHasFetched: (fetched: boolean) => void;
// }

// export const useRestaurantStore = create(
//   persist<RestaurantState>(
//     (set) => ({
//       restaurants: [],
//       hasFetched: false,
//       setRestaurants: (data) => set({ restaurants: data }),
//       setHasFetched: (fetched) => set({ hasFetched: fetched }),
//     }),
//     {
//       name: "restaurant-store", // storage key
//       storage: typeof window !== "undefined" ? sessionStorage : undefined, // Only use sessionStorage on the client-side
//     }
//   )
// );

// store/restaurantStore.ts
import { create } from "zustand";

interface Menu {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items?: string;
  menu_type: any;
  updated_at?: any;
}

interface Restaurant {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  menu: Menu;
  distance?: number;
  rating?: string | number;
  updatedToday?: boolean;
}

interface RestaurantState {
  restaurants: Restaurant[];
  hasFetched: boolean;
  setRestaurants: (data: Restaurant[]) => void;
  setHasFetched: (fetched: boolean) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  hasFetched: false,
  setRestaurants: (data) => set({ restaurants: data }),
  setHasFetched: (fetched) => set({ hasFetched: fetched }),
}));
