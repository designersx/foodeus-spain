"use client"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"

export default function Header() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top border-bottom">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <Image
            src="/Images/Logo.jpg?height=32&width=32"
            alt="Foodeus Logo"
            width={32}
            height={32}
            className="rounded-circle me-2"
          />
          <span className="fw-bold">Foodeus</span>
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
                <button className="dropdown-item" onClick={() => setLanguage("en")}>
                  English {language === "en" && "✓"}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => setLanguage("es")}>
                  Español {language === "es" && "✓"}
                </button>
              </li>
            </ul>
          </div>

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

