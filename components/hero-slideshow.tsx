"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"

const slides = [
  {
    id: 1,
    image: "Images/Daily Specials.png",
    title: {
      en: "Discover Today's Special Menus",
      es: "Descubre los Menús Especiales de Hoy",
    },
  },
  {
    id: 2,
    image: "Images/Special Menus.png",
    title: {
      en: "Fresh and Delicious Daily Specials",
      es: "Especiales Diarios Frescos y Deliciosos",
    },
  },
  {
    id: 3,
    image: "Images//Restaurants Near You.png",
    title: {
      en: "Explore Local Restaurants Near You",
      es: "Explora Restaurantes Locales Cerca de Ti",
    },
  },
]

export function HeroSlideshow() {
  const { language } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div id="heroCarousel" className="carousel slide rounded overflow-hidden" data-bs-ride="carousel">
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${index === currentSlide ? "active" : ""}`}
            style={{ height: "200px" }}
          >
            <div className="position-relative h-100">
              <Image style={{ maxWidth:"300px" ,height:"800px"}}
                src={slide.image || "/placeholder.svg"}
                alt={slide.title[language]}
                fill
                className="object-fit-cover"
                priority={index === 0}
                style={{ filter: 'brightness(65%)' }}
                
              />
              <div className="carousel-caption  pb-4">
                
                <h2 className="lobsterFont"  style={{ textShadow: '0px 0px 3px #000000' }}>
                 {slide.title[language]}</h2>

              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === currentSlide ? "active" : ""}
            aria-current={index === currentSlide ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
          ></button>
        ))}
      </div>
    </div>
  )
}

