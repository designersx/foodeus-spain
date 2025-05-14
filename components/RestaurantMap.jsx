

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useLanguage } from "@/context/language-context";
// import "./css/MapView.css"
// const triggerNavigationTo = (restaurant, directionsServiceRef, directionsRendererRef, mapRef, infoWindowRef, language, markerRefs, userMarkerRef, restaurants, setIsNavigating, setDestination) => {
//   navigator.geolocation.getCurrentPosition(
//     (pos) => {
//       const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//       const destination = restaurant.coordinates;
//       setDestination(destination);

//       directionsServiceRef.current.route(
//         {
//           origin,
//           destination,
//           travelMode: "DRIVING",
//           provideRouteAlternatives: true,
//           avoidTolls: false,
//           avoidHighways: false,
//           avoidFerries: false,
//         },
//         (result, status) => {
//           if (status === "OK") {
//             setIsNavigating(true);
//             markerRefs.current.forEach((m) => m.setMap(null));
//             markerRefs.current = [];
//             userMarkerRef.current.setMap(mapRef.current);
//             directionsRendererRef.current.setDirections({ routes: [] });
//             const bestRoute = result.routes.reduce((min, curr) =>
//               curr.legs[0].distance.value < min.legs[0].distance.value ? curr : min,
//               result.routes[0]
//             );
//             directionsRendererRef.current.setDirections({ ...result, routes: [bestRoute] });

//             const leg = bestRoute.legs[0];
//             const distanceText = leg.distance.text;
//             const durationText = leg.duration.text;
//             const distanceLabel = language === "es" ? "Distancia" : "Distance";
//             const timeLabel = language === "es" ? "Tiempo estimado" : "Estimated Time";

//             const navContent = `
//               <div style="min-width: 200px;">
//                 <strong>${restaurant.name}</strong><br/>
//                 🚗 ${distanceLabel}: <strong>${distanceText}</strong><br/>
//                 ⏱️ ${timeLabel}: <strong>${durationText}</strong><br/>
//               </div>
//             `;

//             const navMarker = new google.maps.Marker({
//               position: destination,
//               map: mapRef.current,
//               title: restaurant.name,
//             });
//             infoWindowRef.current.setContent(navContent);
//             infoWindowRef.current.open(mapRef.current, navMarker);
//           }
//         }
//       );
//     },
//     () => alert("Could not get your location.")
//   );
// };

// const openInfoWindow = (restaurant, map, infoWindowRef, language, onNavigate) => {
//   const categoryLabel = language === "es" ? "Categoría" : "Category";
//   const buttonLabel = language === "es" ? "Llévame allí" : "Navigate";

//   const content = `
//     <div style="min-width: 200px;">
//       <strong>${restaurant.name}</strong><br/>
//       ${categoryLabel}: ${restaurant.category}<br/>
//       ⭐ ${restaurant.rating || "N/A"}<br/>
//       <button id="navigate-btn" style="
//         margin-top: 8px;
//         background-color: #4285F4;
//         color: white;
//         border: none;
//         padding: 8px 14px;
//         border-radius: 6px;
//         font-size: 14px;
//         cursor: pointer;
//         box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
//         transition: background-color 0.3s ease;
//       ">
//         ${buttonLabel}
//       </button>
//     </div>
//   `;

//   infoWindowRef.current.setContent(content);
//   infoWindowRef.current.setPosition(restaurant.coordinates);
//   infoWindowRef.current.open(map);

//   setTimeout(() => {
//     const navBtn = document.getElementById("navigate-btn");
//     if (navBtn) navBtn.onclick = onNavigate;
//   }, 100);
// };

// export function RestaurantMap({ restaurants }) {
 
//   const mapRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const directionsServiceRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const userMarkerRef = useRef(null);
//   const markerRefs = useRef([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const [locationError, setLocationError] = useState("");
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [destination, setDestination] = useState(null);
//   const { language } = useLanguage();
//   useEffect(() => {
//     const fetchLocation = async() => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//       },
//       () => setLocationError("Location access denied."),
//       { enableHighAccuracy: true }
//     );
//   }
//   fetchLocation();
//   }, []);

//  useEffect(() => {
//   if (!userLocation) return;

//   const map = new google.maps.Map(mapRef.current, {
//     center: userLocation,
//     zoom: 15,
//     disableDefaultUI:true,  
//     styles: [
//       { featureType: "poi", stylers: [{ visibility: "off" }] },
//       { featureType: "transit", stylers: [{ visibility: "off" }] },
//     ],
//   });

//   directionsRendererRef.current = new google.maps.DirectionsRenderer();
//   directionsServiceRef.current = new google.maps.DirectionsService();
//   infoWindowRef.current = new google.maps.InfoWindow();
//   directionsRendererRef.current.setMap(map);

//   userMarkerRef.current = new google.maps.Marker({
//     position: userLocation,
//     map,
//     title: "You",
//     icon: {
//       path: google.maps.SymbolPath.CIRCLE,
//       scale: 8,
//       fillColor: "#4285F4",
//       fillOpacity: 1,
//       strokeWeight: 2,
//       strokeColor: "white",
//     },
//   });

//   const controlDiv = document.createElement("div");
//   controlDiv.style.margin = "10px";
//   const relocateBtn = document.createElement("button");
//   relocateBtn.innerHTML = "📍 Relocate   "
//   relocateBtn.style.cssText = `
//     background: #F1582E ;
//     color: #fff;
//     border: none;
//     padding: 10px 14px;
//     border-radius: 3px;
//     cursor: pointer;
//     box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
//     font-size: 15px;
//     font-weight: bold;
//     transition: background 0.3s ease;
//     position: fixed;
//     right: 23px;
//     bottom: 140px;
//     z-index: 9999;
//   `;
//   relocateBtn.onclick = () => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setUserLocation(newLoc);
//         userMarkerRef.current.setPosition(newLoc);
//         map.setCenter(newLoc);

//         if (isNavigating && destination) {
//           triggerNavigationTo(
//             { name: "", coordinates: destination },
//             directionsServiceRef,
//             directionsRendererRef,
//             mapRef,
//             infoWindowRef,
//             language,
//             markerRefs,
//             userMarkerRef,
//             restaurants,
//             setIsNavigating,
//             setDestination
//           );
//         }
//       },
//       () => alert("Failed to retrieve location."),
//       { enableHighAccuracy: true }
//     );
//   };

//   controlDiv.appendChild(relocateBtn);
//   map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
//   restaurants.forEach((restaurant) => {
//     // console.log('restaurant',restaurant)
//     const label = new google.maps.Marker({
//       position: restaurant.coordinates,
//       map,
//       title: restaurant?.name||"Restaurant",
//       label: {
//         text: restaurant.name.substring(0, 1)|| "A",
//         fontSize: "14px",
//       },
//     });
//     label.addListener("click", () => {
//       openInfoWindow(restaurant, map, infoWindowRef, language, () => {
//         triggerNavigationTo(
//           restaurant,
//           directionsServiceRef,
//           directionsRendererRef,
//           mapRef,
//           infoWindowRef,
//           language,
//           markerRefs,
//           userMarkerRef,
//           restaurants,
//           setIsNavigating,
//           setDestination
//         );
//       });
//     });
//     markerRefs.current.push(label);
//   });
// }, [userLocation,restaurants]);


//   return (
//     <>
//       {locationError ? (
//         <div className="alert alert-warning mt-3">
//           {locationError}
//           <br />
//           <small className="text-muted">
//             You can click the lock icon in your browser’s address bar to enable location access manually.
//           </small>
//         </div>
//       ) : (
//         <div ref={mapRef} style={{ width: "100%", height: "80vh" }} />
//       )}
//     </>
//   );
// }





"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/language-context";
import "./css/MapView.css";

const triggerNavigationTo = (
  restaurant,
  directionsServiceRef,
  directionsRendererRef,
  mapInstance, // Changed from mapRef to mapInstance for clarity
  infoWindowRef,
  language,
  markerRefs,
  userMarkerRef,
  restaurants,
  setIsNavigating,
  setDestination
) => {
  if (!directionsServiceRef.current || !directionsRendererRef.current || !mapInstance) {
    console.error("Navigation refs not initialized:", {
      directionsService: directionsServiceRef.current,
      directionsRenderer: directionsRendererRef.current,
      map: mapInstance,
    });
    alert("Navigation services not ready. Please try again.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const destination = restaurant.coordinates;
      if (!destination || !destination.lat || !destination.lng) {
        console.error("Invalid destination coordinates:", destination);
        alert("Invalid destination. Please select a valid restaurant.");
        return;
      }
      setDestination(destination);

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setIsNavigating(true);
            markerRefs.current.forEach((m) => (m.map = null));
            markerRefs.current = [];
            userMarkerRef.current.map = mapInstance; // Use mapInstance instead of mapRef.current
            directionsRendererRef.current.setDirections({ routes: [] });

            const bestRoute = result.routes.reduce(
              (min, curr) =>
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
              <div class="info-window">
                <h3>${restaurant.name}</h3>
                <div class="info-content">
                  <p><span class="material-icons"> ${distanceLabel}:</span> <strong>${distanceText}</strong></p>
                  <p><span class="material-icons">${timeLabel}:</span>  <strong>${durationText}</strong></p>
                </div>
              </div>
            `;

            const navMarker = new google.maps.marker.AdvancedMarkerElement({
              position: destination,
              map: mapInstance, // Use mapInstance
              title: restaurant.name,
            });
            infoWindowRef.current.setContent(navContent);
            infoWindowRef.current.open(mapInstance, navMarker);
          } else {
            console.error("Directions request failed:", status, result);
            alert("Directions request failed: " + status);
          }
        }
      );
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Could not get your location: " + error.message);
    }
  );
};

const openInfoWindow = (
  restaurant,
  map,
  infoWindowRef,
  language,
  placesService,
  userLocation,
  onNavigate
) => {
  if (!placesService || !map || !infoWindowRef.current) {
    console.error("openInfoWindow: Missing required services:", {
      placesService,
      map,
      infoWindow: infoWindowRef.current,
    });
    return;
  }

  if (!restaurant.placeId) {
    console.error("Invalid placeId for restaurant:", restaurant);
    const categoryLabel = language === "es" ? "Categoría" : "Category";
    const buttonLabel = language === "es" ? "Llévame allí" : "Navigate";
    const distance = userLocation
      ? google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(userLocation),
          new google.maps.LatLng(restaurant.coordinates)
        ) / 1000
      : null;
    const distanceText = distance ? `${distance.toFixed(1)} km` : "N/A";

    const content = `
      <div class="info-window">
        <img src="https://via.placeholder.com/200" alt="${restaurant.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;" />
        <h3>${restaurant.name}</h3>
        <div class="info-content">
          <p><span class="material-icons">category</span> ${categoryLabel}: ${restaurant.category}</p>
          <p><span class="material-icons">star</span> Rating: N/A</p>
          <p><span class="material-icons">straighten</span> Distance: ${distanceText}</p>
          <button id="navigate-btn" class="navigate-btn">${buttonLabel}</button>
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.setPosition(restaurant.coordinates);
    infoWindowRef.current.open(map);

    const observer = new MutationObserver(() => {
      const navBtn = document.getElementById("navigate-btn");
      if (navBtn) {
        navBtn.onclick = () => {
          console.log("Navigate button clicked for:", restaurant.name);
          onNavigate();
        };
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return;
  }

  placesService.getDetails(
    { placeId: restaurant.placeId, fields: ["photos", "rating", "user_ratings_total"] },
    (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const photoUrl = place.photos?.[0]?.getUrl({ maxWidth: 200 }) || "https://via.placeholder.com/200";
        // console.log("Place details fetched:", { placeId: restaurant.placeId, photoUrl, rating: place.rating });
        const rating = place.rating || restaurant.rating || "N/A";
        const totalRatings = place.user_ratings_total || "N/A";
        const distance = userLocation
          ? google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(userLocation),
              new google.maps.LatLng(restaurant.coordinates)
            ) / 1000
          : null;
        const distanceText = distance ? `${distance.toFixed(1)} km` : "N/A";
        const categoryLabel = language === "es" ? "Categoría" : "Category";
        const buttonLabel = language === "es" ? "Llévame allí" : "Navigate";
        const distanceLabel = language === "es" ? "Distancia" : "Distance";

        const content = `
          <div class="info-window">
            <img src="${photoUrl}" alt="${restaurant.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;" />
            <h3>${restaurant.name}</h3>
            <div class="info-content">
            <p><span class="material-icons">⭐ </span> ${rating} (${totalRatings} reviews)</p>
              <p><span class="material-icons">${categoryLabel}:</span>  ${restaurant.category}</p>
              <p><span class="material-icons">${distanceLabel}</span>  ${distanceText}</p>
              <button id="navigate-btn" class="navigate-btn">${buttonLabel}</button>
            </div>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.setPosition(restaurant.coordinates);
        infoWindowRef.current.open(map);

        const observer = new MutationObserver(() => {
          const navBtn = document.getElementById("navigate-btn");
          if (navBtn) {
            navBtn.onclick = () => {
              // console.log("Navigate button clicked for:", restaurant.name);
              onNavigate();
            };
            observer.disconnect();
          }
        });
        observer.observe(document, { childList: true, subtree: true });
      } else {
        console.error("Failed to fetch place details:", status, restaurant.placeId);
        alert("Failed to fetch place details: " + status);
      }
    }
  );
};

function createCustomMarkerIcon() {
  const markerDiv = document.createElement("div");
  markerDiv.innerHTML = `
    <div style="
      background-color: #4285F4;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `;
  return markerDiv;
}

function createRestaurantMarkerIcon(name) {
  const markerDiv = document.createElement("div");
  markerDiv.innerHTML = `
    <div style="
      background-color: #F1582E;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      ${name ? name.substring(0, 1).toUpperCase() : ""}
    </div>
  `;
  return markerDiv;
}

function createControlButtons(
  map,
  userLocation,
  destination,
  isNavigating,
  setUserLocation,
  setIsNavigating,
  setDestination,
  directionsRendererRef,
  directionsServiceRef,
  infoWindowRef,
  language,
  markerRefs,
  userMarkerRef,
  restaurants,
  mapRef
) {
  const controlDiv = document.createElement("div");
  controlDiv.style.padding = "10px";
  controlDiv.style.display = "flex";
  controlDiv.style.flexDirection = "column";
  controlDiv.style.gap = "8px";

  const relocateBtn = document.createElement("button");
  relocateBtn.innerHTML = `
    <span class="material-icons" style="vertical-align: middle; margin-right: 8px;"></span>
    ${language === "es" ? "Recentrar" : "Relocate"}
  `;
  relocateBtn.style.cssText = `
    background-color: white;
    color: #202124;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
  `;
  relocateBtn.onmouseover = () => (relocateBtn.style.backgroundColor = "#f1f3f4");
  relocateBtn.onmouseout = () => (relocateBtn.style.backgroundColor = "white");
  relocateBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        userMarkerRef.current.position = newLoc;
        map.setCenter(newLoc);

        if (isNavigating && destination) {
          triggerNavigationTo(
            { name: "", coordinates: destination },
            directionsServiceRef,
            directionsRendererRef,
            map, // Pass map instance
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
  


  const cancelBtn = document.createElement("button");
  cancelBtn.innerHTML = `
    <span class="material-icons" style="vertical-align: middle; margin-right: 8px;"></span>
    ${language === "es" ? "Cancelar Navegación" : "Cancel Navigation"}
  `;
  cancelBtn.style.cssText = `
    background-color: white;
    color: #202124;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
  `;
  cancelBtn.onmouseover = () => (cancelBtn.style.backgroundColor = "#f1f3f4");
  cancelBtn.onmouseout = () => (cancelBtn.style.backgroundColor = "white");
  cancelBtn.onclick = () => {
    setIsNavigating(false);
    setDestination(null);
    directionsRendererRef.current.setDirections({ routes: [] });
    infoWindowRef.current.close();
    markerRefs.current.forEach((m) => (m.map = null));
    markerRefs.current = [];

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    if (!bounds) return;

    const visibleRestaurants = restaurants.filter((restaurant) =>
      bounds.contains(restaurant.coordinates)
    );
    const maxMarkers = zoom > 14 ? visibleRestaurants.length : Math.min(50, visibleRestaurants.length);

    visibleRestaurants.slice(0, maxMarkers).forEach((restaurant) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: restaurant.coordinates,
        map,
        title: restaurant.name,
        content: createRestaurantMarkerIcon(restaurant.name),
      });
      marker.addListener("click", () => {
        openInfoWindow(
          restaurant,
          map,
          infoWindowRef,
          language,
          placesServiceRef.current,
          userLocation,
          () => {
            // console.log("Calling triggerNavigationTo for:", restaurant.name);
            triggerNavigationTo(
              restaurant,
              directionsServiceRef,
              directionsRendererRef,
              map, // Pass map instance
              infoWindowRef,
              language,
              markerRefs,
              userMarkerRef,
              restaurants,
              setIsNavigating,
              setDestination
            );
          }
        );
      });
      markerRefs.current.push(marker);
    });
  };

  controlDiv.appendChild(cancelBtn);

  return controlDiv;
}

export function RestaurantMap({ restaurants }) {
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markerRefs = useRef([]);
  const placesServiceRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState(null);
  const { language } = useLanguage();

  // Fetch user location
  useEffect(() => {
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setLocationError("Location access denied. Please enable location services."),
        { enableHighAccuracy: true }
      );
    };
    fetchLocation();
  }, []);

  // Initialize map and markers
  useEffect(() => {
    if (!userLocation || !window.google || !window.google.maps) return;

    const map = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 15,
      mapId: "1azc4FGempttyHrAm898mokpfXA8", // Replace with your custom Map ID
      disableDefaultUI: true,
      styles: [
      { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", stylers: [{ visibility: "off" }] },
  { featureType: "water", stylers: [{ visibility: "off" }] },

  // Keep roads visible
  { featureType: "road", stylers: [{ visibility: "on" }] },

  // Show only road **text labels** (road names)
  { featureType: "road", elementType: "labels.text", stylers: [{ visibility: "on" }] },
      ],
    });

    directionsServiceRef.current = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({ map });
    infoWindowRef.current = new google.maps.InfoWindow();
    placesServiceRef.current = new google.maps.places.PlacesService(map);

    userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      position: userLocation,
      map,
      title: "You",
      content: createCustomMarkerIcon(),
    });

    const controlDiv = createControlButtons(
      map,
      userLocation,
      destination,
      isNavigating,
      setUserLocation,
      setIsNavigating,
      setDestination,
      directionsRendererRef,
      directionsServiceRef,
      infoWindowRef,
      language,
      markerRefs,
      userMarkerRef,
      restaurants,
      mapRef
    );
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);

    const updateMarkers = () => {
      markerRefs.current.forEach((m) => (m.map = null));
      markerRefs.current = [];

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      if (!bounds) return;

      const visibleRestaurants = restaurants.filter((restaurant) =>
        bounds.contains(restaurant.coordinates)
      );
      const maxMarkers = zoom > 14 ? visibleRestaurants.length : Math.min(50, visibleRestaurants.length);

      visibleRestaurants.slice(0, maxMarkers).forEach((restaurant) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: restaurant.coordinates,
          map,
          title: restaurant.name,
          content: createRestaurantMarkerIcon(restaurant.name),
        });

        marker.addListener("click", () => {
          openInfoWindow(
            restaurant,
            map,
            infoWindowRef,
            language,
            placesServiceRef.current,
            userLocation,
            () => {
              // console.log("Calling triggerNavigationTo for:", restaurant.name);
              triggerNavigationTo(
                restaurant,
                directionsServiceRef,
                directionsRendererRef,
                map, // Pass map instance
                infoWindowRef,
                language,
                markerRefs,
                userMarkerRef,
                restaurants,
                setIsNavigating,
                setDestination
              );
            }
          );
        });
        markerRefs.current.push(marker);
      });
    };

    map.addListener("bounds_changed", updateMarkers);
    map.addListener("zoom_changed", updateMarkers);
    updateMarkers();

    return () => {
      google.maps.event.clearInstanceListeners(map);
    };
  }, [userLocation, restaurants, language]);

  return (
    <>
      {locationError ? (
        <div class="alert alert-warning mt-3">
          {locationError}
          <br />
          <small className="text-muted">
             {language === "en"
          ? "You can click the lock icon in your browser’s address bar to enable location access manually."
          : "Puede hacer clic en el ícono de candado en la barra de direcciones de su navegador para habilitar el acceso a la ubicación manualmente."}
      
          </small>
        </div>
      ) : (
        <div ref={mapRef} style={{ width: "100%", height: "80vh" }} />
      )}
    </>
  );
}