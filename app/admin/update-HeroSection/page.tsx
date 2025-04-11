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
  // useEffect(() => {
  //   if (slides.length <= 1) return;     

  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % slides.length); 
  //   }, 15000); 

  //   return () => clearInterval(interval);
  // }, [slides]); 

  // Handle file upload
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slideId: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
        return; 
      }
    // Generate a preview of the image
    const imageUrl = URL.createObjectURL(file);
  
    // Update the slide image preview
    setSlides((prevSlides) => {
      return prevSlides.map((slide) =>
        slide.id === slideId ? { ...slide, image: imageUrl } : slide
      );
    });
  
    // Compress the image if necessary
    const compressedFile = await compressImage(file);
    const compressedImageUrl = URL.createObjectURL(compressedFile);
  
    // Set for cropping
    setImageToCrop(compressedImageUrl);
    setEditSlideId(slideId);
    setIsCropping(true);
    setUnsavedChanges(true);
    e.target.value = ""; // Reset the file input
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
    const tempmime= arr[0].match(/:(.*?);/) ||""; 
    const mime = tempmime[1]; 
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

      // Update the slide image with the cropped image
  setSlides((prevSlides) => {
    return prevSlides.map((slide) =>
      slide.id === editSlideId ? { ...slide, image: croppedImage } : slide
    );
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
    setUnsavedChanges(true)
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
// console.log(slides)
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
                    src={slide.image ||  (slide.image_path && slide.image_path.includes('/public') 
                      ? `${API_BASE_URL}/${slide.image_path.split("/public")[1]}`
                      : `${API_BASE_URL}/${slide.image_path}`)}
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
        {slides?.length > 0 && (
          <div
            className="carousel-indicators absolute bottom-0 mb-2 flex justify-center w-full"
            style={{ marginLeft: "0px" }}
          >
            {slides?.map((_, index) => (
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
          className="bg-primary text-white px-6 py-2 rounded-full font-medium mb-3 mt-3 me-4"
          onClick={handleSaveHeroData}
          disabled={!unsavedChanges}
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="bg-danger text-white px-6 py-2 rounded-full font-medium mb-3 mt-3 "
          onClick={() => {setUnsavedChanges(false); }}
          disabled={!unsavedChanges}
        >
          Cancel Changes
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
                  maxLength={100}
                  className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}
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
