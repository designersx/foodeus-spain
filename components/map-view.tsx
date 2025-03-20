"use client"
import { useState } from "react";
import { useLanguage } from "@/context/language-context"
import KmlMap from "@/components/KmlMap";
import Lottie from "lottie-react";
import MapLoading from "@/components/ui/mapLoading.json"; 
export function MapView() {
  const { t } = useLanguage()
  const [destination, setDestination] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // ✅ Add loading state

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
    // <div
    //   className="d-flex flex-column align-items-center justify-content-center"
    //   style={{ height: "calc(100vh - 8rem)" }}
    // >
    //   <div className="text-center">
    //     <h1 className="fs-3 fw-bold mb-4">{t("mapView")}</h1>
    //     <div
    //       className="bg-light rounded p-5 d-flex align-items-center justify-content-center"
    //       style={{ width: "100%", height: "400px" }}
    //     >
    //       {/* <p className="text-secondary">Map will be displayed here</p> */}
    //       {/* <KmlMap /> */}
    //       <iframe src="https://www.google.com/maps/d/embed?mid=1azc4FGempttyHrAm898mokpfXA8&ehbc=2E312F" width="100%" height="400px"></iframe>
    //     </div>
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
            // <div className="position-absolute top-50 start-50 translate-middle">
            //   <div className="spinner-border text-primary" role="status">
            //     <span className="visually-hidden">Loading map...</span>
            //   </div>
            // </div>
            <div className="position-absolute top-50 start-50 translate-middle">
                <Lottie animationData={MapLoading} loop={true} className="w-32 h-32 mx-auto" />
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
            loading="lazy"
            title="Map"
            onLoad={() => setLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
      
  )
}

