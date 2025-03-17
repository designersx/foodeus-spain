"use client"

import { useLanguage } from "@/context/language-context"

export function MapView() {
  const { t } = useLanguage()

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "calc(100vh - 8rem)" }}
    >
      <div className="text-center">
        <h1 className="fs-3 fw-bold mb-4">{t("mapView")}</h1>
        <div
          className="bg-light rounded p-5 d-flex align-items-center justify-content-center"
          style={{ width: "100%", height: "400px" }}
        >
          <p className="text-secondary">Map will be displayed here</p>
        </div>
      </div>
    </div>
  )
}

