// 'use client';

// import { useEffect, useRef } from 'react';

// export function RestaurantMap ({ restaurants }) {
//   const mapRef = useRef(null);
//   const categoryIcons = {
//     Hamburguesas: "🍔",
//     Mexicano: "2",
//     Español: "3",
//     Default: "4",
//   };

//   useEffect(() => {
//     const loadMap = () => {
//       const map = new google.maps.Map(mapRef.current, {
//         center: { lat: 40.4218679, lng: -3.7222287 },
//         zoom: 15,
//         styles: [
//             {
//               featureType: 'poi',
//               stylers: [{ visibility: 'off' }],
//             },
//             {
//               featureType: 'transit',
//               stylers: [{ visibility: 'off' }],
//             },
//             {
//               featureType: 'road.local',
//               stylers: [{ visibility: 'simplified' }],
//             },
//           ],
//       });

//       const service = new google.maps.places.PlacesService(map);

//       restaurants.forEach((restaurant) => {
//         const marker = new google.maps.Marker({
//             position: {
//               lat: restaurant.coordinates.lat,
//               lng: restaurant.coordinates.lng,
//             },
//             map,
//             title: restaurant.name,
//             label: categoryIcons[restaurant.category] || categoryIcons.Default,
//           })

//         const infoWindow = new google.maps.InfoWindow();

//         marker.addListener('click', () => {
//             if (restaurant.place_id) {
//               service.getDetails({ placeId: restaurant.place_id }, (place, status) => {
//                 if (status === google.maps.places.PlacesServiceStatus.OK) {
//                   const photoUrl = place.photos?.[0]?.getUrl({ maxWidth: 200 }) || '';
//                   const content = `
//                     <strong>${place.name}</strong><br/>
//                     ⭐ ${place.rating || 'N/A'}<br/>
//                     <p>${place.formatted_address || ''}</p>
//                     ${photoUrl ? `<img src="${photoUrl}" style="width:100px;"><br/>` : ''}
//                     <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}', '_blank')">Take me there</button>
//                   `;
//                   infoWindow.setContent(content);
//                   infoWindow.open(map, marker);
//                 }
//               });
//             } else {
//               // fallback: show your data
//               const content = `
//                 <strong>${restaurant.name}</strong><br/>
//                 ⭐ ${restaurant.rating || 'N/A'}<br/>
//                 ${restaurant.category || ''}
//                 <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}', '_blank')">Take me there</button>
//               `;
//               infoWindow.setContent(content);
//               infoWindow.open(map, marker);
//             }
//           });
          
//       });
//     };

//     if (!window.google) {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
//       script.async = true;
//       script.defer = true;
//       window.initMap = loadMap;
//       document.head.appendChild(script);
//     } else {
//       loadMap();
//     }
//   }, [restaurants]);

//   return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
// };


// 'use client';

// import { useEffect, useRef } from 'react';

// export function RestaurantMap({ restaurants }) {
//   const mapRef = useRef(null);
//   const directionsRendererRef = useRef(null); // for reuse
//   const directionsServiceRef = useRef(null);
//   const infoWindowRef = useRef(null);

//   const categoryIcons = {
//     Hamburguesas: "🍔",
//     Mexicano: "🌮",
//     Español: "🥘",
//     Default: "🍽️",
//   };

//   useEffect(() => {
//     const loadMap = () => {
//       const center = restaurants[0]?.coordinates || { lat: 40.4218679, lng: -3.7222287 };

//       const map = new google.maps.Map(mapRef.current, {
//         center,
//         zoom: 15,
//         styles: [
//           { featureType: 'poi', stylers: [{ visibility: 'off' }] },
//           { featureType: 'transit', stylers: [{ visibility: 'off' }] },
//         ],
//       });

//       directionsRendererRef.current = new google.maps.DirectionsRenderer();
//       directionsServiceRef.current = new google.maps.DirectionsService();
//       directionsRendererRef.current.setMap(map);

//       infoWindowRef.current = new google.maps.InfoWindow();

//       restaurants.forEach((restaurant, index) => {
//         const marker = new google.maps.Marker({
//           position: {
//             lat: restaurant.coordinates.lat,
//             lng: restaurant.coordinates.lng,
//           },
//           map,
//           title: restaurant.name,
//           label: {
//             text: categoryIcons[restaurant.category] || categoryIcons.Default,
//             fontSize: '16px',
//           },
//         });

//         const imageUrl = restaurant.photo_reference
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${restaurant.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//           : '';

//         const content = `
//           <div style="min-width: 200px;">
//             <strong>${restaurant.name}</strong><br/>
//             Category: ${restaurant.category}<br/>
//             ⭐ ${restaurant.rating || 'N/A'}<br/>
//             ${imageUrl ? `<img src="${imageUrl}" style="width:100%; margin-top: 5px;" />` : ''}
//             <br/>
//             <button id="route-btn-${index}" style="margin-top: 5px;">Take me there</button>
//           </div>
//         `;

//         marker.addListener('click', () => {
//           infoWindowRef.current.setContent(content);
//           infoWindowRef.current.open(map, marker);

//           // Wait for the InfoWindow to be rendered in the DOM
//           google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
//             const routeBtn = document.getElementById(`route-btn-${index}`);
//             if (routeBtn) {
//               routeBtn.onclick = () => {
//                 navigator.geolocation.getCurrentPosition(
//                   (pos) => {
//                     const origin = {
//                       lat: pos.coords.latitude,
//                       lng: pos.coords.longitude,
//                     };
//                     const destination = {
//                       lat: restaurant.coordinates.lat,
//                       lng: restaurant.coordinates.lng,
//                     };

//                     directionsServiceRef.current.route(
//                       {
//                         origin,
//                         destination,
//                         travelMode: 'DRIVING',
//                       },
//                       (result, status) => {
//                         if (status === 'OK') {
//                           directionsRendererRef.current.setDirections(result);
//                         } else {
//                           alert('Directions request failed due to ' + status);
//                         }
//                       }
//                     );
//                   },
//                   () => {
//                     alert('Could not get your location.');
//                   }
//                 );
//               };
//             }
//           });
//         });
//       });
//     };

//     if (!window.google) {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
//       script.async = true;
//       script.defer = true;
//       window.initMap = loadMap;
//       document.head.appendChild(script);
//     } else {
//       loadMap();
//     }
//   }, [restaurants]);

//   return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
// }

//withpit navigateion but perfect

// 'use client';

// import { useEffect, useRef ,useState} from 'react';

// export function RestaurantMap({ restaurants }) {
//   const mapRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const directionsServiceRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const userMarkerRef = useRef(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const categoryIcons = {
//     Hamburguesas: '🍔',
//     Mexicano: '🌮',
//     Español: '🥘',
//     Default: '🍽️',
//   };

//   useEffect(() => {
//     // Fetch user's location
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setUserLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         });
//       },
//       (error) => {
//         console.error("Error getting location:", error);
//         setUserLocation({ lat: 40.4218679, lng: -3.7222287 }); // Fallback if denied
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000, // 10 seconds timeout
//         maximumAge: 0,
//       }
//     );
//   }, []);

//   useEffect(() => {
//     if (!userLocation) return; 
//     const loadMap = () => {
//       const center =userLocation;

//       const map = new google.maps.Map(mapRef.current, {
//         center,
//         zoom: 15,
//         styles: [
//           { featureType: 'poi', stylers: [{ visibility: 'off' }] },
//           { featureType: 'transit', stylers: [{ visibility: 'off' }] },
//         ],
//       });

//       userMarkerRef.current = new google.maps.Marker({
//         position: userLocation,
//         map,
//         title: 'Your Location',
//         icon: {
//           path: google.maps.SymbolPath.CIRCLE,
//           scale: 8,
//           fillColor: '#4285F4',
//           fillOpacity: 1,
//           strokeWeight: 2,
//           strokeColor: 'white',
//         },
//       });

//       directionsRendererRef.current = new google.maps.DirectionsRenderer();
//       directionsServiceRef.current = new google.maps.DirectionsService();
//       directionsRendererRef.current.setMap(map);

//       infoWindowRef.current = new google.maps.InfoWindow();

//       restaurants.forEach((restaurant, index) => {
//         const marker = new google.maps.Marker({
//           position: {
//             lat: restaurant.coordinates.lat,
//             lng: restaurant.coordinates.lng,
//           },
//           map,
//           title: restaurant.name,
//           label: {
//             text: categoryIcons[restaurant.category] || categoryIcons.Default,
//             fontSize: '16px',
//           },
//         });

//         const imageUrl = restaurant.photo_reference
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${restaurant.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//           : '';

//         const content = `
//           <div style="min-width: 200px;">
//             <strong>${restaurant.name}</strong><br/>
//             Category: ${restaurant.category}<br/>
//             ⭐ ${restaurant.rating || 'N/A'}<br/>
//             ${imageUrl ? `<img src="${imageUrl}" style="width:100%; margin-top: 5px;" />` : ''}
//             <br/>
//             <button id="route-btn-${index}" style="margin-top: 5px;">Take me there</button>
//             <div id="distance-info-${index}" style="margin-top: 5px;"></div>
//           </div>
//         `;

//         // marker.addListener('click', () => {
//         //   infoWindowRef.current.setContent(content);
//         //   infoWindowRef.current.open(map, marker);

//         //   google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
//         //     const routeBtn = document.getElementById(`route-btn-${index}`);
//         //     const distanceInfoDiv = document.getElementById(`distance-info-${index}`);

//         //     if (routeBtn) {
//         //       routeBtn.onclick = () => {
//         //         navigator.geolocation.getCurrentPosition(
//         //           (pos) => {
//         //             const origin = {
//         //               lat: pos.coords.latitude,
//         //               lng: pos.coords.longitude,
//         //             };
//         //             const destination = {
//         //               lat: restaurant.coordinates.lat,
//         //               lng: restaurant.coordinates.lng,
//         //             };

//         //             directionsServiceRef.current.route(
//         //               {
//         //                 origin,
//         //                 destination,
//         //                 travelMode: 'DRIVING',
//         //               },
//         //               (result, status) => {
//         //                 if (status === 'OK') {
//         //                   directionsRendererRef.current.setDirections(result);
//         //                   const leg = result.routes[0].legs[0];
//         //                   const distanceText = leg.distance.text;
//         //                   const durationText = leg.duration.text;

//         //                   if (distanceInfoDiv) {
//         //                     distanceInfoDiv.innerHTML = `
//         //                       🚗 Distance: <strong>${distanceText}</strong><br/>
//         //                       ⏱️ Estimated Time: <strong>${durationText}</strong>
//         //                     `;
//         //                   }
//         //                 } else {
//         //                   alert('Directions request failed: ' + status);
//         //                 }
//         //               }
//         //             );
//         //           },
//         //           () => {
//         //             alert('Could not get your location.');
//         //           }
//         //         );
//         //       };
//         //     }
//         //   });
//         // });

//         marker.addListener('click', () => {
//           // Close any existing infoWindow before opening a new one
//           infoWindowRef.current.close();
        
//           const buttonId = `route-btn-${index}`;
//           const distanceDivId = `distance-info-${index}`;
        
//           const content = `
//             <div style="min-width: 200px;">
//               <strong>${restaurant.name}</strong><br/>
//               Category: ${restaurant.category}<br/>
//               ⭐ ${restaurant.rating || 'N/A'}<br/>
//               ${imageUrl ? `<img src="${imageUrl}" style="width:100%; margin-top: 5px;" />` : ''}
//               <br/>
//               <button id="${buttonId}" style="margin-top: 5px;">Take me there</button>
//               <div id="${distanceDivId}" style="margin-top: 5px;"></div>
//             </div>
//           `;
        
//           infoWindowRef.current.setContent(content);
//           infoWindowRef.current.open(map, marker);
        
//           google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
//             const routeBtn = document.getElementById(buttonId);
//             const distanceInfoDiv = document.getElementById(distanceDivId);
        
//             if (routeBtn) {
//               routeBtn.onclick = () => {
//                 directionsRendererRef.current.set('directions', null); // ✅ Clear existing route
//                 infoWindowRef.current.close(); // ✅ Close info window so only route is visible
        
//                 navigator.geolocation.getCurrentPosition(
//                   (pos) => {
//                     const origin = {
//                       lat: pos.coords.latitude,
//                       lng: pos.coords.longitude,
//                     };
//                     const destination = {
//                       lat: restaurant.coordinates.lat,
//                       lng: restaurant.coordinates.lng,
//                     };
        
//                     directionsServiceRef.current.route(
//                       {
//                         origin,
//                         destination,
//                         travelMode: 'DRIVING',
//                       },
//                       (result, status) => {
//                         if (status === 'OK') {
//                           directionsRendererRef.current.setDirections(result);
        
//                           const leg = result.routes[0].legs[0];
//                           const distanceText = leg.distance.text;
//                           const durationText = leg.duration.text;
        
//                           infoWindowRef.current.setContent(`
//                             <div style="min-width: 200px;">
//                               <strong>${restaurant.name}</strong><br/>
//                               🚗 Distance: <strong>${distanceText}</strong><br/>
//                               ⏱️ Estimated Time: <strong>${durationText}</strong><br/>
//                               <button id="${buttonId}" style="margin-top: 5px;">Recalculate</button>
//                             </div>
//                           `);
//                           infoWindowRef.current.open(map, marker);
//                         } else {
//                           alert('Directions request failed: ' + status);
//                         }
//                       }
//                     );
//                   },
//                   () => {
//                     alert('Could not get your location.');
//                   }
//                 );
//               };
//             }
//           });
//         });
        
//       });
//     };

//     if (!window.google) {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
//       script.async = true;
//       script.defer = true;
//       window.initMap = loadMap;
//       document.head.appendChild(script);
//     } else {
//       loadMap();
//     }
//   }, [userLocation,restaurants]);

//   return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
// }

//working with lang support routing & on click menu od day card direc route starts  
// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { useLanguage } from "@/context/language-context"
// import { useSearchParams } from 'next/navigation';

// export function RestaurantMap({ restaurants }) {
//   const mapRef = useRef(null);
//   const googleMapRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const directionsServiceRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const userMarkerRef = useRef(null);
//   const navigationWatcherId = useRef(null);
//   const lastSentLocation = useRef(null);
//   const markerRefs = useRef([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const { language } = useLanguage()
//   const searchParams = useSearchParams();
//   const targetLat = parseFloat(searchParams.get('lat'));
//   const targetLng = parseFloat(searchParams.get('lng'));
//   const targetId = searchParams.get('id');
//   const hideMark= searchParams.get('mark');
//   const [hideMarker,setHideMarker]= useState(false);
//   // console.log(targetLat, targetLng, targetId)

 
//   const categoryIcons = {
//     Hamburguesas: '🍔',
//     Mexicano: '🌮',
//     Español: '🥘',
//     Default: '🍽️',
//   };

//   const getDistanceInMeters = (lat1, lng1, lat2, lng2) => {
//     const R = 6371000;
//     const toRad = (value) => (value * Math.PI) / 180;
//     const dLat = toRad(lat2 - lat1);
//     const dLng = toRad(lng2 - lng1);
//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos(toRad(lat1)) *
//         Math.cos(toRad(lat2)) *
//         Math.sin(dLng / 2) ** 2;
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const hitNavigateAPI = (location, restaurant) => {
//     fetch('/api/navigate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         restaurantId: restaurant.id,
//         currentLat: location.lat,
//         currentLng: location.lng,
//         timestamp: new Date().toISOString(),
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => console.log('Navigate API hit:', data))
//       .catch((err) => console.error('Navigate API error:', err));
//   };

//   const stopNavigation = () => {
//     if (navigationWatcherId.current) {
//       navigator.geolocation.clearWatch(navigationWatcherId.current);
//       navigationWatcherId.current = null;
//       lastSentLocation.current = null;
//       alert('Navigation stopped.');
//     }
//   };
  
//   const clearMarkers = () => {
//     markerRefs.current.forEach((m) => m.setMap(null));
//     markerRefs.current = [];
//   };

//   useEffect(() => {
//     const watchId = navigator.geolocation.watchPosition(
//       (pos) => {
//         console.log("Accuracy (meters):", pos.coords.accuracy);
//         const accuratePosition = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
//         setUserLocation(accuratePosition);
//         console.log('ACCURACY',accuratePosition)
//         navigator.geolocation.clearWatch(watchId); // stop after first accurate reading
//       },
//       () => {
//         setUserLocation({ lat: 40.4218679, lng: -3.7222287 }); // fallback
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       }
//     );
//   }, []);

//   useEffect(() => {
//     if (!userLocation) return;
//     if(targetLat && targetLng && targetId){
//       setHideMarker(true)
//     }

//     const loadMap = () => {
//       const map = new google.maps.Map(mapRef.current, {
//         center: userLocation,
//         zoom: 15,
//         styles: [
//           { featureType: 'poi', stylers: [{ visibility: 'off' }] },
//           { featureType: 'transit', stylers: [{ visibility: 'off' }] },
//         ],
//       });
//       googleMapRef.current = map;

//       // targeted from list view
//          const targetRestaurant = targetLat && targetLng
//       ? {
//           id: targetId,
//           name: searchParams.get('name'),
//           coordinates: { lat: targetLat, lng: targetLng },
//         }
//       : null;
//       // console.log('dsd',targetRestaurant);
//       if (targetRestaurant) {
        
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const origin = {
//               lat: pos.coords.latitude,
//               lng: pos.coords.longitude,
//             };
//             const destination = targetRestaurant.coordinates;
  
//             directionsServiceRef.current.route(
//               {
//                 origin,
//                 destination,
//                 travelMode: 'DRIVING',
//               },
//               (result, status) => {
//                 if (status === 'OK') {
//                   directionsRendererRef.current.setDirections(result);
//                   const leg = result.routes[0].legs[0];
//                   const distanceText = leg.distance.text;
//                   const durationText = leg.duration.text;
  
//                   const infoContent = `
//                     <div style="min-width: 200px;">
//                       <strong>${targetRestaurant.name}</strong><br/>
//                       🚗 Distance: <strong>${distanceText}</strong><br/>
//                       ⏱️ Estimated Time: <strong>${durationText}</strong>
//                     </div>
//                   `;
//                   const tempMarker = new google.maps.Marker({
//                     position: destination,
//                     map,
//                     title: targetRestaurant.name,
//                   });
//                   infoWindowRef.current.setContent(infoContent);
//                   infoWindowRef.current.open(map, tempMarker);
//                 }
//               }
//             );
//           },
//           () => {
//             alert('Could not get your location.');
//           }
//         );
//       }
    
      

//       userMarkerRef.current = new google.maps.Marker({
//         position: userLocation,
//         map,
//         title: 'Your Location',
//         icon: {
//           path: google.maps.SymbolPath.CIRCLE,
//           scale: 8,
//           fillColor: '#4285F4',
//           fillOpacity: 1,
//           strokeWeight: 2,
//           strokeColor: 'white',
//         },
//       });

//       directionsRendererRef.current = new google.maps.DirectionsRenderer();
//       directionsServiceRef.current = new google.maps.DirectionsService();
//       directionsRendererRef.current.setMap(map);
//       infoWindowRef.current = new google.maps.InfoWindow();

//       const controlDiv = document.createElement('div');
//       controlDiv.style.margin = '10px';

//       const relocateBtn = document.createElement('button');
//       relocateBtn.innerHTML = language === 'es' ? '📍 Reubicar' : '📍 Relocate';;
//       relocateBtn.style.cssText =
//         'background:#4285F4;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px';

//       relocateBtn.onclick = () => {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const newLoc = {
//               lat: pos.coords.latitude,
//               lng: pos.coords.longitude,
//             };
//             setUserLocation(newLoc);
//             userMarkerRef.current?.setPosition(newLoc);
//             map.setCenter(newLoc);
//             map.setZoom(15);
//           },
//           () => alert('Failed to retrieve location.'),
//           { enableHighAccuracy: true }
//         );
//       };
      
//         const stopBtn = document.createElement('button');
//         // stopBtn.innerHTML = language === 'es' ? '🛑 Detener navegación' : '🛑 Stop Navigation'
//         // stopBtn.style.cssText =
//         //   'margin-left:10px;background:#d9534f;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px';
//         // stopBtn.onclick = stopNavigation;
      
   

//       controlDiv.appendChild(relocateBtn);
//       controlDiv.appendChild(stopBtn);
//       map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
//       // console.log('hideMarker',hideMark)
//       !hideMark && restaurants.forEach((restaurant, index) => {
//         const marker = new google.maps.Marker({
//           position: restaurant.coordinates,
//           map,
//           title: restaurant.name,
//           label: {
//             text: categoryIcons[restaurant.category] || categoryIcons.Default,
//             fontSize: '16px',
//           },
//         });

//         const imageUrl = restaurant.photo_reference
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${restaurant.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//           : '';

//         const buttonId = `route-btn-${index}`;
//         const navBtnId = `start-navigation-${index}`;
//         const takeMeThereLabel = language === 'es' ? 'Llévame allí' : 'Take me there';
//         const categoryLabel = language === 'es' ? 'Categoría' : 'Category';
//         const content = `
//           <div style="min-width: 200px;">
//             <strong>${restaurant.name}</strong><br/>
//             ${categoryLabel}: ${restaurant.category}<br/>
//             ⭐ ${restaurant.rating || 'N/A'}<br/>
//             ${imageUrl ? `<img src="${imageUrl}" style="width:100%; margin-top: 5px;" />` : ''}
//             <br/>
//             <button id="${buttonId}" style="margin-top: 5px;">${takeMeThereLabel}</button>
//             <div id="distance-info-${index}" style="margin-top: 5px;"></div>
//           </div>
//         `;

//         marker.addListener('click', () => {
//           infoWindowRef.current.setContent(content);
//           infoWindowRef.current.open(map, marker);

//           google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
//             const routeBtn = document.getElementById(buttonId);
//             if (routeBtn) {
//               setHideMarker(true);
//               routeBtn.onclick = () => {
//                 navigator.geolocation.getCurrentPosition(
//                   (pos) => {
//                     const origin = {
//                       lat: pos.coords.latitude,
//                       lng: pos.coords.longitude,
//                     };
//                     const destination = restaurant.coordinates;

//                     directionsServiceRef.current.route(
//                       {
//                         origin,
//                         destination,
//                         travelMode: 'DRIVING',
//                       },
//                       (result, status) => {
//                         if (status === 'OK') {
//                           directionsRendererRef.current.setDirections(result);
//                           const leg = result.routes[0].legs[0];
//                           const distanceText = leg.distance.text;
//                           const durationText = leg.duration.text;
//                           const distanceLabel = language === 'es' ? 'Distancia' : 'Distance';
//                           const timeLabel = language === 'es' ? 'Tiempo estimado' : 'Estimated Time';

//                           infoWindowRef.current.setContent(`
//                             <div style="min-width: 200px;">
//                               <strong>${restaurant.name}</strong><br/>
//                               🚗 ${distanceLabel}: <strong>${distanceText}</strong><br/>
//                               ⏱️ ${timeLabel}: <strong>${durationText}</strong><br/>
                          
//                             </div>
//                           `);
//                           infoWindowRef.current.open(map, marker);

//                           google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
//                             const navBtn = document.getElementById(navBtnId);
//                             if (navBtn) {
//                               navBtn.onclick = () => {
//                                 if (navigationWatcherId.current) {
//                                   navigator.geolocation.clearWatch(navigationWatcherId.current);
//                                 }
//                                 navigationWatcherId.current = navigator.geolocation.watchPosition(
//                                   (pos) => {
//                                     const currLoc = {
//                                       lat: pos.coords.latitude,
//                                       lng: pos.coords.longitude,
//                                     };
//                                     userMarkerRef.current?.setPosition(currLoc);
//                                     if (!lastSentLocation.current) {
//                                       lastSentLocation.current = currLoc;
//                                       // hitNavigateAPI(currLoc, restaurant);
//                                     } else {
//                                       const dist = getDistanceInMeters(
//                                         lastSentLocation.current.lat,
//                                         lastSentLocation.current.lng,
//                                         currLoc.lat,
//                                         currLoc.lng
//                                       );
//                                       if (dist >= 500) {
//                                         hitNavigateAPI(currLoc, restaurant);
//                                         lastSentLocation.current = currLoc;
//                                       }
//                                     }
//                                   },
//                                   (err) => console.error('Tracking error', err),
//                                   { enableHighAccuracy: true, maximumAge: 0 }
//                                 );
//                               };
//                             }
//                           });
//                         } else {
//                           alert('Directions request failed: ' + status);
//                         }
//                       }
//                     );
//                   },
//                   () => alert('Could not get your location.')
//                 );
//               };
//             }
//           });
//         });
//       });
//     };

//     if (!window.google) {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
//       script.async = true;
//       script.defer = true;
//       window.initMap = loadMap;
//       document.head.appendChild(script);
//     } else {
//       loadMap();
//     }
//   }, [userLocation, restaurants]);

//   return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
// }



// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { useLanguage } from "@/context/language-context"
// import { useSearchParams } from 'next/navigation';

// export function RestaurantMap({ restaurants }) {
  
//   const mapRef = useRef(null);
//   const googleMapRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const directionsServiceRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const userMarkerRef = useRef(null);
//   const navigationWatcherId = useRef(null);
//   const lastSentLocation = useRef(null);
//   const markerRefs = useRef([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const { language } = useLanguage()
//   const searchParams = useSearchParams();
//   const targetLat = parseFloat(searchParams.get('lat'));
//   const targetLng = parseFloat(searchParams.get('lng'));
//   const targetId = searchParams.get('id');
//   const hideMark= searchParams.get('mark');
//   const [hideMarker,setHideMarker]= useState(searchParams.get('mark'))
//   const [locationError, setLocationError] = useState("");
//   // console.log(targetLat, targetLng, targetId)

 
//   const categoryIcons = {
//     Hamburguesas: '🍔',
//     Mexicano: '🌮',
//     Español: '🥘',
//     Default: '🍽️',
//   };

//   const retryGeolocation = () => {
//   setLoading(true);
//   setLocationError("");

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const userPos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude,
//       };
//       setUserLocation(userPos);
//       // re-run your restaurant logic here...
//       setLoading(false);
//     },
//     (error) => {
//       console.error("Retry location error:", error);

//       if (error.code === error.PERMISSION_DENIED) {
//         setLocationError("Location access is still denied. Please enable it in your browser settings.");
//       } else {
//         setLocationError("Unable to access your location.");
//       }

//       setLoading(false);
//     }
//   );
// };

//   const getDistanceInMeters = (lat1, lng1, lat2, lng2) => {
//     const R = 6371000;
//     const toRad = (value) => (value * Math.PI) / 180;
//     const dLat = toRad(lat2 - lat1);
//     const dLng = toRad(lng2 - lng1);
//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos(toRad(lat1)) *
//         Math.cos(toRad(lat2)) *
//         Math.sin(dLng / 2) ** 2;
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const hitNavigateAPI = (location, restaurant) => {
//     fetch('/api/navigate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         restaurantId: restaurant.id,
//         currentLat: location.lat,
//         currentLng: location.lng,
//         timestamp: new Date().toISOString(),
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => console.log('Navigate API hit:', data))
//       .catch((err) => console.error('Navigate API error:', err));
//   };

//   const stopNavigation = () => {
//     if (navigationWatcherId.current) {
//       navigator.geolocation.clearWatch(navigationWatcherId.current);
//       navigationWatcherId.current = null;
//       lastSentLocation.current = null;
//       alert('Navigation stopped.');
//     }
//   };  
  
//   const clearMarkers = () => {
//     markerRefs.current.forEach((m) => m.setMap(null));
//     markerRefs.current = [];
//   };
//   useEffect(() => {
//     const watchId = navigator.geolocation.watchPosition(
//       (pos) => {
//         console.log("Accuracy (meters):", pos.coords.accuracy);
  
//         const accuratePosition = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
  
//         setUserLocation(accuratePosition);
  
//         // Stop watching after first accurate position
//         navigator.geolocation.clearWatch(watchId);
//       },
//       (error) => {
//         // console.error("Geolocation error:", error);
  
//         if (error.code === error.PERMISSION_DENIED) {
//           setLocationError("Location access was denied. Please enable it in your browser settings.");
//         } else if (error.code === error.POSITION_UNAVAILABLE) {
//           setLocationError("Unable to determine your location. Please try again later.");
//         } else if (error.code === error.TIMEOUT) {
//           setLocationError("Location request timed out. Please ensure location is enabled.");
//         } else {
//           setLocationError("An unknown error occurred while accessing your location.");
//         }
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       }
//     );
//   }, []);
  

//   useEffect(() => {
//     if (!userLocation) return;
//     if(targetLat && targetLng && targetId){
//       setHideMarker(true)
//     }

//     const loadMap = () => {
//       const map = new google.maps.Map(mapRef.current, {
//         center: userLocation,
//         zoom: 15,
//         styles: [
//           { featureType: 'poi', stylers: [{ visibility: 'off' }] },
//           { featureType: 'transit', stylers: [{ visibility: 'off' }] },
//         ],
//       });
//       googleMapRef.current = map;

//       // targeted from list view
//          const targetRestaurant = targetLat && targetLng
//       ? {
//           id: targetId,
//           name: searchParams.get('name'),
//           coordinates: { lat: targetLat, lng: targetLng },
//         }
//       : null;
//       // console.log('dsd',targetRestaurant);
//       if (targetRestaurant) {
        
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const origin = {
//               lat: pos.coords.latitude,
//               lng: pos.coords.longitude,
//             };
//             const destination = targetRestaurant.coordinates;
  
//             directionsServiceRef.current.route(
//               {
//                 origin,
//                 destination,
//                 travelMode: 'DRIVING',
//                 provideRouteAlternatives: true,
//                 avoidTolls: false,             
//                 avoidHighways: false,           
//                 avoidFerries: true,  
//               },
//               (result, status) => {
//                 if (status === 'OK') {
//                   directionsRendererRef.current.setMap(null);
//                   directionsRendererRef.current.set('directions', null);
//                   directionsRendererRef.current.setMap(googleMapRef.current);
                  
//                   const bestRoute = result.routes.reduce((min, curr) => {
//                     const currDistance = curr.legs[0].distance.value;
//                     return currDistance < min.legs[0].distance.value ? curr : min;
//                   }, result.routes[0])

                  
//                     directionsRendererRef.current.setDirections({
//                       ...result,
//                       routes: [bestRoute],
//                     });
//                   console.log('best route direct', bestRoute)
//                   // const leg = result.routes[0].legs[0];
//                   const leg = bestRoute.legs[0];
//                   const distanceText1 = leg.distance.text;
//                   const  durationText1 = leg.duration.text;
//                   const distanceLabel = language === 'es' ? 'Distancia' : 'Distance';
//                   const timeLabel = language === 'es' ? 'Tiempo estimado' : 'Estimated Time';
//                   const infoContent = `
//                     <div style="min-width: 200px;">
//                       <strong>${targetRestaurant.name}</strong><br/>
//                       🚗 ${distanceLabel}: <strong>${distanceText1}</strong><br/>
//                       ⏱️ ${timeLabel}: <strong>${durationText1}</strong>
//                     </div>
//                   `;
//                   const tempMarker = new google.maps.Marker({
//                     position: destination,
//                     map,
//                     title: targetRestaurant.name,
//                   });
//                   infoWindowRef.current.setContent(infoContent);
//                   infoWindowRef.current.open(map, tempMarker);
//                 }

//               }
//             );
//           },
//           () => {
//             alert('Could not get your location.');
//           }
//         );
//       }

//       userMarkerRef.current = new google.maps.Marker({
//         position: userLocation,
//         map,
//         title: 'Your Location',
//         icon: {
//           path: google.maps.SymbolPath.CIRCLE,
//           scale: 8,
//           fillColor: '#4285F4',
//           fillOpacity: 1,
//           strokeWeight: 2,
//           strokeColor: 'white',
//         },
//       });

//       directionsRendererRef.current = new google.maps.DirectionsRenderer();
//       directionsServiceRef.current = new google.maps.DirectionsService();
//       directionsRendererRef.current.setMap(map);
//       infoWindowRef.current = new google.maps.InfoWindow();

//       const controlDiv = document.createElement('div');
//       controlDiv.style.margin = '10px';

//       const relocateBtn = document.createElement('button');
//       relocateBtn.innerHTML = language === 'es' ? '📍 Reubicar' : '📍 Relocate';;
//       relocateBtn.style.cssText =
//         'background:#4285F4;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px';

//       relocateBtn.onclick = () => {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const newLoc = {
//               lat: pos.coords.latitude,
//               lng: pos.coords.longitude,
//             };
//             setUserLocation(newLoc);
//             userMarkerRef.current?.setPosition(newLoc);
//             map.setCenter(newLoc);
//             map.setZoom(15);
//           },
//           () => alert('Failed to retrieve location.'),
//           { enableHighAccuracy: true }
//         );
//       };
//         const stopBtn = document.createElement('button');
//         // stopBtn.innerHTML = language === 'es' ? '🛑 Detener navegación' : '🛑 Stop Navigation'
//         // stopBtn.style.cssText =
//         //   'margin-left:10px;background:#d9534f;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px';
//         // stopBtn.onclick = stopNavigation;

//       controlDiv.appendChild(relocateBtn);
//       controlDiv.appendChild(stopBtn);
//       map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

//       map.addListener('idle', () => {
//       // console.log('hideMarker',hideMark)
//       const bounds = map.getBounds();
//       if (!bounds) return;
//       clearMarkers();
//       const visibleRestaurants = restaurants.filter((restaurant) => {
//         const position = new google.maps.LatLng(
//           restaurant.coordinates.lat,
//           restaurant.coordinates.lng
//         );
//         const inBounds = bounds.contains(position);
//         const distance = getDistanceInMeters(
//           userLocation.lat,
//           userLocation.lng,
//           restaurant.coordinates.lat,
//           restaurant.coordinates.lng
//         );
//         return inBounds && distance <= 5000;
//       });

//       !hideMarker && visibleRestaurants.forEach((restaurant, index) => {
//         const marker = new google.maps.Marker({
//           position: restaurant.coordinates,
//           map,
//           title: restaurant.name,
//           label: {
//             text: categoryIcons[restaurant.category] || categoryIcons.Default,
//             fontSize: '16px',
//           },
//         });

//         markerRefs.current.push(marker);

//         const imageUrl = restaurant.photo_reference
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${restaurant.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
//           : '';

//         const buttonId = `route-btn-${index}`;
//         const navBtnId = `start-navigation-${index}`;
//         const takeMeThereLabel = language === 'es' ? 'Llévame allí' : 'Take me there';
//         const categoryLabel = language === 'es' ? 'Categoría' : 'Category';
//         const content = `
//           <div style="min-width: 200px;">
//             <strong>${restaurant.name}</strong><br/>
//             ${categoryLabel}: ${restaurant.category}<br/>
//             ⭐ ${restaurant.rating || 'N/A'}<br/>
//             ${imageUrl ? `<img src="${imageUrl}" style="width:100%; margin-top: 5px;" />` : ''}
//             <br/>
//             <button id="${buttonId}" style="
//               margin-top: 8px;
//               background-color: #4285F4;
//               color: white;
//               border: none;
//               padding: 8px 14px;
//               border-radius: 6px;
//               font-size: 14px;
//               cursor: pointer;
//               box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
//               transition: background-color 0.3s ease;
//             ">
//               ${takeMeThereLabel}
//             </button>
//             <div id="distance-info-${index}" style="margin-top: 5px;"></div>
//           </div>
//         `;
        
//         marker.addListener('click', () => {
//           ;
//           map.panTo(marker.getPosition());
         

//           google.maps.event.addListenerOnce(map, 'idle', () => {
//             setTimeout(() => {
//               infoWindowRef.current.setContent(content)
//               infoWindowRef.current.open(map, marker);
//               const routeBtn = document.getElementById(buttonId);
//               if (routeBtn) {
//                 routeBtn.onclick = () => {
//                   navigator.geolocation.getCurrentPosition(
//                     (pos) => {
//                       const origin = {
//                         lat: pos.coords.latitude,
//                         lng: pos.coords.longitude,
//                       };
//                       const destination = restaurant.coordinates;
//                       directionsServiceRef.current.route(
//                         {
//                           origin,
//                           destination,
//                           travelMode: 'DRIVING',
//                           provideRouteAlternatives: true, 
//                           avoidTolls: false,              
//                           avoidHighways: false,           
//                           avoidFerries: false,  
//                         },
//                         (result, status) => {
//                           if (status === 'OK') {
//                             directionsRendererRef.current.setDirections({ routes: [] });
//                             const bestRoute = result.routes.reduce((min, curr) => {
//                               const currDistance = curr.legs[0].distance.value;
//                               return currDistance < min.legs[0].distance.value ? curr : min;
//                             }, result.routes[0]);
//                             // console.log('bestroute',bestRoute);
//                             directionsRendererRef.current.setDirections({
//                               ...result,
//                               routes: [bestRoute],
//                             });
  
//                             const leg = bestRoute.legs[0];
//                             const distanceText = leg.distance.text;
//                             const durationText = leg.duration.text;
//                             const distanceLabel = language === 'es' ? 'Distancia' : 'Distance';
//                             const timeLabel = language === 'es' ? 'Tiempo estimado' : 'Estimated Time';
  
//                             infoWindowRef.current.setContent(`
//                               <div style="min-width: 200px;">
//                                 <strong>${restaurant.name}</strong><br/>
//                                 🚗 ${distanceLabel}: <strong>${distanceText}</strong><br/>
//                                 ⏱️ ${timeLabel}: <strong>${durationText}</strong><br/>
                            
//                               </div>
//                             `);
                       
//                               infoWindowRef.current.open(map, marker);
                      
  
//                             google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
//                               const navBtn = document.getElementById(navBtnId);
//                               if (navBtn) {
//                                 navBtn.onclick = () => {
//                                   if (navigationWatcherId.current) {
//                                     navigator.geolocation.clearWatch(navigationWatcherId.current);
//                                   }
//                                   navigationWatcherId.current = navigator.geolocation.watchPosition(
//                                     (pos) => {
//                                       const currLoc = {
//                                         lat: pos.coords.latitude,
//                                         lng: pos.coords.longitude,
//                                       };
//                                       userMarkerRef.current?.setPosition(currLoc);
//                                       if (!lastSentLocation.current) {
//                                         lastSentLocation.current = currLoc;
//                                         // hitNavigateAPI(currLoc, restaurant);
//                                       } else {
//                                         const dist = getDistanceInMeters(
//                                           lastSentLocation.current.lat,
//                                           lastSentLocation.current.lng,
//                                           currLoc.lat,
//                                           currLoc.lng
//                                         );
//                                         if (dist >= 500) {
//                                           hitNavigateAPI(currLoc, restaurant);
//                                           lastSentLocation.current = currLoc;
//                                         }
//                                       }
//                                     },
//                                     (err) => console.error('Tracking error', err),
//                                     { enableHighAccuracy: true, maximumAge: 0 }
//                                   );
//                                 };
//                               }
//                             });
//                           } else {
//                             alert('Directions request failed: ' + status);
//                           }
//                         }
//                       );
//                     },
//                     () => alert('Could not get your location.')
//                   );
//                 };
//               }
//             }, 50);
//           });
       
//         });
     
//       });
//     })
//     };

//     if (!window.google) {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
//       script.async = true;
//       script.defer = true;
//       window.initMap = loadMap;
//       document.head.appendChild(script);
//     } else {
//       loadMap();
//     }
//   }, [userLocation, restaurants]);

//   // return <div ref={mapRef} style={{ width: '100%', height: '80vh' }} />;
//   return (
//     <>
//       {locationError ? (
//         <div className="alert alert-warning mt-3">
//           {locationError} <br />
//           <small className="text-muted">
//             You can click the lock icon in your browser’s address bar to enable location access manually.
//           </small>
//           <div className="mt-2">
//             <button className="btn btn-sm btn-outline-primary" onClick={retryGeolocation}>
//               Try Again
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div ref={mapRef} style={{ width: '100%', height: '80vh' }} />
//       )}
//     </>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { useSearchParams } from "next/navigation";

// Segment 1: Initialize Map
const initializeMap = (mapRef, userLocation) => {
  return new google.maps.Map(mapRef.current, {
    center: userLocation,
    zoom: 15,
    styles: [
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
    ],
  });
};

// Segment 2: Create User Marker
const createUserMarker = (map, userLocation) => {
  return new google.maps.Marker({
    position: userLocation,
    map,
    title: "Your Location",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
    },
  });
};

// Segment 3: Add Map Controls
const addMapControls = (map, language, setUserLocation, stopNavigation) => {
  const controlDiv = document.createElement("div");
  controlDiv.style.margin = "10px";

  const relocateBtn = document.createElement("button");
  relocateBtn.innerHTML = language === "es" ? "📍 Reubicar" : "📍 Relocate";
  relocateBtn.style.cssText =
    "background:#4285F4;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px";
  relocateBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        map.setCenter(newLoc);
        map.setZoom(15);
      },
      () => alert("Failed to retrieve location."),
      { enableHighAccuracy: true }
    );
  };

  const stopBtn = document.createElement("button");
  stopBtn.innerHTML = language === "es" ? "🛑 Detener navegación" : "🛑 Stop Navigation";
  stopBtn.style.cssText =
    "margin-left:10px;background:#d9534f;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px";
  stopBtn.onclick = stopNavigation;

  controlDiv.appendChild(relocateBtn);
  controlDiv.appendChild(stopBtn);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
};

// Segment 4: Handle Target Restaurant Directions
const handleTargetRestaurant = (
  targetRestaurant,
  directionsServiceRef,
  directionsRendererRef,
  googleMapRef,
  infoWindowRef,
  language
) => {
  if (!targetRestaurant) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const destination = targetRestaurant.coordinates;

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: "DRIVING",
          provideRouteAlternatives: true,
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: true,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current.set("directions", null);
            directionsRendererRef.current.setMap(googleMapRef.current);

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

            const infoContent = `
              <div style="min-width: 200px;">
                <strong>${targetRestaurant.name}</strong><br/>
                🚗 ${distanceLabel}: <strong>${distanceText}</strong><br/>
                ⏱️ ${timeLabel}: <strong>${durationText}</strong>
              </div>
            `;
            const tempMarker = new google.maps.Marker({
              position: destination,
              map: googleMapRef.current,
              title: targetRestaurant.name,
            });
            infoWindowRef.current.setContent(infoContent);
            infoWindowRef.current.open(googleMapRef.current, tempMarker);
          }
        }
      );
    },
    () => alert("Could not get your location.")
  );
};

// Segment 5: Add Restaurant Markers (Final Fix)
const addRestaurantMarkers = (
  map,
  restaurants,
  userLocation,
  hideMarker,
  infoWindowRef,
  directionsServiceRef,
  directionsRendererRef,
  language,
  markerRefs,
  userMarkerRef,
  stopNavigation,
  hitNavigateAPI,
  navigationWatcherId,
  lastSentLocation,
  navigating
) => {
  const bounds = map.getBounds();
  if (!bounds) return;

  const getDistanceInMeters = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearAllMarkersExceptUser = () => {
    markerRefs.current.forEach((m) => m.setMap(null));
    markerRefs.current = [];
    userMarkerRef.current.setMap(map); // Ensure user marker persists
  };

  if (navigating) return; // Skip adding markers if navigating

  clearAllMarkersExceptUser();

  const visibleRestaurants = restaurants.filter((restaurant) => {
    const position = new google.maps.LatLng(restaurant.coordinates.lat, restaurant.coordinates.lng);
    const inBounds = bounds.contains(position);
    const distance = getDistanceInMeters(
      userLocation.lat,
      userLocation.lng,
      restaurant.coordinates.lat,
      restaurant.coordinates.lng
    );
    return inBounds && distance <= 5000;
  });

  if (!hideMarker) {
    const categoryIcons = {
      Hamburguesas: "🍔",
      Mexicano: "🌮",
      Español: "🥘",
      Default: "🍽️",
    };

    visibleRestaurants.forEach((restaurant, index) => {
      const marker = new google.maps.Marker({
        position: restaurant.coordinates,
        map,
        title: restaurant.name,
        label: {
          text: categoryIcons[restaurant.category] || categoryIcons.Default,
          fontSize: "16px",
        },
      });
      markerRefs.current.push(marker);

      const imageUrl = restaurant.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${restaurant.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        : "";
      const buttonId = `route-btn-${index}`;
      const takeMeThereLabel = language === "es" ? "Llévame allí" : "Take me there";
      const categoryLabel = language === "es" ? "Categoría" : "Category";
      const stopLabel = language === "es" ? "Detener navegación" : "Stop Navigation";
      const content = `
        <div style="min-width: 200px;">
          <strong>${restaurant.name}</strong><br/>
          ${categoryLabel}: ${restaurant.category}<br/>
          ⭐ ${restaurant.rating || "N/A"}<br/>
          ${imageUrl ? `<img src="${imageUrl}" style="width:100%; margin-top: 5px;" />` : ""}
          <br/>
          <button id="${buttonId}" style="
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
            ${takeMeThereLabel}
          </button>
          <div id="distance-info-${index}" style="margin-top: 5px;"></div>
        </div>
      `;

      marker.addListener("click", () => {
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);

        const attachRouteButton = () => {
          const routeBtn = document.getElementById(buttonId);
          if (routeBtn) {
            routeBtn.onclick = (e) => {
              e.stopPropagation();
              clearAllMarkersExceptUser();
              const destinationMarker = new google.maps.Marker({
                position: restaurant.coordinates,
                map,
                title: restaurant.name,
                label: {
                  text: categoryIcons[restaurant.category] || categoryIcons.Default,
                  fontSize: "16px",
                },
              });
              markerRefs.current = [destinationMarker];

              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  const destination = restaurant.coordinates;
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
                            <button id="stop-btn-${index}" style="
                              margin-top: 8px;
                              background-color: #d9534f;
                              color: white;
                              border: none;
                              padding: 8px 14px;
                              border-radius: 6px;
                              font-size: 14px;
                              cursor: pointer;
                              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                            ">
                              ${stopLabel}
                            </button>
                          </div>
                        `;
                        infoWindowRef.current.close();
                        infoWindowRef.current.setContent(navContent);
                        infoWindowRef.current.open(map, destinationMarker);

                        const attachStopButton = () => {
                          const stopBtn = document.getElementById(`stop-btn-${index}`);
                          if (stopBtn) {
                            stopBtn.onclick = (e) => {
                              e.stopPropagation();
                              stopNavigation();
                              directionsRendererRef.current.setDirections({ routes: [] });
                              infoWindowRef.current.close();
                              addRestaurantMarkers(
                                map,
                                restaurants,
                                userLocation,
                                hideMarker,
                                infoWindowRef,
                                directionsServiceRef,
                                directionsRendererRef,
                                language,
                                markerRefs,
                                userMarkerRef,
                                stopNavigation,
                                hitNavigateAPI,
                                navigationWatcherId,
                                lastSentLocation,
                                false // Reset navigating state
                              );
                            };
                          } else {
                            setTimeout(attachStopButton, 100); // Retry if DOM not ready
                          }
                        };
                        setTimeout(attachStopButton, 100);
                      } else {
                        alert("Directions request failed: " + status);
                      }
                    }
                  );
                },
                () => alert("Could not get your location.")
              );
            };
          } else {
            setTimeout(attachRouteButton, 100); // Retry if DOM not ready
          }
        };
        setTimeout(attachRouteButton, 100);
      });
    });
  }
};

// Main Component
export function RestaurantMap({ restaurants }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const navigationWatcherId = useRef(null);
  const lastSentLocation = useRef(null);
  const markerRefs = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [navigating, setNavigating] = useState(false); // New state to track navigation
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const targetLat = parseFloat(searchParams.get("lat"));
  const targetLng = parseFloat(searchParams.get("lng"));
  const targetId = searchParams.get("id");
  const hideMark = searchParams.get("mark");
  const [hideMarker, setHideMarker] = useState(searchParams.get("mark"));

  const retryGeolocation = () => {
    setLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(userPos);
        setLoading(false);
      },
      (error) => {
        console.error("Retry location error:", error);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location access is still denied. Please enable it in your browser settings."
            : "Unable to access your location."
        );
        setLoading(false);
      }
    );
  };

  const hitNavigateAPI = (location, restaurant) => {
    fetch("/api/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        currentLat: location.lat,
        currentLng: location.lng,
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Navigate API hit:", data))
      .catch((err) => console.error("Navigate API error:", err));
  };

  const stopNavigation = () => {
    if (navigationWatcherId.current) {
      navigator.geolocation.clearWatch(navigationWatcherId.current);
      navigationWatcherId.current = null;
      lastSentLocation.current = null;
      setNavigating(false); // Reset navigation state
      alert("Navigation stopped.");
    }
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("Accuracy (meters):", pos.coords.accuracy);
        const accuratePosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(accuratePosition);
        navigator.geolocation.clearWatch(watchId);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. Please enable it in your browser settings."
            : error.code === error.POSITION_UNAVAILABLE
            ? "Unable to determine your location. Please try again later."
            : error.code === error.TIMEOUT
            ? "Location request timed out. Please ensure location is enabled."
            : "An unknown error occurred while accessing your location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    if (targetLat && targetLng && targetId) setHideMarker(true);

    const loadMap = () => {
      const map = initializeMap(mapRef, userLocation);
      googleMapRef.current = map;

      const targetRestaurant =
        targetLat && targetLng
          ? { id: targetId, name: searchParams.get("name"), coordinates: { lat: targetLat, lng: targetLng } }
          : null;

      userMarkerRef.current = createUserMarker(map, userLocation);
      directionsRendererRef.current = new google.maps.DirectionsRenderer();
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current.setMap(map);
      infoWindowRef.current = new google.maps.InfoWindow();

      addMapControls(map, language, setUserLocation, () => {
        stopNavigation();
        setNavigating(false);
        addRestaurantMarkers(
          map,
          restaurants,
          userLocation,
          hideMarker,
          infoWindowRef,
          directionsServiceRef,
          directionsRendererRef,
          language,
          markerRefs,
          userMarkerRef,
          stopNavigation,
          hitNavigateAPI,
          navigationWatcherId,
          lastSentLocation,
          false
        );
      });
      handleTargetRestaurant(
        targetRestaurant,
        directionsServiceRef,
        directionsRendererRef,
        googleMapRef,
        infoWindowRef,
        language
      );
      map.addListener("idle", () =>
        addRestaurantMarkers(
          map,
          restaurants,
          userLocation,
          hideMarker,
          infoWindowRef,
          directionsServiceRef,
          directionsRendererRef,
          language,
          markerRefs,
          userMarkerRef,
          stopNavigation,
          hitNavigateAPI,
          navigationWatcherId,
          lastSentLocation,
          navigating
        )
      );
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = loadMap;
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, [userLocation, restaurants, navigating]);

  return (
    <>
      {locationError ? (
        <div className="alert alert-warning mt-3">
          {locationError} <br />
          <small className="text-muted">
            You can click the lock icon in your browser’s address bar to enable location access manually.
          </small>
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-primary" onClick={retryGeolocation}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div ref={mapRef} style={{ width: "100%", height: "80vh" }} />
      )}
    </>
  );
}
