"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/language-context";
import { RestaurantCard } from "@/components/restaurant-card";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { Input } from "@/components/ui/input"; // Radix UI Input
import { Search } from "lucide-react";
import { getRestaurantsWithMenus } from "@/services/apiService";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import Link from "next/link"
import { usePathname } from "next/navigation"


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
      }finally{
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
  }, [restaurants,userLocation]);


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
const pathname = usePathname()
  return (

    <div className="pb-5">
      {/* <HeroSlideshow /> */}
      <div className=" SearchFixed container my-3">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-9 col-md-9">
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
          <div className="col-3 col-md-3">
            <Link
              href="/map"

              className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/map" ? "text-primary" : "text-secondary"
                }`}
            >
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.70718 0.903421L9.70712 0.902994L9.69806 0.905051C9.67349 0.910629 9.64951 0.918506 9.62642 0.928574L1.1647 3.95734L1.1647 3.95734L1.16395 3.95761C1.08661 3.98599 1.01986 4.03745 0.972673 4.10501C0.925489 4.17257 0.900134 4.25298 0.9 4.33539V4.33555L0.9 20.6975L0.9 20.6976C0.90011 20.7624 0.915795 20.8262 0.945736 20.8836C0.975678 20.941 1.019 20.9903 1.07205 21.0274C1.1251 21.0645 1.18631 21.0883 1.25049 21.0966C1.31451 21.105 1.37959 21.0977 1.44023 21.0756C1.44038 21.0755 1.44053 21.0755 1.44068 21.0754L9.76744 18.0956L18.0942 21.0754C18.0944 21.0755 18.0945 21.0755 18.0947 21.0756C18.1837 21.1081 18.2814 21.1081 18.3704 21.0756C18.3706 21.0755 18.3708 21.0755 18.3709 21.0754L26.8353 18.0457L26.836 18.0454C26.9134 18.0171 26.9801 17.9656 27.0273 17.898C27.0745 17.8305 27.0999 17.7501 27.1 17.6677V17.6675V1.30557V1.3054C27.0999 1.24065 27.0842 1.17687 27.0543 1.11946C27.0243 1.06205 26.981 1.0127 26.928 0.975609C26.8749 0.938515 26.8137 0.914775 26.7495 0.906418C26.6855 0.898078 26.6204 0.905306 26.5597 0.927482C26.5596 0.927528 26.5594 0.927574 26.5593 0.92762L18.2326 3.90741L9.90663 0.927916C9.8433 0.902991 9.77468 0.894556 9.70718 0.903421ZM1.70465 4.6143L9.36512 1.87364V17.3888L1.70465 20.1294V4.6143ZM10.1698 17.3794V1.8738L17.8302 4.62368V20.1292L10.1698 17.3794ZM18.6349 4.6143L26.2953 1.87364V17.3887L18.6349 20.1294V4.6143Z" fill="#95757D" stroke="#95757D" strokeWidth="0.2" />
              </svg>


              <span className="small">{t("mapView")}</span>
            </Link>
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
                filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant?.id}
                  restaurant={restaurant}
                  distance={restaurant?.distance}
                />
              ))
            ) : (
              userLocation && locationError  && <p className="text-center text-gray-500">No restaurants found.</p>
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
    </div>
  );
}
