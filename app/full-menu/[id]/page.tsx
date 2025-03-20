"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"
import {getRestaurantById} from "@/services/apiService"
// Sample data - in a real app, this would come from an API
// const restaurantMenus = [
//   {
//     id: "1",
//     name: "La Trattoria",
//     fullMenu: {
//       buffet: [
//         {
//           title: { en: "Weekend Brunch Buffet", es: "Buffet de Brunch de Fin de Semana" },
//           price: { en: "$24.99", es: "€22.50" },
//           description: {
//             en: "All-you-can-eat Italian brunch with pasta, pizza, salads, and desserts",
//             es: "Brunch italiano todo lo que puedas comer con pasta, pizza, ensaladas y postres",
//           },
//         },
//       ],
//       alaCarte: [
//         {
//           title: { en: "Margherita Pizza", es: "Pizza Margherita" },
//           price: { en: "$14.99", es: "€13.50" },
//           description: {
//             en: "Classic pizza with tomato sauce, mozzarella, and basil",
//             es: "Pizza clásica con salsa de tomate, mozzarella y albahaca",
//           },
//         },
//         {
//           title: { en: "Lasagna", es: "Lasaña" },
//           price: { en: "$16.99", es: "€15.50" },
//           description: {
//             en: "Layers of pasta, meat sauce, and cheese",
//             es: "Capas de pasta, salsa de carne y queso",
//           },
//         },
//         {
//           title: { en: "Tiramisu", es: "Tiramisú" },
//           price: { en: "$8.99", es: "€7.50" },
//           description: {
//             en: "Coffee-flavored Italian dessert",
//             es: "Postre italiano con sabor a café",
//           },
//         },
//       ],
//       comboMeals: [
//         {
//           title: { en: "Family Pasta Night", es: "Noche de Pasta Familiar" },
//           price: { en: "$49.99", es: "€45.00" },
//           description: {
//             en: "Serves 4: Choice of 2 pastas, garlic bread, and salad",
//             es: "Sirve 4: Elección de 2 pastas, pan de ajo y ensalada",
//           },
//         },
//       ],
//       menuOfTheDay: {
//         title: { en: "Italian Pasta Special", es: "Especial de Pasta Italiana" },
//         price: { en: "$15.99", es: "€14.50" },
//         description: {
//           en: "Homemade pasta with fresh tomato sauce, basil, and parmesan cheese",
//           es: "Pasta casera con salsa de tomate fresco, albahaca y queso parmesano",
//         },
//         image: "/placeholder.svg?height=120&width=120",
//       },
//     },
//   },
//   {
//     id: "2",
//     name: "El Rincón",
//     fullMenu: {
//       buffet: [
//         {
//           title: { en: "Spanish Tapas Buffet", es: "Buffet de Tapas Españolas" },
//           price: { en: "$29.99", es: "€27.50" },
//           description: {
//             en: "All-you-can-eat Spanish tapas and paella",
//             es: "Tapas españolas y paella todo lo que puedas comer",
//           },
//         },
//       ],
//       alaCarte: [
//         {
//           title: { en: "Patatas Bravas", es: "Patatas Bravas" },
//           price: { en: "$8.99", es: "€7.50" },
//           description: {
//             en: "Fried potatoes with spicy tomato sauce",
//             es: "Patatas fritas con salsa de tomate picante",
//           },
//         },
//         {
//           title: { en: "Gambas al Ajillo", es: "Gambas al Ajillo" },
//           price: { en: "$12.99", es: "€11.50" },
//           description: {
//             en: "Garlic shrimp",
//             es: "Camarones al ajo",
//           },
//         },
//         {
//           title: { en: "Flan", es: "Flan" },
//           price: { en: "$6.99", es: "€5.50" },
//           description: {
//             en: "Spanish caramel custard",
//             es: "Flan de caramelo español",
//           },
//         },
//       ],
//       comboMeals: [
//         {
//           title: { en: "Paella Feast", es: "Festín de Paella" },
//           price: { en: "$59.99", es: "€55.00" },
//           description: {
//             en: "Serves 4: Large paella, bread, and sangria",
//             es: "Sirve 4: Paella grande, pan y sangría",
//           },
//         },
//       ],
//       menuOfTheDay: {
//         title: { en: "Seafood Paella", es: "Paella de Mariscos" },
//         price: { en: "$24.99", es: "€22.50" },
//         description: {
//           en: "Traditional Spanish rice dish with fresh seafood, saffron, and vegetables",
//           es: "Plato tradicional español de arroz con mariscos frescos, azafrán y verduras",
//         },
//         image: "/placeholder.svg?height=120&width=120",
//       },
//     },
//   },
//   {
//     id: "3",
//     name: "Sushi Spot",
//     fullMenu: {
//       buffet: [
//         {
//           title: { en: "All-You-Can-Eat Sushi", es: "Sushi Todo lo que Puedas Comer" },
//           price: { en: "$34.99", es: "€32.50" },
//           description: {
//             en: "Unlimited sushi, sashimi, and rolls",
//             es: "Sushi, sashimi y rollos ilimitados",
//           },
//         },
//       ],
//       alaCarte: [
//         {
//           title: { en: "Salmon Nigiri (2 pcs)", es: "Nigiri de Salmón (2 pzs)" },
//           price: { en: "$5.99", es: "€5.50" },
//           description: {
//             en: "Fresh salmon over rice",
//             es: "Salmón fresco sobre arroz",
//           },
//         },
//         {
//           title: { en: "Dragon Roll", es: "Roll Dragón" },
//           price: { en: "$14.99", es: "€13.50" },
//           description: {
//             en: "Eel, cucumber, avocado",
//             es: "Anguila, pepino, aguacate",
//           },
//         },
//         {
//           title: { en: "Miso Soup", es: "Sopa de Miso" },
//           price: { en: "$3.99", es: "€3.50" },
//           description: {
//             en: "Traditional Japanese soup",
//             es: "Sopa tradicional japonesa",
//           },
//         },
//       ],
//       comboMeals: [
//         {
//           title: { en: "Sushi for Two", es: "Sushi para Dos" },
//           price: { en: "$45.99", es: "€42.00" },
//           description: {
//             en: "Chef's selection of nigiri, rolls, and appetizers",
//             es: "Selección del chef de nigiri, rollos y aperitivos",
//           },
//         },
//       ],
//       menuOfTheDay: {
//         title: { en: "Sushi Combo Platter", es: "Plato Combinado de Sushi" },
//         price: { en: "$22.99", es: "€20.50" },
//         description: {
//           en: "Assortment of fresh nigiri and maki rolls with wasabi and pickled ginger",
//           es: "Surtido de nigiri fresco y rollos maki con wasabi y jengibre encurtido",
//         },
//         image: "/placeholder.svg?height=120&width=120",
//       },
//     },
//   },
//   {
//     id: "4",
//     name: "Burger Joint",
//     fullMenu: {
//       buffet: [],
//       alaCarte: [
//         {
//           title: { en: "Classic Burger", es: "Hamburguesa Clásica" },
//           price: { en: "$12.99", es: "€11.50" },
//           description: {
//             en: "Beef patty, lettuce, tomato, onion",
//             es: "Carne de res, lechuga, tomate, cebolla",
//           },
//         },
//         {
//           title: { en: "Cheese Fries", es: "Papas con Queso" },
//           price: { en: "$6.99", es: "€5.50" },
//           description: {
//             en: "Fries topped with melted cheese",
//             es: "Papas fritas cubiertas con queso derretido",
//           },
//         },
//         {
//           title: { en: "Milkshake", es: "Batido" },
//           price: { en: "$5.99", es: "€5.50" },
//           description: {
//             en: "Vanilla, chocolate, or strawberry",
//             es: "Vainilla, chocolate o fresa",
//           },
//         },
//       ],
//       comboMeals: [
//         {
//           title: { en: "Family Burger Pack", es: "Paquete de Hamburguesas Familiar" },
//           price: { en: "$39.99", es: "€36.00" },
//           description: {
//             en: "4 burgers, 2 large fries, and 4 drinks",
//             es: "4 hamburguesas, 2 papas fritas grandes y 4 bebidas",
//           },
//         },
//       ],
//       menuOfTheDay: {
//         title: { en: "Gourmet Burger Special", es: "Especial de Hamburguesa Gourmet" },
//         price: { en: "$18.99", es: "€17.50" },
//         description: {
//           en: "Angus beef patty with caramelized onions, artisan cheese, and truffle aioli",
//           es: "Hamburguesa de carne Angus con cebollas caramelizadas, queso artesanal y alioli de trufa",
//         },
//         image: "/placeholder.svg?height=120&width=120",
//       },
//     },
//   },
//   {
//     id: "5",
//     name: "Thai Delight",
//     fullMenu: {
//       buffet: [
//         {
//           title: { en: "Thai Lunch Buffet", es: "Buffet de Almuerzo Tailandés" },
//           price: { en: "$19.99", es: "€18.50" },
//           description: {
//             en: "All-you-can-eat Thai favorites",
//             es: "Todo lo que puedas comer de favoritos tailandeses",
//           },
//         },
//       ],
//       alaCarte: [
//         {
//           title: { en: "Tom Yum Soup", es: "Sopa Tom Yum" },
//           price: { en: "$7.99", es: "€7.50" },
//           description: {
//             en: "Spicy and sour soup with shrimp",
//             es: "Sopa picante y ácida con camarones",
//           },
//         },
//         {
//           title: { en: "Green Curry", es: "Curry Verde" },
//           price: { en: "$14.99", es: "€13.50" },
//           description: {
//             en: "Chicken in green curry sauce with vegetables",
//             es: "Pollo en salsa de curry verde con verduras",
//           },
//         },
//         {
//           title: { en: "Mango Sticky Rice", es: "Arroz Pegajoso con Mango" },
//           price: { en: "$6.99", es: "€5.50" },
//           description: {
//             en: "Sweet sticky rice with fresh mango",
//             es: "Arroz pegajoso dulce con mango fresco",
//           },
//         },
//       ],
//       comboMeals: [
//         {
//           title: { en: "Thai Feast", es: "Festín Tailandés" },
//           price: { en: "$49.99", es: "€45.00" },
//           description: {
//             en: "Serves 4: Appetizers, 3 main dishes, rice, and dessert",
//             es: "Sirve 4: Aperitivos, 3 platos principales, arroz y postre",
//           },
//         },
//       ],
//       menuOfTheDay: {
//         title: { en: "Pad Thai Special", es: "Especial de Pad Thai" },
//         price: { en: "$16.99", es: "€15.50" },
//         description: {
//           en: "Stir-fried rice noodles with tofu, bean sprouts, peanuts, and lime",
//           es: "Fideos de arroz salteados con tofu, brotes de soja, cacahuetes y lima",
//         },
//         image: "/placeholder.svg?height=120&width=120",
//       },
//     },
//   },
// ]


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

    switch (menuType) {
      case "Buffet":
        fullMenu.buffet.push(formattedMenu);
        break;
      case "À La Carte":
      case "À La Carte": // Handle different Unicode variations
      case "A La Carte": // Handle missing accents
      case "La Carte":
        fullMenu.alaCarte.push(formattedMenu);
        break;
      case "Combo Meals":
        fullMenu.comboMeals.push(formattedMenu);
        break;
      case "Today's Special":
        fullMenu.menuOfTheDay = formattedMenu;
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
          setRestaurant(formattedData);
        }
      })
      .catch((err) => console.error("Error fetching restaurant:", err));
  }, [id]);

  // useEffect(() => {
  //   // Find the restaurant with the matching ID
  //   const place = restaurantMenus.find((r) => r.id === id)
  //   if (place) {
  //     setRestaurant(place)
  //   }
  // }, [id])

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
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "menuOfTheDay" ? "active" : ""}`}
            onClick={() => setActiveTab("menuOfTheDay")}
          >
            {language === "en" ? "Today's Special" : "Especial de Hoy"}
          </button>
        </li>
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

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === "menuOfTheDay" ? "show active" : ""}`}>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex gap-3">
                <div className="position-relative" style={{ width: "64px", height: "64px", flexShrink: 0 }}>
                  <Image
                    src={restaurant.fullMenu.menuOfTheDay.image || "/placeholder.svg"}
                    alt={restaurant.fullMenu.menuOfTheDay.title[language]}
                    fill
                    className="object-fit-cover rounded"
                  />
                </div>
                <div>
                  <h3 className="fs-5 fw-bold">{restaurant.fullMenu.menuOfTheDay.title[language]}</h3>
                  <p className="small text-secondary mb-1">{restaurant.fullMenu.menuOfTheDay.description[language]}</p>
                  <p className="text-primary fw-medium mb-0">{restaurant.fullMenu.menuOfTheDay.price[language]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

