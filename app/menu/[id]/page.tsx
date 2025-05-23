// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { useParams } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { useLanguage } from "@/context/language-context";
// import { API_BASE_URL, getRestaurantById } from "@/services/apiService";
// import { getMenuImagePath } from "@/utils/getImagePath";
// import { Edit, Plus, Search, Star } from "lucide-react";
// import { apiClient } from "@/services/apiService";
// import { useSearchParams } from "next/navigation";

// interface MenuItem {
//   title: { en: string; es: string };
//   description: { en: string; es: string };
//   image: string;
//   items: { en: string; es: string }[];
//   price: { en: string; es: string };
//   menu_type?: string;
//   updated_at?: any;
// }

// interface location {
//   lat: number;
//   lng: number;
// }
// interface Restaurant {
//   id: string;
//   name: string;
//   location: location | any;
//   coordinates: { lat: number; lng: number };
//   menu: MenuItem[];
//   ratings?: string | number;
//   totalRating?: string | number;
// }

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
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// export default function MenuDetailPage() {
//   const { id } = useParams();
//   const { language } = useLanguage();
//   const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
//   const [menuItems, setMenuItems] = useState<Restaurant | null>(null);
//   const [data, setdata] = useState<Restaurant | null>(null);
//   const [userLocation, setUserLocation] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);
//   const [distanceToRestaurant, setDistanceToRestaurant] = useState<
//     number | null
//   >(null);
//   const [mapUrl, setMapUrl] = useState<string>("");
//   const [src, setSrc] = useState<string>(getMenuImagePath(menuItem?.image));
//   const searchParams = useSearchParams();
//   const menuId =    searchParams.get("menuId") || localStorage.getItem("lastMenuId");
//   const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

//   useEffect(() => {

//     const storedData = sessionStorage.getItem("selectedRestaurant");
//     if (storedData) {
//       setMenuItems(JSON.parse(storedData));
//     } else {
//       // fallback if not found
//       console.warn("No restaurant data found in sessionStorage");
//     }

//   }, [id]);


//   useEffect(() => {
//     if (menuItems && menuItems.menu) {
//       if (menuItems.menu) {
//         setMenuItem(menuItems?.menu);
//         setSrc(menuItems?.menu?.image);
//       }
//     }
//   }, [id, menuItems]);

//   useEffect(() => {
//     const getLocationAsync = async () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error("Error getting user location:", error);
//         }
//       );
//     }
//   }
//  getLocationAsync 
//   }, []);

//   useEffect(() => {
//     const userloc = JSON.parse(localStorage.getItem("userLocation") || "{}");
//     if (menuItems && userLocation) {

//       const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userloc?.lat},${userloc?.lng}&destination=${menuItems?.coordinates?.lat},${menuItems?.coordinates?.lng}&travelmode=driving`;
//       setMapUrl(directionsUrl);
//     }
//   }, [userLocation, menuItems]);

//   if (!menuItem) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "50vh" }}
//       >
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   const isValidUrl = (url: string) => {
//     const pattern = new RegExp("^(https?:\\/\\/)");
//     return pattern.test(url);
//   };

//   const formatTotalRatings = (count: number): string => {
//     if (count >= 1000) {
//       const formatted = (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1);
//       return `${formatted}k+`;
//     }
//     return `${count}`;
//   };

//   const handleShowFullMenu = () => {
//     // Save menu to session storage
//     if (menuItem) {
//       sessionStorage.setItem('fullMenu', JSON.stringify(menuItem));
//     }
//   };

//   return (
//     <>
//       <div className="w-full min-h-screen overflow-hidden">
//         <div className="pb-5 mb-5">
//           {/* Back button */}
//           <Link
//             href="/"
//             className="d-inline-flex align-items-center text-decoration-none mb-3"
//           >
//             <i className="bi bi-chevron-left me-1"></i>
//             {language === "en" ? "Back" : "Atrás"}
//           </Link>

//           {/* Hero image */}
//           <div
//             className="position-relative rounded overflow-hidden mb-4"
//             style={{ height: "250px" }}
//           >
//             <Image
//               src={getMenuImagePath(src)}
//               alt={menuItem?.title[language]}
//               onError={(e) => {
//                 const target = e.target as HTMLImageElement;
//                 target.onerror = null;
//                 target.src =
//                   "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
//               }}
//               fill
//               className="object-cover"
//               style={{ filter: "brightness(75%)" }}
//               // loading="lazy"
//             />
//             <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-gradient-dark">
//               <h1
//                 className="text-white fs-3 fw-bold mb-0 text-capitalize resName"
//                 style={{
//                   wordBreak: "break-all", // Breaks long words that have no spaces
//                   overflowWrap: "break-word", // Handles text wrapping
//                   whiteSpace: "normal", // Allows text to wrap normally
//                 }}
//               >
//                 {menuItem?.title[language]
//                   ? menuItem?.title[language]
//                   : language === "en"
//                   ? "Menu not Available"
//                   : "Menú no disponible"}
//               </h1>
//               <div className="d-flex align-items-center text-white-50 small mt-1">
//                 <i className="bi bi-geo-alt me-1"></i>
//                 {menuItems?.name} - {menuItems?.location}
//               </div>
//             </div>
//           </div>

//           {/* Price */}
//           <div className="flex justify-between align-items-center mb-1">
//             <div className="fs-3 fw-bold text-primary">
//               {}
//               {menuItem?.price && parseFloat(menuItem.price) > 0
//                 ? `€ ${menuItem.price}`
//                 : language === "en"
//                 ? "Not Available"
//                 : "No Disponible"}
//             </div>

//             {menuItems?.distance !== null && (
//               <div className="text-muted text-sm">
//                 <i className="bi bi-geo-alt me-1"></i>
//                 {language === "es" ? "Distancia" : "Distance"}:{" "}
//                 {menuItems?.distance?.toFixed(1)}km
//               </div>
//             )}
//           </div>

//           {/* ratings & Description */}
//           <div className="mb-4">
//             <span className="flex items-center gap-1 text-sm text-muted-foreground">
//               <Star
//                 className="h-3 w-3"
//                 style={{ color: "#FFD700", fill: "#FFD700" }}
//               />
//               {menuItems?.rating}{" "}

//               {menuItems?.total_ratings != null && menuItems?.total_ratings !== "" && (
//                 <>
//                   ({formatTotalRatings(Number(menuItems?.total_ratings))} {language === "es" ? "valoraciones" : "ratings"})
//                 </>
//               )}
//             </span>
//             <h2 className="fs-4 fw-semibold mb-2">
//               {language === "en" ? "Description" : "Descripción"}
//             </h2>
//             <p
//               className="text-secondary "
//               style={{
//                 wordBreak: "break-all", // Breaks long words that have no spaces
//                 overflowWrap: "anywhere", // Handles text wrapping
//                 whiteSpace: "normal", // Allows text to wrap normally
//               }}
//             >
//               {menuItem.description[language] &&
//               menuItem.description[language]?.length > 150
//                 ? `${menuItem.description[language].substring(0, 150)}...`
//                 : menuItem.description[language] ||
//                   (language === "en" ? "Not Available" : "No Disponible")}
//             </p>
//           </div>

//           {/* Menu items */}
//           <div className="mb-4">
//             <h2 className="fs-4 fw-semibold mb-2">
//               {language === "en" ? "Includes" : "Incluye"}
//             </h2>
//             <ul className="list-unstyled">
//               {menuItem.items?.length > 0 ? (
//                 menuItem.items?.map((item: any, index: number) => (
//                   <div className="card mb-3" key={index}>
//                     <div className="card-body">
//                       <div className="d-flex gap-3">
//                         <div
//                           className="position-relative"
//                           style={{
//                             width: "60px",
//                             height: "60px",
//                             flexShrink: 0,
//                           }}
//                         >
//                           <Image
//                             src={getMenuImagePath(item?.image_url)}
//                             alt={item.item_name || "Item"}
//                             onError={(e) => {
//                               e.currentTarget.src =
//                                 "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
//                             }}
//                             fill
//                             className="object-fit-cover rounded"
//                             // loading="lazy"
//                           />
//                         </div>
//                         <div className="flex-grow-1">
//                           <h5 className="fs-6 fw-bold resName" style={{
//                               wordBreak: "break-all", // Breaks long words that have no spaces
//                               overflowWrap: "break-word", // Handles text wrapping
//                               whiteSpace: "normal", // Allows text to wrap normally
//                             }}>
//                             {" "}
//                             {item.item_name?item.item_name:""}
//                           </h5>
//                           <p
//                             className="small text-secondary mb-1 resName "
//                             style={{
//                               wordBreak: "break-all", // Breaks long words that have no spaces
//                               overflowWrap: "break-word", // Handles text wrapping
//                               whiteSpace: "normal", // Allows text to wrap normally
//                             }}
//                           >
//                             {item?.description?item?.description:""}
//                           </p>
//                           {/* <p className="text-primary fw-medium mb-0">{item.price}</p> */}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <li className="text-muted">
//                   {language === "en" ? "Not Available" : "No Disponible"}
//                 </li>
//               )}
//             </ul>
//           </div>
//         </div>
//         <div className="fixed-bottom bg-white border-top p-3">
//           <div className="container p-0">
//             <div className="row g-2">
//               <div className="col-sm-6 col-6 Navigate_btn">

//                 <button 
//                   onClick={() => window.open(mapUrl, "_blank")}
//                   className="btn btn-primary w-100"
//                 >
//                   {language === "en" ? "Take Me There" : "Llévame Allí"}
//                 </button>
//               </div>

//               <div className="col-sm-6 col-6">
//                 <Link
//                   href={{
//                     pathname: `/full-menu/${id}`,
//                     query: { menuId },
//                   }}

//                 >
//                   <button className="btn btn-outline-primary w-100" onClick={handleShowFullMenu}>
//                     {language === "en"
//                       ? "Show Full Menu"
//                       : "Mostrar Menú Completo"}
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { API_BASE_URL, getRestaurantById } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";
import { Edit, Plus, Search, Star } from "lucide-react";
import { apiClient } from "@/services/apiService";
import { useSearchParams } from "next/navigation";

interface MenuItem {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items: { en: string; es: string }[];
  price: { en: string; es: string };
  menu_type?: string;
  updated_at?: any;
  start_time:string;
  end_time:string;
  rating:string;
  total_ratings:string;
}

interface location {
  lat: number;
  lng: number;
}
interface Restaurant {
  id: string;
  name: string;
  location: location | any;
  coordinates: { lat: number; lng: number };
  menu: MenuItem[];
  rating?: string | number;
  total_ratings?: string | number;
  distance:string;
}

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2?: number,
  lng2?: number
) => {
  if (!lat2 || !lng2) return Number.MAX_VALUE;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MenuDetailPage() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<Restaurant | null>(null);
  const [data, setdata] = useState<Restaurant | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceToRestaurant, setDistanceToRestaurant] = useState<
    number | null
  >(null);
  const [mapUrl, setMapUrl] = useState<string>("");
  const [src, setSrc] = useState<string>(getMenuImagePath(menuItem?.image));
  const searchParams = useSearchParams();
  const menuId = searchParams.get("menuId") || localStorage.getItem("lastMenuId") || null;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {

    const storedData = sessionStorage.getItem("selectedRestaurant");
    if (storedData) {
      setMenuItems(JSON.parse(storedData));
    } else {
      // fallback if not found
      console.warn("No restaurant data found in sessionStorage");
    }

  }, [id]);

 
  useEffect(() => {
    if (menuItems && Array.isArray(menuItems.menu) && menuItems.menu.length > 0) {
      // Merge all items from each menu into one flat array
      const mergedMenuItems = menuItems?.menu?.flatMap(menu => menu.items || []);
      // console.log('mergedMenuItems', mergedMenuItems)
      setMenuItem(mergedMenuItems);

      // Set image src from the first menu (optional: you can customize this)
      if (menuItems.menu[0]?.image) {
        setSrc(menuItems?.menu[0].image);
      }
    }
  }, [id, menuItems]);

  // console.log('menuitem', menuItem)
  useEffect(() => {
    const getLocationAsync = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting user location:", error);
          }
        );
      }
    }
    getLocationAsync
  }, []);

  useEffect(() => {
    const userloc = JSON.parse(localStorage.getItem("userLocation") || "{}");
    if (menuItems && (userLocation || userloc)) {

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userloc?.lat},${userloc?.lng}&destination=${menuItems?.coordinates?.lat},${menuItems?.coordinates?.lng}&travelmode=driving`;
      setMapUrl(directionsUrl);
    }
  }, [userLocation, menuItems]);

  if (!menuItem) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  const isValidUrl = (url: string) => {
    const pattern = new RegExp("^(https?:\\/\\/)");
    return pattern.test(url);
  };

  const formatTotalRatings = (count: number): string => {
    if (count >= 1000) {
      const formatted = (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1);
      return `${formatted}k+`;
    }
    return `${count}`;
  };

  const handleShowFullMenu = () => {
    // Save menu to session storage
    if (menuItem) {
      sessionStorage.setItem('fullMenu', JSON.stringify(menuItem));
    }
  };

  const convertAmPm = (time: string | number): string => {
    const numericTime = parseInt(time.toString(), 10);

    if (isNaN(numericTime) || numericTime < 0 || numericTime > 23) {
      return "Invalid time";
    }

    const hour12 = numericTime % 12 === 0 ? 12 : numericTime % 12;
    const period = numericTime < 12 ? "AM" : "PM";
    const formattedHour = hour12.toString().padStart(2, "0");

    return `${formattedHour} ${period}`;
  };
  // console.log('menuItems', menuItems)

  return (
    <>
      <div className="w-full min-h-screen overflow-hidden">
        <div className="pb-5 mb-5">
          {/* Back button */}
          <Link
            href="/"
            className="d-inline-flex align-items-center text-decoration-none mb-3"
          >
            <i className="bi bi-chevron-left me-1"></i>
            {language === "en" ? "Back" : "Atrás"}
          </Link>

          {/* Hero image */}
          <div
            className="position-relative rounded overflow-hidden mb-4"
            style={{ height: "250px" }}
          >
            <Image
              src={getMenuImagePath(src)}
              alt={menuItems?.menu[0]?.title[language]}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
              }}
              fill
              className="object-cover"
              style={{ filter: "brightness(75%)" }}
            // loading="lazy"
            />
            <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-gradient-dark">
              <div className="d-flex align-items-center text-white-50 small mt-1">
                <i className="bi bi-geo-alt me-1"></i>
                {menuItems?.name} - {menuItems?.location}
              </div>
            </div>
          </div>


          {/* ratings & distance */}
          <div className="mb-4 flex justify-between">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star
                className="h-3 w-3"
                style={{ color: "#FFD700", fill: "#FFD700" }}
              />
              {menuItems?.rating}{" "}

              {menuItems?.total_ratings != null && menuItems?.total_ratings !== "" && (
                <>
                  ({formatTotalRatings(Number(menuItems?.total_ratings))} {language === "es" ? "valoraciones" : "ratings"})
                </>
              )}
            </span>
            {menuItems?.distance !== null && (
              <div className="text-muted text-sm">
                <i className="bi bi-geo-alt me-1"></i>
                {language === "es" ? "Distancia" : "Distance"}:{" "}
                {menuItems?.distance?.toFixed(1)}km
              </div>
            )}
          </div>
          {/* Menu cards   */}
          {menuItems?.menu?.map((menuItem, cIndex) => {
            // console.log('menuItem', menuItem.menu_id)
            return (
              <>
                <div className="card mb-3" key={cIndex}>
                  <div className="card-body"> 
                    {menuItem?.start_time && menuItem?.end_time &&
                      <div className="flex justify-end text-xs">
                        {t('ServingHours')} {convertAmPm(menuItem?.start_time)} - {convertAmPm(menuItem?.end_time)}
                      </div>
                    }
                    {/* Title Price */}
                    <div className="flex justify-between align-items-center mb-1 text-capitalize">
                      <div className="fs-3 fw-bold text-primary resName">
                        { }
                        {menuItem?.title
                          ? `${menuItem.title[language]}`
                          : language === "en"
                            ? "Not Available"
                            : "No Disponible"}
                      </div>
                      {menuItem?.price && parseFloat(menuItem?.price) > 0
                        ? `€${menuItem.price}`
                        : language === "en"
                          ? "Not Available"
                          : "No Disponible"}
                    </div>
                    {menuItem.description[language] && (
                      <>
                        <h2 className="fs-4 fw-semibold mb-2">
                          {language === "en" ? "Description" : "Descripción"}
                        </h2>
                        <p
                          className="text-secondary "
                          style={{
                            wordBreak: "break-all", 
                            overflowWrap: "anywhere",
                            whiteSpace: "normal", 
                          }}
                        >
                          {menuItem.description[language] &&
                            menuItem.description[language]?.length > 150
                            ? `${menuItem.description[language].substring(0, 150)}...`
                            : menuItem.description[language] ||
                            (language === "en" ? "Not Available" : "No Disponible")}
                        </p>
                      </>
                    )}
                    {/* Menu items */}
                    <div className="mb-4">
                      <h2 className="fs-4 fw-semibold mb-2">
                        {language === "en" ? "Includes" : "Incluye"}
                      </h2>
                      <ul className="list-unstyled">
                        {menuItem?.items?.length > 0 ? (
                          menuItem?.items?.map((item: any, index: number) => (
                            <div className="d-flex gap-3" key={item.id}>
                              <div
                                className="position-relative"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  flexShrink: 0,
                                }}
                              >
                                <Image
                                  src={getMenuImagePath(item?.image_url)}
                                  alt={item.item_name || "Item"}
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
                                  }}
                                  fill
                                  className="object-fit-cover rounded"
                                // loading="lazy"
                                />
                              </div>
                              <div className="flex-grow-1">
                                <h5 className="fs-6 fw-bold resName" style={{
                                  wordBreak: "break-all", // Breaks long words that have no spaces
                                  overflowWrap: "break-word", // Handles text wrapping
                                  whiteSpace: "normal", // Allows text to wrap normally
                                }}>
                                  {" "}
                                  {item.item_name ? item.item_name : ""}
                                </h5>
                                <p
                                  className="small text-secondary mb-1 resName "
                                  style={{
                                    wordBreak: "break-all", // Breaks long words that have no spaces
                                    overflowWrap: "break-word", // Handles text wrapping
                                    whiteSpace: "normal", // Allows text to wrap normally
                                  }}
                                >
                                  {item?.description ? item?.description : ""}
                                </p>
                              </div>
                              <div>
                                <span style={{
                                  padding: "2px 2px",
                                  borderRadius: "5px",
                                  backgroundColor:
                                    item?.item_type === "MainDish"
                                      ? "#D7EED0"
                                      : item?.item_type === "Starter"
                                        ? "#EEE7D0"
                                        : item?.item_type === "Drinks"
                                          ? "#EED0D0"
                                          : "#D0E1EE",
                                }}>{item?.item_type}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <li className="text-muted">
                            {language === "en" ? "Not Available" : "No Disponible"}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )
          })}
        </div>
        <div className="fixed-bottom bg-white border-top p-3">
          <div className="container p-0">
            <div className="row g-2">
              <div className="col-sm-6 col-6 Navigate_btn">
                <button
                  onClick={() => window.open(mapUrl, "_blank")}
                  className="btn btn-primary w-100"
                >
                  {language === "en" ? "Take Me There" : "Llévame Allí"}
                </button>
              </div>

              <div className="col-sm-6 col-6">
                <Link
                  href={{
                    pathname: `/full-menu/${id}`,
                    // query: { menuId },
                  }}
                >
                  <button className="btn btn-outline-primary w-100" onClick={handleShowFullMenu}>
                    {language === "en"
                      ? "Show Full Menu"
                      : "Mostrar Menú Completo"}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}