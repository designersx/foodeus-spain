import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the structure of a Slide
interface Slide {
  id: number;
  image: string;
  title: { en: string; es: string };
}

// Define the state structure for the slideshow store
interface SlideshowState {
  slides: Slide[];
  hasFetched: boolean;
  setSlides: (slides: Slide[]) => void;
  setHasFetched: (fetched: boolean) => void;
  addSlide: (slide: Slide) => void;
  updateSlide: (updatedSlide: Slide) => void;
  removeSlide: (id: number) => void;
}

// Custom Storage for Zustand's Persist Middleware
const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null; // Return parsed item or null
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value)); // Stringify the value before saving
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name); // Simply remove the item from localStorage
  },
};

export const useSlideshowStore = create(
  persist<SlideshowState>(
    (set) => ({
      slides: [],
      hasFetched: false,
      setSlides: (slides) => set({ slides }),
      setHasFetched: (fetched) => set({ hasFetched: fetched }),
      addSlide: (slide) => set((state) => ({
        slides: [...state.slides, slide],
      })),
      updateSlide: (updatedSlide) => set((state) => ({
        slides: state.slides.map((slide) =>
          slide.id === updatedSlide.id ? updatedSlide : slide
        ),
      })),
      removeSlide: (id) => set((state) => ({
        slides: state.slides.filter((slide) => slide.id !== id),
      })),
    }),
    {
      name: "slideshow-store", // Key for the storage in localStorage
      storage: customStorage, // Use customStorage with proper methods
    }
  )
);
