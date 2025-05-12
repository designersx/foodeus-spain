"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import hotFoodAnimation from "@/components/ui/hot-food.json";
import { useLanguage } from "@/context/language-context"; // <-- your language context


// Dynamically import Lottie only on client side
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

export default function MainScreenLoader() {
  const { language } = useLanguage(); // get current language
  const [showLoader, setShowLoader] = useState(false);
//   const [loadingText, setLoadingText] = useState("Searching your food...");
  const loadingText =
    language === "es"
      ? "Por favor espera mientras encontramos opciones deliciosas para ti."
      : "Please wait while we find delicious options for you!";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className="relative flex flex-col items-center justify-center">
        <div className="position-fixed top-60 start-50 translate-middle"
        style={{
          position: "fixed",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
      <Lottie
        animationData={hotFoodAnimation}
        loop
        className="w-32 h-32 sm:w-48 sm:h-48 mx-auto"
      /></div>
      <div className="position-fixedmt-1 text-lg font-medium text-gray-700 animate-pulse">
        {loadingText}
      </div>
    </div>
  );
}
