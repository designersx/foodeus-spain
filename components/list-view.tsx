// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useLanguage } from "@/context/language-context";
// import { RestaurantCard } from "@/components/restaurant-card";
// import { HeroSlideshow } from "@/components/hero-slideshow";
// import { Input } from "@/components/ui/input"; // Radix UI Input
// import { Search } from "lucide-react";
// import { apiClient, getRestaurantsWithMenus } from "@/services/apiService";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { ChevronDown } from "lucide-react";
// import { useRestaurantStore } from "@/store/restaurantStore";
// import Link from "next/link";

// import { boolean } from "yup";
// import RegisterPromptModal from "./register-popup-modal";
// import { useRouter } from "next/navigation";
// import PopUp from "./ui/custom-toast";
// import { usePathname } from "next/navigation";
// import LocationLoader from "./LocationLoader";
// export interface Restaurant {
//   restaurant_id: number;
//   name: string;
//   rating: number;
//   total_ratings: number;
//   distance: string |number;
//   cuisine: string;
//   cover_image: string;
//   location: Coordinates;
//   address: string;
//   phone: string;
//   website: string;
//   category: string;
//   open_hours: OpenHours | string;
//   description: string;
//   menus: Menu[];
// }

// export interface Coordinates {
//   latitude: string;
//   longitude: string;
// }

// export interface OpenHours {
//   open_now: boolean;
//   periods: Period[];
//   weekday_text: string[];
// }

// export interface Period {
//   open: {
//     day: number; // 0: Sunday, 1: Monday, etc.
//     time: string; // Format: "0900"
//   };
//   close: {
//     day: number;
//     time: string;
//   };
// }

// export interface Menu {
//   id: number;
//   restaurant_id: number;
//   item_name: string;
//   price: string;
//   description: string;
//   menu_type: string;
//   item_list: any | null; // Can refine this if structure is known
//   Image_URL: string | null;
//   created_at: string;
//   updated_at: string;
//   items: MenuItem[];
// }

// export interface MenuItem {
//   id: number;
//   item_name: string;
//   price: string;
//   item_type: string;
//   description: string | null;
//   image_url: string | null;
// }

// export interface RegisterUserDetails {
//   name: string;
//   email: string;
//   status: boolean;
// }


// const calculateDistance = (
//   lat1: number,
//   lng1: number,
//   lat2?: number,
//   lng2?: number
// ) => {
//   if (!lat2 || !lng2) return Number.MAX_VALUE; // If coordinates are missing, set a large distance
//   const R = 6371; // Radius of Earth in km
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//     Math.cos((lat2 * Math.PI) / 180) *
//     Math.sin(dLng / 2) *
//     Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in km
// };

// export function ListView() {
//   const { t, language } = useLanguage();
//   const [userLocation, setUserLocation] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);
//   const [restaurantsWithDistance, setRestaurantsWithDistance] = useState<
//     Restaurant[]
//   >([]);
//   // const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
//     []
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
//   const [filterBy, setFilterBy] = useState("all");
//   const [locationError, setLocationError] = useState<string>("");
//   const { restaurants, setRestaurants, hasFetched, setHasFetched } =
//     useRestaurantStore(); // Use zustand store
//   const [visibleCount, setVisibleCount] = useState(5);
//   const [userLocationFromStorage, setUserLocationFromStorage] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState<string>("");
//   const [showRegisterModal, setShowRegisterModal] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const [selectedMenu, setSelectedMenu] = useState("");
//   const [page,setPage]=useState(1)
//   const router = useRouter();

//   useEffect(() => {
//     // Check if we're on the client side before accessing localStorage
//     if (typeof window !== "undefined") {
//       const locationVar = localStorage.getItem("userLocation") || "{}";
//       const userLocation2 = JSON.parse(locationVar);
//       setUserLocationFromStorage(userLocation2);
//     }
//     setRestaurantsWithDistance(restaurants);
//     setFilteredRestaurants(restaurants);
//   }, []);


//   // Utility to format date to just yyyy-mm-dd
//   const formatDate = (date: Date) => date.toISOString().split("T")[0];


//   useEffect(() => {
//     const getLocationAsync = async () => {
//       if (!navigator.geolocation) {
//         setLocationError("Geolocation is not supported by your browser.");
//         return;
//       }
  
//       setLoadingLocation(true);
  
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userPos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
  
//           setUserLocation(userPos);
//           localStorage.setItem("userLocation", JSON.stringify(userPos));
//           setLoadingLocation(false);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           if (error.code === error.PERMISSION_DENIED) {
//             setLocationError(
//               "Location access was denied. Please enable it in your browser settings."
//             );
//           } else {
//             setLocationError("Unable to access your location.");
//           }
//           setLoadingLocation(false);
//         }
//       );
//     };
  
//     // Call asynchronously but not blocking main thread
//     setTimeout(() => {
//       getLocationAsync();
//     }, 0); // 0ms delay ensures it's async but immediate
  
//     return () => {
//       setLoadingLocation(false);
//     };
//   }, []);  


//   //fix api with gmap data
//   useEffect(() => {
//     if (userLocationFromStorage || userLocation) {
//       const fetchAndProcessRestaurants = async () => {
//         setLoading(true);
//         try {
//           const Lat = userLocationFromStorage?.lat || userLocation?.lat;
//           const Lng = userLocationFromStorage?.lng || userLocation?.lng;
          
//           const data = await getRestaurantsWithMenus(Lat, Lng, page); // Assuming you have page variable
//           console.log(data,Lat, Lng, page)
//           if (!Array.isArray(data.data)) {
//             console.error("API response is not an array:", data);
//             return;
//           }
          
//           // console.log(data.data);
          
//           const today = new Date();
//           const formattedToday = formatDate(today);

//           const todaySpecialRestaurants: Restaurant[] = [];

//           data?.data?.forEach((restaurant: any) => {
//             if (restaurant.menus.some((menu: any) => menu?.items?.length === 0)) {
//               return;
//             }

//             const allMenus = restaurant.menus || [];
//             const sortedMenus = allMenus.sort((a:any, b:any) => {
//               const dateA = new Date(a.updated_at).getTime();
//               const dateB = new Date(b.updated_at).getTime();
//               return dateB - dateA;
//             });

//             if (sortedMenus.length > 0) {
//               const latestMenu = sortedMenus[0];

//               todaySpecialRestaurants.push({
//                 id: restaurant.restaurant_id?.toString() || "",
//                 name: restaurant.name || "",
//                 location: restaurant.address || "",
//                 coordinates: {
//                   lat: Number(restaurant.location?.latitude) || 0,
//                   lng: Number(restaurant.location?.longitude) || 0,
//                 },
//                 rating: restaurant.rating?.toString() || "",
//                 total_ratings:restaurant.total_ratings?.toString() || "",
//                 category: restaurant.category,
//                 menu: {
//                   title: {
//                     en: latestMenu.item_name || "",
//                     es: latestMenu.item_name || "",
//                   },
//                   description: {
//                     en: latestMenu.description || "",
//                     es: latestMenu.description || "",
//                   },
//                   image: latestMenu.Image_URL || "",
//                   items: latestMenu.items,
//                   updated_at: latestMenu.updated_at,
//                   menu_type: latestMenu.menu_type,
//                   menu_id: latestMenu.id,
//                   price: latestMenu.price,
//                 },
//                 distance:  parseFloat(restaurant.distance) || 0, // Directly using the distance from the API response
//               });
//             }
//           });

//           // Sorting by distance from the user's location
//           const withDistance = todaySpecialRestaurants.sort((a, b) => a.distance - b.distance);

//           console.log("Fetched restaurants:", withDistance);
//           setRestaurants(withDistance);
//           setRestaurantsWithDistance(withDistance);
//           setFilteredRestaurants(withDistance);
//           setHasFetched(true);
//         } catch (err) {
//           console.error("Error fetching restaurants:", err);
//         } finally {
//           setLoading(false);
//         }
//       };
//       if (!hasFetched && (Object.keys(userLocationFromStorage).length>0 || userLocation)) {
//         fetchAndProcessRestaurants();
//       }
//     }
//   }, [hasFetched, userLocation, userLocationFromStorage]);


//   const deg2rad = (deg: number) => {
//     return deg * (Math.PI / 180);
//   };

//   useEffect(() => {
//     const term = searchTerm?.toLowerCase();
//     if (!term) {
//       // console.log("No search term, showing all restaurants.");
//       setFilteredRestaurants(restaurantsWithDistance);
//       return;
//     }

//     const results = restaurantsWithDistance?.filter((restaurant) => {
//       if (!term) return true;

//       // Check if restaurant name or location matches
//       const isRestaurantMatch =
//         restaurant?.name?.toLowerCase().includes(term) ||
//         restaurant?.location?.toLowerCase().includes(term);

//       // Check if the menu title matches
//       const isMenuMatch = restaurant?.menu?.title?.en
//         ?.toLowerCase()
//         .includes(term);

//       // Check if any item_name in the items array matches
//       const isItemMatch = restaurant?.menu?.items?.some((item) =>
//         item.item_name?.toLowerCase().includes(term)
//       );

//       const isCuisineMatch=restaurant?.category?.toLowerCase().includes(term)

//       return isRestaurantMatch || isMenuMatch || isItemMatch||isCuisineMatch;
//     });

//     setFilteredRestaurants(results);
//   }, [searchTerm, restaurantsWithDistance, filterBy]);

//   const handleMenuClick = (menuType: any) => {
//     if (selectedMenu === menuType) {
//       // If the same menu type is clicked, remove the filter and show all items
//       setSelectedMenu(""); // Clear the selected menu
//       setFilteredRestaurants(restaurantsWithDistance); // Show all items again
//     } else {
//       // If a new menu type is selected, filter the data
//       setSelectedMenu(menuType);
//       const filteredItems = restaurantsWithDistance.filter((restaurant) => {
//         const isItemTypeMatch = restaurant?.menu?.items?.some((item) =>
//           item?.item_type?.includes(menuType)
//         );
//         return isItemTypeMatch;
//       });
//       setFilteredRestaurants(filteredItems);
//     }
//   };

//   const handleRestaurantClick = (restaurant: Restaurant) => {
//     const isLoginUser = localStorage.getItem("isLoggedIn");
//     sessionStorage.setItem("selectedRestaurant", JSON.stringify(restaurant));
//     if (isLoginUser === "true") {
//       router.push(`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`);
//     } else {
//       setShowRegisterModal(true);
//     }
//   };
//   //handle register
//   const handleRegister = async (data: { name: string; email: string }) => {
//     const { name, email } = data;
//     const userDetails: RegisterUserDetails = {
//       name: name,
//       email: email,
//       status: true,
//     };
//     try {
//       const response = await apiClient.post(
//         "/mobileUsers/createMobileUser",
//         userDetails
//       );
//       if (response) {
//         setToast({
//           show: true,
//           message: "OTP sent successfully",
//           type: "success",
//         });
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error registering user", error.response);
//       setToast({
//         show: true,
//         message: error.response.data.message,
//         type: "error",
//       });
//       return false;
//     }
//   };
//   //handle close
//   const handleClose = () => {
//     setShowRegisterModal(false);
//   };
//   // serachbar go on top
//   const searchRef = useRef(null);
//   const [isSticky, setIsSticky] = useState(false);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const [focused, setFocused] = useState(false);
//   // Scroll to top with offset on focus
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
//         if (currentScrollY < lastScrollY) {
//           setIsSticky(true);
//         } else {
//           setIsSticky(false);
//         }
//       }

//       setLastScrollY(currentScrollY);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [lastScrollY, focused]);

//   const retryGeolocation = () => {
//     setLoading(true);
//     setLocationError("");

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const userPos = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };
//         setUserLocation(userPos);
//         // re-run your restaurant logic here...
//         setLoading(false);
//       },
//       (error) => {
//         console.error("Retry location error:", error);

//         if (error.code === error.PERMISSION_DENIED) {
//           setLocationError(
//             language === "en"
//                 ? "Location access was denied. Please enable it in your browser settings."
//                 : "El acceso a la ubicación fue denegado. Por favor, habilítelo en la configuración de su navegador."
//           );
//         } else {
//           setLocationError(language === "en"
//             ? "Unable to access your location."
//             : "No se puede acceder a su ubicación.");
//         }

//         setLoading(false);
//       },{ timeout: 10000 }
//     );
//   };

// if (
//   loadingLocation &&
//   (
//     userLocationFromStorage == null || 
//     Object.keys(userLocationFromStorage).length === 0
//   )
// ) { 
//   console.log("Loading location............................");
//     return (
//       // <div
//       //       className="position-absolute top-50 start-50 translate-middle"
//       //       style={{
//       //         position: "absolute",
//       //         top: "50%",
//       //         left: "50%",
//       //         transform: "translate(-50%, -50%)",
//       //       }}
//       //     >
//       //       <div className="spinner-border text-primary" role="status">
//       //         <span className="visually-hidden">{t('Loading')}</span>
//       //       </div>
//       //     </div>
//       <LocationLoader/>
//     );
//   }

//   const pathname = usePathname();
//   return (
//     <div className="pb-5">
//       {/* <HeroSlideshow /> */}
//       <div className=" SearchFixed container my-1">
//         <div className=" SearchBox  g-4 align-items-center">
//           {/* Search Input */}
//           <div className=" MenuType">
//             <div className="MeneSequence">
//               <span
//                 className={`Starter ${selectedMenu === "Starter" ? "selected" : ""
//                   }`}
//                 style={{ backgroundColor: "#EEE7D0" }}
//                 onClick={() => handleMenuClick("Starter")}
//               >
//                 {t("Starter")}
//               </span>
//               <span
//                 className={`Main Dish ${selectedMenu === "MainDish" ? "selected" : ""
//                   }`}
//                 style={{ backgroundColor: "#D7EED0" }}
//                 onClick={() => handleMenuClick("MainDish")}
//               >
//                 {t("MainDish")}
//               </span>
//               <span
//                 className={`Desert ${selectedMenu === "Dessert" ? "selected" : ""
//                   }`}
//                 style={{ backgroundColor: "#D0E1EE" }}
//                 onClick={() => handleMenuClick("Dessert")}
//               >
//                 {t("Dessert")}
//               </span>
//               <span
//                 className={`Drinks ${selectedMenu === "Drinks" ? "selected" : ""
//                   }`}
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
//                 className={`form-control w-full p-2 border rounded-md transition-all duration-300 ${isSticky ? "sticky top-0 z-50 bg-white shadow-md" : ""
//                   }`}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{ fontSize: "0.8rem" }}
//               />
//             </div>
//           </div>
//           <div className="MapIcon">
//             <Link
//               href="/map"
//               className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/map" ? "text-primary" : "text-secondary"
//                 }`}
//             >
//               <div className="svgControler">
//                 <svg
//                   width="37"
//                   height="37"
//                   viewBox="0 0 37 37"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <circle
//                     cx="18.2609"
//                     cy="18.2609"
//                     r="18.2609"
//                     fill="#F1582E"
//                   />
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
//         ) : userLocationFromStorage && !locationError && filteredRestaurants?.length > 0 ? (
//           filteredRestaurants.map((restaurant, index) => (
//             <div key={index} onClick={() => handleRestaurantClick(restaurant)}>
//               <RestaurantCard
//                 key={restaurant?.id}
//                 restaurant={restaurant}
//                 distance={restaurant?.distance}
//               />
//             </div>
//           ))
//         ) : (
//           userLocationFromStorage &&
//           locationError && (
//             <p className="text-center text-gray-500">{language == 'en' ? "No restaurants found." : "No se encontraron restaurantes."}</p>
//           )
//         )}
//       </div>

//       {
//         selectedMenu && !loading && filteredRestaurants?.length === 0 && (
//           <div className="text-center mt-4">
//             <p className="text-gray-500">
//               {language === "en"
//                 ? "No restaurants found. Please try again later."
//                 : "No se encontraron restaurantes. Por favor, inténtelo de nuevo más tarde."}
//             </p>
//           </div>
//         )
//       }

//       {locationError && (
//         <div className="alert alert-warning mt-3">
//           {locationError} <br />
//           <small className="text-muted">
//           {language === "en"
//             ? "You can click the lock icon in your browser’s address bar to enable location access manually."
//             : "Puede hacer clic en el ícono de candado en la barra de direcciones de su navegador para habilitar el acceso a la ubicación manualmente."}

//           </small>
//           <div className="mt-2">
//             <button
//               className="btn btn-sm btn-outline-primary"
//               onClick={retryGeolocation}
//             >
//                 {language === "en" ? "Try Again" : "Intentar de nuevo"}
//             </button>
//           </div>
//         </div>
//       )}
//       {!isLoggedIn && (
//         <RegisterPromptModal
//           show={showRegisterModal}
//           onClose={handleClose}
//           onRegister={handleRegister}
//         // modalView={false}
//         />
//       )}
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

// //singke menu
// "use client";
// import { useEffect, useState, useRef } from "react";
// import { useLanguage } from "@/context/language-context";
// import { RestaurantCard } from "@/components/restaurant-card";
// import { HeroSlideshow } from "@/components/hero-slideshow";
// import { Input } from "@/components/ui/input"; // Radix UI Input
// import { Search } from "lucide-react";
// import { apiClient, getRestaurantsWithMenus } from "@/services/apiService";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { ChevronDown } from "lucide-react";
// import { useRestaurantStore } from "@/store/restaurantStore";
// import Link from "next/link";
// import { boolean } from "yup";
// import RegisterPromptModal from "./register-popup-modal";
// import { useRouter } from "next/navigation";
// import PopUp from "./ui/custom-toast";
// import { usePathname } from "next/navigation";
// import LocationLoader from "./LocationLoader";

// export interface Restaurant {
//     restaurant_id: number;
//     name: string;
//     rating: number;
//     total_ratings: number;
//     distance: string |number;
//     cuisine: string;
//     cover_image: string;
//     location: Coordinates;
//     address: string;
//     phone: string;
//     website: string;
//     category: string;
//     open_hours: OpenHours | string;
//     description: string;
//     menus: Menu[];
//   }
  
//   export interface Coordinates {
//     latitude: string;
//     longitude: string;
//   }
  
//   export interface OpenHours {
//     open_now: boolean;
//     periods: Period[];
//     weekday_text: string[];
//   }
  
//   export interface Period {
//     open: {
//       day: number; // 0: Sunday, 1: Monday, etc.
//       time: string; // Format: "0900"
//     };
//     close: {
//       day: number;
//       time: string;
//     };
//   }
  
//   export interface Menu {
//     id: number;
//     restaurant_id: number;
//     item_name: string;
//     price: string;
//     description: string;
//     menu_type: string;
//     item_list: any | null; // Can refine this if structure is known
//     Image_URL: string | null;
//     created_at: string;
//     updated_at: string;
//     items: MenuItem[];
//   }
  
//   export interface MenuItem {
//     id: number;
//     item_name: string;
//     price: string;
//     item_type: string;
//     description: string | null;
//     image_url: string | null;
//   }
  
//   export interface RegisterUserDetails {
//     name: string;
//     email: string;
//     status: boolean;
//   }
  

// export function ListView() {
//   const { t, language } = useLanguage();
//   const [userLocation, setUserLocation] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);
//   const [restaurantsWithDistance, setRestaurantsWithDistance] = useState<
//     Restaurant[]
//   >([]);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
//   const [filterBy, setFilterBy] = useState("all");
//   const [locationError, setLocationError] = useState<string>("");
//   const { restaurants, setRestaurants, hasFetched, setHasFetched } =
//     useRestaurantStore();
//   const [visibleCount, setVisibleCount] = useState(5);
//   const [userLocationFromStorage, setUserLocationFromStorage] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState<string>("");
//   const [showRegisterModal, setShowRegisterModal] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const [selectedMenu, setSelectedMenu] = useState("");
//   const [page, setPage] = useState(1);
//   const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for load more
//   const [hasMoreData, setHasMoreData] = useState(true); // Track if more data is available
//   const router = useRouter();
//   // console.log('restaurants',restaurants)
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const locationVar = localStorage.getItem("userLocation");
//       let userLocation2 = locationVar ? JSON.parse(locationVar) : null;
//       if (userLocation2 && Object.keys(userLocation2).length === 0) {
//         userLocation2 = null;
//       }
//       setUserLocationFromStorage(userLocation2);
//     }
//     setRestaurantsWithDistance(restaurants);
//     setFilteredRestaurants(restaurants);
//   }, []);

//   // Utility to format date to just yyyy-mm-dd
//   const formatDate = (date: Date) => date.toISOString().split("T")[0];

//   useEffect(() => {
//     const getLocationAsync = async () => {
//       if (!navigator.geolocation) {
//         setLocationError("Geolocation is not supported by your browser.");
//         return;
//       }

//       setLoadingLocation(true);

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userPos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setUserLocation(userPos);
//           localStorage.setItem("userLocation", JSON.stringify(userPos));
//           setLoadingLocation(false);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           if (error.code === error.PERMISSION_DENIED) {
//             setLocationError(
//               "Location access was denied. Please enable it in your browser settings."
//             );
//           } else {
//             setLocationError("Unable to access your location.");
//           }
//           setLoadingLocation(false);
//         }
//       );
//     };

//     setTimeout(() => {
//       getLocationAsync();
//     }, 0);

//     return () => {
//       setLoadingLocation(false);
//     };
//   }, []);

//   // Fetch and process restaurants
//   const fetchAndProcessRestaurants = async (append = false) => {
//     setLoading(append ? false : true); // Only show full loading for initial fetch
//     setIsLoadingMore(append); // Show loading for load more
//     try {
//       const Lat = userLocationFromStorage?.lat || userLocation?.lat;
//       const Lng = userLocationFromStorage?.lng || userLocation?.lng;

//       const data = await getRestaurantsWithMenus(Lat, Lng, page);
//       // console.log(data, Lat, Lng, page);

//       if (!Array.isArray(data.data)) {
//         console.error("API response is not an array:", data);
//         setHasMoreData(false);
//         return;
//       }

//       if (data.data.length === 0) {
//         setHasMoreData(false); // No more data to fetch
//         return;
//       }

//       const today = new Date();
//       const formattedToday = formatDate(today);
//       const todaySpecialRestaurants: Restaurant[] = [];
//       console.log('data :',data?.data)
//       data?.data?.forEach((restaurant: any) => {
//         const filteredMenus = restaurant.menus.filter((menu: any) => menu?.items?.length > 0);

//         // If no menus remain after filtering, skip this restaurant
//         if (filteredMenus.length === 0) {
//           return;
//         }

//         // const allMenus = restaurant.menus || [];
//         const sortedMenus = filteredMenus.sort((a: any, b: any) => {
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
//             rating: restaurant.rating?.toString() || "",
//             total_ratings: restaurant.total_ratings?.toString() || "",
//             category: restaurant.category,
//             menu: {
//               title: {
//                 en: latestMenu.item_name || "",
//                 es: latestMenu.item_name || "",
//               },
//               description: {
//                 en: latestMenu.description || "",
//                 es: latestMenu.description || "",
//               },
//               image: latestMenu.Image_URL || "",
//               items: latestMenu.items,
//               updated_at: latestMenu.updated_at,
//               menu_type: latestMenu.menu_type,
//               menu_id: latestMenu.id,
//               price: latestMenu.price,
//             },
//             distance: parseFloat(restaurant.distance) || 0,
//           });
//         }
//       });

//       // Sort by distance
//       const withDistance = todaySpecialRestaurants.sort((a, b) => a.distance - b.distance);
      
//       // Append or replace data
//       if (append) {
//         // setRestaurantsWithDistance((prev) => [...prev, ...withDistance]);
//         setFilteredRestaurants((prev) => [...prev, ...withDistance]);
//         const updated=[...restaurants,...withDistance]
//         setRestaurants(updated);
//       } else {
//         // console.log('withDistance',withDistance)
//         // setRestaurantsWithDistance(withDistance);
//         setFilteredRestaurants(withDistance);
//         setRestaurants(withDistance);
//       }

//       setHasFetched(true);
//     } catch (err) {
//       console.error("Error fetching restaurants:", err);
//       setHasMoreData(false);
//     } finally {
//       setLoading(false);
//       setIsLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     // console.log(hasFetched,userLocationFromStorage,userLocation)
//     if (!hasFetched && (userLocationFromStorage || userLocation)) {
//               fetchAndProcessRestaurants();
//             }
//   }, [hasFetched, userLocation, userLocationFromStorage]);

//   // Handle Load More
//   const handleLoadMore = () => {
//     setPage((prev) => prev + 1);
//   };

//   useEffect(() => {
//     if (page > 1) {
//       fetchAndProcessRestaurants(true); // Append new data
//     }
//   }, [page]);

//   useEffect(() => {
//     const term = searchTerm?.toLowerCase();
//     if (!term) {
//       setFilteredRestaurants(restaurantsWithDistance);
//       return;
//     }

//     const results = restaurantsWithDistance?.filter((restaurant) => {
//       if (!term) return true;

//       const isRestaurantMatch =
//         restaurant?.name?.toLowerCase().includes(term) ||
//         restaurant?.location?.toLowerCase().includes(term);

//       const isMenuMatch = restaurant?.menu?.title?.en
//         ?.toLowerCase()
//         .includes(term);

//       const isItemMatch = restaurant?.menu?.items?.some((item) =>
//         item.item_name?.toLowerCase().includes(term)
//       );

//       const isCuisineMatch = restaurant?.category?.toLowerCase().includes(term);

//       return isRestaurantMatch || isMenuMatch || isItemMatch || isCuisineMatch;
//     });

//     setFilteredRestaurants(results);
//   }, [searchTerm, restaurantsWithDistance, filterBy]);

//    const handleMenuClick = (menuType: any) => {
//     if (selectedMenu === menuType) {
//       // If the same menu type is clicked, remove the filter and show all items
//       setSelectedMenu(""); // Clear the selected menu
//       setFilteredRestaurants(restaurantsWithDistance); // Show all items again
//     } else {
//       // If a new menu type is selected, filter the data
//       setSelectedMenu(menuType);
//       const filteredItems = restaurantsWithDistance.filter((restaurant) => {
//         const isItemTypeMatch = restaurant?.menu?.items?.some((item) =>
//           item?.item_type?.includes(menuType)
//         );
//         return isItemTypeMatch;
//       });
//       setFilteredRestaurants(filteredItems);
//     }
//   };

//   const handleRestaurantClick = (restaurant: Restaurant) => {
//     const isLoginUser = localStorage.getItem("isLoggedIn");
//     sessionStorage.setItem("selectedRestaurant", JSON.stringify(restaurant));
//     if (isLoginUser === "true") {
//       router.push(`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`);
//     } else {
//       setShowRegisterModal(true);
//     }
//   };
//   //handle register
//   const handleRegister = async (data: { name: string; email: string }) => {
//     const { name, email } = data;
//     const userDetails: RegisterUserDetails = {
//       name: name,
//       email: email,
//       status: true,
//     };
//     try {
//       const response = await apiClient.post(
//         "/mobileUsers/createMobileUser",
//         userDetails
//       );
//       if (response) {
//         setToast({
//           show: true,
//           message: "OTP sent successfully",
//           type: "success",
//         });
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error registering user", error.response);
//       setToast({
//         show: true,
//         message: error.response.data.message,
//         type: "error",
//       });
//       return false;
//     }
//   };


// const handleClose = () => {
// setShowRegisterModal(false);
// };
// // serachbar go on top
// const searchRef = useRef(null);
// const [isSticky, setIsSticky] = useState(false);
// const [lastScrollY, setLastScrollY] = useState(0);
// const [focused, setFocused] = useState(false);
// // Scroll to top with offset on focus
// const handleFocus = () => {
// const element = searchRef.current;
// const offset = 10;

// if (element) {
// const y = element.getBoundingClientRect().top + window.scrollY - offset;
// window.scrollTo({ top: y, behavior: "smooth" });
// }

// setFocused(true);
// };
// const handleBlur = () => {
// setFocused(false);
// setIsSticky(false);
// };
// useEffect(() => {
// const handleScroll = () => {
// const currentScrollY = window.scrollY;

// if (focused) {
// if (currentScrollY < lastScrollY) {
// setIsSticky(true);
// } else {
// setIsSticky(false);
// }
// }

// setLastScrollY(currentScrollY);
// };

// window.addEventListener("scroll", handleScroll);
// return () => window.removeEventListener("scroll", handleScroll);
// }, [lastScrollY, focused]);

// const retryGeolocation = () => {
// setLoading(true);
// setLocationError("");

// navigator.geolocation.getCurrentPosition(
// (position) => {
// const userPos = {
// lat: position.coords.latitude,
// lng: position.coords.longitude,
// };
// setUserLocation(userPos);
// // re-run your restaurant logic here...
// setLoading(false);
// },
// (error) => {
// console.error("Retry location error:", error);

// if (error.code === error.PERMISSION_DENIED) {
// setLocationError(
// language === "en"
// ? "Location access was denied. Please enable it in your browser settings."
// : "El acceso a la ubicación fue denegado. Por favor, habilítelo en la configuración de su navegador."
// );
// } else {
// setLocationError(language === "en"
// ? "Unable to access your location."
// : "No se puede acceder a su ubicación.");
// }

// setLoading(false);
// },{ timeout: 10000 }
// );
// };

// if (
// loadingLocation &&
// (
// userLocationFromStorage == null ||
// Object.keys(userLocationFromStorage).length === 0
// )
// ) {
// console.log("Loading location............................");
// return <LocationLoader />;
// }

// const pathname = usePathname();
// return (
// <div className="pb-5">
//   {/* <HeroSlideshow /> */}
//   <div className="SearchFixed container my-1">
//     <div className="SearchBox g-4 align-items-center">
//       {/* Search Input */}
//       <div className="MenuType">
//         <div className="MeneSequence">
//           <span
//             className={`Starter ${selectedMenu === "Starter" ? "selected" : ""}`}
//             style={{ backgroundColor: "#EEE7D0" }}
//             onClick={() => handleMenuClick("Starter")}
//           >
//             {t("Starter")}
//           </span>
//           <span
//             className={`Main Dish ${selectedMenu === "MainDish" ? "selected" : ""}`}
//             style={{ backgroundColor: "#D7EED0" }}
//             onClick={() => handleMenuClick("MainDish")}
//           >
//             {t("MainDish")}
//           </span>
//           <span
//             className={`Desert ${selectedMenu === "Dessert" ? "selected" : ""}`}
//             style={{ backgroundColor: "#D0E1EE" }}
//             onClick={() => handleMenuClick("Dessert")}
//           >
//             {t("Dessert")}
//           </span>
//           <span
//             className={`Drinks ${selectedMenu === "Drinks" ? "selected" : ""}`}
//             style={{ backgroundColor: "#EED0D0" }}
//             onClick={() => handleMenuClick("Drinks")}
//           >
//             {t("Drinks")}
//           </span>
//         </div>

//         <div className="InputSearch">
//           <input
//             ref={searchRef}
//             type="text"
//             placeholder={
//               language === "es"
//                 ? "Buscar restaurantes, cocina o ubicación"
//                 : "Search restaurants, cuisine, or location"
//             }
//             className={`form-control w-full p-2 border rounded-md transition-all duration-300 ${
//               isSticky ? "sticky top-0 z-50 bg-white shadow-md" : ""
//             }`}
//             onFocus={handleFocus}
//             onBlur={handleBlur}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ fontSize: "0.8rem" }}
//           />
//         </div>
//       </div>
//       <div className="MapIcon">
//         <Link
//           href="/map"
//           className={`text-decoration-none d-flex flex-column align-items-center ${
//             pathname === "/map" ? "text-primary" : "text-secondary"
//           }`}
//         >
//           <div className="svgControler">
//             <svg
//               width="37"
//               height="37"
//               viewBox="0 0 37 37"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <circle cx="18.2609" cy="18.2609" r="18.2609" fill="#F1582E" />
//               <path
//                 fillRule="evenodd"
//                 clipRule="evenodd"
//                 d="M26.1876 9.29969C24.2049 7.34128 21.5664 6.26172 18.763 6.26172C15.9587 6.26172 13.3213 7.34125 11.3373 9.29969C9.35464 11.2581 8.26172 13.8632 8.26172 16.6335C8.26172 19.4035 9.35461 22.0086 11.3373 23.9672C12.6436 25.2575 13.9543 26.5422 15.2653 27.8268C16.4036 28.9434 17.543 30.0588 18.6779 31.1788L18.7619 31.2617L18.8458 31.1788C19.9807 30.06 21.1179 28.9457 22.2561 27.8303C23.568 26.5445 24.88 25.2587 26.1873 23.9684C28.17 22.01 29.2617 19.4048 29.2617 16.6346C29.2617 13.8635 28.1702 11.2583 26.1876 9.29969ZM18.7618 21.6197C15.978 21.6197 13.7127 19.3833 13.7127 16.6323C13.7127 13.8825 15.9779 11.6449 18.7618 11.6449C21.5458 11.6449 23.811 13.8824 23.811 16.6323C23.811 19.3833 21.5458 21.6197 18.7618 21.6197Z"
//                 fill="white"
//               />
//             </svg>
//             <div className="circles">
//               <div className="circle1"></div>
//               <div className="circle2"></div>
//               <div className="circle3"></div>
//             </div>
//           </div>
//           <span className="small">{t("mapView")}</span>
//         </Link>
//       </div>
//     </div>
//   </div>

//   <div className="text-center mt-4">
//     {loading ? (
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
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     ) : (userLocationFromStorage || userLocation) && !locationError && filteredRestaurants?.length > 0 ? (
//       filteredRestaurants.map((restaurant, index) => (
//         <div key={index} onClick={() => handleRestaurantClick(restaurant)}>
//           <RestaurantCard
//             key={restaurant?.id}
//             restaurant={restaurant}
//             distance={restaurant?.distance}
//           />
//         </div>
//       ))
//     ) : (
//       userLocationFromStorage &&
//       locationError && (
//         <p className="text-center text-gray-500">
//           {language === "en" ? "No restaurants found." : "No se encontraron restaurantes."}
//         </p>
//       )
//     )}
//   </div>

//   {/* Load More Button */}
//   {filteredRestaurants?.length >= 10 && hasMoreData && (
//     <div className="text-center mt-6">
//       <button
//         className="btn btn-primary px-6 mb-5 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
//         onClick={handleLoadMore}
//         disabled={isLoadingMore}
//       >
//         {isLoadingMore ? (
//           <span className="flex items-center">
//             <svg
//               className="animate-spin h-5 w-5 mr-2 text-white"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
//               />
//             </svg>
//             {language === "en" ? "Loading..." : "Cargando..."}
//           </span>
//         ) : (
//           <span>{language === "en" ? "Load More" : "Cargar Más"}</span>
//         )}
//       </button>
//     </div>
//   )}

//   {/* No More Data Message */}
//   {!hasMoreData && filteredRestaurants?.length >= 10 && (
//     <div className="text-center mt-6 mb-5">
//       <p className="text-gray-500">
//         {language === "en"
//           ? "No more restaurants to load."
//           : "No hay más restaurantes para cargar."}
//       </p>
//     </div>
//   )}

//   {selectedMenu && !loading && filteredRestaurants?.length === 0 && (
//     <div className="text-center mt-4">
//       <p className="text-gray-500">
//         {language === "en"
//           ? "No restaurants found. Please try again later."
//           : "No se encontraron restaurantes. Por favor, inténtelo de nuevo más tarde."}
//       </p>
//     </div>
//   )}

//   {locationError && (
//     <div className="alert alert-warning mt-3">
//       {locationError} <br />
//       <small className="text-muted">
//         {language === "en"
//           ? "You can click the lock icon in your browser’s address bar to enable location access manually."
//           : "Puede hacer clic en el ícono de candado en la barra de direcciones de su navegador para habilitar el acceso a la ubicación manualmente."}
//       </small>
//       <div className="mt-2">
//         <button
//           className="btn btn-sm btn-outline-primary"
//           onClick={retryGeolocation}
//         >
//           {language === "en" ? "Try Again" : "Intentar de nuevo"}
//         </button>
//       </div>
//     </div>
//   )}
//   {!isLoggedIn && (
//     <RegisterPromptModal
//       show={showRegisterModal}
//       onClose={handleClose}
//       onRegister={handleRegister}
//     />
//   )}
//   {toast.show && (
//     <PopUp
//       type={toast.type}
//       message={toast.message}
//       onClose={() => setToast({ show: false, message: "", type: "" })}
//     />
//   )}
// </div>
// );
// }


//multiple menu
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
import LocationLoader from "./LocationLoader";
import MainScreenLoader from "./MainScreenLoader";

export interface Restaurant {
    restaurant_id: number;
    name: string;
    rating: number;
    total_ratings: number;
    distance: string |number;
    cuisine: string;
    cover_image: string;
    location: Coordinates;
    address: string;
    phone: string;
    website: string;
    category: string;
    open_hours: OpenHours | string;
    description: string;
    menus: Menu[];
  }
  
  export interface Coordinates {
    latitude: string;
    longitude: string;
  }
  
  export interface OpenHours {
    open_now: boolean;
    periods: Period[];
    weekday_text: string[];
  }
  
  export interface Period {
    open: {
      day: number; // 0: Sunday, 1: Monday, etc.
      time: string; // Format: "0900"
    };
    close: {
      day: number;
      time: string;
    };
  }
  
  export interface Menu {
    id: number;
    restaurant_id: number;
    item_name: string;
    price: string;
    description: string;
    menu_type: string;
    item_list: any | null; // Can refine this if structure is known
    Image_URL: string | null;
    created_at: string;
    updated_at: string;
    items: MenuItem[];
    start_time:String;
    end_time:string;
  }
  
  export interface MenuItem {
    id: number;
    item_name: string;
    price: string;
    item_type: string;
    description: string | null;
    image_url: string | null;
  }
  
  export interface RegisterUserDetails {
    name: string;
    email: string;
    status: boolean;
  }
  

export function ListView() {
  const { t, language } = useLanguage();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [restaurantsWithDistance, setRestaurantsWithDistance] = useState<
    Restaurant[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hardRefresh, setHardRefresh] = useState<boolean>(true);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState("all");
  const [locationError, setLocationError] = useState<string>("");
  const { restaurants, setRestaurants, hasFetched, setHasFetched,hasMoreData, setHasMoreData } =    useRestaurantStore();
  const [visibleCount, setVisibleCount] = useState(5);
  const [userLocationFromStorage, setUserLocationFromStorage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState<string>("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [selectedMenu, setSelectedMenu] = useState("");
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for load more
  // const [hasMoreData, setHasMoreData] = useState(true); // Track if more data is available; shift to global state as it got change when switch compneny and load more button show 
  const router = useRouter();
  // console.log('restaurants',restaurants)

    const loadingText =
    language === "es"
      ? "Por favor espera mientras encontramos opciones deliciosas para ti."
      : "Please wait while we find delicious options for you!";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const locationVar = localStorage.getItem("userLocation");
      let userLocation2 = locationVar ? JSON.parse(locationVar) : null;
      if (userLocation2 && Object.keys(userLocation2).length === 0) {
        userLocation2 = null;
      }
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

    setTimeout(() => {
      getLocationAsync();
    }, 0);

    return () => {
      setLoadingLocation(false);
    };
  }, []);

  // Fetch and process restaurants
  const fetchAndProcessRestaurants = async (append = false) => {
    setLoading(append ? false : true); // Only show full loading for initial fetch
    setIsLoadingMore(append); // Show loading for load more
    try {
      const Lat = userLocationFromStorage?.lat || userLocation?.lat;
      const Lng = userLocationFromStorage?.lng || userLocation?.lng;

      const data = await getRestaurantsWithMenus(Lat, Lng, page);
      // console.log(data, Lat, Lng, page);

      if (!Array.isArray(data.data)) {
        console.error("API response is not an array:", data);
        setHasMoreData(false);
        return;
      }

      if (data.data.length === 0) {
        console.log("No more data to fetch");
        setHasMoreData(false); // No more data to fetch
        return;
      }

      const today = new Date();
      const formattedToday = formatDate(today);
      const todaySpecialRestaurants: Restaurant[] = [];
      // console.log('data :',data?.data)
      data?.data?.forEach((restaurant: any) => {
        if (restaurant.menus.some((menu: any) => menu?.items?.length === 0)) {
          return;
        }

        const allMenus = restaurant.menus || [];
        const sortedMenus = allMenus.sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at).getTime();
          const dateB = new Date(b.updated_at).getTime();
          return dateB - dateA;
        });

        if (sortedMenus.length > 0) {
          const latestMenu = sortedMenus;

          todaySpecialRestaurants.push({
            id: restaurant.restaurant_id?.toString() || "",
            name: restaurant.name || "",
            location: restaurant.address || "",
            coordinates: {
              lat: Number(restaurant.location?.latitude) || 0,
              lng: Number(restaurant.location?.longitude) || 0,
            },
            rating: restaurant.rating?.toString() || "",
            total_ratings: restaurant.total_ratings?.toString() || "",
            category: restaurant.category,
            menu: sortedMenus.map((menu: any) => ({
              title: {
                en: menu.item_name || "",
                es: menu.item_name || "",
              },
              description: {
                en: menu.description || "",
                es: menu.description || "",
              },
              image: menu.Image_URL || "",
              items: menu.items || [],
              updated_at: menu.updated_at,
              menu_type: menu.menu_type,
              menu_id: menu.id,
              price: menu.price,
              end_time:menu.end_time,
              start_time:menu.start_time,
            })),
            distance: parseFloat(restaurant.distance) || 0,
          });
        }
      });

      // Sort by distance
      const withDistance = todaySpecialRestaurants.sort((a, b) => a.distance - b.distance);
      
      // Append or replace data
      if (append) {
        setRestaurantsWithDistance((prev) => [...prev, ...withDistance]);
        setFilteredRestaurants((prev) => [...prev, ...withDistance]);
        const updated=[...restaurants,...withDistance]
        setRestaurants(updated);
      } else {
        // console.log('withDistance',withDistance)
        setRestaurantsWithDistance(withDistance);
        setFilteredRestaurants(withDistance);
        setRestaurants(withDistance);
      }

      setHasFetched(true);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setHasMoreData(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setHardRefresh(false);
    }
  };

  useEffect(() => {
    // console.log(hasFetched,userLocationFromStorage,userLocation)
    if (!hasFetched && (userLocationFromStorage || userLocation)) {
              fetchAndProcessRestaurants();
            }
    
  }, [hasFetched, userLocation, userLocationFromStorage]);

  // Handle Load More
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      fetchAndProcessRestaurants(true); // Append new data
    }
  }, [page]);

  useEffect(() => {
    const term = searchTerm?.toLowerCase();
    if (!term) {
      setFilteredRestaurants(restaurantsWithDistance);
      return;
    }

    const results = restaurantsWithDistance?.filter((restaurant) => {
      if (!term) return true;

      const isRestaurantMatch =
        restaurant?.name?.toLowerCase().includes(term) ||
        restaurant?.location?.toLowerCase().includes(term);

      const isMenuMatch = restaurant?.menu[0]?.title?.en
        ?.toLowerCase()
        .includes(term);

      const isItemMatch = restaurant?.menu[0]?.items?.some((item) =>
        item.item_name?.toLowerCase().includes(term)
      );

      const isCuisineMatch = restaurant?.category?.toLowerCase().includes(term);

      return isRestaurantMatch || isMenuMatch || isItemMatch || isCuisineMatch;
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
        
        const isItemTypeMatch = restaurant?.menu[0]?.items?.some((item) =>
          item?.item_type?.includes(menuType)
        );
        return isItemTypeMatch;
      });
      setFilteredRestaurants(filteredItems);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    const isLoginUser = localStorage.getItem("isLoggedIn");
    sessionStorage.setItem("selectedRestaurant", JSON.stringify(restaurant));
    if (isLoginUser === "true") {
      router.push(`/menu/${restaurant.id}`);
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
return <LocationLoader />;
}
const pathname = usePathname();

return (
<div className="pb-5">
  {/* <HeroSlideshow /> */}
  <div className="SearchFixed container my-1">
    <div className="SearchBox g-4 align-items-center">
      {/* Search Input */}
      <div className="MenuType">
        <div className="MeneSequence">
          <span
            className={`Starter ${selectedMenu === "Starter" ? "selected" : ""}`}
            style={{ backgroundColor: "#EEE7D0" }}
            onClick={() => handleMenuClick("Starter")}
          >
            {t("Starter")}
          </span>
          <span
            className={`Main Dish ${selectedMenu === "MainDish" ? "selected" : ""}`}
            style={{ backgroundColor: "#D7EED0" }}
            onClick={() => handleMenuClick("MainDish")}
          >
            {t("MainDish")}
          </span>
          <span
            className={`Desert ${selectedMenu === "Dessert" ? "selected" : ""}`}
            style={{ backgroundColor: "#D0E1EE" }}
            onClick={() => handleMenuClick("Dessert")}
          >
            {t("Dessert")}
          </span>
          <span
            className={`Drinks ${selectedMenu === "Drinks" ? "selected" : ""}`}
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
            className={`form-control w-full p-2 border rounded-md transition-all duration-300 ${
              isSticky ? "sticky top-0 z-50 bg-white shadow-md" : ""
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
          className={`text-decoration-none d-flex flex-column align-items-center ${
            pathname === "/map" ? "text-primary" : "text-secondary"
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
              <circle cx="18.2609" cy="18.2609" r="18.2609" fill="#F1582E" />
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
      // <div
      //   className="position-absolute top-50 start-50 translate-middle"
      //   style={{
      //     position: "absolute",
      //     top: "50%",
      //     left: "50%",
      //     transform: "translate(-50%, -50%)",
      //   }}
      // >
      //   <div className="spinner-border text-primary" role="status">
      //     <span className="visually-hidden">Loading...</span>
      //   </div>
      // </div>
      <>
      <MainScreenLoader/>
   
      </>
    ) : (userLocationFromStorage || userLocation) && !locationError && filteredRestaurants?.length > 0 ? (
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
        <p className="text-center text-gray-500">
          {language === "en" ? "No restaurants found." : "No se encontraron restaurantes."}
        </p>
      )
    )}
  </div>

  {/* Load More Button */}
  {filteredRestaurants?.length >= 10 && hasMoreData && (
    <div className="text-center mt-6">
      <button
        className="btn btn-primary px-6 mb-5 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        onClick={handleLoadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <span className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
            {language === "en" ? "Loading..." : "Cargando..."}
          </span>
        ) : (
          <span>{language === "en" ? "Load More" : "Cargar Más"}</span>
        )}
      </button>
    </div>
  )}

  {/* No More Data Message */}
  {!hasMoreData && filteredRestaurants?.length >= 10 && (
    <div className="text-center mt-6 mb-5">
      <p className="text-gray-500">
        {language === "en"
          ? "No more restaurants to load."
          : "No hay más restaurantes para cargar."}
      </p>
    </div>
  )}

{selectedMenu && !loading && filteredRestaurants?.length === 0 && (
  <div className="text-center mt-4">
    <p className="text-gray-500">
      {language === "en"
        ? "No results found for the selected option. Please try a different selection."
        : "No se encontraron resultados para la opción seleccionada. Por favor, intenta con una diferente."}
    </p>
  </div>
)}

  {!selectedMenu && !hardRefresh && filteredRestaurants?.length === 0 && (
    <div className="text-center mt-4">
      <p className="text-gray-500">
        {language === "en"
          ? "No menu found. Please try again later."
          : "No se encontró ningún menú. Por favor, inténtelo de nuevo más tarde."}
      </p>
    </div>
  )}

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