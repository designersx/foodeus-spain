"use client";

import { useEffect, useState, useRef  } from "react";
import { useLanguage } from "@/context/language-context";
import { RestaurantCard } from "@/components/restaurant-card";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { Input } from "@/components/ui/input"; // Radix UI Input
import { Search } from "lucide-react";
import { getRestaurantsWithMenus } from "@/services/apiService";
import Lottie from "lottie-react";
import hotFoodAnimation from "@/components/ui/hot-food.json";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";

interface Menu {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items?: string;
  updated_at?: any
  menu_id?: string|number;
  menu_type?: any;
}

interface Restaurant {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  menu: Menu;
  distance?: number;
  rating?: string | number;  // 👈 add or confirm this field
  ratings?: string | number;
  updatedToday?: boolean;
}

// Function to calculate distance
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2?: number,
  lng2?: number
) => {
  if (!lat2 || !lng2) return Number.MAX_VALUE; // If coordinates are missing, set a large distance
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export function ListView() {
  const { t, language } = useLanguage();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [restaurantsWithDistance, setRestaurantsWithDistance] = useState<
    Restaurant[]
  >([]);
  // const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filterBy, setFilterBy] = useState("all");

  const { restaurants, setRestaurants, hasFetched, setHasFetched } = useRestaurantStore(); // Use zustand store
  const [visibleCount, setVisibleCount] = useState(20);
  useEffect(() => {
    if (!hasFetched || restaurants.length == 0) {
    getRestaurantsWithMenus()
      .then((data) => {
        console.log("API Response:", data);
        if (!Array.isArray(data.data)) {
          console.error("API response is not an array:", data);
          return;
        }

        const formattedRestaurants: Restaurant[] = data.data.map(
          (restaurant: any) => {
            // Ensure menus exist before sorting
            const sortedMenus = restaurant.menus
            ? [...restaurant.menus].sort((a, b) => {
                const today = new Date().toDateString(); // Strip time

                const isATodaySpecial =
                  a.menu_type === "Today's Special" &&
                  new Date(a.updated_at).toDateString() === today;

                const isBTodaySpecial =
                  b.menu_type === "Today's Special" &&
                  new Date(b.updated_at).toDateString() === today;

                if (isATodaySpecial && !isBTodaySpecial) return -1;
                if (!isATodaySpecial && isBTodaySpecial) return 1;

                // Otherwise, sort by updated_at descending
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
              })
            : [];

            return {
              id: restaurant.restaurant_id?.toString() || "",
              name: restaurant.name || "",
              location: restaurant.address || "",
              coordinates: {
                lat: Number(restaurant.location?.latitude) || 0,
                lng: Number(restaurant.location?.longitude) || 0,
              },
              rating: restaurant.ratings?.toString() || "",
              category: restaurant.category,
              menu:
                sortedMenus.length > 0
                  ? {
                      title: {
                        en: sortedMenus[0].item_name || "",
                        es: sortedMenus[0].item_name || "",
                      },
                      description: {
                        en: sortedMenus[0].description || "",
                        es: sortedMenus[0].description || "",
                      },
                      image: sortedMenus[0]?.image_url || "",
                      items: sortedMenus[0]?.item_list,
                      updated_at: sortedMenus[0]?.updated_at,
                      menu_type: sortedMenus[0]?.menu_type,
                      menu_id: sortedMenus[0]?.menu_id,
                    }
                  : {
                      title: { en: "", es: "" },
                      description: { en: "", es: "" },
                      image: "",
                    },
            };
          }
        );
        // console.log("formattedRestaurants", formattedRestaurants);
        setRestaurants(formattedRestaurants);
        setHasFetched(true); 
      })
      .catch((err) => {
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      });
    }
  }, [hasFetched, setRestaurants, setHasFetched]);

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

//         const today = new Date().toISOString().split("T")[0];

//         const withDistance = restaurants.map((restaurant) => {
//           const distance = calculateDistance(
//             userPos.lat,
//             userPos.lng,
//             restaurant.coordinates.lat,
//             restaurant.coordinates.lng
//           );

//           const latestUpdate = restaurant.menu?.updated_at || "";
//           const updatedDate = latestUpdate?.split(" ")[0];

//           const updatedToday =
//             updatedDate === today &&restaurant?.menu?.menu_type === "Today's Special";

//           return {
//             ...restaurant,
//             distance,
//             updatedToday,
//             rating: restaurant.rating || 3,
//           };
//         });

//         // Sort: today's special updated today first, then by distance
//         withDistance.sort((a, b) => {
//           if (a.updatedToday && !b.updatedToday) return -1;
//           if (!a.updatedToday && b.updatedToday) return 1;
//           return (a.distance || 0) - (b.distance || 0);
//         });

//         setRestaurantsWithDistance(withDistance);
//         setFilteredRestaurants(withDistance);
//         setLoading(false);
//       },
//       (error) => {
//         console.error("Error getting location:", error);
//         setLoading(false);
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

        const today = new Date().toISOString().split("T")[0];

        const withDistance = restaurants.map((restaurant) => {
          const hasMenu = !!restaurant.menu?.updated_at;
          const latestUpdate = restaurant.menu?.updated_at || "";
          const updatedDate = latestUpdate?.split(" ")[0];

          const updatedToday =
            updatedDate === today && restaurant?.menu?.menu_type === "Today's Special";

          return {
            ...restaurant,
            distance: calculateDistance(
              userPos.lat,
              userPos.lng,
              restaurant.coordinates.lat,
              restaurant.coordinates.lng
            ),
            updatedToday,
            hasMenu,
            rating: restaurant.rating || 3,
          };
        });

        // Sort: 1) updatedToday=true 2) hasMenu=true 3) by distance
        withDistance.sort((a, b) => {
          if (a.updatedToday && !b.updatedToday) return -1;
          if (!a.updatedToday && b.updatedToday) return 1;

          if (a.hasMenu && !b.hasMenu) return -1;
          if (!a.hasMenu && b.hasMenu) return 1;

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
    return deg * (Math.PI / 180);
  };
  useEffect(() => {
    const term = searchTerm?.toLowerCase();

    const results = restaurantsWithDistance?.filter((restaurant) => {
      if (!term) return true;

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

// serachbar go on top
const searchRef = useRef(null);
const [isSticky, setIsSticky] = useState(false);
const [lastScrollY, setLastScrollY] = useState(0);
const [focused, setFocused] = useState(false);

// Scroll to top with offset on focus
const handleFocus = () => {
  const element = searchRef.current;
  const offset = 10;

  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  setFocused(true);
};

const handleBlur = () => {
  setFocused(false);
  setIsSticky(false);
};

// Scroll direction detection
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (focused) {
      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsSticky(true);
      } else {
        // Scrolling down
        setIsSticky(false);
      }
    }

    setLastScrollY(currentScrollY);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollY, focused]);

useEffect(() => {
  const handleScroll = () => {
    const scrollThreshold = 300; // px from bottom

    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - scrollThreshold
    ) {
      // Load 10 more restaurants
      setVisibleCount((prev) => Math.min(prev + 10, filteredRestaurants.length));
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [filteredRestaurants.length]);

    return (
    <div className="pb-5">
      <HeroSlideshow />
      <div className=" SearchFixed container my-3">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-9">
          <input
              ref={searchRef}
              type="text"
              placeholder={
                language === "es"
                  ? "Buscar restaurantes, cocina o ubicación"
                  : "Search restaurants, cuisine, or location"
              }
              className={`form-control w-full p-3 border rounded-md transition-all duration-300 ${
                isSticky ? 'sticky top-0 z-50 bg-white shadow-md' : ''
              }`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        {loading ? (
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading map...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredRestaurants.length > 0 ? (
             filteredRestaurants?.slice(0, visibleCount).map((restaurant) => (
              // filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant?.id}
                  restaurant={restaurant}
                  distance={restaurant?.distance}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No restaurants found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
