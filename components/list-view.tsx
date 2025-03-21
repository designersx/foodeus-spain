"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/context/language-context"
import { RestaurantCard } from "@/components/restaurant-card"
import { HeroSlideshow } from "@/components/hero-slideshow"
import { Input } from "@/components/ui/input"; // Radix UI Input
import { Search } from "lucide-react";
import {getRestaurantsWithMenus} from "@/services/apiService"
import Lottie from "lottie-react";
import hotFoodAnimation from "@/components/ui/hot-food.json"; 
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

// Sample data for restaurants

// const restaurants = [
//   {
//     id: "1",
//     name: "La Trattoria",
//     location: "123 Main St, Anytown",
//     coordinates: { lat: 40.7128, lng: -74.006 },
//     menu: {
//       title: {
//         en: "Italian Pasta Special",
//         es: "Especial de Pasta Italiana",
//       },
//       description: {
//         en: "Homemade pasta with fresh tomato sauce, basil, and parmesan cheese",
//         es: "Pasta casera con salsa de tomate fresco, albahaca y queso parmesano",
//       },
//       image: "Images/Homemade pasta.png?height=120&width=120",
//     },
//   },
//   {
//     id: "2",
//     name: "El Rincón",
//     location: "45679 Oak Ave, Somewhere",
//     coordinates: { lat: 40.7168, lng: -73.998 },
//     menu: {
//       title: {
//         en: "Seafood Paella",
//         es: "Paella de Mariscos",
//       },
//       description: {
//         en: "Traditional Spanish rice dish with fresh seafood, saffron, and vegetables",
//         es: "Plato tradicional español de arroz con mariscos frescos, azafrán y verduras",
//       },
//       image: "Images/Seafood Paella.png?height=120&width=120",
//     },
//   },
//   {
//     id: "3",
//     name: "Sushi Spot",
//     location: "789 Pine Rd, Elsewhere",
//     coordinates: { lat: 40.7218, lng: -74.012 },
//     menu: {
//       title: {
//         en: "Sushi Combo Platter",
//         es: "Plato Combinado de Sushi",
//       },
//       description: {
//         en: "Assortment of fresh nigiri and maki rolls with wasabi and pickled ginger",
//         es: "Surtido de nigiri fresco y rollos maki con wasabi y jengibre encurtido",
//       },
//       image: "Images/Sushi Combo Platter.png?height=120&width=120",
//     },
//   },
//   {
//     id: "4",
//     name: "Burger Joint",
//     location: "101 Elm St, Nowhere",
//     coordinates: { lat: 40.7148, lng: -74.016 },
//     menu: {
//       title: {
//         en: "Gourmet Burger Special",
//         es: "Especial de Hamburguesa Gourmet",
//       },
//       description: {
//         en: "Angus beef patty with caramelized onions, artisan cheese, and truffle aioli",
//         es: "Hamburguesa de carne Angus con cebollas caramelizadas, queso artesanal y alioli de trufa",
//       },
//       image: "Images/Gourmet Burger Special.png?height=120&width=120",
//     },
//   },
//   {
//     id: "5",
//     name: "Thai Delight",
//     location: "202 Maple Dr, Anyplace",
//     coordinates: { lat: 40.7108, lng: -74.002 },
//     menu: {
//       title: {
//         en: "Pad Thai Special",
//         es: "Especial de Pad Thai",
//       },
//       description: {
//         en: "Stir-fried rice noodles with tofu, bean sprouts, peanuts, and lime",
//         es: "Fideos de arroz salteados con tofu, brotes de soja, cacahuetes y lima",
//       },
//       image: "Images/Pad Thai Special.png?height=120&width=120",
//     },
//   },
// ]
// Define types
interface Menu {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items?: string;
  updated_at:string;
}

interface Restaurant {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  menu: Menu;
  distance?: number;
}

// Function to calculate distance
const calculateDistance = (lat1: number, lng1: number, lat2?: number, lng2?: number) => {
  if (!lat2 || !lng2) return Number.MAX_VALUE; // If coordinates are missing, set a large distance
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export function ListView() {
  const { t,language} = useLanguage();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [restaurantsWithDistance, setRestaurantsWithDistance] = useState<Restaurant[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterBy, setFilterBy] = useState("all"); 
  useEffect(() => {
    // fetch("https://foodeus.truet.net/src/enduser/getRestaurantsWithMenus", {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" },
    // })
    getRestaurantsWithMenus()
      .then((data) => {
        if (!Array.isArray(data.data)) {
          console.error("API response is not an array:", data);
          return;
        }

        const formattedRestaurants: Restaurant[] = data.data.map((restaurant:any) => {
          // Ensure menus exist before sorting
          const sortedMenus = restaurant.menus
            ? [...restaurant.menus].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            : [];

          return {
            id: restaurant.restaurant_id?.toString() || "",
            name: restaurant.name || "",
            location: restaurant.address || "",
            coordinates: {
              lat: Number(restaurant.location?.latitude) || 0,
              lng: Number(restaurant.location?.longitude) || 0,
            },
            menu: sortedMenus.length > 0
              ? {
                  title: { en: sortedMenus[0].item_name || "", es: sortedMenus[0].item_name ||"" },
                  description: { en: sortedMenus[0].description || "", es: sortedMenus[0].description ||"" },
                  image: sortedMenus[0]?.image_url || "",
                  items: sortedMenus[0]?.item_list,
                  updated_at:sortedMenus[0]?.updated_at
                }
              : { title: { en: "", es: "" }, description: { en: "", es: "" }, image: "" },
          };
        });

        setRestaurants(formattedRestaurants);

      })
      .catch((err) => {console.error("Error fetching restaurants:", err);setLoading(false)});
      
  }, []);

  // useEffect(() => {
  //   if (!restaurants.length) return;

  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const userPos = {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude,
  //         };
  //         setUserLocation(userPos);

  //         // Calculate distance for each restaurant
  //         const withDistance = restaurants.map((restaurant) => ({
  //           ...restaurant,
  //           distance: calculateDistance(userPos.lat, userPos.lng, restaurant.coordinates.lat, restaurant.coordinates.lng),
  //         }));

  //         // Sort by distance
  //         withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  //         setRestaurantsWithDistance(withDistance);
  //         console.log(withDistance)
  //         setFilteredRestaurants(withDistance);
  //         setLoading(false);
       
  //       },
  //       (error) => {
  //         console.error("Error getting location:", error);
  //         setLoading(false)
  //       }
  //     );
  //   }
  // }, [restaurants]);

  useEffect(() => {
    if (!restaurants.length) return;
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
  
          const today = new Date().toISOString().split("T")[0]; // e.g. "2025-03-19"
  
          const withDistance = restaurants.map((restaurant) => {
            const distance = calculateDistance(
              userPos.lat,
              userPos.lng,
              restaurant.coordinates.lat,
              restaurant.coordinates.lng
            );
            // Get latest updated_at from menus
            const latestUpdate = restaurant.menu?.updated_at || "";
  
            // If using multiple menus:
            // const latestUpdate = restaurant.menus?.[0]?.updated_at || "";
  
            const updatedDate = latestUpdate?.split(" ")[0]; // "2025-03-19"
            

            const updatedToday = updatedDate === today;
            return { ...restaurant, distance, updatedToday };
          });
  
          // Sort: updatedToday first, then by distance
          withDistance.sort((a, b) => {
            if (a.updatedToday && !b.updatedToday) return -1;
            if (!a.updatedToday && b.updatedToday) return 1;
            return (a.distance || 0) - (b.distance || 0);
          });
          setRestaurantsWithDistance(withDistance);
          setFilteredRestaurants(withDistance);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  }, [restaurants]);
  

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }
  useEffect(() => {
    const term = searchTerm?.toLowerCase();
  
    const results = restaurantsWithDistance?.filter((restaurant) => {
      if (!term) return true; // Show all if search is empty
  
      switch (filterBy) {
        case "restaurant":
          return restaurant?.name?.toLowerCase().includes(term);
  
        case "location":
          return restaurant?.location?.toLowerCase().includes(term);
  
        case "menu":
          return restaurant?.menu?.title?.en?.toLowerCase().includes(term);
        case "items":
          return restaurant?.menu?.items?.toLowerCase().includes(term);
  
        case "all":
        default:
          return (
            restaurant?.name?.toLowerCase().includes(term) ||
            restaurant?.location?.toLowerCase().includes(term) ||
            restaurant?.menu?.title?.en?.toLowerCase().includes(term) ||
            restaurant?.menu?.items?.toLowerCase().includes(term)
          );
      }
    });
  
    setFilteredRestaurants(results);
  }, [searchTerm, restaurantsWithDistance, filterBy]);
  

  return (
    <div className="pb-5">
      <HeroSlideshow />
      <div className="container my-3">
  <div className="row g-2 align-items-center">
    {/* Search Input */}
    <div className="col-12 col-md-9">
      <input
        type="text"
        placeholder={
          language === "es"
            ? "Buscar restaurantes, cocina o ubicación"
            : "Search restaurants, cuisine, or location"
        }
        className="form-control"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Filter Dropdown */}
    <div className="col-12 col-md-3">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="form-control d-flex justify-content-between align-items-center">
            {filterBy === "all" ? "All" : filterBy}
            <ChevronDown className="ms-2" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white border rounded p-2 shadow min-w-[160px] z-50"
            sideOffset={4}
          >
            {["all", "restaurant", "location", "menu", "items"].map((option) => (
              <DropdownMenu.Item
                key={option}
                className="px-2 py-1 text-sm cursor-pointer hover:bg-light rounded"
                onClick={() => setFilterBy(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  </div>
</div>




      <div className="text-center mt-4">
      {loading ?
        // <div className="position-absolute top-50 start-50 translate-middle">
        // <Lottie animationData={hotFoodAnimation} loop={true} className="w-32 h-32 mx-auto" />
        // </div>
        <div className="position-absolute top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading map...</span>
         </div>
        </div>

        :
        <>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant?.id} restaurant={restaurant} distance={restaurant?.distance} />
          ))
        ) : (
          <p className="text-center text-gray-500">No restaurants found.</p>
        )}
        </>
      }
      </div> 
    </div>
  )
}

