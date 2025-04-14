"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/language-context";
import { RestaurantCard } from "@/components/restaurant-card";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { Input } from "@/components/ui/input"; // Radix UI Input
import { Search } from "lucide-react";
import { apiClient, getRestaurantsWithMenus } from "@/services/apiService";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { boolean } from "yup";
import RegisterPromptModal from "./RegisterPromptModal";
import { useRouter } from 'next/navigation';

interface Menu {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items?: string;
  updated_at?: any
  menu_id?: string | number;
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
  const [locationError, setLocationError] = useState<string>("");
  const { restaurants, setRestaurants, hasFetched, setHasFetched } = useRestaurantStore(); // Use zustand store
  const [visibleCount, setVisibleCount] = useState(5);
  const [userLocationFromStorage, setUserLocationFromStorage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState<string>("")
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== "undefined") {
      const locationVar = localStorage.getItem("userLocation") || "{}";
      const userLocation = JSON.parse(locationVar);
      setUserLocationFromStorage(userLocation);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(userPos);

          localStorage.setItem("userLocation", JSON.stringify(userPos));

          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);

          if (error.code === error.PERMISSION_DENIED) {
            setLocationError(
              "Location access was denied. Please enable it in your browser settings."
            );
          } else {
            setLocationError("Unable to access your location.");
          }

          setLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
    }

    return () => {
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurantsWithMenus();
        // console.log("API Response:", data);
        if (!Array.isArray(data.data)) {
          console.error("API response is not an array:", data);
          return;
        }

        const formattedRestaurants: Restaurant[] = data.data.map((restaurant: any) => {
          const sortedMenus = restaurant.menus
            ? [...restaurant.menus].sort((a, b) => {
              const today = new Date().toDateString();

              const isATodaySpecial =
                a.menu_type === "Today's Special" &&
                new Date(a.updated_at).toDateString() === today;

              const isBTodaySpecial =
                b.menu_type === "Today's Special" &&
                new Date(b.updated_at).toDateString() === today;

              if (isATodaySpecial && !isBTodaySpecial) return -1;
              if (!isATodaySpecial && isBTodaySpecial) return 1;

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
        });

        setRestaurants(formattedRestaurants);
        setHasFetched(true);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    // Only run the fetch once when data is not fetched
    if (!hasFetched) {
      fetchRestaurants();
    }

  }, [hasFetched]);

  useEffect(() => {
    if (!restaurants.length) return;
    if (userLocationFromStorage) {
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
            userLocationFromStorage?.lat,
            userLocationFromStorage?.lng,
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
    }
  }, [restaurants, userLocation]);

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    const term = searchTerm?.toLowerCase();
    if (!term) {
      console.log("No search term, showing all restaurants.");
      setFilteredRestaurants(restaurantsWithDistance);
      return;
    }

    const results = restaurantsWithDistance?.filter((restaurant) => {
      if (!term) return true;

      return (
        restaurant?.name?.toLowerCase().includes(term) ||
        restaurant?.location?.toLowerCase().includes(term) ||
        restaurant?.menu?.title?.en?.toLowerCase().includes(term) ||
        restaurant?.menu?.items?.toLowerCase().includes(term)
      );
    });

    setFilteredRestaurants(results);
  }, [searchTerm, restaurantsWithDistance, filterBy]);

  const handleRestaurantClick = (restaurant) => {

    const isLoginUser = localStorage.getItem("isLoggedIn");
    console.log(isLoginUser)
    if (isLoginUser === "true") {
      router.push(`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`);
    } else {
      setShowRegisterModal(true);
    }
  };

  const handleRegister = async (data: { name: string; email: string }) => {
    const { name, email } = data;
    console.log("Registered with Name:", name, "and Email:", email);

    try {
      const response = await apiClient.post('/mobileUsers/createMobileUser', { name, email });
      if (response.status === 200) {
        console.log("User registered successfully", response.data);
      }
    } catch (error) {
      console.error("Error registering user", error);
    }
  };
  useEffect(() => {
    console.log("LoggedIn status changed:", isLoggedIn);
  }, [isLoggedIn]);
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (focused) {
        if (currentScrollY < lastScrollY) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, focused]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollThreshold = 300; // px from bottom

  //     if (
  //       window.innerHeight + window.scrollY >=
  //       document.body.offsetHeight - scrollThreshold
  //     ) {
  //       // Load 10 more restaurants
  //       setVisibleCount((prev) => Math.min(prev + 10, filteredRestaurants.length));
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [filteredRestaurants.length]);

  const retryGeolocation = () => {
    setLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        // re-run your restaurant logic here...
        setLoading(false);
      },
      (error) => {
        console.error("Retry location error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location access is still denied. Please enable it in your browser settings.");
        } else {
          setLocationError("Unable to access your location.");
        }

        setLoading(false);
      }
    );
  };

  if (loading) {
    return (
      <div
        className="position-absolute top-50 start-50 translate-middle"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
              className={`form-control w-full p-3 border rounded-md transition-all duration-300 ${isSticky ? 'sticky top-0 z-50 bg-white shadow-md' : ''
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
        {loading ?
          (
            <div
              className="position-absolute top-50 start-50 translate-middle"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )
          : (
            userLocation && !locationError && filteredRestaurants.length > 0 ? (
              // filteredRestaurants?.slice(0, visibleCount).map((restaurant) => (
              filteredRestaurants.map((restaurant, index) => (
                <div key={index} onClick={() => handleRestaurantClick(restaurant)} >
                  <RestaurantCard
                    key={restaurant?.id}
                    restaurant={restaurant}
                    distance={restaurant?.distance}

                  />
                </div>

              ))
            ) : (
              userLocation && locationError && <p className="text-center text-gray-500">No restaurants found.</p>
            )
          )}


      </div>

      {locationError && (
        <div className="alert alert-warning mt-3">
          {locationError} <br />
          <small className="text-muted">
            You can click the lock icon in your browser’s address bar to enable location access manually.
          </small>
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-primary" onClick={retryGeolocation}>
              Try Again
            </button>
          </div>
        </div>
      )}
      {!isLoggedIn && (
        <RegisterPromptModal
          show={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}
