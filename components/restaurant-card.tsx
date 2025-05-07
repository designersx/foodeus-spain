// "use client"
// import { useEffect, useState } from "react";
// import { useRouter } from 'next/navigation';
// import Image from "next/image"
// import Link from "next/link"
// import { useLanguage } from "@/context/language-context"
// import { API_BASE_URL, apiClient } from "@/services/apiService"
// import { Badge } from "@/components/ui/badge"
// import { Edit, Plus, Search, Star } from "lucide-react"
// import { getMenuImagePath } from "@/utils/getImagePath"
// import RegisterPromptModal from "./register-popup-modal";
// interface Restaurant {
//   id: string
//   name: string
//   location: string
//   rating?: string | number;  // 👈 add or confirm this field
//   ratings?: string | number;
//   coordinates: {
//     lat: number
//     lng: number
//   }
//   menu: {
//     title: {
//       en: string
//       es: string
//     }
//     description: {
//       en: string
//       es: string
//     }
//     image: string,
//     menu_id?: string | number;
//     menu_type?: any;
//     updated_at?: any
//   }
//   distance?: number
// }
// export function RestaurantCard({ restaurant, distance }: { restaurant: Restaurant; distance?: number }) {
//   const { language } = useLanguage()
//   const [src, setSrc] = useState<string>(getMenuImagePath(restaurant?.menu.image));
//   const [mapUrl, setMapUrl] = useState<string>("")
//   const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   // Format distance to show in km or m
//   console.log('restaurant',restaurant)
//   const formatDistance = (distance?: number) => {
//     if (distance === undefined) return ""

//     if (distance < 1) {
//       // If less than 1 km, show in meters
//       return `${Math.round(distance * 1000)}m`
//     } else {
//       // Otherwise show in kilometers with 1 decimal place
//       return `${distance.toFixed(1)}km`
//     }
//   }
//   const isValidUrl = (url: string) => {
//     const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
//     return pattern.test(url);
//   };
//   const navigateMeThere = () => {
//     setIsLoading(true);
//     const setUserLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

//     if (setUserLocation && setUserLocation.lat) {
//       console.log("User Location Latitude:", setUserLocation.lat);

//       const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${setUserLocation.lat},${setUserLocation.lng}&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&travelmode=driving`;
//       window.open(directionsUrl, "_blank");
//     } else {
//       console.log("User Location not found in localStorage.");
//     }
//   };
//   return (
//     <>
//       <div className="text-decoration-none text-dark">
//         <div className="card mb-3 mainClass">
//           <div className="dishControl" style={{ height: "" }}>
//             <div className="dishImage ">
//               <Image
//                 src={src}
//                 alt={restaurant?.menu.title[language]}
//                 onError={() => setSrc("https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg")}
//                 fill
//                 className=""
//                 quality={75} // optional, adjusts the quality of the image
//                 placeholder="blur" // Show a blurred image placeholder while loading
//                 blurDataURL={src} // Optional: Add a small, low-quality image or base64-encoded version here
//               />
//               <span className="dishPrice"> € {restaurant?.menu?.price}

//               </span>

//             </div>
//             <div className="dishContent">

//               <div className="card-body h-100 foodDescription  text-left text-transform: capitalize text-capitalize" style={{ textAlign: "left" }}>
//                 <div className="MeniList">

//                   <div className="MeneSequence">
//                     {['MainDish', 'Starter', 'Drinks', 'Dessert'].map((type) => {
//                       // Filter items based on type
//                       const itemsOfType = restaurant?.menu?.items?.filter(
//                         (item) => item.item_type === type
//                       );

//                       if (itemsOfType?.length > 0) {
//                         // Track if we have already displayed the first item of this type
//                         let isFirstItemDisplayed = false;

//                         return (
//                           <div key={type}>
//                             {/* Render a section for each type */}
//                             <div className="flex gap-3 flex-wrap">
//                               {itemsOfType.map((item, index) => {
//                                 // Display only the first item for each type
//                                 if (!isFirstItemDisplayed) {
//                                   isFirstItemDisplayed = true; // Mark the first item as displayed

//                                   // Count how many times this item appears in the items list
//                                   const itemCount = restaurant.menu.items.filter(
//                                     (i) => i.item_type === type
//                                   ).length;

//                                   return (
//                                     <span
//                                       className="item-label"
//                                       style={{
//                                         backgroundColor:
//                                           type === "MainDish"
//                                             ? "#D7EED0"
//                                             : type === "Starter"
//                                               ? "#EEE7D0"
//                                               : type === "Drinks"
//                                                 ? "#EED0D0"
//                                                 : "#D0E1EE",
//                                       }}
//                                       key={`${type}-${index}`}
//                                     >
//                                       {item.item_name}
//                                       {/* If more than one item with the same name, show quantity */}
//                                       {type === "Main Course" && itemCount > 1 && (
//                                         <span className="DishQuanty">+{itemCount - 1}</span>
//                                       )}
//                                     </span>
//                                   );
//                                 }
//                                 return null; // Skip rendering any subsequent items of the same type
//                               })}
//                             </div>
//                           </div>
//                         );
//                       }
//                       return null;
//                     })}
//                   </div>

//                 </div>
//                 <div className="resturantLoc  w-100">
//                   <div>
//                     <span className="flex items-center gap-2 text-sm font-medium restaurantMenu">
//                       <span className="resName">{restaurant?.name.slice(0, 20)}</span>
//                       <span className="flex items-center gap-1 starWidth" >
//                         <Star className="h-3 w-3" style={{ color: "#FFD700", fill: "#FFD700" }} />
//                         {restaurant?.rating}
//                       </span>
//                     </span>
//                     <div className="restDistance">
//                       <p className="card-text small text-secondary d-flex align-items-center mb-0">
//                         <i className="bi bi-geo-alt me-1 small"></i>
//                         <span className="resName">
//                           {restaurant?.location}
//                         </span>
//                       </p>
//                       {distance !== undefined && (
//                         <div className="small fw-medium text-primary restDistance" onClick={(e) => {
//                           e.stopPropagation();
//                           navigateMeThere();
//                         }}>
//                           {/* <span >{formatDistance(distance)}</span> */}
//                           <span>{distance}km</span>
//                         </div>
//                       )}
//                     </div>

//                   </div>

//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <hr />
//     </>
//   )
// }


"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
import { API_BASE_URL, apiClient } from "@/services/apiService"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Search, Star } from "lucide-react"
import { getMenuImagePath } from "@/utils/getImagePath"
import RegisterPromptModal from "./register-popup-modal";
interface Restaurant {
  id: string
  name: string
  location: string
  rating?: string | number;  // 👈 add or confirm this field
  ratings?: string | number;
  coordinates: {
    lat: number
    lng: number
  }
  menu: {
    title: {
      en: string
      es: string
    }
    description: {
      en: string
      es: string
    }
    image: string,
    menu_id?: string | number;
    menu_type?: any;
    updated_at?: any
  }
  distance?: number
}
export function RestaurantCard({ restaurant, distance }: { restaurant: Restaurant; distance?: number }) {
  const { language } = useLanguage()
  const [src, setSrc] = useState<string>(getMenuImagePath(restaurant?.menu[0].image));
  const [mapUrl, setMapUrl] = useState<string>("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  // Format distance to show in km or m
  console.log('restaurant card',restaurant)
  const isValidUrl = (url: string) => {
    const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
    return pattern.test(url);
  };
  const navigateMeThere = () => {
    setIsLoading(true);
    const setUserLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

    if (setUserLocation && setUserLocation.lat) {
      // console.log("User Location Latitude:", setUserLocation.lat);

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${setUserLocation.lat},${setUserLocation.lng}&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&travelmode=driving`;
      window.open(directionsUrl, "_blank");
    } else {
      console.log("User Location not found in localStorage.");
    }
  };
  return (
    <>
      <div className="text-decoration-none text-dark">
        <div className="card mb-3 mainClass">
          <div className="dishControl" style={{ height: "" }}>
            <div className="dishImage ">
              <Image
                src={src}
                alt={restaurant?.menu[0].title[language]}
                onError={() => setSrc("https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg")}
                fill
                className=""
                quality={75} // optional, adjusts the quality of the image
                placeholder="blur" // Show a blurred image placeholder while loading
                blurDataURL={src} // Optional: Add a small, low-quality image or base64-encoded version here
              />
              <span className="dishPrice"> € {restaurant?.menu[0]?.price}

              </span>

            </div>
            <div className="dishContent">

              <div className="card-body h-100 foodDescription  text-left text-transform: capitalize text-capitalize" style={{ textAlign: "left" }}>
                <div className="MeniList">

                  <div className="MeneSequence">
                    {['MainDish', 'Starter', 'Drinks', 'Dessert'].map((type) => {
                      // Filter items based on type
                      const itemsOfType = restaurant?.menu[0]?.items?.filter(
                        (item) => item.item_type === type
                      );

                      if (itemsOfType?.length > 0) {
                        // Track if we have already displayed the first item of this type
                        let isFirstItemDisplayed = false;

                        return (
                          <div key={type}>
                            {/* Render a section for each type */}
                            <div className="flex gap-3 flex-wrap">
                              {itemsOfType.map((item, index) => {
                                // Display only the first item for each type
                                if (!isFirstItemDisplayed) {
                                  isFirstItemDisplayed = true; // Mark the first item as displayed

                                  // Count how many times this item appears in the items list
                                  const itemCount = restaurant.menu[0].items.filter(
                                    (i) => i.item_type === type
                                  ).length;

                                  return (
                                    <span
                                      className="item-label"
                                      style={{
                                        backgroundColor:
                                          type === "MainDish"
                                            ? "#D7EED0"
                                            : type === "Starter"
                                              ? "#EEE7D0"
                                              : type === "Drinks"
                                                ? "#EED0D0"
                                                : "#D0E1EE",
                                      }}
                                      key={`${type}-${index}`}
                                    >
                                      {item.item_name}
                                      {/* If more than one item with the same name, show quantity */}
                                      {type === "Main Course" && itemCount > 1 && (
                                        <span className="DishQuanty">+{itemCount - 1}</span>
                                      )}
                                    </span>
                                  );
                                }
                                return null; // Skip rendering any subsequent items of the same type
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                </div>
                <div className="resturantLoc  w-100">
                  <div>
                    <span className="flex items-center gap-2 text-sm font-medium restaurantMenu">
                      <span className="resName">{restaurant?.name.slice(0, 20)}</span>
                      <span className="flex items-center gap-1 starWidth" >
                        <Star className="h-3 w-3" style={{ color: "#FFD700", fill: "#FFD700" }} />
                        {restaurant?.rating}
                      </span>
                    </span>
                    <div className="restDistance">
                      <p className="card-text small text-secondary d-flex align-items-center mb-0">
                        <i className="bi bi-geo-alt me-1 small"></i>
                        <span className="resName">
                          {restaurant?.location}
                        </span>
                      </p>
                      {distance !== undefined && (
                        <div className="small fw-medium text-primary restDistance" onClick={(e) => {
                          e.stopPropagation();
                          navigateMeThere();
                        }}>
                          <span>{distance?.toFixed(1)}km</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </>
  )
}

