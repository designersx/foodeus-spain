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
  useEffect(() => {
    // fetch("http://localhost:8081/enduser/getRestaurantsWithMenus", {
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
                }
              : { title: { en: "", es: "" }, description: { en: "", es: "" }, image: "" },
          };
        });

        setRestaurants(formattedRestaurants);

      })
      .catch((err) => {console.error("Error fetching restaurants:", err);setLoading(false)});
      
  }, []);

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

          // Calculate distance for each restaurant
          const withDistance = restaurants.map((restaurant) => ({
            ...restaurant,
            distance: calculateDistance(userPos.lat, userPos.lng, restaurant.coordinates.lat, restaurant.coordinates.lng),
          }));

          // Sort by distance
          withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          setRestaurantsWithDistance(withDistance);
          console.log(withDistance)
          setFilteredRestaurants(withDistance);
          setLoading(false);
       
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false)
        }
      );
    }
  }, [restaurants]);


  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }
  useEffect(() => {
    const results = restaurantsWithDistance?.filter((restaurant) =>
      restaurant?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())||
      restaurant?.location?.toLowerCase()?.includes(searchTerm?.toLowerCase())||
      restaurant?.menu?.title?.en?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
    setFilteredRestaurants(results);
  }, [searchTerm, restaurantsWithDistance]);

  return (
    <div className="pb-5">
      <HeroSlideshow />
      <div className="mt-4 mb-3">
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

