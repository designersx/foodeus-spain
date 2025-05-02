// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { useLanguage } from "@/context/language-context";
// import { API_BASE_URL, getRestaurantMenuById } from "@/services/apiService";
// import { getMenuImagePath } from "@/utils/getImagePath";

// interface MenuItem {
//   title: string;
//   price: string;
//   description: string;
//   image: string | undefined;
// }

// interface FullMenu {
//   [key: string]: MenuItem[]; // Dynamically handle different menu types
//   menuOfTheDay: MenuItem[] | null; // Allow null or an array of MenuItems
// }

// interface RawMenu {
//   item_name?: string;
//   price?: number;
//   description?: string;
//   image_url?: string;
//   menu_type?: string;
//   updated_at?: string;
// }

// interface RestaurantData {
//   restaurant_id?: string;
//   name?: string;
//   menus?: RawMenu[];
// }

// const formatMenuData = (
//   restaurantData: RestaurantData | null
// ): { id: string; name: string; fullMenu: FullMenu } | null => {
//   if (!restaurantData || !restaurantData.menus) return null;

//   const fullMenu: FullMenu = {
//     menuOfTheDay: null,
//   };
//   // Iterate over menus and categorize
//   restaurantData?.menus?.forEach((menu) => {
//     menu?.item_list?.forEach((item: any) => {
//       const formattedMenu: MenuItem = {
//         title: item.name || "",
//         price: `€${item.price ?? 0}`,
//         description: item.description || "",
//         image: item.image,
//       };
//       const menuType = item.item_type?.normalize("NFD") || ""; // Handle undefined
//       const today = new Date().toISOString().split("T")[0];
//       if (!fullMenu[menuType]) {
//         fullMenu[menuType] = [];
//       }
//       fullMenu[menuType].push(formattedMenu);
//     });
//   });

//   return {
//     id: restaurantData.restaurant_id || "",
//     name: restaurantData.name || "",
//     fullMenu,
//   };
// };
// const isValidUrl = (url: string) => {
//   const pattern = new RegExp("^(https?:\\/\\/)"); // Simple regex to check for valid URL
//   return pattern.test(url);
// };
// export default function FullMenuPage() {
//   const { id } = useParams();
//   const { language } = useLanguage();
//   const [restaurant, setRestaurant] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState("menuOfTheDay");
//   const [menuItems, setMenuItems] = useState(null);
//   const [src, setSrc] = useState<string>("");
//   useEffect(() => {
//     if (!id) return;
//     getRestaurantMenuById(`${id}`)
//       .then((data) => {
//         if (data.success && data.data) {
//           const formattedData = formatMenuData(data.data);
//           // console.log('kk',data.data);
//           setRestaurant(formattedData);
//         }
//       })
//       .catch((err) => console.error("Error fetching restaurant:", err));
//   }, [id]);

//   useEffect(() => {
//     if (!restaurant) return;

//     // Check if "menuOfTheDay" is available and set activeTab accordingly
//     if (restaurant?.fullMenu?.menuOfTheDay) {
//       setActiveTab("menuOfTheDay");
//     } else {
//       // If menuOfTheDay is not available, set the first available menu type
//       const availableMenuTypes = Object.keys(restaurant.fullMenu).filter(
//         (key) => key !== "menuOfTheDay" && restaurant.fullMenu[key].length > 0
//       );
//       if (availableMenuTypes.length > 0) {
//         setActiveTab(availableMenuTypes[0]);
//       }
//     }

//     setSrc(getMenuImagePath(restaurant.fullMenu?.menuOfTheDay?.image));
//   }, [restaurant]);

//   if (!restaurant) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "50vh" }}
//       >
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="pb-4">
//       {/* Back button */}
//       <Link
//         href={`/menu/${id}`}
//         className="d-inline-flex align-items-center text-decoration-none mb-3"
//       >
//         <i className="bi bi-chevron-left me-1"></i>
//         Back
//       </Link>

//       <h1 className="fs-3 fw-bold mb-4">
//         {restaurant.name} {language === "en" ? "Full Menu" : "Menú Completo"}
//       </h1>
//       <div className="fullMenu">
//         <ul className="nav nav-tabs">
//           {/* Check if "Menu of the Day" exists, if so make it the first tab */}
//           {restaurant.fullMenu.menuOfTheDay && (
//             <li className="nav-item">
//               <button
//                 className={`nav-link ${
//                   activeTab === "menuOfTheDay" ? "active" : ""
//                 }`}
//                 onClick={() => setActiveTab("menuOfTheDay")}
//               >
//                 {language === "en" ? "Today's Special" : "Especial de Hoy"}
//               </button>
//             </li>
//           )}

//           {/* Render other menu tabs dynamically */}
//           {Object.keys(restaurant.fullMenu)
//             .filter(
//               (menuType) =>
//                 menuType !== "menuOfTheDay" &&
//                 restaurant.fullMenu[menuType].length > 0
//             )
//             .map((menuType) => (
//               <li className="nav-item" key={menuType}>
//                 <button
//                   className={`nav-link ${
//                     activeTab === menuType ? "active" : ""
//                   }`}
//                   onClick={() => setActiveTab(menuType)}
//                 >
//                   {language === "en" ? menuType : menuType}
//                 </button>
//               </li>
//             ))}
//         </ul>
//       </div>
//       {}
//       <div className="tab-content">
//         {restaurant.fullMenu?.menuOfTheDay && (
//           <div
//             className={`tab-pane fade ${
//               activeTab === "menuOfTheDay" ? "show active" : ""
//             }`}
//           >
//             <div className="card mb-3">
//               <div className="card-body">
//                 <div className="d-flex gap-3">
//                   <div
//                     className="position-relative"
//                     style={{ width: "64px", height: "64px", flexShrink: 0 }}
//                   >
//                     <Image
//                       src={getMenuImagePath(
//                         restaurant.fullMenu?.menuOfTheDay?.image
//                       )}
//                       alt={restaurant.fullMenu?.menuOfTheDay?.title}
//                       onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.onerror = null; // prevent infinite loop
//                         target.src = "/Images/fallback.jpg";
//                       }}
//                       fill
//                       className="object-fit-cover rounded"
//                     />
//                   </div>
//                   <div>
//                     <h3 className="fs-5 fw-bold">
//                       {restaurant.fullMenu?.menuOfTheDay?.title}
//                     </h3>
//                     <p className="small text-secondary mb-1">
//                       {restaurant?.fullMenu?.menuOfTheDay?.description}
//                     </p>
//                     <p className="text-primary fw-medium mb-0">
//                       {restaurant?.fullMenu?.menuOfTheDay?.price}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {Object.keys(restaurant.fullMenu).map(
//           (menuType) =>
//             menuType !== "menuOfTheDay" &&
//             restaurant.fullMenu[menuType].length > 0 && (
//               <div
//                 key={menuType}
//                 className={`tab-pane fade ${
//                   activeTab === menuType ? "show active" : ""
//                 }`}
//               >
//                 <div className="list-group">
//                   {restaurant.fullMenu[menuType].map(
//                     (item: any, index: number) => (
//                       <div key={index} className="list-group-item">
//                         <div className="d-flex gap-3">
//                           <div
//                             className="position-relative"
//                             style={{
//                               width: "64px",
//                               height: "64px",
//                               flexShrink: 0,
//                             }}
//                           >
//                             <Image
//                               src={getMenuImagePath(item.image)}
//                               alt={item.title}
//                               onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.onerror = null; // prevent infinite loop
//                                 target.src = "/Images/fallback.jpg";
//                               }}
//                               fill
//                               className="object-fit-cover rounded"
//                             />
//                           </div>
//                           <div>
//                             <h3 className="fs-5 fw-bold mb-1">{item.title}</h3>
//                             <p className="small text-secondary mb-0">
//                               {item.description}
//                             </p>
//                           </div>
//                           {/* <p className="text-primary fw-medium">{item.price}</p> */}
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             )
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { getRestaurantMenuById } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";
import { useSearchParams } from "next/navigation";
interface MenuItem {
  title: string;
  price: string;
  description: string;
  image: string;
}

interface FullMenu {
  [key: string]: MenuItem[];
}

export default function FullMenuPage() {
  const searchParams = useSearchParams();
  const menuId = searchParams.get("menuId");
  const { id } = useParams();
  const { t,language } = useLanguage();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [fullMenu, setFullMenu] = useState<FullMenu>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const MENU_TAB_ORDER = ["Starter", "MainDish", "Drinks", "Dessert"];

  useEffect(() => {
    if (menuId) {
      localStorage.setItem("lastMenuId", menuId); // ✅ Store in localStorage
    }
  }, [menuId]);

  useEffect(() => {
    if (!menuId) return;

    getRestaurantMenuById(`${menuId}`)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const menuGrouped: FullMenu = {};

          res.data.forEach((item: any) => {
            const menuItem: MenuItem = {
              title: item.item_name || "",
              price: `€${item.price ?? "0.00"}`,
              description: item.description || "",
              image:
                item.image_url ||
                "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg",
            };

            const type = item.item_type?.trim() || "Other";

            if (!menuGrouped[type]) {
              menuGrouped[type] = [];
            }

            menuGrouped[type].push(menuItem);
          });

          setRestaurantName(res.data[0]?.restaurant_name || "Restaurant");
          setFullMenu(menuGrouped);

          // Set the first tab as active
          const types = MENU_TAB_ORDER.filter((type) => menuGrouped[type]);
          if (types.length > 0) {
            setActiveTab(types[0]);
          }
        }
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, [menuId]);

  if (!Object.keys(fullMenu).length) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Back Button */}
      <Link
        href={`/menu/${id}`}
        className="d-inline-flex align-items-center text-decoration-none mb-3"
      >
        <i className="bi bi-chevron-left me-1"></i>{language === "en" ? "Back" : "Atrás"}
      </Link>

      <h1 className="fs-3 fw-bold mb-4">
        {restaurantName} {language === "en" ? "Full Menu" : "Menú Completo"}
      </h1>

      {/* Tabs */}
      {/* <ul className="nav nav-tabs mb-3">
        {Object.keys(fullMenu).map((menuType) => (
          <li className="nav-item" key={menuType}>
            <button
              className={`nav-link ${activeTab === menuType ? "active" : ""}`}
              onClick={() => setActiveTab(menuType)}
            >
              {menuType}
            </button>
          </li>
        ))}
      </ul> */}

      <ul className="nav nav-tabs mb-3"           
      style={{
      display: "flex",        
      overflowX: "auto",      
      paddingBottom: "10px",  
      listStyleType: "none",  
      margin: 0,             
    }}>
        {MENU_TAB_ORDER.filter((type) => fullMenu[type]).map((menuType) => (
          <li className="nav-item" key={menuType} style={{ flex: "0 0 auto" }}>
            <button
              className={`nav-link ${activeTab === menuType ? "active" : ""}`}
              onClick={() => setActiveTab(menuType)}
            >
              {t(menuType)}
            </button>
          </li>
        ))}
      </ul>

      {/* Menu List */}
   

      <div className="tab-content w-full min-h-screen overflow-hidden">
        {MENU_TAB_ORDER.filter((type) => fullMenu[type]).map(
          (menuType) =>
            activeTab === menuType && (
              <div key={menuType} className="tab-pane show active">
                <div className="list-group">
                  {fullMenu[menuType].map((item, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex gap-3">
                        <div
                          className="position-relative"
                          style={{
                            width: "64px",
                            height: "64px",
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={getMenuImagePath(item.image)}
                            alt={item.title}
                            fill
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src =
                                "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
                            }}
                            className="object-fit-cover rounded"
                          />
                        </div>
                        <div>
                          <h3 className="fs-5 fw-bold mb-1 resName" style={{ 
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                          }}>{item.title}</h3>
                          <p className="small text-secondary mb-1 line-clamp-2" style={{ 
                            wordBreak: "break-all",

                          }}>
                            {item.description}
                          </p>
                          {/* <p className="text-primary fw-medium mb-0">
                            {item.price}
                          </p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    
    </div>
  );
}
