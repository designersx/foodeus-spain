"use client"
import React, { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language")
    if (storedLanguage) {
      setLanguage(storedLanguage as "en" | "es")
    }
  }, [setLanguage])
 
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
          {/* <span className="fw-bold"></span> */}
        </Link>

        <div className="d-flex align-items-center">
          {/* Language Dropdown */}
          <div className="dropdown me-2">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {language === "en" ? "EN" : "ES"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() =>{ setLanguage("en");localStorage.setItem("language","en")}}>
                  English {language === "en" && "✓"}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() =>{ setLanguage("es");localStorage.setItem("language","es")}}>
                  Español {language === "es" && "✓"}
                </button>
              </li>
            </ul>
          </div>

          {/* <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center gap-1"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle"></i>
            User
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <a className="dropdown-item" href="/profile">
                <i className="bi bi-person me-2"></i> Profile
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </li>
          </ul>
        </div> */}
        
          {/* Hamburger Menu */}
          {/* <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#navbarOffcanvas"
            aria-controls="navbarOffcanvas"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button> */}
        </div>

        {/* Offcanvas Menu */}
        {/* <div
          className="offcanvas offcanvas-end"
          tabIndex={-1}
          id="navbarOffcanvas"
          aria-labelledby="navbarOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="navbarOffcanvasLabel">
              Menu
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link href="/" className="nav-link fs-5">
                  {t("restaurants")}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="#" className="nav-link fs-5">
                  {t("menuOfTheDay")}
                </Link>
              </li>
            </ul>
          </div>
        </div> */}
      </div>
    </nav>
  )
}

