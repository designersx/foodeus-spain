"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"
import {API_BASE_URL, getRestaurantById} from "@/services/apiService"



interface MenuItem {
  title: { en: string; es: string };
  price: { en: string; es: string };
  description: { en: string; es: string };
  image: string;
}

interface FullMenu {
  buffet: MenuItem[];
  alaCarte: MenuItem[];
  comboMeals: MenuItem[];
  menuOfTheDay: MenuItem | null;
}

interface RawMenu {
  item_name?: string;
  price?: number;
  description?: string;
  image_url?: string;
  menu_type?: string;
  updated_at?: string;
}

interface RestaurantData {
  restaurant_id?: string;
  name?: string;
  menus?: RawMenu[];
}

const formatMenuData = (restaurantData: RestaurantData | null): { id: string; name: string; fullMenu: FullMenu } | null => {
  if (!restaurantData || !restaurantData.menus) return null;

  // Initialize structure
  const fullMenu: FullMenu = {
    buffet: [],
    alaCarte: [],
    comboMeals: [],
    menuOfTheDay: null,
  };

  // Iterate over menus and categorize
  restaurantData.menus.forEach((menu) => {
    const formattedMenu: MenuItem = {
      title: { en: menu.item_name || "", es: menu.item_name ||"" }, // Add Spanish translation if needed
      price: { en: `$${menu.price ?? 0}`, es: `€${((menu.price ?? 0) * 0.9).toFixed(2)}` }, // Example conversion
      description: { en: menu.description || "", es: menu.description ||"" }, // Add Spanish description
      image: menu.image_url || "/placeholder.svg?height=120&width=120",
    };

    const menuType = menu.menu_type?.normalize("NFD") || ""; // Handle undefined
    const today = new Date().toISOString().split("T")[0];
    switch (menuType) {
      case "Buffet":
        fullMenu.buffet.push(formattedMenu);
        break;
      case "À La Carte":
      case "À La Carte": // Handle different Unicode variations
      case "A La Carte": // Handle missing accents
      case "La Carte":
      case "� La Carte":
        fullMenu.alaCarte.push(formattedMenu);
        break;
      case "Combo Meals":
        fullMenu.comboMeals.push(formattedMenu);
        break;
      case "Today's Special":
        if (menu.updated_at) {
          const updatedDate = new Date(menu.updated_at).toISOString().split("T")[0];
          if (updatedDate === today) {
            fullMenu.menuOfTheDay = formattedMenu;
          }
        }
      
        break;
      default:
        break;
    }
  });

  return {
    id: restaurantData.restaurant_id || "",
    name: restaurantData.name || "",
    fullMenu,
  };
};

const isValidUrl = (url:string) => {
  const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
  return pattern.test(url);
};
export default function FullMenuPage() {
  const { id } = useParams()
  const { language } = useLanguage()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("menuOfTheDay")
  const [menuItems, setMenuItems] = useState(null);

  useEffect(() => {
    if (!id) return;
      getRestaurantById(`${id}`)
      .then((data) => {
        if (data.success && data.data) {
          const formattedData = formatMenuData(data.data);
          console.log('kk',data.data);
          setRestaurant(formattedData);
        }
      })
      .catch((err) => console.error("Error fetching restaurant:", err));
  }, [id]);


  useEffect(() => {
    if(!restaurant) return;
    if (restaurant?.fullMenu && !restaurant?.fullMenu?.menuOfTheDay) {
      setActiveTab("alaCarte");
    }
  }, [restaurant]);

  console.log(restaurant)
  if (!restaurant) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <p>Loading...</p>
      </div>
    )
  }
  

  return (
    <div className="pb-4">
      {/* Back button */}
      <Link href={`/menu/${id}`} className="d-inline-flex align-items-center text-decoration-none mb-3">
        <i className="bi bi-chevron-left me-1"></i>
        Back
      </Link>

      <h1 className="fs-3 fw-bold mb-4">
        {restaurant.name} - {language === "en" ? "Full Menu" : "Menú Completo"}
      </h1>

      <ul className="nav nav-tabs mb-4">
      {restaurant.fullMenu?.menuOfTheDay && (
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "menuOfTheDay" ? "active" : ""}`}
            onClick={() => setActiveTab("menuOfTheDay")}
          >
            {language === "en" ? "Today's Special" : "Especial de Hoy"}
          </button>
        </li>
        
      )
      }
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "alaCarte" ? "active" : ""}`}
            onClick={() => setActiveTab("alaCarte")}
          >
            {language === "en" ? "À La Carte" : "À La Carta"}
          </button>
        </li>
        {restaurant.fullMenu.buffet.length > 0 && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "buffet" ? "active" : ""}`}
              onClick={() => setActiveTab("buffet")}
            >
              {language === "en" ? "Buffet" : "Buffet"}
            </button>
          </li>
        )}
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "comboMeals" ? "active" : ""}`}
            onClick={() => setActiveTab("comboMeals")}
          >
            {language === "en" ? "Combo Meals" : "Combos"}
          </button>
        </li>
      </ul>
      {}
      <div className="tab-content">
        {restaurant.fullMenu?.menuOfTheDay && (
        <div className={`tab-pane fade ${activeTab === "menuOfTheDay" ? "show active" : ""}`}>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex gap-3">
                <div className="position-relative" style={{ width: "64px", height: "64px", flexShrink: 0 }}>
                  <Image
                    src={isValidUrl(restaurant.fullMenu?.menuOfTheDay?.image)
                      ? restaurant.fullMenu?.menuOfTheDay?.image
                      :`${API_BASE_URL}${restaurant.fullMenu?.menuOfTheDay?.image.split("/public")[1]}`|| "/placeholder.svg"}
                    alt={restaurant.fullMenu?.menuOfTheDay?.title[language]}
                    fill
                    className="object-fit-cover rounded"
                  />
                </div>
                <div>
                  <h3 className="fs-5 fw-bold">{restaurant.fullMenu?.menuOfTheDay?.title[language]}</h3>
                  <p className="small text-secondary mb-1">{restaurant?.fullMenu?.menuOfTheDay?.description[language]}</p>
                  <p className="text-primary fw-medium mb-0">{restaurant?.fullMenu?.menuOfTheDay?.price[language]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        <div className={`tab-pane fade ${activeTab === "alaCarte" ? "show active" : ""}`}>
          <div className="list-group">
            {restaurant.fullMenu.alaCarte.map((item: any, index: number) => (
              <div key={index} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="fs-5 fw-bold mb-1">{item.title[language]}</h3>
                    <p className="small text-secondary mb-0">{item.description[language]}</p>
                  </div>
                  <p className="text-primary fw-medium">{item.price[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`tab-pane fade ${activeTab === "buffet" ? "show active" : ""}`}>
          <div className="list-group">
            {restaurant.fullMenu.buffet.map((item: any, index: number) => (
              <div key={index} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="fs-5 fw-bold mb-1">{item.title[language]}</h3>
                    <p className="small text-secondary mb-0">{item.description[language]}</p>
                  </div>
                  <p className="text-primary fw-medium">{item.price[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`tab-pane fade ${activeTab === "comboMeals" ? "show active" : ""}`}>
          <div className="list-group">
            {restaurant.fullMenu.comboMeals.map((item: any, index: number) => (
              <div key={index} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="fs-5 fw-bold mb-1">{item.title[language]}</h3>
                    <p className="small text-secondary mb-0">{item.description[language]}</p>
                  </div>
                  <p className="text-primary fw-medium">{item.price[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

