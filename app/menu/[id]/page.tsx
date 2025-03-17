"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

// Sample data - in a real app, this would come from an API
const menuItems = [
  {
    id: "1",
    name: "La Trattoria",
    location: "123 Main St, Anytown",
    coordinates: { lat: 40.7128, lng: -74.006 },
    menu: {
      title: {
        en: "Italian Pasta Special",
        es: "Especial de Pasta Italiana",
      },
      description: {
        en: "Homemade pasta with fresh tomato sauce, basil, and parmesan cheese. Our chef's special recipe passed down through generations. Made with locally sourced ingredients and served with a side of garlic bread.",
        es: "Pasta casera con salsa de tomate fresco, albahaca y queso parmesano. La receta especial de nuestro chef transmitida de generación en generación. Elaborada con ingredientes de origen local y servida con una guarnición de pan de ajo.",
      },
      image: "/placeholder.svg?height=400&width=800",
      items: [
        {
          en: "Spaghetti with Tomato Sauce",
          es: "Espaguetis con Salsa de Tomate",
        },
        {
          en: "Fettuccine Alfredo",
          es: "Fettuccine Alfredo",
        },
        {
          en: "Penne Arrabbiata",
          es: "Penne Arrabbiata",
        },
        {
          en: "Garlic Bread",
          es: "Pan de Ajo",
        },
        {
          en: "House Salad",
          es: "Ensalada de la Casa",
        },
      ],
      price: {
        en: "$15.99",
        es: "€14.50",
      },
    },
  },
  {
    id: "2",
    name: "El Rincón",
    location: "456 Oak Ave, Somewhere",
    coordinates: { lat: 40.7168, lng: -73.998 },
    menu: {
      title: {
        en: "Seafood Paella",
        es: "Paella de Mariscos",
      },
      description: {
        en: "Traditional Spanish rice dish with fresh seafood, saffron, and vegetables. Our paella is cooked in the authentic Spanish style in a wide, shallow pan to create the perfect socarrat (crispy bottom layer).",
        es: "Plato tradicional español de arroz con mariscos frescos, azafrán y verduras. Nuestra paella se cocina al estilo español auténtico en una paellera ancha y poco profunda para crear el socarrat perfecto (capa inferior crujiente).",
      },
      image: "/placeholder.svg?height=400&width=800",
      items: [
        {
          en: "Saffron Rice",
          es: "Arroz con Azafrán",
        },
        {
          en: "Mussels",
          es: "Mejillones",
        },
        {
          en: "Shrimp",
          es: "Gambas",
        },
        {
          en: "Calamari",
          es: "Calamares",
        },
        {
          en: "Bell Peppers",
          es: "Pimientos",
        },
      ],
      price: {
        en: "$24.99",
        es: "€22.50",
      },
    },
  },
  {
    id: "3",
    name: "Sushi Spot",
    location: "789 Pine Rd, Elsewhere",
    coordinates: { lat: 40.7218, lng: -74.012 },
    menu: {
      title: {
        en: "Sushi Combo Platter",
        es: "Plato Combinado de Sushi",
      },
      description: {
        en: "Assortment of fresh nigiri and maki rolls with wasabi and pickled ginger. Our sushi is prepared by master chefs using only the freshest fish delivered daily. Perfect for sharing or as a complete meal.",
        es: "Surtido de nigiri fresco y rollos maki con wasabi y jengibre encurtido. Nuestro sushi es preparado por chefs maestros utilizando solo el pescado más fresco entregado diariamente. Perfecto para compartir o como comida completa.",
      },
      image: "/placeholder.svg?height=400&width=800",
      items: [
        {
          en: "Salmon Nigiri (2 pcs)",
          es: "Nigiri de Salmón (2 pzs)",
        },
        {
          en: "Tuna Nigiri (2 pcs)",
          es: "Nigiri de Atún (2 pzs)",
        },
        {
          en: "California Roll (6 pcs)",
          es: "Roll California (6 pzs)",
        },
        {
          en: "Spicy Tuna Roll (6 pcs)",
          es: "Roll de Atún Picante (6 pzs)",
        },
        {
          en: "Miso Soup",
          es: "Sopa de Miso",
        },
      ],
      price: {
        en: "$22.99",
        es: "€20.50",
      },
    },
  },
  {
    id: "4",
    name: "Burger Joint",
    location: "101 Elm St, Nowhere",
    coordinates: { lat: 40.7148, lng: -74.016 },
    menu: {
      title: {
        en: "Gourmet Burger Special",
        es: "Especial de Hamburguesa Gourmet",
      },
      description: {
        en: "Angus beef patty with caramelized onions, artisan cheese, and truffle aioli. Our burgers are made with 100% grass-fed beef and served on a freshly baked brioche bun with a side of hand-cut fries.",
        es: "Hamburguesa de carne Angus con cebollas caramelizadas, queso artesanal y alioli de trufa. Nuestras hamburguesas están hechas con 100% de carne de res alimentada con pasto y se sirven en un pan brioche recién horneado con una guarnición de papas fritas cortadas a mano.",
      },
      image: "/placeholder.svg?height=400&width=800",
      items: [
        {
          en: "Angus Beef Patty",
          es: "Hamburguesa de Carne Angus",
        },
        {
          en: "Caramelized Onions",
          es: "Cebollas Caramelizadas",
        },
        {
          en: "Artisan Cheese",
          es: "Queso Artesanal",
        },
        {
          en: "Truffle Aioli",
          es: "Alioli de Trufa",
        },
        {
          en: "Hand-cut Fries",
          es: "Papas Fritas Cortadas a Mano",
        },
      ],
      price: {
        en: "$18.99",
        es: "€17.50",
      },
    },
  },
  {
    id: "5",
    name: "Thai Delight",
    location: "202 Maple Dr, Anyplace",
    coordinates: { lat: 40.7108, lng: -74.002 },
    menu: {
      title: {
        en: "Pad Thai Special",
        es: "Especial de Pad Thai",
      },
      description: {
        en: "Stir-fried rice noodles with tofu, bean sprouts, peanuts, and lime. Our authentic Pad Thai is prepared with traditional ingredients and techniques, offering the perfect balance of sweet, sour, and savory flavors.",
        es: "Fideos de arroz salteados con tofu, brotes de soja, cacahuetes y lima. Nuestro auténtico Pad Thai se prepara con ingredientes y técnicas tradicionales, ofreciendo el equilibrio perfecto de sabores dulces, ácidos y salados.",
      },
      image: "/placeholder.svg?height=400&width=800",
      items: [
        {
          en: "Rice Noodles",
          es: "Fideos de Arroz",
        },
        {
          en: "Tofu",
          es: "Tofu",
        },
        {
          en: "Bean Sprouts",
          es: "Brotes de Soja",
        },
        {
          en: "Crushed Peanuts",
          es: "Cacahuetes Triturados",
        },
        {
          en: "Lime Wedge",
          es: "Rodaja de Lima",
        },
      ],
      price: {
        en: "$16.99",
        es: "€15.50",
      },
    },
  },
]

export default function MenuDetailPage() {
  const { id } = useParams()
  const { language } = useLanguage()
  const [menuItem, setMenuItem] = useState<any>(null)

  useEffect(() => {
    // Find the menu item with the matching ID
    const item = menuItems.find((item) => item.id === id)
    if (item) {
      setMenuItem(item)
    }
  }, [id])

  if (!menuItem) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      {/* Content wrapper with padding to prevent content from being hidden behind buttons */}
      <div className="pb-5 mb-5">
        {/* Back button */}
        <Link href="/" className="d-inline-flex align-items-center text-decoration-none mb-3">
          <i className="bi bi-chevron-left me-1"></i>
          Back
        </Link>

        {/* Hero image */}
        <div className="position-relative rounded overflow-hidden mb-4" style={{ height: "250px" }}>
          <Image
            src={menuItem.menu.image || "/placeholder.svg"}
            alt={menuItem.menu.title[language]}
            fill
            className="object-fit-cover"
          />
          <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-gradient-dark">
            <h1 className="text-white fs-3 fw-bold mb-0">{menuItem.menu.title[language]}</h1>
            <div className="d-flex align-items-center text-white-50 small mt-1">
              <i className="bi bi-geo-alt me-1"></i>
              {menuItem.name} - {menuItem.location}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="fs-3 fw-bold text-primary mb-3">{menuItem.menu.price[language]}</div>

        {/* Description */}
        <div className="mb-4">
          <h2 className="fs-4 fw-semibold mb-2">{language === "en" ? "Description" : "Descripción"}</h2>
          <p className="text-secondary">{menuItem.menu.description[language]}</p>
        </div>

        {/* Menu items */}
        <div className="mb-4">
          <h2 className="fs-4 fw-semibold mb-2">{language === "en" ? "Includes" : "Incluye"}</h2>
          <ul className="list-unstyled">
            {menuItem.menu.items.map((item: any, index: number) => (
              <li key={index} className="d-flex align-items-center mb-2">
                <div className="bg-primary rounded-circle me-2" style={{ width: "8px", height: "8px" }}></div>
                {item[language]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action buttons - fixed at bottom */}
      <div className="fixed-bottom bg-white border-top p-3">
        <div className="container">
          <div className="row g-2">
            <div className="col-6">
              <Link href={`/directions/${menuItem.id}`} className="btn btn-primary w-100">
                {language === "en" ? "Take Me There" : "Llévame Allí"}
              </Link>
            </div>
            <div className="col-6">
              <Link href={`/full-menu/${menuItem.id}`} className="btn btn-outline-primary w-100">
                {language === "en" ? "Show Full Menu" : "Mostrar Menú Completo"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

