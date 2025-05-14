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
  const storedMenu = sessionStorage.getItem('fullMenu');
  useEffect(() => {
    if (menuId) {
      localStorage.setItem("lastMenuId", menuId); 
    }
  }, [menuId]);

  useEffect(() => {

    if (storedMenu) {
      const menu = JSON.parse(storedMenu);
      const menuGrouped: FullMenu = {};

      menu?.forEach((item: any) => {
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
  
            setFullMenu(menuGrouped);
  
            // Set the first tab as active
            const types = MENU_TAB_ORDER.filter((type) => menuGrouped[type]);
            if (types.length > 0) {
              setActiveTab(types[0]);
            }
      }

   }, [storedMenu]);
  // if (!Object.keys(fullMenu).length) {
  //   return (
  //     <div
  //       className="d-flex justify-content-center align-items-center"
  //       style={{ height: "50vh" }}
  //     >
  //       <p>Loading menu...</p>
  //     </div>
  //   );
  // }

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
