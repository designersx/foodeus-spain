// "use client"

// import { useState, useEffect } from "react"
// import Image from "next/image"
// import { useLanguage } from "@/context/language-context"
// import {API_BASE_URL, apiClient} from "@/services/apiService"
// import { getMenuImagePath } from "@/utils/getImagePath"
// import { useSlideshowStore } from "@/store/heroSlideshowStore"
// const temp_slides = [
//   {
//     id: 1,
//     image: "Images/Daily Specials.png",
//     title: {
//       en: "Discover Today's Special Menus",
//       es: "Descubre los Menús Especiales de Hoy",
//     },
//   },
//   {
//     id: 2,
//     image: "Images/Special Menus.png",
//     title: {
//       en: "Fresh and Delicious Daily Specials",
//       es: "Especiales Diarios Frescos y Deliciosos",
//     },
//   },
//   {
//     id: 3,
//     image: "Images//Restaurants Near You.png",
//     title: {
//       en: "Explore Local Restaurants Near You",
//       es: "Explora Restaurantes Locales Cerca de Ti",
//     },
//   },
// ]

// export function HeroSlideshow() {
//   const { language } = useLanguage()
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const [slidshow, setSlideshow] = useState([])
//   const { slides, setSlides, setHasFetched, addSlide, updateSlide, removeSlide } = useSlideshowStore();

//   const transformApiResponse = (apiResponse: any) => {
//     return apiResponse.map((item: any) => ({
//       id: item.id,
//       image:`${API_BASE_URL}/${item.image_path}`, 
//       title: {
//         en: item.title, // English title
//         es: item.title, // Spanish title
//       },
//     }));
//   };

//     useEffect(() => {
//       const fetchSlides = async () => {
//         try {
//           const response = await apiClient.get("/enduser/getHeroSliders");
//           if (response.status === 200) {
//             const data=response?.data?.data;
//             const formattedData = transformApiResponse(data);
//             setSlides(formattedData); // Set the fetched slides in the store
//             setHasFetched(true); // Mark the data as fetched
//           } else {
//             console.error("Failed to fetch slides");
//           }
//         } catch (error) {
//           console.error("Error fetching slides:", error);
//         }
//       };
  
//       if (!slides.length) { // Fetch only if slides are not already fetched
//         fetchSlides();
//       }
//     }, [setSlides, setHasFetched, slides.length]);
// console.log("slideshow",slides)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length)
//     }, 5000)
//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <div id="heroCarousel" className="carousel slide rounded overflow-hidden" data-bs-ride="carousel">
//       <div className="carousel-inner">
//         {slides.map((slide, index) => (
//           <div
//             key={slide.id}
//             className={`carousel-item ${index === currentSlide ? "active" : ""}`}
//             style={{ height: "200px" }}
//           >
//             <div className="position-relative h-100">
//               <Image style={{ maxWidth:"300px" ,height:"800px"}}
//                 src={slide.image || "/placeholder.svg"}
//                 alt={slide.title[language]}
//                 fill
//                 className="object-fit-cover"
//                 priority={index === 0}
//                 style={{ filter: 'brightness(65%)' }}
                
//               />
//               <div className="carousel-caption  pb-4">
                
//                 <h2 className="lobsterFont"  style={{ textShadow: '0px 0px 3px #000000' }}>
//                  {slide.title[language]}</h2>

//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="carousel-indicators">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             type="button"
//             data-bs-target="#heroCarousel"
//             data-bs-slide-to={index}
//             className={index === currentSlide ? "active" : ""}
//             aria-current={index === currentSlide ? "true" : "false"}
//             aria-label={`Slide ${index + 1}`}
//             onClick={() => setCurrentSlide(index)}
//           ></button>
//         ))}
//       </div>
//     </div>
//   )
// }
import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { API_BASE_URL, apiClient } from "@/services/apiService";
import { useSlideshowStore } from "@/store/heroSlideshowStore";

const temp_slides = [
    {
      id: 1,
      image: "Images/Daily Specials.png",
      title: {
        en: "Discover Today's Special Menus",
        es: "Descubre los Menús Especiales de Hoy",
      },
    },
    {
      id: 2,
      image: "Images/Special Menus.png",
      title: {
        en: "Fresh and Delicious Daily Specials",
        es: "Especiales Diarios Frescos y Deliciosos",
      },
    },
    {
      id: 3,
      image: "Images//Restaurants Near You.png",
      title: {
        en: "Explore Local Restaurants Near You",
        es: "Explora Restaurantes Locales Cerca de Ti",
      },
    },
  ]

export function HeroSlideshow() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { slides, setSlides, setHasFetched } = useSlideshowStore(); // Using Zustand store

  const transformApiResponse = (apiResponse: any) => {
    return apiResponse.map((item: any) => ({
      id: item.id,
      image: item.image_path.includes('/public') 
      ? `${API_BASE_URL}/${item.image_path.split("/public")[1]}`
      : `${API_BASE_URL}/${item.image_path}`,
      title: {
        en: item.title,
        es: item.title, // Assuming title is same for both languages, change as needed
      },
    }));
  };

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await apiClient.get("/enduser/getHeroSliders");
        if (response.status === 200) {
          const data = response?.data?.data;
          const formattedData = transformApiResponse(data);
          setSlides(formattedData); // Set slides in Zustand store
          setHasFetched(true); // Mark as fetched
        } else {
          console.error("Failed to fetch slides");
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
      }
    };

    if (!slides.length) { // Fetch slides only if not already fetched
      fetchSlides();
    }
  }, [setSlides, setHasFetched, slides.length]); // Dependency on slides.length to avoid duplicate API calls

  useEffect(() => {
    if (slides.length > 0) { // Only start interval once slides are loaded
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length); // Loop through slides
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [slides]); // Re-run the effect when slides change
  return (
    <div id="heroCarousel" className="carousel slide rounded overflow-hidden" data-bs-ride="carousel">
      <div className="carousel-inner">
        {slides?.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`carousel-item ${index === currentSlide ? "active" : ""}`}
              style={{ height: "200px" }} // Adjust the height of the carousel item
            >
              <div className="position-relative h-100">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title[language]}
                  layout="fill" // Ensure the image fills its container
                  objectFit="cover" // Image will cover the container
                  priority={index === 0} // Load the first image with priority
                  style={{ filter: "brightness(65%)",objectFit: "cover"  }} // Apply brightness filter
                />
                <div className="carousel-caption pb-4">
                  <h2 className="lobsterFont" style={{ textShadow: '0px 0px 3px #000000' }}>
                    {slide.title[language]}
                  </h2>
                </div>
              </div>
            </div>
          ))
        ) : (
          temp_slides?.map((slide, index) => (
            <div
              key={slide.id}
              className={`carousel-item ${index === currentSlide ? "active" : ""}`}
              style={{ height: "200px" }} // Adjust the height of the carousel item
            >
              <div className="position-relative h-100">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title[language]}
                  layout="fill" // Ensure the image fills its container
                  objectFit="cover" // Image will cover the container
                  priority={index === 0} // Load the first image with priority
                  style={{ filter: "brightness(65%)",objectFit: "cover"  }} // Apply brightness filter
                />
                <div className="carousel-caption pb-4">
                  <h2 className="lobsterFont" style={{ textShadow: '0px 0px 3px #000000' }}>
                    {slide.title[language]}
                  </h2>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {slides?.length > 0 && (
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide-to={index}
              className={index === currentSlide ? "active" : ""}
              aria-current={index === currentSlide ? "true" : "false"}
              aria-label={`Slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}


