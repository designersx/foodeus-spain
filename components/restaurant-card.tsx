"use client"
import { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
import { API_BASE_URL } from "@/services/apiService"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Search, Star } from "lucide-react"
import { getMenuImagePath } from "@/utils/getImagePath"
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
  const [src, setSrc] = useState<string>(getMenuImagePath(restaurant?.menu.image));
  const [mapUrl, setMapUrl] = useState<string>("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState<string>("");
  // Format distance to show in km or m
  const formatDistance = (distance?: number) => {
    if (distance === undefined) return ""

    if (distance < 1) {
      // If less than 1 km, show in meters
      return `${Math.round(distance * 1000)}m`
    } else {
      // Otherwise show in kilometers with 1 decimal place
      return `${distance.toFixed(1)}km`
    }
  }
  const isValidUrl = (url: string) => {
    const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
    return pattern.test(url);
  };

  const navigateMeThere = () => {
    setIsLoading(true);
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       const lat = position.coords.latitude;
    //       const lng = position.coords.longitude;
    //       setUserLocation({ lat, lng });
    //       const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&travelmode=driving`;
    //       window.open(directionsUrl, "_blank");
    //       setIsLoading(false);
    //     },
    //     (error) => {
    //       setErrorMessage("Error retrieving location. Please try again.");
    //       setIsLoading(false);
    //       console.error("Error getting location:", error);
    //     },
    //     { timeout: 10000, enableHighAccuracy: true }
    //   );
    // } else {
    //   setErrorMessage("Geolocation is not supported by this browser.");
    //   setIsLoading(false);
    // }
    const setUserLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

if (setUserLocation && setUserLocation.lat) {
  console.log("User Location Latitude:", setUserLocation.lat);

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${setUserLocation.lat},${setUserLocation.lng}&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&travelmode=driving`;
          window.open(directionsUrl, "_blank");
}else{
console.log("User Location not found in localStorage.");
}
  };
  return (
    <Link href={`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`} className="text-decoration-none text-dark">
      <div className="card mb-3 mainClass">
        <div className="dishControl" style={{ height: "" }}>
          <div className="dishImage ">
            <Image
              src={src}
              alt={restaurant?.menu.title[language]}
              onError={() => setSrc("/Images/fallback.jpg")}
              loading="lazy"
              fill
              className=""
            />
          </div>
          <div className="dishContent">

            <div className="card-body h-100  text-left text-transform: capitalize text-capitalize" style={{ textAlign: "left" }}>
              <div>
                <h5 className="card-title fs-6 fw-bold text-truncate mb-1 resName">
                  {restaurant?.menu.title[language]
                    ? restaurant.menu.title[language]
                    : language === "en"
                      ? "Menu not Available"
                      : "Menú no disponible"}
                </h5>
                {/* <p
                  className="card-text small text-secondary mb-0 line-clamp-2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {restaurant.menu.description[language]}
                </p> */}
              </div>
              <div className="resturantLoc  w-100">
                <div>
                  <span className="flex items-center gap-2 text-sm font-medium restaurantMenu">
                    <span className="resName">{restaurant?.name.slice(0,20)}</span>
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
                      <div className="small fw-medium text-primary restDistance">
                        {/* <Link
                          href={{
                            pathname: '/map',
                            query: {
                              id: restaurant.id,
                              name: restaurant.name,
                              lat: restaurant.coordinates.lat,
                              lng: restaurant.coordinates.lng,
                              mark: true,
                            },
                          }}
                        >
                          {formatDistance(distance)}
                        </Link> */}
                        <span onClick={navigateMeThere}>{formatDistance(distance)}</span>
                        </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

