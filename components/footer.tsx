"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/language-context"

export default function Footer() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <footer className="fixed-bottom bg-light border-top">
      <div className="container">
        <div className="row text-center py-2">
          <div className="col-6">
            <Link
              href="/"
              className={`text-decoration-none d-flex flex-column align-items-center ${
                pathname === "/" ? "text-primary" : "text-secondary"
              }`}
            >
              <i className="bi bi-list fs-5"></i>
              <span className="small">{t("listView")}</span>
            </Link>
          </div>
          <div className="col-6">
            <Link
              href="/map"
              className={`text-decoration-none d-flex flex-column align-items-center ${
                pathname === "/map" ? "text-primary" : "text-secondary"
              }`}
            >
              <i className="bi bi-map fs-5"></i>
              <span className="small">{t("mapView")}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

