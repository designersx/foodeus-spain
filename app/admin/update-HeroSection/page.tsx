// "use client";

// import React, { useState, useRef, useCallback } from "react";
// import Slider from "react-slick";
// import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import "react-image-crop/dist/ReactCrop.css";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import browserImageCompression from "browser-image-compression";

// const HeroSection = () => {
//   const [images, setImages] = useState<string[]>([]);
//   const [imageToCrop, setImageToCrop] = useState<string | null>(null);
//   const [crop, setCrop] = useState<Crop>({
//     unit: "px",
//     x: 0,
//     y: 0,
//     width: 1920,
//     height: 1080,
//   });
//   const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
//   const [isCropping, setIsCropping] = useState(false);
//   const [editIndex, setEditIndex] = useState<number | null>(null); // Track which slide to edit
//   const imgRef = useRef<HTMLImageElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const compressedFile = await compressImage(file);
//     const imageUrl = URL.createObjectURL(compressedFile);
//     setImageToCrop(imageUrl);
//     setIsCropping(true);
//     fileInputRef.current!.value = "";
//   };

//   const compressImage = async (file: File) => {
//     const options = {
//       maxSizeMB: 0.8,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     return await browserImageCompression(file, options);
//   };

//   const handleCropComplete = useCallback((crop: PixelCrop) => {
//     setCompletedCrop(crop);
//   }, []);

//   const handleCropImage = useCallback(async () => {
//     if (!imgRef.current || !completedCrop) return;

//     const image = imgRef.current;
//     const canvas = document.createElement("canvas");
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;

//     // Force all images to 1920x1080
//     canvas.width = 1920;
//     canvas.height = 1080;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     // Center the cropped area within the 1920x1080 canvas
//     const cropWidth = completedCrop.width * scaleX;
//     const cropHeight = completedCrop.height * scaleY;
//     const offsetX = (1920 - cropWidth) / 2;
//     const offsetY = (1080 - cropHeight) / 2;

//     ctx.fillStyle = "#000"; // Black background for padding
//     ctx.fillRect(0, 0, 1920, 1080);
//     ctx.drawImage(
//       image,
//       completedCrop.x * scaleX,
//       completedCrop.y * scaleY,
//       cropWidth,
//       cropHeight,
//       offsetX,
//       offsetY,
//       cropWidth,
//       cropHeight
//     );

//     const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
//     if (editIndex !== null) {
//       // Update existing slide
//       setImages((prev) => {
//         const newImages = [...prev];
//         newImages[editIndex] = croppedImage;
//         return newImages;
//       });
//       setEditIndex(null);
//     } else {
//       // Add new slide, limited to 3
//       setImages((prev) => (prev.length < 3 ? [...prev, croppedImage] : prev));
//     }
//     setIsCropping(false);
//     setImageToCrop(null);
//     setCompletedCrop(null);
//   }, [completedCrop, editIndex]);

//   const handleEditSlide = (index: number) => {
//     setEditIndex(index);
//     fileInputRef.current?.click();
//   };

//   const sliderSettings = {
//     dots: true,
//     infinite: images.length > 1,
//     speed: 600,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: true,
//     autoplay: true,
//     autoplaySpeed: 4000,
//     pauseOnHover: true,
//     fade: true, // Smooth fade transition
//     customPaging: (i: number) => (
//       <div className="w-3 h-3 bg-white/50 rounded-full transition-all duration-300 hover:bg-white cursor-pointer" />
//     ),
//     dotsClass: "slick-dots slick-dots-custom",
//   };

//   return (
//     <div className="relative w-full max-w-7xl mx-auto py-12 px-4">
//       {/* Carousel */}
//       <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200/20 bg-gradient-to-br from-gray-900 to-black">
//         {images.length > 0 ? (
//           <Slider {...sliderSettings}>
//             {images.map((image, index) => (
//               <div
//                 key={index}
//                 className="relative h-[60vh] w-full group cursor-pointer"
//                 onClick={() => handleEditSlide(index)}
//               >
//                 <img
//                   src={image}
//                   alt={`hero-${index}`}
//                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                 />
//                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//                   <span className="text-white text-lg font-semibold bg-blue-600/80 px-4 py-2 rounded-lg">
//                     Edit Image
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         ) : (
//           <div className="h-[60vh] w-full bg-gray-800 flex items-center justify-center rounded-2xl">
//             <span className="text-gray-300 text-xl font-medium animate-pulse">
//               Upload up to 3 stunning images
//             </span>
//           </div>
//         )}
//         <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
//           {images.length}/3
//         </div>
//       </div>

//       {/* Crop Modal */}
//       {isCropping && imageToCrop && (
//         <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-fade-in">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-5xl shadow-2xl border border-gray-200/50">
//             <ReactCrop
//               crop={crop}
//               onChange={(_, percentCrop) => setCrop(percentCrop)}
//               onComplete={handleCropComplete}
//               aspect={16 / 9}
//               minWidth={1920}
//               minHeight={1080}
//               className="rounded-lg overflow-hidden"
//             >
//               <img
//                 ref={imgRef}
//                 src={imageToCrop}
//                 alt="Crop preview"
//                 className="max-h-[60vh] w-full object-contain"
//               />
//             </ReactCrop>
//             <div className="flex justify-end gap-4 mt-6">
//               <Button
//                 variant="outline"
//                 className="border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-2 rounded-lg transition-all duration-200"
//                 onClick={() => {
//                   setIsCropping(false);
//                   setImageToCrop(null);
//                   setCompletedCrop(null);
//                   setEditIndex(null);
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="default"
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
//                 onClick={handleCropImage}
//                 disabled={!completedCrop}
//               >
//                 {editIndex !== null ? "Update Image" : "Crop & Save"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Upload Controls */}
//       <div className="flex justify-center gap-6 mt-8">
//         <Input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           className="hidden"
//         />
//         {images.length < 3 && (
//           <Button
//             onClick={() => {
//               setEditIndex(null);
//               fileInputRef.current?.click();
//             }}
//             className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
//           >
//             Add New Image
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HeroSection;

// "use client";

// import React, { useState, useRef, useCallback } from "react";
// import Slider from "react-slick";
// import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import "react-image-crop/dist/ReactCrop.css";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import browserImageCompression from "browser-image-compression";
// import { motion, AnimatePresence } from "framer-motion";

// interface HeroSlide {
//   id: number;
//   image: string;
//   title: string;
// }

// const HeroSection = () => {
//   const [slides, setSlides] = useState<HeroSlide[]>([]);
//   const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
//   const [imageToCrop, setImageToCrop] = useState<string | null>(null);
//   const [crop, setCrop] = useState<Crop>({
//     unit: "px",
//     x: 0,
//     y: 0,
//     width: 1920,
//     height: 1080,
//   });
//   const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
//   const [isCropping, setIsCropping] = useState(false);
//   const [editSlideId, setEditSlideId] = useState<number | null>(null);
//   const imgRef = useRef<HTMLImageElement>(null);
//   const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]); // One ref per slide
//   const sliderRef = useRef<any>(null);

//   const MAX_SLIDES = 3;

//   // Handle file upload
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slideId: number) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const compressedFile = await compressImage(file);
//     const imageUrl = URL.createObjectURL(compressedFile);
//     setImageToCrop(imageUrl);
//     setEditSlideId(slideId);
//     setIsCropping(true);
//     e.target.value = ""; // Reset input
//   };

//   // Compress image
//   const compressImage = async (file: File) => {
//     const options = {
//       maxSizeMB: 0.8,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     return await browserImageCompression(file, options);
//   };

//   // Handle crop completion
//   const handleCropComplete = useCallback((crop: PixelCrop) => {
//     setCompletedCrop(crop);
//   }, []);

//   // Crop and save image
//   const handleCropImage = useCallback(async () => {
//     if (!imgRef.current || !completedCrop || editSlideId === null) return;

//     const image = imgRef.current;
//     const canvas = document.createElement("canvas");
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;

//     const targetWidth = 1920;
//     const targetHeight = 1080;

//     canvas.width = targetWidth;
//     canvas.height = targetHeight;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     ctx.drawImage(
//       image,
//       completedCrop.x * scaleX,
//       completedCrop.y * scaleY,
//       completedCrop.width * scaleX,
//       completedCrop.height * scaleY,
//       0,
//       0,
//       targetWidth,
//       targetHeight
//     );

//     const croppedImage = canvas.toDataURL("image/jpeg", 0.9);

//     setSlides((prevSlides) => {
//       const existingSlide = prevSlides.find((slide) => slide.id === editSlideId);
//       if (existingSlide) {
//         return prevSlides.map((slide) =>
//           slide.id === editSlideId ? { ...slide, image: croppedImage } : slide
//         );
//       }
//       return [...prevSlides, { id: editSlideId, image: croppedImage, title: "" }];
//     });

//     setIsCropping(false);
//     setImageToCrop(null);
//     setCompletedCrop(null);
//     setEditSlideId(null);
//   }, [completedCrop, editSlideId]);

//   // Handle title change
//   const handleTitleChange = (id: number, title: string) => {
//     setSlides((prevSlides) => {
//       const existingSlide = prevSlides.find((slide) => slide.id === id);
//       if (existingSlide) {
//         return prevSlides.map((slide) =>
//           slide.id === id ? { ...slide, title } : slide
//         );
//       }
//       return [...prevSlides, { id, image: "", title }]; // Add new slide with empty image
//     });
//   };

//   const sliderSettings = {
//     dots: true,
//     infinite: slides.length > 1,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: true,
//     autoplay: true,
//     autoplaySpeed: 4000,
//     beforeChange: (_: number, next: number) => setActiveSlideIndex(next),
//     customPaging: (i: number) => (
//       <div
//         className={`w-10 h-2 mx-2 rounded-full cursor-pointer transition-all duration-300 ${
//           i === activeSlideIndex ? "bg-indigo-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
//         }`}
//         onClick={() => sliderRef.current?.slickGoTo(i)}
//       />
//     ),
//     dotsClass: "slick-dots flex justify-center mt-4",
//   };

//   return (
//     <div className="relative w-full max-w-6xl mx-auto py-12">
//       {/* Slider */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="relative w-full h-[450px] rounded-xl overflow-hidden shadow-lg border border-gray-200"
//       >
//         {slides.length > 0 ? (
//           <Slider ref={sliderRef} {...sliderSettings} className="w-full h-full">
//             {slides.map((slide) => (
//               <div key={slide.id} className="relative w-full h-full">
//                 <motion.img
//                   src={slide.image || "/placeholder.png"} // Fallback image
//                   alt={`hero-${slide.id}`}
//                   className="w-full h-full object-cover"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                 />
//                 {slide.title && (
//                   <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-4">
//                     <h3 className="text-xl font-semibold">{slide.title}</h3>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </Slider>
//         ) : (
//           <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-xl">
//             <span className="text-gray-600 text-xl font-medium animate-pulse">
//               Add your hero images below!
//             </span>
//           </div>
//         )}
//       </motion.div>

//       {/* Crop Modal */}
//       <AnimatePresence>
//         {isCropping && imageToCrop && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl"
//             >
//               <ReactCrop
//                 crop={crop}
//                 onChange={(_, percentCrop) => setCrop(percentCrop)}
//                 onComplete={handleCropComplete}
//                 aspect={16 / 9}
//                 minWidth={1920}
//                 minHeight={1080}
//                 className="rounded-lg overflow-hidden"
//               >
//                 <img
//                   ref={imgRef}
//                   src={imageToCrop}
//                   alt="Crop preview"
//                   className="max-h-[500px] w-full object-contain"
//                 />
//               </ReactCrop>
//               <div className="flex justify-end gap-4 mt-6">
//                 <Button
//                   variant="outline"
//                   className="border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold"
//                   onClick={() => {
//                     setIsCropping(false);
//                     setImageToCrop(null);
//                     setCompletedCrop(null);
//                     setEditSlideId(null);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   variant="default"
//                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-semibold"
//                   onClick={handleCropImage}
//                   disabled={!completedCrop}
//                 >
//                   Save Image
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Slide Controls */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.2 }}
//         className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
//       >
//         {[1, 2, 3].map((id, index) => {
//           const slide = slides.find((s) => s.id === id);
//           return (
//             <div
//               key={id}
//               className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
//             >
//               <h4 className="text-lg font-semibold mb-4">Slide {id}</h4>
//               <div className="space-y-4">
//                 {/* Image Upload */}
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleFileChange(e, id)}
//                     className="hidden"
//                     ref={(el) => (fileInputRefs.current[index] = el)}
//                   />
//                   <Button
//                     onClick={() => fileInputRefs.current[index]?.click()}
//                     className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-full font-medium w-full"
//                   >
//                     {slide?.image ? "Change Image" : "Upload Image"}
//                   </Button>
//                 </div>
//                 {/* Title Input */}
//                 <Input
//                   type="text"
//                   placeholder="Enter slide title"
//                   value={slide?.title || ""}
//                   onChange={(e) => handleTitleChange(id, e.target.value)}
//                   className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </motion.div>
//     </div>
//   );
// };

// export default HeroSection;

// "use client";

// import React, { useState, useRef, useCallback, useEffect } from "react";
// import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import browserImageCompression from "browser-image-compression";
// import { motion, AnimatePresence } from "framer-motion";

// interface HeroSlide {
//   id: number;
//   image: string;
//   title: string;
// }

// const HeroSection = () => {
//   const [slides, setSlides] = useState<HeroSlide[]>([]);
//   const [currentSlide, setCurrentSlide] = useState<number>(0);
//   const [imageToCrop, setImageToCrop] = useState<string | null>(null);
//   const [crop, setCrop] = useState<Crop>({
//     unit: "px",
//     x: 0,
//     y: 0,
//     width: 1920,
//     height: 1080,
//   });
//   const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
//   const [isCropping, setIsCropping] = useState(false);
//   const [editSlideId, setEditSlideId] = useState<number | null>(null);
//   const imgRef = useRef<HTMLImageElement>(null);
//   const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   const MAX_SLIDES = 3;

//   // Auto-slide effect
//   useEffect(() => {
//     if (slides.length <= 1) return;
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 4000); // 4 seconds
//     return () => clearInterval(interval);
//   }, [slides.length]);

//   // Handle file upload
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slideId: number) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const compressedFile = await compressImage(file);
//     const imageUrl = URL.createObjectURL(compressedFile);
//     setImageToCrop(imageUrl);
//     setEditSlideId(slideId);
//     setIsCropping(true);
//     e.target.value = "";
//   };

//   // Compress image
//   const compressImage = async (file: File) => {
//     const options = {
//       maxSizeMB: 0.8,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     return await browserImageCompression(file, options);
//   };

//   // Handle crop initialization
//   const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
//     const { width, height } = e.currentTarget;
//     const crop = centerCrop(
//       makeAspectCrop(
//         {
//           unit: "px",
//           width: 1920,
//           height: 1080,
//         },
//         16 / 9,
//         width,
//         height
//       ),
//       width,
//       height
//     );
//     setCrop(crop);
//     setCompletedCrop(crop);
//   }, []);

//   // Handle crop completion
//   const handleCropComplete = useCallback((crop: PixelCrop) => {
//     setCompletedCrop(crop);
//   }, []);

//   // Crop and save image
//   const handleCropImage = useCallback(async () => {
//     if (!imgRef.current || !completedCrop || editSlideId === null) return;

//     const image = imgRef.current;
//     const canvas = document.createElement("canvas");
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;

//     const targetWidth = 1920;
//     const targetHeight = 1080;

//     canvas.width = targetWidth;
//     canvas.height = targetHeight;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     ctx.drawImage(
//       image,
//       completedCrop.x * scaleX,
//       completedCrop.y * scaleY,
//       completedCrop.width * scaleX,
//       completedCrop.height * scaleY,
//       0,
//       0,
//       targetWidth,
//       targetHeight
//     );

//     const croppedImage = canvas.toDataURL("image/jpeg", 0.9);

//     setSlides((prevSlides) => {
//       const existingSlide = prevSlides.find((slide) => slide.id === editSlideId);
//       if (existingSlide) {
//         return prevSlides.map((slide) =>
//           slide.id === editSlideId ? { ...slide, image: croppedImage } : slide
//         );
//       }
//       return [...prevSlides, { id: editSlideId, image: croppedImage, title: "" }];
//     });

//     setIsCropping(false);
//     setImageToCrop(null);
//     setCompletedCrop(null);
//     setEditSlideId(null);
//   }, [completedCrop, editSlideId]);

//   // Handle title change
//   const handleTitleChange = (id: number, title: string) => {
//     setSlides((prevSlides) => {
//       const existingSlide = prevSlides.find((slide) => slide.id === id);
//       if (existingSlide) {
//         return prevSlides.map((slide) =>
//           slide.id === id ? { ...slide, title } : slide
//         );
//       }
//       return [...prevSlides, { id, image: "", title }];
//     });
//   };

//   return (
//     <div id="heroCarousel" className="carousel slide rounded overflow-hidden" data-bs-ride="carousel">
//       {/* Slider */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         id="heroCarousel"
//         className="carousel slide rounded overflow-hidden relative"
//         data-bs-ride="carousel"
//       >
//         <div className="carousel-inner">
//           {slides.length > 0 ? (
//             slides.map((slide, index) => (
//               <div
//                 key={slide.id}
//                 className={`carousel-item ${index === currentSlide ? "active" : ""}`}
//                 style={{ height: "200px" }}
//               >
//                 <div className="position-relative h-100 flex justify-center items-center bg-gray-100">
//                   <img
//                     src={slide.image || "/placeholder.svg"}
//                     alt={slide.title || `hero-${slide.id}`}
//                     className="object-cover"
//                     style={{
//                       maxWidth: "100%",
//                       height: "100%",
//                       filter: "brightness(65%)",
//                     }}
//                   />
//                   {slide.title && (
//                     <div className="carousel-caption pb-4">
//                       <h2
//                         className="lobsterFont"
//                         style={{ textShadow: "0px 0px 3px #000000" }}
//                       >
//                         {slide.title}
//                       </h2>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="carousel-item active" style={{ height: "400px" }}>
//               <div className="position-relative h-100 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
//                 <span className="text-gray-600 text-xl font-medium animate-pulse">
//                   Add your hero images below!
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//         {slides.length > 0 && (
//           <div className="carousel-indicators absolute bottom-0 mb-2 flex justify-center w-full">
//             {slides.map((_, index) => (
//               <button
//                 key={index}
//                 type="button"
//                 data-bs-target="#heroCarousel"
//                 data-bs-slide-to={index}
//                 className={`w-3 h-3 mx-1 rounded-full cursor-pointer transition-all duration-300 ${
//                   index === currentSlide ? "bg-indigo-600 scale-125" : "bg-gray-400 hover:bg-gray-500"
//                 }`}
//                 aria-current={index === currentSlide ? "true" : "false"}
//                 aria-label={`Slide ${index + 1}`}
//                 onClick={() => setCurrentSlide(index)}
//               ></button>
//             ))}
//           </div>
//         )}
//       </motion.div>

//       {/* Crop Modal */}
//       <AnimatePresence>
//         {isCropping && imageToCrop && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl"
//             >
//               <ReactCrop
//                 crop={crop}
//                 onChange={(_, percentCrop) => setCrop(percentCrop)}
//                 onComplete={handleCropComplete}
//                 aspect={16 / 9}
//                 minWidth={1920}
//                 minHeight={1080}
//                 locked
//                 className="rounded-lg overflow-hidden"
//               >
//                 <img
//                   ref={imgRef}
//                   src={imageToCrop}
//                   alt="Crop preview"
//                   style={{ maxHeight: "500px", maxWidth: "100%", objectFit: "contain" }}
//                   onLoad={onImageLoad}
//                 />
//               </ReactCrop>
//               <div className="flex justify-end gap-4 mt-6">
//                 <Button
//                   variant="outline"
//                   className="border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold"
//                   onClick={() => {
//                     setIsCropping(false);
//                     setImageToCrop(null);
//                     setCompletedCrop(null);
//                     setEditSlideId(null);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   variant="default"
//                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-semibold"
//                   onClick={handleCropImage}
//                   disabled={!completedCrop}
//                 >
//                   Save Image
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Slide Controls */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.2 }}
//         className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
//       >
//         {[1, 2, 3].map((id, index) => {
//           const slide = slides.find((s) => s.id === id);
//           return (
//             <div
//               key={id}
//               className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
//             >
//               <h4 className="text-lg font-semibold mb-4">Slide {id}</h4>
//               <div className="space-y-4">
//                 {/* Image Upload */}
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleFileChange(e, id)}
//                     className="hidden"
//                     ref={(el) => (fileInputRefs.current[index] = el)}
//                   />
//                   <Button
//                     onClick={() => fileInputRefs.current[index]?.click()}
//                     className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-full font-medium w-full"
//                   >
//                     {slide?.image ? "Change Image" : "Upload Image"}
//                   </Button>
//                 </div>
//                 {/* Title Input */}
//                 <Input
//                   type="text"
//                   placeholder="Enter slide title"
//                   value={slide?.title || ""}
//                   onChange={(e) => handleTitleChange(id, e.target.value)}
//                   className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </motion.div>
//     </div>
//   );
// };

// export default HeroSection;

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import browserImageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import { formToJSON } from "axios";
import { apiClient,API_BASE_URL} from "@/services/apiService";
import { getMenuImagePath} from "@/utils/getImagePath";

import { toast } from "@/hooks/use-toast";

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  imageUrl?: string; // Optional field for image URL
  image_path?: string; // Optional field for image path
}

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [editSlideId, setEditSlideId] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const MAX_SLIDES = 3;

  useEffect(()=>{
    const fetchHeroList=async()=>{
      try {
        const response = await apiClient.get("/enduser/getHeroSliders");
        if (response.status=200) {
          const data=response?.data?.data;
          setSlides(data)
        } else {
          console.error("Failed to fetched hero data");
        }
      } catch (error) {
        console.error("Error while fetching hero data:", error);
      }
    }
    fetchHeroList()
  },[unsavedChanges])
  // Auto-slide effect
  useEffect(() => {
    if (slides.length <= 1) return;     

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length); 
    }, 15000); 

    return () => clearInterval(interval);
  }, [slides]); 

  // Handle file upload
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slideId: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressedFile = await compressImage(file);
    // console.log("compressedFile", compressedFile);
    const imageUrl = URL.createObjectURL(compressedFile);
    setImageToCrop(imageUrl);
    setEditSlideId(slideId);
    setIsCropping(true);
    setUnsavedChanges(true);
    e.target.value = "";
  };

  // Compress image
  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await browserImageCompression(file, options);
  };

  // Handle crop initialization
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: "px",
            width: 1920,
            height: 1080,
          },
          16 / 9,
          width,
          height
        ),
        width,
        height
      );
      setCrop(crop);
      setCompletedCrop(crop);
    },
    []
  );

  // Handle crop completion
  const handleCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop);
  }, []);

  const base64ToFile = (base64: string, fileName: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1]; // Get MIME type
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };
  // Crop and save image
  const handleCropImage = useCallback(async () => {
    if (!imgRef.current || !completedCrop || editSlideId === null) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const targetWidth = 1920;
    const targetHeight = 1080;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const croppedImage = canvas.toDataURL("image/jpeg", 0.9);

    setSlides((prevSlides) => {
      const existingSlide = prevSlides.find(
        (slide) => slide.id === editSlideId
      );
      if (existingSlide) {
        return prevSlides.map((slide) =>
          slide.id === editSlideId ? { ...slide, image: croppedImage } : slide
        );
      }
      return [
        ...prevSlides,
        { id: editSlideId, image: croppedImage, title: "" },
      ];
    });

    setIsCropping(false);
    setImageToCrop(null);
    setCompletedCrop(null);
    setEditSlideId(null);
  }, [completedCrop, editSlideId]);

  // Handle title change
  const handleTitleChange = (id: number, title: string) => {
    setSlides((prevSlides) => {
      const existingSlide = prevSlides.find((slide) => slide.id === id);
      if (existingSlide) {
        return prevSlides.map((slide) =>
          slide.id === id ? { ...slide, title } : slide
        );
      }
      return [...prevSlides, { id, image: "", title }];
    });
  };

  const handleSaveHeroData = async () => {
   
    const formData = new FormData();

    slides.forEach((slide, index) => {
      // Append the title of the slide
      let id = slide.id;
      formData.append(`slide_title${id}`, slide.title);
      formData.append(`slide_id`, `${id}`);

      if (slide.image) {
        const imageFile = base64ToFile(slide.image, `${slide.id}.jpg`);
        formData.append(`slide_image${id}`, imageFile);
      } else {
        console.log(`No image for slide ${slide.id}`);
      }
    });
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(
        "/admin/updateHeroSliders",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status==200) {
        console.log("Hero data saved successfully");
        toast({
          title: "Updated Successfully",
          description: "Hero Section has been updated successfully",
        })
        setUnsavedChanges(false); // Reset unsaved changes state after saving
      } else {
        console.error("Failed to save hero data");
      }
    } catch (error) {
      console.error("Error saving hero data:", error);
    }

    // printFormData(formData);
    // console.log("Hero data saved:", slides);

    setUnsavedChanges(false);
  };
console.log(slides)
  return (
    <div
      id="heroCarousel"
      className="carousel slide rounded overflow-hidden"
      data-bs-ride="carousel"
    >
      {/* Slider */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        id="heroCarousel"
        className="carousel slide rounded overflow-hidden relative"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {slides?.length > 0 ? (
            slides?.map((slide, index) => (
              <div
                key={slide.id}
                className={`carousel-item ${
                  index === currentSlide ? "active" : ""
                }`}
                style={{
                  maxHeight: "400px",
                  maxWidth: "100%",
                  objectFit: "cover",
                }}
              >  
                <div className="position-relative h-100">
                
                  <img
                    src={slide.image_path ? `${API_BASE_URL}/${slide.image_path}`: slide.image}
                    alt={slide.title || `hero-${slide.id}`}
                    className="object-cover w-full h-full"
                    style={{ filter: "brightness(65%)" }}
                    loading="lazy"
                    width={800}
                    height={300}
                  />
                  {slide.title && (
                    <div className="carousel-caption  pb-4">
                      <h2
                        className="lobsterFont"
                        style={{ textShadow: "0px 0px 3px #000000" }}
                      >
                        {slide.title}
                      </h2>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="carousel-item active" style={{ height: "400px" }}>
              <div className="position-relative h-100 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xl font-medium animate-pulse">
                  Add your hero images below!
                </span>
              </div>
            </div>
          )}
        </div>
        {slides.length > 0 && (
          // <div
          //   className="carousel-indicators absolute bottom-0 mb-2 flex justify-center w-full"
          //   style={{ marginLeft: "0px" }}
          // >
          //   {slides.map((_, index) => (
          //     <button
          //       key={index}
          //       type="button"
          //       data-bs-target="#heroCarousel"
          //       data-bs-slide-to={index}
          //       className={`w-3 h-3 mx-1 rounded-full cursor-pointer transition-all duration-500 ${
          //         index === currentSlide
          //           ? "bg-indigo-600 scale-125"
          //           : "bg-gray-400 hover:bg-gray-500"
          //       }`}
          //       aria-current={index === currentSlide ? "true" : "false"}
          //       aria-label={`Slide ${index + 1}`}
          //       onClick={() => setCurrentSlide(index)}
          //     ></button>
          //   ))}
            
          // </div>
          <div
            className="carousel-indicators absolute bottom-0 mb-2 flex justify-center w-full"
            style={{ marginLeft: "0px" }}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={index}
                className={`w-3 h-3 mx-1 rounded-full cursor-pointer transition-all duration-500 ${
                  index === currentSlide
                    ? "bg-primary" // active state: more visible (larger and blue)
                    : "bg-gray-400 hover:bg-gray-500" // inactive state: default gray and hover effect
                }`}
                aria-current={index === currentSlide ? "true" : "false"}
                aria-label={`Slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
              ></button>
            ))}
          </div>

        )}
      </motion.div>
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          className="bg-primary text-white px-6 py-2 rounded-full font-medium mb-3 mt-3"
          onClick={handleSaveHeroData}
          disabled={!unsavedChanges}
        >
          Save Changes
        </Button>
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {isCropping && imageToCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 10, y: 20 }}
              className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl"
            >
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={handleCropComplete}
                aspect={16 / 9}
                minWidth={1920}
                minHeight={1080}
                locked
                className="rounded-lg overflow-hidden"
              >
                <img
                  ref={imgRef}
                  src={imageToCrop}
                  alt="Crop preview"
                  style={{
                    maxHeight: "400px",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold"
                  onClick={() => {
                    setIsCropping(false);
                    setImageToCrop(null);
                    setCompletedCrop(null);
                    setEditSlideId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-semibold"
                  onClick={handleCropImage}
                  disabled={!completedCrop}
                >
                  Save Image
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[1, 2, 3].map((id, index) => {
          const slide = slides.find((s) => s.id === id);
          return (
            <div
              key={id}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <h4 className="text-lg font-semibold mb-4">Slide {id}</h4>
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, id)}
                    className="hidden"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                  />
                  <Button
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-full font-medium w-full"
                  >
                    {slide?.image ? "Change Image" : "Upload Image"}
                  </Button>
                </div>
                {/* Title Input */}

                <Input
                  type="text"
                  placeholder="Enter slide title"
                  value={slide?.title || ""}
                  onChange={(e) => handleTitleChange(id, e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default HeroSection;
