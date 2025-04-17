

"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/language-context";
import "./css/MapView.css"
const triggerNavigationTo = (restaurant, directionsServiceRef, directionsRendererRef, mapRef, infoWindowRef, language, markerRefs, userMarkerRef, restaurants, setIsNavigating, setDestination) => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const destination = restaurant.coordinates;
      setDestination(destination);

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: "DRIVING",
          provideRouteAlternatives: true,
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        (result, status) => {
          if (status === "OK") {
            setIsNavigating(true);
            markerRefs.current.forEach((m) => m.setMap(null));
            markerRefs.current = [];
            userMarkerRef.current.setMap(mapRef.current);
            directionsRendererRef.current.setDirections({ routes: [] });
            const bestRoute = result.routes.reduce((min, curr) =>
              curr.legs[0].distance.value < min.legs[0].distance.value ? curr : min,
              result.routes[0]
            );
            directionsRendererRef.current.setDirections({ ...result, routes: [bestRoute] });

            const leg = bestRoute.legs[0];
            const distanceText = leg.distance.text;
            const durationText = leg.duration.text;
            const distanceLabel = language === "es" ? "Distancia" : "Distance";
            const timeLabel = language === "es" ? "Tiempo estimado" : "Estimated Time";

            const navContent = `
              <div style="min-width: 200px;">
                <strong>${restaurant.name}</strong><br/>
                🚗 ${distanceLabel}: <strong>${distanceText}</strong><br/>
                ⏱️ ${timeLabel}: <strong>${durationText}</strong><br/>
              </div>
            `;

            const navMarker = new google.maps.Marker({
              position: destination,
              map: mapRef.current,
              title: restaurant.name,
            });
            infoWindowRef.current.setContent(navContent);
            infoWindowRef.current.open(mapRef.current, navMarker);
          }
        }
      );
    },
    () => alert("Could not get your location.")
  );
};

const openInfoWindow = (restaurant, map, infoWindowRef, language, onNavigate) => {
  const categoryLabel = language === "es" ? "Categoría" : "Category";
  const buttonLabel = language === "es" ? "Llévame allí" : "Navigate";

  const content = `
    <div style="min-width: 200px;">
      <strong>${restaurant.name}</strong><br/>
      ${categoryLabel}: ${restaurant.category}<br/>
      ⭐ ${restaurant.rating || "N/A"}<br/>
      <button id="navigate-btn" style="
        margin-top: 8px;
        background-color: #4285F4;
        color: white;
        border: none;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        transition: background-color 0.3s ease;
      ">
        ${buttonLabel}
      </button>
    </div>
  `;

  infoWindowRef.current.setContent(content);
  infoWindowRef.current.setPosition(restaurant.coordinates);
  infoWindowRef.current.open(map);

  setTimeout(() => {
    const navBtn = document.getElementById("navigate-btn");
    if (navBtn) navBtn.onclick = onNavigate;
  }, 100);
};

export function RestaurantMap({ restaurants }) {

  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markerRefs = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setLocationError("Location access denied."),
      { enableHighAccuracy: true }
    );
  }, []);

 useEffect(() => {
  if (!userLocation) return;

  const map = new google.maps.Map(mapRef.current, {
    center: userLocation,
    zoom: 15,
    disableDefaultUI:false,  // Disable default UI elements including the pan arrows
    styles: [
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
    ],
  });

  directionsRendererRef.current = new google.maps.DirectionsRenderer();
  directionsServiceRef.current = new google.maps.DirectionsService();
  infoWindowRef.current = new google.maps.InfoWindow();
  directionsRendererRef.current.setMap(map);

  userMarkerRef.current = new google.maps.Marker({
    position: userLocation,
    map,
    title: "You",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
    },
  });

  const controlDiv = document.createElement("div");
  controlDiv.style.margin = "10px";
  const relocateBtn = document.createElement("button");
  relocateBtn.innerHTML = "📍 Relocate   "
  relocateBtn.style.cssText = `
    background: #F1582E ;
    color: #fff;
    border: none;
    padding: 10px 14px;
    border-radius: 3px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    font-size: 15px;
    font-weight: bold;
    transition: background 0.3s ease;
    position: fixed;
    right: 23px;
    bottom: 205px;
    z-index: 9999;
  `;
  relocateBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        userMarkerRef.current.setPosition(newLoc);
        map.setCenter(newLoc);

        if (isNavigating && destination) {
          triggerNavigationTo(
            { name: "", coordinates: destination },
            directionsServiceRef,
            directionsRendererRef,
            mapRef,
            infoWindowRef,
            language,
            markerRefs,
            userMarkerRef,
            restaurants,
            setIsNavigating,
            setDestination
          );
        }
      },
      () => alert("Failed to retrieve location."),
      { enableHighAccuracy: true }
    );
  };

  controlDiv.appendChild(relocateBtn);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

  restaurants.forEach((restaurant) => {
    const label = new google.maps.Marker({
      position: restaurant.coordinates,
      map,
      title: restaurant.name,
      label: {
        text: restaurant.name.substring(0, 1),
        fontSize: "14px",
      },
    });
    label.addListener("click", () => {
      openInfoWindow(restaurant, map, infoWindowRef, language, () => {
        triggerNavigationTo(
          restaurant,
          directionsServiceRef,
          directionsRendererRef,
          mapRef,
          infoWindowRef,
          language,
          markerRefs,
          userMarkerRef,
          restaurants,
          setIsNavigating,
          setDestination
        );
      });
    });
    markerRefs.current.push(label);
  });
}, [userLocation]);


  return (
    <>
      {locationError ? (
        <div className="alert alert-warning mt-3">
          {locationError}
          <br />
          <small className="text-muted">
            You can click the lock icon in your browser’s address bar to enable location access manually.
          </small>
        </div>
      ) : (
        <div ref={mapRef} style={{ width: "100%", height: "80vh" }} />
      )}
    </>
  );
}
