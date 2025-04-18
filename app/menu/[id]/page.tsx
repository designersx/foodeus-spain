"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
import { API_BASE_URL, getRestaurantById } from "@/services/apiService"
import { getMenuImagePath } from "@/utils/getImagePath"
import { Edit, Plus, Search, Star } from "lucide-react"

interface MenuItem {
  title: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
  items: { en: string; es: string }[];
  price: { en: string; es: string };
  menu_type?: string;
  updated_at?: any
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
  ratings?: string | number;
  totalRating?: string | number;
}


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

export default function MenuDetailPage() {
  const { id, } = useParams()
  const { language } = useLanguage()
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<Restaurant | null>(null);
  const [data, setdata] = useState<Restaurant | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToRestaurant, setDistanceToRestaurant] = useState<number | null>(null);
  const [mapUrl, setMapUrl] = useState<string>("")
  const [src, setSrc] = useState<string>(getMenuImagePath(menuItem?.image));
   
  useEffect(() => {
    if (id) {
      getRestaurantById(`${id}`)
        .then((data) => {
          // console.log("API Response:", data);

          if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
            const restaurant = data.data;
       
            const sortedMenus = restaurant.menus
              ? [...restaurant.menus].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              : [];

            // Format menus to match frontend structure
            const formattedMenus: MenuItem[] = sortedMenus.map((menu) => ({
              title: { en: menu.item_name || "", es: menu.item_name || "" },
              description: { en: menu.description || "", es: menu.description || "" },
              image: menu.image_url || "",
              items: menu.item_list || [], // Assuming item_list is an array of strings
              price: {
                en: `€${Number(menu.price).toFixed(2)}`,
                es: `€${(Number(menu.price)).toFixed(2)}`,
              },
              updated_at: menu.updated_at,
              menu_type: menu.menu_type,
            }));
            setdata(restaurant)
            setMenuItems({
              id: restaurant.restaurant_id || "",
              name: restaurant.name || "",
              location: restaurant.address || "",
              coordinates: {
                lat: restaurant?.latitude || "",
                lng: restaurant?.longitude || "",
              },
              menu: formattedMenus,
            });
          } else {
            console.error("Unexpected API response format:", data);
          }
        })
        .catch((err) => console.error("Error fetching restaurant details:", err));
    }
  }, [id]);


  useEffect(() => {
    if (menuItems && menuItems.menu?.length > 0) {
      let selectedItem = null;

      // Step 2: Fallback to "Today's Special" updated today
      if (!selectedItem) {
        const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
        selectedItem = menuItems.menu.find(
          (item) =>
            item.menu_type === "Today's Special" &&
            item.updated_at?.split(" ")[0] === today
        );
      }

      // Step 3: Fallback to most recently updated
      if (!selectedItem) {
        selectedItem = [...menuItems.menu].sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })[0];
      }

      if (selectedItem) {
        setMenuItem(selectedItem);
        setSrc(selectedItem.image);
      }
    }
  }, [id, menuItems]);


  useEffect(() => {
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
    
  }, []);

  useEffect(() => {
    const userloc = JSON.parse(localStorage.getItem("userLocation") || "{}");
    if (menuItems && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        menuItems.coordinates.lat,
        menuItems.coordinates.lng
      );
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userloc?.lat},${userloc?.lng}&destination=${menuItems?.coordinates?.lat},${menuItems?.coordinates?.lng}&travelmode=driving`
      setMapUrl(directionsUrl)
      setDistanceToRestaurant(distance);
    }
  }, [userLocation, menuItems]);

  if (!menuItem) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  const isValidUrl = (url: string) => {
    const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
    return pattern.test(url);
  };

  const formatTotalRatings = (count: number) => {
    const rounded = Math.floor(count / 10) * 10;
    return `${rounded}+`;
  };
  // console.log('sss',mapUrl)
  return (
    <>
      <div className="pb-5 mb-5">
        {/* Back button */} 
        <Link href="/" className="d-inline-flex align-items-center text-decoration-none mb-3">
          <i className="bi bi-chevron-left me-1"></i>
          Back
        </Link>

        {/* Hero image */}
        <div className="position-relative rounded overflow-hidden mb-4" style={{ height: "250px" }}>
          <Image
          src={getMenuImagePath(src)}
            // src={
            //   isValidUrl(src)
            //     ? src
            //     : src.includes("/public")
            //       ? `${API_BASE_URL}/${src.split("/public")[1]}`
            //       : `${API_BASE_URL}/${src}`
            //         ? src : ""
            // }
            alt={menuItem?.title[language]}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // prevent infinite loop if fallback also fails
              target.src = '/Images/fallback.jpg';
            }}
            fill
            className="object-cover"
            style={{ filter: "brightness(75%)" }}
            loading="lazy"
          />
          <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-gradient-dark">
            <h1 className="text-white fs-3 fw-bold mb-0 text-capitalize">{menuItem?.title[language]
              ? menuItem?.title[language]
              : language === "en"
                ? "Menu not Available"
                : "Menú no disponible"}
            </h1>
            <div className="d-flex align-items-center text-white-50 small mt-1">
              <i className="bi bi-geo-alt me-1"></i>
              {menuItems?.name} - {menuItems?.location}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between align-items-center mb-1">
          <div className="fs-3 fw-bold text-primary">
            { }
            {menuItem?.price[language] ? menuItem?.price[language] : language === "en" ? "Not Available" : "No Disponible"}
          </div>

          {distanceToRestaurant !== null && (
            <div className="text-muted text-sm">
              <i className="bi bi-geo-alt me-1"></i>
              {language === "es" ? "Distancia" : "Distance"}: {distanceToRestaurant?.toFixed(1)} km
            </div>
          )}
        </div>

        {/* ratings & Description */}
        <div className="mb-4">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3 w-3" style={{ color: "#FFD700", fill: "#FFD700" }} />
            {data?.ratings}{" "}
            {`(${formatTotalRatings(Number(data?.totalRating))} ${language === "es" ? "valoraciones" : "ratings"
              })`}
          </span>
          <h2 className="fs-4 fw-semibold mb-2">{language === "en" ? "Description" : "Descripción"}</h2>
          <p className="text-secondary">{menuItem.description[language] ? menuItem.description[language] : language === "en" ? "Not Available" : "No Disponible"}</p>
        </div>

        {/* Menu items */}
        <div className="mb-4">
          <h2 className="fs-4 fw-semibold mb-2">{language === "en" ? "Includes" : "Incluye"}</h2>
          <ul className="list-unstyled">
            {menuItem.items.length > 0 ? (
              menuItem.items?.map((item: any, index: number) => (
                <div className="card mb-3" key={index}>
                  <div className="card-body">
                    <div className="d-flex gap-3">
                      <div className="position-relative" style={{ width: "60px", height: "60px", flexShrink: 0 }}>
                        <Image
                          src={getMenuImagePath(item.image)} // Use item.image here for dynamic content
                          alt={item.name || "Item"}  // Use item.name here for dynamic content
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // prevent infinite loop
                            target.src = "/Images/fallback.jpg";
                          }}
                          fill
                          className="object-fit-cover rounded"
                             loading="lazy"
                        />
                      </div>
                      <div>
                        <h5 className="fs-6 fw-bold">{item.name}</h5>
                        <p className="small text-secondary mb-1">{item.description}</p>
                        {/* <p className="text-primary fw-medium mb-0">{item.price}</p> */}
                      </div>
                    </div>
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

      {/* Action buttons - fixed at bottom */}
      <div className="fixed-bottom bg-white border-top p-3">
        <div className="container p-0">
          <div className="row g-2">
            {/* <div className="col-sm-6 col-12" >
               <a href={mapUrl} target="_blank" rel="noopener noreferrer" 
                 className="btn btn-primary w-100">
                {language === "en" ? "Take Me There" : "Llévame Allí"}
                </a>
            </div>
            <div className="col-sm-6 col-12" >
              <Link href={`/full-menu/${menuItems?.id}`} className="btn btn-outline-primary w-100">
                {language === "en" ? "Show Full Menu" : "Mostrar Menú Completo"}
              </Link>
            </div> */}
            <div className="col-sm-6 col-6">
              <button
                type="button"
                onClick={() => window.open(mapUrl, "_blank")}
                className="btn btn-primary w-100"
              >
                {language === "en" ? "Take Me There" : "Llévame Allí"}
              </button>
            </div>
            <div className="col-sm-6 col-6">
              <Link href={`/full-menu/${menuItems?.id}`}>
                <button className="btn btn-outline-primary w-100">
                  {language === "en" ? "Show Full Menu" : "Mostrar Menú Completo"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

