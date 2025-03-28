// app/coming-soon/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/language-context";

export default function ComingSoonPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const title = language === "es" ? "🚧 ¡Próximamente!" : "🚧 Coming Soon!";
  const description =
    language === "es"
      ? "Esta función está en desarrollo y estará disponible pronto. ¡Mantente atento!"
      : "This feature is under development and will be available soon. Stay tuned!";

  return (
    <>
      <div className=" DishMain">
<div className="DishImages">
<img src="/Images/Dish-ViewComing.png"/>

</div>


        <span className="commingDish">{title}</span>
        {/* <p className="text-lg text-gray-600 max-w-md mb-6">ferfefefefefdef{description}</p> */}
        {/* <button onClick={() => router.back()} className="bg-black text-white px-4 py-2 rounded">Go Back</button> */}
      </div>
      <Footer />
    </>
  );
}
