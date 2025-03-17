"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/context/language-context"
import { RestaurantCard } from "@/components/restaurant-card"
import { HeroSlideshow } from "@/components/hero-slideshow"

// Sample data for restaurants
const restaurants = [
  {
    id: "1",
    name: "La Trattoria",
    location: "123 Main St, Anytown",
    coordinates: { lat: 40.7128, lng: -74.006 },
    menu: {
      title: {
        en: "Italian Pasta Special",
        es: "Especial de Pasta Italiana",
      },
      description: {
        en: "Homemade pasta with fresh tomato sauce, basil, and parmesan cheese",
        es: "Pasta casera con salsa de tomate fresco, albahaca y queso parmesano",
      },
      image: "Images/Homemade pasta.png?height=120&width=120",
    },
  },
  {
    id: "2",
    name: "El Rincón",
    location: "456 Oak Ave, Somewhere",
    coordinates: { lat: 40.7168, lng: -73.998 },
    menu: {
      title: {
        en: "Seafood Paella",
        es: "Paella de Mariscos",
      },
      description: {
        en: "Traditional Spanish rice dish with fresh seafood, saffron, and vegetables",
        es: "Plato tradicional español de arroz con mariscos frescos, azafrán y verduras",
      },
      image: "Images/Seafood Paella.png?height=120&width=120",
    },
  },
  {
    id: "3",
    name: "Sushi Spot",
    location: "789 Pine Rd, Elsewhere",
    coordinates: { lat: 40.7218, lng: -74.012 },
    menu: {
      title: {
        en: "Sushi Combo Platter",
        es: "Plato Combinado de Sushi",
      },
      description: {
        en: "Assortment of fresh nigiri and maki rolls with wasabi and pickled ginger",
        es: "Surtido de nigiri fresco y rollos maki con wasabi y jengibre encurtido",
      },
      image: "Images/Sushi Combo Platter.png?height=120&width=120",
    },
  },
  {
    id: "4",
    name: "Burger Joint",
    location: "101 Elm St, Nowhere",
    coordinates: { lat: 40.7148, lng: -74.016 },
    menu: {
      title: {
        en: "Gourmet Burger Special",
        es: "Especial de Hamburguesa Gourmet",
      },
      description: {
        en: "Angus beef patty with caramelized onions, artisan cheese, and truffle aioli",
        es: "Hamburguesa de carne Angus con cebollas caramelizadas, queso artesanal y alioli de trufa",
      },
      image: "Images/Gourmet Burger Special.png?height=120&width=120",
    },
  },
  {
    id: "5",
    name: "Thai Delight",
    location: "202 Maple Dr, Anyplace",
    coordinates: { lat: 40.7108, lng: -74.002 },
    menu: {
      title: {
        en: "Pad Thai Special",
        es: "Especial de Pad Thai",
      },
      description: {
        en: "Stir-fried rice noodles with tofu, bean sprouts, peanuts, and lime",
        es: "Fideos de arroz salteados con tofu, brotes de soja, cacahuetes y lima",
      },
      image: "Images/Pad Thai Special.png?height=120&width=120",
    },
  },
]

export function ListView() {
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [restaurantsWithDistance, setRestaurantsWithDistance] = useState(restaurants)

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userPos)

          // Calculate distance for each restaurant
          const withDistance = restaurants.map((restaurant) => {
            const distance = calculateDistance(
              userPos.lat,
              userPos.lng,
              restaurant.coordinates.lat,
              restaurant.coordinates.lng,
            )
            return { ...restaurant, distance }
          })

          // Sort by distance
          withDistance.sort((a, b) => a.distance - b.distance)
          setRestaurantsWithDistance(withDistance)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  return (
    <div className="pb-5">
      <HeroSlideshow />
      <div className="mt-4">
        {restaurantsWithDistance.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} distance={restaurant.distance} />
        ))}
      </div>
    </div>
  )
}

