'use client';

import { MapView } from "@/components/map-view"
import Footer from "@/components/footer"
import {RestaurantMap} from "@/components/RestaurantMap";
import { useRestaurantStore } from "@/store/restaurantStore";

export default function MapPage() {
  const { restaurants, setRestaurants, hasFetched, setHasFetched } = useRestaurantStore();
  // console.log(restaurants)
  return (
    <>
     <RestaurantMap restaurants={restaurants} />
      {/* <MapView /> */}
      <Footer />
    </>
  )
}

