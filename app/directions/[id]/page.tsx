"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
import { useRouter } from "next/navigation";
// Sample data - in a real app, this would come from an APIdsds
const restaurants = [
  {
    id: "1",
    name: "La Trattoria",
    location: "123 Main St, Anytown",
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: "2",
    name: "El Rincón",
    location: "456 Oak Ave, Somewhere",
    coordinates: { lat: 40.7168, lng: -73.998 },
  },
  {
    id: "3",
    name: "Sushi Spot",
    location: "789 Pine Rd, Elsewhere",
    coordinates: { lat: 40.7218, lng: -74.012 },
  },
  {
    id: "4",
    name: "Burger Joint",
    location: "101 Elm St, Nowhere",
    coordinates: { lat: 40.7148, lng: -74.016 },
  },
  {
    id: "5",
    name: "Thai Delight",
    location: "202 Maple Dr, Anyplace",
    coordinates: { lat: 40.7108, lng: -74.002 },
  },
]

export default function DirectionsPage() {
  const router = useRouter();
  const queryParams = new URLSearchParams(window.location.search);
  const lat = queryParams.get("lat");
  const lng = queryParams.get("lng");
  const name=queryParams.get("name");
  const location=queryParams.get("location");
  const { id } = useParams()
  const { language } = useLanguage()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapUrl, setMapUrl] = useState<string>("")
console.log(id,lat, lng)
  useEffect(() => {
    // Find the restaurant with the matching ID
    // const place = restaurants.find((r) => r.id === id)
    // if (place) {
      setRestaurant({
        id: id,
        name: name,
        location: location,
        coordinates: { lat: lat, lng: lng },
      })
// }    


    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userPos)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [id,location])

  useEffect(() => {
    if (userLocation) {
      // Create Google Maps directions URL
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&travelmode=driving`
      setMapUrl(directionsUrl)

      // In a real app, you would use the Google Maps API to render the map
      // For this example, we'll just provide a link to Google Maps
    }
  }, [restaurant, userLocation])

  if (!restaurant) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <Link href={`/menu/${id}`} className="d-inline-flex align-items-center text-decoration-none mb-3">
        <i className="bi bi-chevron-left me-1"></i>
        Back
      </Link>

      <h1 className="fs-3 fw-bold mb-4">
        {language === "en" ? "Directions to" : "Direcciones a"} {restaurant.name}
      </h1>

      {/* Map placeholder */}
      <div
        className="bg-light rounded d-flex flex-column align-items-center justify-content-center mb-4 p-5"
        style={{ height: "400px" }}
      >
        <p className="text-secondary mb-4">
          {language === "en"
            ? "Google Maps would display directions here"
            : "Google Maps mostraría las direcciones aquí"}
        </p>

        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {language === "en" ? "Open in Google Maps" : "Abrir en Google Maps"}
          </a>
        )}
      </div>

      {/* Restaurant info */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title fs-5 fw-semibold">{restaurant.name}</h2>
          <p className="card-text text-secondary">{restaurant.location}</p>

          {userLocation && (
            <div className="mt-3">
              <h3 className="fs-6 fw-medium">{language === "en" ? "Distance" : "Distancia"}:</h3>
              <p>
                {calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  restaurant.coordinates.lat,
                  restaurant.coordinates.lng,
                ).toFixed(2)}{" "}
                km
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

