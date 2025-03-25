// "use client";

// import { useState, useEffect } from "react";
// import { GoogleMap, LoadScript, KmlLayer, Marker } from "@react-google-maps/api";

// const mapContainerStyle = {
//   width: "100%",
//   height: "500px",
// };

// const defaultCenter = {
//   lat: 40.4168, // Default Madrid center
//   lng: -3.7038,
// };

// export default function KmlMap() {
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [googleLoaded, setGoogleLoaded] = useState(false);

//   // Get the user's current location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//         }
//       );
//     }
//   }, []);

//   return (
//     <LoadScript
//       googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
//       onLoad={() => setGoogleLoaded(true)}
//     >
//       {googleLoaded ? (
//         <GoogleMap
//           mapContainerStyle={mapContainerStyle}
//           zoom={12}
//           center={userLocation || defaultCenter} // Center on user location if available
//           onLoad={(map) => setMap(map)}
//           onClick={(e) => console.log("Map Clicked at:", e.latLng?.lat(), e.latLng?.lng())}
//         >
//           {/* Load KML File (Ensure it's accessible from public directory or external URL) */}
//           <KmlLayer
//             url="https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=1azc4FGempttyHrAm898mokpfXA8" // Place your KML file inside public/kml/
//             options={{ preserveViewport: true }}
//             onClick={(e) => {
//               if (e.latLng) {
//                 const lat = e.latLng.lat();
//                 const lng = e.latLng.lng();
//                 setSelectedLocation({ lat, lng });
//                 console.log("KML Clicked at:", lat, lng);
//               }
//             }}
//           />

//           {/* Show User’s Current Location with a Marker */}
//           {userLocation && googleLoaded && (
//             <Marker
//               position={userLocation}
//               icon={{
//                 url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue marker for user location
//                 scaledSize: new window.google.maps.Size(40, 40),
//               }}
//             />
//           )}

//           {/* Show Selected Location Marker */}
//           {selectedLocation && (
//             <Marker
//               position={selectedLocation}
//               icon={{
//                 url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red marker for selected place
//                 scaledSize: new window.google.maps.Size(40, 40),
//               }}
//             />
//           )}
//         </GoogleMap>
//       ) : (
//         <p>Loading Map...</p>
//       )}
//     </LoadScript>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  KmlLayer,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

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
  const [selectedPlace, setSelectedPlace] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
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

  // Initialize Places Service when Google Maps is loaded
  useEffect(() => {
    if (googleLoaded && map) {
      const service = new window.google.maps.places.PlacesService(map);
      setPlacesService(service);
    }
  }, [googleLoaded, map]);

  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  // Fetch place details when a place is selected
  const fetchPlaceDetails = (lat: number, lng: number) => {
    if (!placesService) return;

    const request: google.maps.places.PlaceSearchRequest = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 500, // Search within 500 meters
      type: "restaurant", // Use a single string instead of an array
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const nearestPlace = results[0];
        if (nearestPlace.place_id) { // Check if place_id exists
          placesService.getDetails(
            { placeId: nearestPlace.place_id },
            (place, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                setPlaceDetails(place);
              }
            }
          );
        } else {
          setPlaceDetails(null); // No place_id available
        }
      } else {
        setPlaceDetails(null); // No nearby place found
      }
    });
  };

  // Handle KML click with corrected event type
  const handleKmlClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      // Note: featureData is not directly available in MapMouseEvent; KML name might need to come from API or be omitted
      const name = "Clicked Location"; // Placeholder; adjust if you fetch KML data separately
      setSelectedPlace({ lat, lng, name });
      fetchPlaceDetails(lat, lng);
      console.log("KML Clicked at:", lat, lng, "Name:", name);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      libraries={["places"]}
      onLoad={() => setGoogleLoaded(true)}
    >
      {googleLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={userLocation || defaultCenter}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onClick={(e) => console.log("Map Clicked at:", e.latLng?.lat(), e.latLng?.lng())}
        >
          {/* Load KML File */}
          <KmlLayer
            url="https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=1azc4FGempttyHrAm898mokpfXA8"
            options={{ preserveViewport: false }}
            onClick={handleKmlClick} // Use MapMouseEvent type
          />

          {/* User's Current Location */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {/* Selected Place InfoWindow */}
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => {
                setSelectedPlace(null);
                setPlaceDetails(null);
              }}
            >
              <div style={{ maxWidth: "300px" }}>
                <h3>{selectedPlace.name}</h3>
                {placeDetails ? (
                  <>
                    {/* Place Image */}
                    {placeDetails.photos && placeDetails.photos.length > 0 && (
                      <img
                        src={placeDetails.photos[0].getUrl({ maxWidth: 200 })}
                        alt={placeDetails.name}
                        style={{ width: "100%", marginBottom: "10px" }}
                      />
                    )}
                    {/* Reviews */}
                    {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                      <div>
                        <h4>Reviews:</h4>
                        <ul>
                          {placeDetails.reviews.slice(0, 2).map((review, index) => (
                            <li key={index}>
                              <p>{review.text}</p>
                              <small>
                                — {review.author_name} ({review.rating}/5)
                              </small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Navigate Button */}
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`,
                          "_blank"
                        )
                      }
                      style={{ marginTop: "10px", padding: "5px 10px" }}
                    >
                      Navigate to Place
                    </button>
                  </>
                ) : (
                  <p>Loading details...</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <p>Loading Map...</p>
      )}
    </LoadScript>
  );
}