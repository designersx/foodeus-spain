"use client"

import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

interface Restaurant {
  id: string
  name: string
  location: string
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
    image: string
  }
  distance?: number
}

export function RestaurantCard({ restaurant, distance }: { restaurant: Restaurant; distance?: number }) {
  const { language } = useLanguage()

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

  return (
    <Link href={`/menu/${restaurant.id}`} className="text-decoration-none text-dark">
      <div className="card mb-3 shadow-sm hover-shadow">
        <div className="row g-0" style={{ height: "" }}>
          <div className="col-4 position-relative">
            <Image
              src={restaurant.menu.image || "/placeholder.svg"}
              alt={restaurant.menu.title[language]}
              fill
              className="object-fit-cover rounded-start"
            />
          </div>
          <div className="col-8">
            <div className="card-body h-100 d-flex flex-column justify-content-between p-3">
              <div>
                <h5 className="card-title fs-6 fw-bold text-truncate mb-1">{restaurant.menu.title[language]}</h5>
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
                  <p className="card-text small mb-0 fw-medium">{restaurant.name}</p>
                  <p className="card-text small text-secondary d-flex align-items-center mb-0">
                    <i className="bi bi-geo-alt me-1 small"></i>
                    <span className="text-truncate">{restaurant.location}</span>
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

