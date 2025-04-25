'use client';

import { MapView } from "@/components/map-view"
import { useEffect } from "react";
import Footer from "@/components/footer"
import {RestaurantMap} from "@/components/RestaurantMap";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useRouter } from "next/navigation";

export default function MapPage() {
  const { restaurants, setRestaurants, hasFetched, setHasFetched } = useRestaurantStore();
  const router = useRouter();
  // console.log(restaurants)
  useEffect(() => {
    if (restaurants.length === 0) {
      router.push('/');
    }
  }, [restaurants, router]);

  if (restaurants.length === 0) {
    return null; // or a spinner
  }
  return (
    <>
    
      <RestaurantMap restaurants={restaurants} />      {/* <MapView /> */}
      <Footer />
    </>
  )
}

