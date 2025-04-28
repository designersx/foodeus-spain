import { useEffect } from "react";

const useGoogleMaps = () => {
  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.maps) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`;
    script.async = true;
    script.defer = true;

    // Append script to head
    document.head.appendChild(script);

    // Once script is loaded, initialize Google Maps
    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      // Initialize your map here or perform any action you need after the map is loaded
    };

    // Clean up the script tag after component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []); // Empty dependency array to run only once on mount

};

export default useGoogleMaps;
