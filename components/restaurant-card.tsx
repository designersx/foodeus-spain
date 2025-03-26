"use client"
import { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
import { API_BASE_URL } from "@/services/apiService"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Search, Star } from "lucide-react"
import {getMenuImagePath} from "@/utils/getImagePath"
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
    menu_id?: string|number;
    menu_type?: string;
    updated_at?: any
  }
  distance?: number
}

export function RestaurantCard({ restaurant, distance }: { restaurant: Restaurant; distance?: number }) {
  const { language } = useLanguage()
  const [src, setSrc] = useState<string>(getMenuImagePath(restaurant?.menu.image));

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
  const isValidUrl = (url:string) => {
    const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
    return pattern.test(url);
  };
  

  return (
    <Link href={`/menu/${restaurant.id}?menuId=${restaurant.menu.menu_id}`} className="text-decoration-none text-dark">
      <div className="card mb-3 shadow-sm hover-shadow">
        <div className="row g-0" style={{ height: "" }}>
          <div className="col-4 position-relative">
            <Image
              // src={isValidUrl(restaurant?.menu.image) 
              //   ? restaurant?.menu.image  // If it's a valid URL, use it directly
              //   :`${API_BASE_URL}${restaurant.menu.image.split("/public")[1]}` || "/Images/fallback.jpg"}
              src={src}
              alt={restaurant?.menu.title[language]}
              onError={() => setSrc("/Images/fallback.jpg")}
              fill
              className="object-fit-cover rounded-start"
            />
          </div>
          <div className="col-8">
            
            <div className="card-body h-100 d-flex flex-column justify-content-between p-3 text-left text-transform: capitalize text-capitalize" style={{ textAlign: "left" }}>
              <div>
                <h5 className="card-title fs-6 fw-bold text-truncate mb-1">{restaurant?.menu.title[language]}</h5>
                <p
                  className="card-text small text-secondary mb-0 line-clamp-2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {restaurant.menu.description[language]}
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-end w-100">
                <div>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span>{restaurant?.name}</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" style={{ color: "#FFD700", fill: "#FFD700" }} />
                      {restaurant?.rating}
                    </span>
                  </span>
                  <p className="card-text small text-secondary d-flex align-items-center mb-0">
                    <i className="bi bi-geo-alt me-1 small"></i>
                    <span className="text-truncate">
                    {restaurant?.location.length > 45
                      ? restaurant?.location.slice(0, restaurant?.location?.lastIndexOf(" ", 20)) + "..."
                      : restaurant?.location}
                  </span>
                  </p>
                </div>
                {distance !== undefined && (
                  <div className="small fw-medium text-primary">{formatDistance(distance)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

