"use client"
import { useState } from "react";
import { useLanguage } from "@/context/language-context"
import KmlMap from "@/components/KmlMap";
export function MapView() {
  const { t } = useLanguage()
  const [destination, setDestination] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); 
  const handleNavigate = () => {
    if (destination) {
      const encodedDestination = encodeURIComponent(destination);
      const newSrc = `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=Current+Location&destination=${encodedDestination}&zoom=15`;
      const mapFrame = document.getElementById("mapFrame") as HTMLIFrameElement;
      if (mapFrame) {
        mapFrame.src = newSrc;
      }
    }
  };
  return (
    // <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ height: "calc(100vh - 8rem)" }}>
    //   <div className="text-center">
    //     <h1 className="fs-3 fw-bold mb-4">{t("mapView")}</h1>
  
    //       <KmlMap />
    //   </div>
    // </div>

    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="text-center w-100 px-2">
        {/* <h1 className="fs-3 fw-bold mb-4">Map View</h1> */}

        {/* Navigation Input
        <div className="d-flex justify-content-center mb-3">
          <input
            type="text"
            className="form-control w-50 me-2"
            placeholder="Enter a destination..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleNavigate}>
            Navigate
          </button>
        </div> */}

        {/* Map Container */}
        <div
          className="bg-light rounded shadow p-3 d-flex align-items-center justify-content-center"
          style={{ width: "100%", height: "620px", border: "1px solid #ddd" }}
        >
              {loading && (
            <div className="position-absolute top-50 start-50 translate-middle">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading map...</span>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading delicious options...</p>

            </div>
          )}
          <iframe
            id="mapFrame"
            src="https://www.google.com/maps/d/embed?mid=1azc4FGempttyHrAm898mokpfXA8&ehbc=2E312F&gestureHandling=greedy"
            width="100%"
            height="100%"
            style={{ border: "0", borderRadius: "10px" }}
            allowFullScreen
            // loading="lazy"
            title="Map"
            onLoad={() => setLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
      
  )
}

