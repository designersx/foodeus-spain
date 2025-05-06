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
import Link from "next/link";

import { boolean } from "yup";
import RegisterPromptModal from "./register-popup-modal";
import { useRouter } from "next/navigation";
import PopUp from "./ui/custom-toast";
import { usePathname } from "next/navigation";
interface Menu {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items?: [];
  updated_at?: any;
  menu_id?: string | number;
  menu_type?: any;
  price?: string | number;
}
interface Restaurant {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  menu: Menu;
  distance?: number;
  rating?: string | number; // 👈 add or confirm this field
  ratings?: string | number;
  updatedToday?: boolean;
}
interface RegisterUserDetails {
  name: string;
  email: string;
  status: boolean;
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

// calcuate distance with openstreet api accurate calcuate distance
// const calculateDistance = async (lat1, lng1, lat2, lng2) => {
//   if (!lat2 || !lng2) return Number.MAX_VALUE; // If coordinates are missing, set a large distance
  
//   const url = `http://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;

//   // Return the fetch Promise that resolves with distance in km
//   return fetch(url)
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.routes && data.routes.length > 0) {
//         const distance = data.routes[0].legs[0].distance; // Distance in meters
//         return distance / 1000; // Convert to kilometers
//       }
//       return Number.MAX_VALUE; // Return a large value if no route is found
//     })
//     .catch((error) => {
//       console.error('Error calculating distance:', error);
//       return Number.MAX_VALUE; // Return a large value in case of error
//     });
// };
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
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState("all");
  const [locationError, setLocationError] = useState<string>("");
  const { restaurants, setRestaurants, hasFetched, setHasFetched } =
    useRestaurantStore(); // Use zustand store
  const [visibleCount, setVisibleCount] = useState(5);
  const [userLocationFromStorage, setUserLocationFromStorage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState<string>("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [selectedMenu, setSelectedMenu] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== "undefined") {
      const locationVar = localStorage.getItem("userLocation") || "{}";
      const userLocation2 = JSON.parse(locationVar);
      setUserLocationFromStorage(userLocation2);
    }
    setRestaurantsWithDistance(restaurants);
    setFilteredRestaurants(restaurants);
  }, []);


  // Utility to format date to just yyyy-mm-dd
  const formatDate = (date: Date) => date.toISOString().split("T")[0];


  useEffect(() => {
    const getLocationAsync = async () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser.");
        return;
      }
  
      setLoadingLocation(true);
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
  
          setUserLocation(userPos);
          localStorage.setItem("userLocation", JSON.stringify(userPos));
          setLoadingLocation(false);
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
          setLoadingLocation(false);
        }
      );
    };
  
    // Call asynchronously but not blocking main thread
    setTimeout(() => {
      getLocationAsync();
    }, 0); // 0ms delay ensures it's async but immediate
  
    return () => {
      setLoadingLocation(false);
    };
  }, []);  


  useEffect(() => {
    const fetchAndProcessRestaurants = async () => {
      setLoading(true);
      try {
        const data = await getRestaurantsWithMenus();
  
        if (!Array.isArray(data.data)) {
          console.error("API response is not an array:", data);
          return;
        }
        // console.log(data.data) 
        const today = new Date();
        const formattedToday = formatDate(today);
  
        const todaySpecialRestaurants: Restaurant[] = [];
  
        data?.data?.forEach((restaurant: any) => {
          if (restaurant.menus.some((menu: any) => menu?.items?.length === 0)) {
            return;
          }
  
          const allMenus = restaurant.menus || [];
          const sortedMenus = allMenus.sort((a, b) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return dateB - dateA;
          });
  
          if (sortedMenus.length > 0) {
            const latestMenu = sortedMenus[0];
  
            todaySpecialRestaurants.push({
              id: restaurant.restaurant_id?.toString() || "",
              name: restaurant.name || "",
              location: restaurant.address || "",
              coordinates: {
                lat: Number(restaurant.location?.latitude) || 0,
                lng: Number(restaurant.location?.longitude) || 0,
              },
              rating: restaurant.ratings?.toString() || "",
              category: restaurant.category,
              menu: {
                title: {
                  en: latestMenu.item_name || "",
                  es: latestMenu.item_name || "",
                },
                description: {
                  en: latestMenu.description || "",
                  es: latestMenu.description || "",
                },
                image: latestMenu.image_url || "",
                items: latestMenu.items,
                updated_at: latestMenu.updated_at,
                menu_type: latestMenu.menu_type,
                menu_id: latestMenu.menu_id,
                price: latestMenu.price,
              },
            });
          }
        });
  
        // If location is available, calculate distances
        const hasLocation = userLocation || userLocationFromStorage;
        let withDistance = todaySpecialRestaurants;
        if (hasLocation) {
          const userLat = userLocationFromStorage?.lat || userLocation?.lat;
          const userLng = userLocationFromStorage?.lng || userLocation?.lng;
  
          withDistance = todaySpecialRestaurants.map((restaurant) => {
            const updatedAt = restaurant.menu?.updated_at || "";
            const updatedDate = updatedAt.split("T")[0].split(" ")[0];
            const updatedToday = updatedDate === formattedToday;
  
            return {
              ...restaurant,
              distance: calculateDistance(
                userLat,
                userLng,
                restaurant.coordinates.lat,
                restaurant.coordinates.lng
              ),
              updatedToday,
              rating: restaurant.rating || 3,
            };
          });
  
          const todayUpdated = withDistance
            .filter((r) => r.updatedToday)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  
          const olderUpdates = withDistance
            .filter((r) => !r.updatedToday)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  
          withDistance = [...todayUpdated, ...olderUpdates];
        }
        // console.log("Fetched restaurants:", withDistance);
        setRestaurants(withDistance); // final list with distance & updatedToday
        setRestaurantsWithDistance(withDistance);
        setFilteredRestaurants(withDistance);
        setHasFetched(true);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };
    if (!hasFetched && userLocationFromStorage) {
      fetchAndProcessRestaurants();
    }
  }, [hasFetched, userLocation, userLocationFromStorage]);
  
  // // useEffect with accurate calculate distance 
  // useEffect(() => {
  //   const fetchAndProcessRestaurants = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await getRestaurantsWithMenus();
  //       const todaySpecialRestaurants = [];

  //       data?.data?.forEach((restaurant) => {
  //         if (restaurant.menus.some((menu) => menu?.items?.length === 0)) {
  //           return;
  //         }
  //         const allMenus = restaurant.menus || [];
  //         const sortedMenus = allMenus.sort((a, b) => {
  //           const dateA = new Date(a.updated_at).getTime();
  //           const dateB = new Date(b.updated_at).getTime();
  //           return dateB - dateA;
  //         });

  //         if (sortedMenus.length > 0) {
  //           const latestMenu = sortedMenus[0];

  //           todaySpecialRestaurants.push({
  //             id: restaurant.restaurant_id?.toString() || "",
  //             name: restaurant.name || "",
  //             location: restaurant.address || "",
  //             coordinates: {
  //               lat: Number(restaurant.location?.latitude) || 0,
  //               lng: Number(restaurant.location?.longitude) || 0,
  //             },
  //             rating: restaurant.ratings?.toString() || "",
  //             category: restaurant.category,
  //             menu: {
  //               title: { en: latestMenu.item_name || "", es: latestMenu.item_name || "" },
  //               description: { en: latestMenu.description || "", es: latestMenu.description || "" },
  //               image: latestMenu.image_url || "",
  //               items: latestMenu.items,
  //               updated_at: latestMenu.updated_at,
  //               menu_type: latestMenu.menu_type,
  //               menu_id: latestMenu.menu_id,
  //               price: latestMenu.price,
  //             },
  //           });
  //         }
  //       });

  //       const hasLocation = userLocation || userLocationFromStorage;
  //       let withDistance = todaySpecialRestaurants;

  //       if (hasLocation) {
  //         const userLat = userLocationFromStorage?.lat || userLocation?.lat;
  //         const userLng = userLocationFromStorage?.lng || userLocation?.lng;

  //         // Use Promise.all to fetch distances concurrently
  //         const restaurantsWithDistances = await Promise.all(
  //           todaySpecialRestaurants.map(async (restaurant) => {
  //             const calculatedDistance = await calculateDistance(
  //               userLat,
  //               userLng,
  //               restaurant.coordinates.lat,
  //               restaurant.coordinates.lng
  //             );
  //             return {
  //               ...restaurant,
  //               distance: calculatedDistance,
  //             };
  //           })
  //         );

  //         // Update the state with restaurants sorted by distance
  //         withDistance = restaurantsWithDistances.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  //       }

  //       setRestaurants(withDistance); // final list with distance
  //       setRestaurantsWithDistance(withDistance);
  //       setFilteredRestaurants(withDistance);
  //       setHasFetched(true);
  //     } catch (err) {
  //       console.error("Error fetching restaurants:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (!hasFetched && userLocationFromStorage) {
  //     fetchAndProcessRestaurants();
  //   }
  // }, [hasFetched, userLocation, userLocationFromStorage]);

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    const term = searchTerm?.toLowerCase();
    if (!term) {
      // console.log("No search term, showing all restaurants.");
      setFilteredRestaurants(restaurantsWithDistance);
      return;
    }

    const results = restaurantsWithDistance?.filter((restaurant) => {
      if (!term) return true;

      // Check if restaurant name or location matches
      const isRestaurantMatch =
        restaurant?.name?.toLowerCase().includes(term) ||
        restaurant?.location?.toLowerCase().includes(term);

      // Check if the menu title matches
      const isMenuMatch = restaurant?.menu?.title?.en
        ?.toLowerCase()
        .includes(term);

      // Check if any item_name in the items array matches
      const isItemMatch = restaurant?.menu?.items?.some((item) =>
        item.item_name?.toLowerCase().includes(term)
      );

      const isCuisineMatch=restaurant?.category?.toLowerCase().includes(term)

      return isRestaurantMatch || isMenuMatch || isItemMatch||isCuisineMatch;
    });

    setFilteredRestaurants(results);
  }, [searchTerm, restaurantsWithDistance, filterBy]);

  const handleMenuClick = (menuType: any) => {
    if (selectedMenu === menuType) {
      // If the same menu type is clicked, remove the filter and show all items
      setSelectedMenu(""); // Clear the selected menu
      setFilteredRestaurants(restaurantsWithDistance); // Show all items again
    } else {
      // If a new menu type is selected, filter the data
      setSelectedMenu(menuType);
      const filteredItems = restaurantsWithDistance.filter((restaurant) => {
        const isItemTypeMatch = restaurant?.menu?.items?.some((item) =>
          item?.item_type?.includes(menuType)
        );
        return isItemTypeMatch;
      });
      setFilteredRestaurants(filteredItems);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    const isLoginUser = localStorage.getItem("isLoggedIn");
    if (isLoginUser === "true") {
      router.push(`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`);
    } else {
      setShowRegisterModal(true);
    }
  };
  //handle register
  const handleRegister = async (data: { name: string; email: string }) => {
    const { name, email } = data;
    const userDetails: RegisterUserDetails = {
      name: name,
      email: email,
      status: true,
    };
    try {
      const response = await apiClient.post(
        "/mobileUsers/createMobileUser",
        userDetails
      );
      if (response) {
        setToast({
          show: true,
          message: "OTP sent successfully",
          type: "success",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error registering user", error.response);
      setToast({
        show: true,
        message: error.response.data.message,
        type: "error",
      });
      return false;
    }
  };
  //handle close
  const handleClose = () => {
    setShowRegisterModal(false);
  };
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
      window.scrollTo({ top: y, behavior: "smooth" });
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, focused]);

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
          setLocationError(
            language === "en"
                ? "Location access was denied. Please enable it in your browser settings."
                : "El acceso a la ubicación fue denegado. Por favor, habilítelo en la configuración de su navegador."
          );
        } else {
          setLocationError(language === "en"
            ? "Unable to access your location."
            : "No se puede acceder a su ubicación.");
        }

        setLoading(false);
      },{ timeout: 10000 }
    );
  };

if (
  loadingLocation &&
  (
    userLocationFromStorage == null || 
    Object.keys(userLocationFromStorage).length === 0
  )
) { 
  console.log("Loading location............................");
    return (
      <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('Loading')}</span>
            </div>
          </div>
    );
  }

  const pathname = usePathname();
  return (
    <div className="pb-5">
      {/* <HeroSlideshow /> */}
      <div className=" SearchFixed container my-1">
        <div className=" SearchBox  g-4 align-items-center">
          {/* Search Input */}
          <div className=" MenuType">
            <div className="MeneSequence">
              <span
                className={`Starter ${selectedMenu === "Starter" ? "selected" : ""
                  }`}
                style={{ backgroundColor: "#EEE7D0" }}
                onClick={() => handleMenuClick("Starter")}
              >
                {t("Starter")}
              </span>
              <span
                className={`Main Dish ${selectedMenu === "MainDish" ? "selected" : ""
                  }`}
                style={{ backgroundColor: "#D7EED0" }}
                onClick={() => handleMenuClick("MainDish")}
              >
                {t("MainDish")}
              </span>
              <span
                className={`Desert ${selectedMenu === "Dessert" ? "selected" : ""
                  }`}
                style={{ backgroundColor: "#D0E1EE" }}
                onClick={() => handleMenuClick("Dessert")}
              >
                {t("Dessert")}
              </span>
              <span
                className={`Drinks ${selectedMenu === "Drinks" ? "selected" : ""
                  }`}
                style={{ backgroundColor: "#EED0D0" }}
                onClick={() => handleMenuClick("Drinks")}
              >
                {t("Drinks")}
              </span>
            </div>

            <div className="InputSearch">
              <input
                ref={searchRef}
                type="text"
                placeholder={
                  language === "es"
                    ? "Buscar restaurantes, cocina o ubicación"
                    : "Search restaurants, cuisine, or location"
                }
                className={`form-control w-full p-2 border rounded-md transition-all duration-300 ${isSticky ? "sticky top-0 z-50 bg-white shadow-md" : ""
                  }`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.8rem" }}
              />
            </div>
          </div>
          <div className="MapIcon">
            <Link
              href="/map"
              className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/map" ? "text-primary" : "text-secondary"
                }`}
            >
              <div className="svgControler">
                <svg
                  width="37"
                  height="37"
                  viewBox="0 0 37 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="18.2609"
                    cy="18.2609"
                    r="18.2609"
                    fill="#F1582E"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M26.1876 9.29969C24.2049 7.34128 21.5664 6.26172 18.763 6.26172C15.9587 6.26172 13.3213 7.34125 11.3373 9.29969C9.35464 11.2581 8.26172 13.8632 8.26172 16.6335C8.26172 19.4035 9.35461 22.0086 11.3373 23.9672C12.6436 25.2575 13.9543 26.5422 15.2653 27.8268C16.4036 28.9434 17.543 30.0588 18.6779 31.1788L18.7619 31.2617L18.8458 31.1788C19.9807 30.06 21.1179 28.9457 22.2561 27.8303C23.568 26.5445 24.88 25.2587 26.1873 23.9684C28.17 22.01 29.2617 19.4048 29.2617 16.6346C29.2617 13.8635 28.1702 11.2583 26.1876 9.29969ZM18.7618 21.6197C15.978 21.6197 13.7127 19.3833 13.7127 16.6323C13.7127 13.8825 15.9779 11.6449 18.7618 11.6449C21.5458 11.6449 23.811 13.8824 23.811 16.6323C23.811 19.3833 21.5458 21.6197 18.7618 21.6197Z"
                    fill="white"
                  />
                </svg>

                <div className="circles">
                  <div className="circle1"></div>
                  <div className="circle2"></div>
                  <div className="circle3"></div>
                </div>
              </div>

              <span className="small">{t("mapView")}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        {loading ? (
          <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : userLocationFromStorage && !locationError && filteredRestaurants?.length > 0 ? (
          filteredRestaurants.map((restaurant, index) => (
            <div key={index} onClick={() => handleRestaurantClick(restaurant)}>
              <RestaurantCard
                key={restaurant?.id}
                restaurant={restaurant}
                distance={restaurant?.distance}
              />
            </div>
          ))
        ) : (
          userLocationFromStorage &&
          locationError && (
            <p className="text-center text-gray-500">{language == 'en' ? "No restaurants found." : "No se encontraron restaurantes."}</p>
          )
        )}
      </div>

      {
        selectedMenu && !loading && filteredRestaurants?.length === 0 && (
          <div className="text-center mt-4">
            <p className="text-gray-500">
              {language === "en"
                ? "No restaurants found. Please try again later."
                : "No se encontraron restaurantes. Por favor, inténtelo de nuevo más tarde."}
            </p>
          </div>
        )
      }

      {locationError && (
        <div className="alert alert-warning mt-3">
          {locationError} <br />
          <small className="text-muted">
          {language === "en"
            ? "You can click the lock icon in your browser’s address bar to enable location access manually."
            : "Puede hacer clic en el ícono de candado en la barra de direcciones de su navegador para habilitar el acceso a la ubicación manualmente."}

          </small>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={retryGeolocation}
            >
                {language === "en" ? "Try Again" : "Intentar de nuevo"}
            </button>
          </div>
        </div>
      )}
      {!isLoggedIn && (
        <RegisterPromptModal
          show={showRegisterModal}
          onClose={handleClose}
          onRegister={handleRegister}
        // modalView={false}
        />
      )}
      {toast.show && (
        <PopUp
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
}

// "use client";

// import React,{ useEffect, useState, useRef, useMemo, useCallback } from "react";
// import { useLanguage } from "@/context/language-context";
// import { RestaurantCard } from "@/components/restaurant-card";
// import { HeroSlideshow } from "@/components/hero-slideshow";
// import { Input } from "@/components/ui/input";
// import { Search, ChevronDown } from "lucide-react";
// import { apiClient, getRestaurantsWithMenus } from "@/services/apiService";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { useRestaurantStore } from "@/store/restaurantStore";
// import Link from "next/link";
// import { useRouter, usePathname } from "next/navigation";
// import RegisterPromptModal from "./register-popup-modal";
// import PopUp from "./ui/custom-toast";
// import debounce from "lodash/debounce";

// // Interfaces (unchanged)
// interface Menu {
//   title: { en: string; es: string };
//   description: { en: string; es: string };
//   image: string;
//   items?: any[];
//   updated_at?: any;
//   menu_id?: string | number;
//   menu_type?: any;
//   price?: string | number;
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
//   hasMenu?: boolean;
//   updatedAt?: string;
// }

// interface RegisterUserDetails {
//   name: string;
//   email: string;
//   status: boolean;
// }

// // Distance calculation function (unchanged)
// const calculateDistance = (
//   lat1: number,
//   lng1: number,
//   lat2?: number,
//   lng2?: number
// ) => {
//   if (!lat2 || !lng2) return Number.MAX_VALUE;
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//     Math.cos((lat2 * Math.PI) / 180) *
//     Math.sin(dLng / 2) *
//     Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// // Memoized RestaurantCard
// const MemoizedRestaurantCard = React.memo(RestaurantCard);

// export function ListView() {
//   const { t, language } = useLanguage();
//   const {
//     restaurants,
//     restaurantsWithDistance,
//     userLocation,
//     hasFetched,
//     setRestaurants,
//     setRestaurantsWithDistance,
//     setUserLocation,
//     setHasFetched,
//   } = useRestaurantStore();
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [locationError, setLocationError] = useState<string>("");
//   const [selectedMenu, setSelectedMenu] = useState<string>("");
//   const [showRegisterModal, setShowRegisterModal] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchRef = useRef<HTMLInputElement>(null);
//   const [isSticky, setIsSticky] = useState(false);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const [focused, setFocused] = useState(false);

//   // Debounced search handler
//   const debouncedSearch = useCallback(
//     debounce((term: string) => {
//       setSearchTerm(term);
//     }, 300),
//     []
//   );

//   // Async geolocation fetch
//   const fetchGeolocation = useCallback(async () => {
//     if (!navigator.geolocation) {
//       setLocationError("Geolocation is not supported by your browser.");
//       return;
//     }

//     try {
//       const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
//       });
//       const userPos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude,
//       };
//       setUserLocation(userPos);
//       localStorage.setItem("userLocation", JSON.stringify(userPos));
//     } catch (error: any) {
//       console.error("Geolocation error:", error);
//       if (error.code === error.PERMISSION_DENIED) {
//         setLocationError(
//           language === "en"
//             ? "Location access was denied. Please enable it in your browser settings."
//             : "El acceso a la ubicación fue denegado. Por favor, habilítelo en la configuración de su navegador."
//         );
//       } else {
//         setLocationError(
//           language === "en"
//             ? "Unable to access your location."
//             : "No se puede acceder a su ubicación."
//         );
//       }
//     }
//   }, [setUserLocation, language]);

//   // Fetch restaurants
//   const fetchRestaurants = useCallback(async () => {
//     if (hasFetched && restaurants.length > 0) return;
//     setLoading(true);
//     try {
//       const data = await getRestaurantsWithMenus();
//       if (!Array.isArray(data.data)) {
//         console.error("API response is not an array:", data);
//         return;
//       }

//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(today.getDate() - 1);
//       const formattedToday = today.toISOString().split("T")[0];
//       const formattedYesterday = yesterday.toISOString().split("T")[0];

//       const todaySpecialRestaurants: Restaurant[] = [];

//       data.data.forEach((restaurant: any) => {
//         if (restaurant.menus.some((menu: any) => menu?.items?.length === 0)) return;
//         const allMenus = restaurant.menus || [];
//         const sortedMenus = allMenus.sort(
//           (a: any, b: any) =>
//             new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
//         );

//         if (sortedMenus.length > 0) {
//           const latestMenu = sortedMenus[0];
//           todaySpecialRestaurants.push({
//             id: restaurant.restaurant_id?.toString() || "",
//             name: restaurant.name || "",
//             location: restaurant.address || "",
//             coordinates: {
//               lat: Number(restaurant.location?.latitude) || 0,
//               lng: Number(restaurant.location?.longitude) || 0,
//             },
//             rating: restaurant.ratings?.toString() || "3",
//             menu: {
//               title: {
//                 en: latestMenu.item_name || "",
//                 es: latestMenu.item_name || "",
//               },
//               description: {
//                 en: latestMenu.description || "",
//                 es: latestMenu.description || "",
//               },
//               image: latestMenu.image_url || "",
//               items: latestMenu.items,
//               updated_at: latestMenu.updated_at,
//               menu_type: latestMenu.menu_type,
//               menu_id: latestMenu.menu_id,
//               price: latestMenu.price,
//             },
//           });
//         }
//       });

//       setRestaurants(todaySpecialRestaurants);
//       setHasFetched(true);
//     } catch (err) {
//       console.error("Error fetching restaurants:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [hasFetched, setRestaurants, setHasFetched]);

//   // Calculate distances
//   useEffect(() => {
//     if (!restaurants.length || !userLocation) return;

//     const today = new Date().toISOString().split("T")[0];
//     const withDistance = restaurants.map((restaurant) => {
//       const hasMenu = !!restaurant.menu?.updated_at;
//       const updatedAt = restaurant.menu?.updated_at || "";
//       const updatedDate = updatedAt.split("T")[0].split(" ")[0];
//       const updatedToday = updatedDate === today;

//       return {
//         ...restaurant,
//         distance: calculateDistance(
//           userLocation.lat,
//           userLocation.lng,
//           restaurant.coordinates.lat,
//           restaurant.coordinates.lng
//         ),
//         updatedToday,
//         hasMenu,
//         updatedAt,
//         rating: restaurant.rating || "3",
//       };
//     });

//     const todayUpdated = withDistance
//       .filter((r) => r.updatedToday)
//       .sort((a, b) => (a.distance || 0) - (b.distance || 0));
//     const olderUpdates = withDistance
//       .filter((r) => !r.updatedToday)
//       .sort((a, b) => (a.distance || 0) - (b.distance || 0));

//     const sortedList = [...todayUpdated, ...olderUpdates];
//     setRestaurantsWithDistance(sortedList);
//   }, [restaurants, userLocation, setRestaurantsWithDistance]);

//   // Initialize geolocation and restaurants
//   useEffect(() => {
//     const storedLocation = localStorage.getItem("userLocation");
//     if (storedLocation) {
//       setUserLocation(JSON.parse(storedLocation));
//     } else {
//       fetchGeolocation();
//     }
//     fetchRestaurants();
//   }, [fetchGeolocation, fetchRestaurants, setUserLocation]);

//   // Memoized filtered restaurants
//   const filteredRestaurants = useMemo(() => {
//     const term = searchTerm.toLowerCase();
//     let results = restaurantsWithDistance;

//     if (selectedMenu) {
//       results = results.filter((restaurant) =>
//         restaurant.menu?.items?.some((item) =>
//           item?.item_type?.includes(selectedMenu)
//         )
//       );
//     }

//     if (term) {
//       results = results.filter(
//         (restaurant) =>
//           restaurant.name.toLowerCase().includes(term) ||
//           restaurant.location.toLowerCase().includes(term) ||
//           restaurant.menu?.title?.en?.toLowerCase().includes(term) ||
//           restaurant.menu?.items?.some((item) =>
//             item.item_name?.toLowerCase().includes(term)
//           )
//       );
//     }

//     return results;
//   }, [searchTerm, selectedMenu, restaurantsWithDistance]);

//   // Handlers
//   const handleMenuClick = useCallback((menuType: string) => {
//     setSelectedMenu((prev) => (prev === menuType ? "" : menuType));
//   }, []);

//   const handleRestaurantClick = useCallback(
//     (restaurant: Restaurant) => {
//       const isLoginUser = localStorage.getItem("isLoggedIn");
//       if (isLoginUser === "true") {
//         router.push(`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`);
//       } else {
//         setShowRegisterModal(true);
//       }
//     },
//     [router]
//   );

//   const handleRegister = async (data: { name: string; email: string }) => {
//     try {
//       const response = await apiClient.post("/mobileUsers/createMobileUser", {
//         name: data.name,
//         email: data.email,
//         status: true,
//       });
//       setToast({
//         show: true,
//         message: "OTP sent successfully",
//         type: "success",
//       });
//       return true;
//     } catch (error: any) {
//       console.error("Error registering user", error.response);
//       setToast({
//         show: true,
//         message: error.response?.data?.message || "Error registering user",
//         type: "error",
//       });
//       return false;
//     }
//   };

//   const handleClose = () => setShowRegisterModal(false);

//   const handleFocus = () => {
//     const element = searchRef.current;
//     const offset = 10;
//     if (element) {
//       const y = element.getBoundingClientRect().top + window.scrollY - offset;
//       window.scrollTo({ top: y, behavior: "smooth" });
//     }
//     setFocused(true);
//   };

//   const handleBlur = () => {
//     setFocused(false);
//     setIsSticky(false);
//   };

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;
//       if (focused) {
//         setIsSticky(currentScrollY < lastScrollY);
//       }
//       setLastScrollY(currentScrollY);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [lastScrollY, focused]);

//   const retryGeolocation = () => {
//     setLoading(true);
//     setLocationError("");
//     fetchGeolocation().finally(() => setLoading(false));
//   };

//   if (!userLocation && !restaurantsWithDistance.length && !localStorage.getItem("userLocation")) {
//     return (
//       <div
//         className="position-absolute top-50 start-50 translate-middle"
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//         }}
//       >
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading Location...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pb-5">
//       <div className="SearchFixed container my-1">
//         <div className="SearchBox g-4 align-items-center">
//           <div className="MenuType">
//             <div className="MeneSequence">
//               <span
//                 className={`Starter ${selectedMenu === "Starter" ? "selected" : ""}`}
//                 style={{ backgroundColor: "#EEE7D0" }}
//                 onClick={() => handleMenuClick("Starter")}
//               >
//                 {t("Starter")}
//               </span>
//               <span
//                 className={`Main Dish ${selectedMenu === "MainDish" ? "selected" : ""}`}
//                 style={{ backgroundColor: "#D7EED0" }}
//                 onClick={() => handleMenuClick("MainDish")}
//               >
//                 {t("MainDish")}
//               </span>
//               <span
//                 className={`Desert ${selectedMenu === "Dessert" ? "selected" : ""}`}
//                 style={{ backgroundColor: "#D0E1EE" }}
//                 onClick={() => handleMenuClick("Dessert")}
//               >
//                 {t("Dessert")}
//               </span>
//               <span
//                 className={`Drinks ${selectedMenu === "Drinks" ? "selected" : ""}`}
//                 style={{ backgroundColor: "#EED0D0" }}
//                 onClick={() => handleMenuClick("Drinks")}
//               >
//                 {t("Drinks")}
//               </span>
//             </div>
//             <div className="InputSearch">
//               <input
//                 ref={searchRef}
//                 type="text"
//                 placeholder={
//                   language === "es"
//                     ? "Buscar restaurantes, cocina o ubicación"
//                     : "Search restaurants, cuisine, or location"
//                 }
//                 className={`form-control w-full p-2 border rounded-md transition-all duration-300 ${
//                   isSticky ? "sticky top-0 z-50 bg-white shadow-md" : ""
//                 }`}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 onChange={(e) => debouncedSearch(e.target.value)}
//                 style={{ fontSize: "0.8rem" }}
//               />
//             </div>
//           </div>
//           <div className="MapIcon">
//             <Link
//               href="/map"
//               className={`text-decoration-none d-flex flex-column align-items-center ${
//                 pathname === "/map" ? "text-primary" : "text-secondary"
//               }`}
//             >
//               <div className="svgControler">
//                 <svg
//                   width="37"
//                   height="37"
//                   viewBox="0 0 37 37"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <circle cx="18.2609" cy="18.2609" r="18.2609" fill="#F1582E" />
//                   <path
//                     fillRule="evenodd"
//                     clipRule="evenodd"
//                     d="M26.1876 9.29969C24.2049 7.34128 21.5664 6.26172 18.763 6.26172C15.9587 6.26172 13.3213 7.34125 11.3373 9.29969C9.35464 11.2581 8.26172 13.8632 8.26172 16.6335C8.26172 19.4035 9.35461 22.0086 11.3373 23.9672C12.6436 25.2575 13.9543 26.5422 15.2653 27.8268C16.4036 28.9434 17.543 30.0588 18.6779 31.1788L18.7619 31.2617L18.8458 31.1788C19.9807 30.06 21.1179 28.9457 22.2561 27.8303C23.568 26.5445 24.88 25.2587 26.1873 23.9684C28.17 22.01 29.2617 19.4048 29.2617 16.6346C29.2617 13.8635 28.1702 11.2583 26.1876 9.29969ZM18.7618 21.6197C15.978 21.6197 13.7127 19.3833 13.7127 16.6323C13.7127 13.8825 15.9779 11.6449 18.7618 11.6449C21.5458 11.6449 23.811 13.8824 23.811 16.6323C23.811 19.3833 21.5458 21.6197 18.7618 21.6197Z"
//                     fill="white"
//                   />
//                 </svg>
//                 <div className="circles">
//                   <div className="circle1"></div>
//                   <div className="circle2"></div>
//                   <div className="circle3"></div>
//                 </div>
//               </div>
//               <span className="small">{t("mapView")}</span>
//             </Link>
//           </div>
//         </div>
//       </div>

//       <div className="text-center mt-4">
//         {loading ? (
//           <div
//             className="position-absolute top-50 start-50 translate-middle"
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//             }}
//           >
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         ) : userLocation && !locationError && filteredRestaurants.length > 0 ? (
//           filteredRestaurants.map((restaurant) => (
//             <div
//               key={restaurant.id}
//               onClick={() => handleRestaurantClick(restaurant)}
//             >
//               <MemoizedRestaurantCard restaurant={restaurant} distance={restaurant.distance} />
//             </div>
//           ))
//         ) : (
//           userLocation &&
//           locationError && (
//             <p className="text-center text-gray-500">
//               {language === "en" ? "No restaurants found." : "No se encontraron restaurantes."}
//             </p>
//           )
//         )}
//       </div>

//       {selectedMenu && !loading && filteredRestaurants.length === 0 && (
//         <div className="text-center mt-4">
//           <p className="text-gray-500">
//             {language === "en"
//               ? "No restaurants found. Please try again later."
//               : "No se encontraron restaurantes. Por favor, inténtelo de nuevo más tarde."}
//           </p>
//         </div>
//       )}

//       {locationError && (
//         <div className="alert alert-warning mt-3">
//           {locationError}
//           <br />
//           <small className="text-muted">
//             {language === "en"
//               ? "You can click the lock icon in your browser’s address bar to enable location access manually."
//               : "Puede hacer clic en el ícono de candado en la barra de direcciones de su navegador para habilitar el acceso a la ubicación manualmente."}
//           </small>
//           <div className="mt-2">
//             <button
//               className="btn btn-sm btn-outline-primary"
//               onClick={retryGeolocation}
//             >
//               {language === "en" ? "Try Again" : "Intentar de nuevo"}
//             </button>
//           </div>
//         </div>
//       )}

//       <RegisterPromptModal
//         show={showRegisterModal}
//         onClose={handleClose}
//         onRegister={handleRegister}
//       />

//       {toast.show && (
//         <PopUp
//           type={toast.type}
//           message={toast.message}
//           onClose={() => setToast({ show: false, message: "", type: "" })}
//         />
//       )}
//     </div>
//   );
// }