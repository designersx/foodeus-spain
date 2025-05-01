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
// import { create } from "zustand";

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

// export const useRestaurantStore = create<RestaurantState>((set) => ({
//   restaurants: [],
//   hasFetched: false,
//   setRestaurants: (data) => set({ restaurants: data }),
//   setHasFetched: (fetched) => set({ hasFetched: fetched }),
// }));

// cache 
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

// export const useRestaurantStore = create<RestaurantState>()(
//   persist(
//     (set) => ({
//       restaurants: [],
//       hasFetched: false,
//       setRestaurants: (data) => set({ restaurants: data }),
//       setHasFetched: (fetched) => set({ hasFetched: fetched }),
//     }),
//     {
//       name: "restaurant-store", // This is the key used in localStorage
//     }
//   )
// );

// store/restaurantStore.ts
// store/restaurantStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  menu: Menu;
  distance?: number;
  rating?: string | number;
  updatedToday?: boolean;
  hasMenu?: boolean;
  updatedAt?: string;
}

interface Menu {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items?: any[];
  updated_at?: any;
  menu_id?: string | number;
  menu_type?: any;
  price?: string | number;
}

interface RestaurantStore {
  restaurants: Restaurant[];
  restaurantsWithDistance: Restaurant[];
  userLocation: { lat: number; lng: number } | null;
  hasFetched: boolean;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setRestaurantsWithDistance: (restaurants: Restaurant[]) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setHasFetched: (hasFetched: boolean) => void;
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set) => ({
      restaurants: [],
      restaurantsWithDistance: [],
      userLocation: null,
      hasFetched: false,
      setRestaurants: (restaurants) => set({ restaurants }),
      setRestaurantsWithDistance: (restaurantsWithDistance) =>
        set({ restaurantsWithDistance }),
      setUserLocation: (userLocation) => set({ userLocation }),
      setHasFetched: (hasFetched) => set({ hasFetched }),
    }),
    {
      name: 'restaurant-storage', // Persist in localStorage
    }
  )
);