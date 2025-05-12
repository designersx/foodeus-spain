import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";

export default function LocationLoader() {
  const { t, language: contextLanguage } = useLanguage();
  const [showLoader, setShowLoader] = useState(false);
  const [browserLanguage, setBrowserLanguage] = useState("en");

  // Detect browser language
  useEffect(() => {
    const detectedLanguage = navigator.language || navigator.languages[0] || "en";
    setBrowserLanguage(detectedLanguage.startsWith("es") ? "es" : "en");
  }, []);

  // Delay showing the loader to avoid flash on fast desktop browsers
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Use browser language if available, otherwise fall back to context language
  const displayLanguage = browserLanguage || contextLanguage || "en";

  // Don't render anything until the delay is complete
  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50 ">
      <div className="flex flex-col items-center">
        {/* Loader Animation */}
        <div className="relative w-24 h-24">
          {/* Spinning Plate */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-500 animate-spin-slow"></div>
          {/* Fork */}
          <div className="absolute w-6 h-6 top-0 left-1/2 transform -translate-x-1/2 animate-orbit-fork">
            {/* <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-800"
            >
              <path d="M12 3v12m-4-4h8" />
            </svg> */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-yellow-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 12h16M4 16h16M4 8c0-2 3-4 8-4s8 2 8 4M4 16c0 2 3 4 8 4s8-2 8-4" />
        </svg> */}
          </div>
          {/* Knife */}
          <div className="absolute w-6 h-6 bottom-0 left-1/2 transform -translate-x-1/2 animate-orbit-knife">
            {/* <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-800"
            >
              <path d="M12 3v18m-4-4h8" />
            </svg> */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l9 9-9 11L3 11z" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="14" cy="14" r="1" fill="currentColor" />
            <circle cx="10" cy="13" r="1" fill="currentColor" />
          </svg> */}
          <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6 text-red-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
          </div>
          {/* Center Pin (Location Dot) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="mt-4 text-lg font-semibold text-gray-800 animate-pulse">
          {displayLanguage === "es"
            ? "Buscando tu ubicación..."
            : "Finding your location..."}
        </p>
        <p className="mt-2 text-sm text-gray-500 text-center">
          {displayLanguage === "es"
            ? "Por favor, permite el acceso a la ubicación para encontrar restaurantes cercanos."
            : "Please allow location access to find nearby restaurants."}
        </p>
      </div>

      {/* Accessibility */}
      <span className="sr-only">{t("Loading")}</span>
    </div>
  );
}

