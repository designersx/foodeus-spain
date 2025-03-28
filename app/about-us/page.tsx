"use client";

import React from "react";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/language-context";
import Link from "next/link";

export default function AboutUsPage() {
  const { language } = useLanguage();

  const title = language === "es" ? "Sobre Nosotros" : "About Us";

  const description =
    language === "es"
      ? `Foodeus es tu puerta de entrada a la vibrante escena culinaria de Madrid. Nuestro objetivo es ayudarte a descubrir restaurantes auténticos, explorar menús del día y disfrutar experiencias gastronómicas locales. Nos apasiona conectar a las personas con la buena comida y apoyar a los negocios locales.`
      : `Foodeus is your gateway to Madrid’s vibrant food scene. Our goal is to help you discover authentic restaurants, explore daily menus, and enjoy local dining experiences. We’re passionate about connecting people to great food and supporting local businesses.`;

  return (
    <>
      <div className="min-h-screen bg-white px-6 sm:px-12 md:px-24 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
          {title}
        </h1>

        <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-10">
          {description}
        </p>

        {/* <div className="flex justify-center gap-6 flex-wrap">
          <Link
            href="/contact"
            className="text-blue-600 font-medium hover:underline transition"
          >
            {language === "es" ? "Contáctanos" : "Contact Us"}
          </Link>
          <Link
            href="/faq"
            className="text-blue-600 font-medium hover:underline transition"
          >
            {language === "es" ? "Preguntas Frecuentes" : "FAQs"}
          </Link>
          <Link
            href="https://instagram.com/foodeys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline transition"
          >
            Instagram
          </Link>
        </div> */}
      </div>

      <Footer />
    </>
  );
}
