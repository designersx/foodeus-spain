"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"
import { User } from "lucide-react";
import PopUp from "./ui/custom-toast"
import ProfileSection from "./profile-section-modal"
import { LogIn } from "lucide-react"; 
import RegisterPromptModal from "./register-popup-modal"
import { apiClient } from "@/services/apiService"
import { usePathname } from 'next/navigation';
interface Toast {
  show: boolean;
  message: string;
  type: string;
  onConfirm: (() => void) | null;
}
interface RegisterUserDetails {
  name: string;
  email: string;
  status: boolean;
}
export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage()
  const [isLoggedIn, setIsLoggedIn] = useState<string>("")
  const [isShowProfileSection, setIsShowProfileSection] = useState<boolean>(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: '', onConfirm: null });

  const handleLogout = () => {
    setToast({
      show: true, message: language === "es" ? "¿Estás seguro de que quieres cerrar sesión?" : "Are you sure you want to Logout?"
      , onConfirm: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem("mobileToken")
        setIsLoggedIn(null);
      }, type: 'info'
    });

  }
  const handleProfileSection = () => {
    setIsShowProfileSection(true)
  }
  const handleLogin = () => {

    setShowRegisterModal(true)
  }
  //handle close
  const handleClose = () => {
    setShowRegisterModal(false)
  }
  //handle register
  const handleRegister = async (data: { name: string; email: string }) => {
    const { name, email } = data;
    const userDetails: RegisterUserDetails = {
      name: name,
      email: email,
      status: true,
    };

    try {
      const response = await apiClient.post('/mobileUsers/createMobileUser',userDetails);
      if (response) {
        setToast({
          show: true, message: "OTP sent successfully",
          type: 'success',
        });
        return true;

      }
      return false;
    } catch (error) {
      // console.error("Error registering user", error.response);
      setToast({ show: true, message: error.response.data.message, type: 'error' });
      return false;
    }
  };
  //function lock
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language")
    if (storedLanguage) {
      setLanguage(storedLanguage as "en" | "es")
    }
  }, [setLanguage])

  useEffect(() => {
    const interval = setInterval(() => {
      const isUserTrue = localStorage.getItem('isLoggedIn');
      setIsLoggedIn(isUserTrue || "");
    }, 1000);
    return () => clearInterval(interval); // cleanup on unmount
  }, []);
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light  border-bottom">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <Image
            src="/Images/menudistaLogo.png?width=100"
            alt="Foodeus Logo"
            width={120}
            height={40}
            className=""
          />
        </Link>
        <div className="d-flex align-items-center">
          {pathname === "/" && isLoggedIn !== "true" && (
            <div className="dropdown ">
              <button
                className="btn btn-sm btn-outline-secondary BorderNone d-flex align-items-center gap-1"
                type="button"
                data-bs-toggle="dropdown"
                onClick={handleLogin}
              >
                <LogIn size={16} />
              </button>
            </div>
          )}

          {/* Profile-section */}
          {isLoggedIn == "true" && pathname === "/" && 
          <div className="dropdown me-2">
            <button 
              className="btn btn-sm btn-outline-secondary  dropdown-toggle d-flex align-items-center gap-1"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <User size={16} />

            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={handleProfileSection} >

                  {t("headingProfileTabProfile")}

                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>

                  {t("headingProfileTabLogout")}
                </button>
              </li>
            </ul>
          </div>}
          {/* Language Dropdown */}
          <div className="dropdown ">
            <button
              className="btn btn-sm btn-outline-secondary BorderNone dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {language === "en" ? "EN" : "ES"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => { setLanguage("en"); localStorage.setItem("language", "en") }}>
                  English {language === "en" && "✓"}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => { setLanguage("es"); localStorage.setItem("language", "es") }}>
                  Español {language === "es" && "✓"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {toast.show && <PopUp type={toast.type} onClose={() => setToast({ show: false, message: '', type: '', onConfirm: null })} message={toast.message} onConfirm={toast.onConfirm}

      />}
      {
        isShowProfileSection && <ProfileSection show={isShowProfileSection}
          onClose={() => setIsShowProfileSection(false)}
        />
      }
      <RegisterPromptModal
        show={showRegisterModal}
        onClose={handleClose}
        onRegister={handleRegister}
      // modalView={true}
      />
    </nav>
  )
}

