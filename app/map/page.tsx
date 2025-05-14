'use client';

import { MapView } from "@/components/map-view"
import { useEffect,useState } from "react";
import Footer from "@/components/footer"
import {RestaurantMap} from "@/components/RestaurantMap";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiService";
import { useLanguage } from "@/context/language-context";
interface Restaurant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  placeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function MapPage() {
  // const { restaurants, setRestaurants, hasFetched, setHasFetched } = useRestaurantStore();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
   const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");
  const [userLocationFromStorage, setUserLocationFromStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { language } = useLanguage();
  // console.log(restaurants)
  // useEffect(() => {
  //   if (restaurants.length === 0) {
  //     router.push('/');
  //   }
  // }, [restaurants, router]);

  // if (restaurants.length === 0) {
  //   return null; // or a spinner
  // }


   useEffect(() => {
      if (typeof window !== "undefined") {
        const locationVar = localStorage.getItem("userLocation");
        let userLocation2 = locationVar ? JSON.parse(locationVar) : null;
        if (userLocation2 && Object.keys(userLocation2).length === 0) {
          userLocation2 = null;
        }
        setUserLocationFromStorage(userLocation2);
      }
      }, []);

   useEffect(() => {
      const getLocationAsync = async () => {
        if (!navigator.geolocation) {
          setLocationError("Geolocation is not supported by your browser.");
          return;
        }
  
        setLoadingLocation(true);
  
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userPos);
            localStorage.setItem("userLocation", JSON.stringify(userPos));
            setLoadingLocation(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            if (error.code === error.PERMISSION_DENIED) {
              setLocationError(
                "Location access was denied. Please enable it in your browser settings."
              );
            } else {
              setLocationError("Unable to access your location.");
            }
            setLoadingLocation(false);
          }
        );
      };
  
      setTimeout(() => {
        getLocationAsync();
      }, 0);
  
      return () => {
        setLoadingLocation(false);
      };
    }, []);

      const fetchAndProcessRestaurants = async (append = false) => {

    try {
      const Lat = userLocationFromStorage?.lat || userLocation?.lat;
      const Lng = userLocationFromStorage?.lng || userLocation?.lng;
      // console.log("Lat", Lat,Lng);
      const data=await apiClient.get(`/enduser/getRestaurantListforMap?latitude=${Lat}&longitude=${Lng}&page=1`);
      const restaurants = data.data.data;
      // console.log("restaurants", restaurants);
      if (restaurants && restaurants.length > 0) {
        setRestaurants(restaurants);
      } else {
        console.log("No restaurants found");
        setError("No restaurants found");
      }
    } catch (error) {

      console.error("Error fetching restaurants:", error);
      setError("Error fetching restaurants");
    }
    finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    // console.log("userLocation", userLocation, userLocationFromStorage,restaurants);
    if (userLocation || userLocationFromStorage) {
      fetchAndProcessRestaurants();
    }
  }, [userLocation, userLocationFromStorage]);

     const Lat = userLocationFromStorage?.lat || userLocation?.lat;
      const Lng = userLocationFromStorage?.lng || userLocation?.lng;

   return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div
            style={{
              position: "fixed",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {language === "es" ? "Cargando..." : "Loading..."}
          </div>
        </div>
      ) : restaurants?.length > 0 ? (
        <>
          <RestaurantMap restaurants={restaurants} />
          <Footer />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <div
            style={{
              position: "fixed",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h1 className="text-2xl font-bold text-gray-700">
              {language === "es" ? "No se encontraron restaurantes" : error || "No restaurants found"}
            </h1>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};