"use client";

import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, KmlLayer, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 40.4168, // Default Madrid center
  lng: -3.7038,
};

export default function KmlMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Get the user's current location
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
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      onLoad={() => setGoogleLoaded(true)}
    >
      {googleLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={userLocation || defaultCenter} // Center on user location if available
          onLoad={(map) => setMap(map)}
          onClick={(e) => console.log("Map Clicked at:", e.latLng?.lat(), e.latLng?.lng())}
        >
          {/* Load KML File (Ensure it's accessible from public directory or external URL) */}
          <KmlLayer
            url="https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=1azc4FGempttyHrAm898mokpfXA8" // Place your KML file inside public/kml/
            options={{ preserveViewport: true }}
            onClick={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setSelectedLocation({ lat, lng });
                console.log("KML Clicked at:", lat, lng);
              }
            }}
          />

          {/* Show User’s Current Location with a Marker */}
          {userLocation && googleLoaded && (
            <Marker
              position={userLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue marker for user location
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {/* Show Selected Location Marker */}
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red marker for selected place
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <p>Loading Map...</p>
      )}
    </LoadScript>
  );
}
