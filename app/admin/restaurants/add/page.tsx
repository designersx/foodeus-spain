"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Upload } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useLanguage } from "@/context/language-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/services/apiService"

// const validationSchema = Yup.object().shape({
//   name: Yup.string().trim().required("Restaurant name is required"),
//   category: Yup.string().trim().required("Cuisine is required"),
//   address: Yup.string().trim().required("Address is required"),
//   phone: Yup.string().required("Phone is required").matches(/^\d+$/, "Phone must be digits only").min(9).max(15),
 
//   description: Yup.string().trim().max(200).required("Description is required"),
//   open_hours: Yup.string().trim().max(100).required("Business hours are required"),
// })

export default function AddRestaurantPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedplace, setSelectedPlace] = useState<boolean>(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const validationSchema = 
    Yup.object().shape({
      name: Yup.string()
        .trim()
        .required(t("ValidationRestaurantNameRequired")),
      category: Yup.string()
        .trim()
        .required(t("ValidationCuisineRequired")),
      address: Yup.string()
        .trim()
        .required(t("ValidationAddressRequired")),
      phone: Yup.string()
        .required(t("ValidationPhoneRequired"))
        .matches(/^\d+$/, t("ValidationPhoneDigitsOnly"))
        .min(9, t("ValidationPhoneMin"))
        .max(15, t("ValidationPhoneMax")),
      description: Yup.string()
        .trim()
        .max(200, t("ValidationDescriptionMax"))
        .required(t("ValidationDescriptionRequired")),
      open_hours: Yup.string()
        .trim()
        .max(100, t("ValidationOpenHoursMax"))
        .required(t("ValidationOpenHoursRequired")),
    });


  const formik = useFormik({
    initialValues: {
      name: "",
      category: "",
      address: "",
      phone: "",
      website: "",
      description: "",
      open_hours: "",
      latitude: "",
      longitude: "",
      placeId: "",
      cover_image: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      const coordinates = ['latitude', 'longitude']
      let hasCoordinates = coordinates.every(coord => values[coord] && values[coord] !== "");
      if (!hasCoordinates) {
        toast({
          title: t("ToastWarningTitle"),
          description: t("ToastMissingCoordinates"),
          variant: "destructive",
        });
        return
      }
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value as any)
        }
      })

      try {
        const token = localStorage.getItem('token')
        const response = await apiClient.post('/restaurants/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast({
            title: "Restaurant added",
            description: "The restaurant has been added successfully",
          })
          router.push("/admin/restaurants")
        } else {
          throw new Error("Failed to add restaurant")
        }
      } catch (error) {
        toast({
          title: t("ToastErrorTitle"),
          description: t("ToastAddRestaurantError"),
          variant: "destructive",
        });
        
        console.error("Error adding restaurant:", error)
      } finally {
        setIsLoading(false)
      }
    },
  })
  
 

  if(formik.values.address.length === 0  && selectedplace)
  {
    setSelectedPlace(false)
  }
  useEffect(() => {
    if (
      !formik.values.address ||
      typeof window === "undefined" ||
      !window.google ||
      formik.values.address.length < 4 || selectedplace
    ) return;


    const legacyAutocomplete = new window.google.maps.places.AutocompleteService();
    legacyAutocomplete.getPlacePredictions(
      {
        input: formik.values.address,
        types: ["establishment"],
        componentRestrictions: { country: ["in", "es"] },
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log("predictions", predictions)
          setSuggestions(predictions || []);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [formik.values.address]);

  const handleSelectPlace = (placeId: string, description: string) => {
    setSuggestions([]);
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    // console.log("place out", placeId);
    setSelectedPlace(true)
    service.getDetails(
      {
        placeId,
        fields: ["formatted_address", "geometry", "name", "place_id"],
      },
      (place, status) => {
        // console.log("place inside", place, status);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const lat = place?.geometry?.location?.lat()?.toString() || "";
          const lng = place?.geometry?.location?.lng()?.toString() || "";
          const formatted = place?.formatted_address || description;

          formik.setValues((prev) => ({
            ...prev,
            address: formatted,
            latitude: lat,
            longitude: lng,
            placeId,
          }));
          setSuggestions([]);
        }
      }
    );
  }

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
  
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
      title: t("ToastInvalidFileTypeTitle"),
      description: t("ToastInvalidFileTypeMessage"),
      variant: "destructive",
    });
          return; 
        }
      formik.setFieldValue("cover_image", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  // console.log(formik.errors)

  return (
    <div className="full-width-container space-y-6 responsive-container">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/restaurants">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t('BackToRestaurants')}
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">{t('AddRestaurant')}</h1>

      <form onSubmit={formik.handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('RestaurantInfo')}</CardTitle>
            <CardDescription>{t('ProvideRestaurantDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover Image */}
            <div>
              <Label>{t('CoverImage')}</Label>
              <div
                className="border-dashed border-2 rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImagePreview ? (
                  <img src={coverImagePreview} alt="Preview" className="max-h-[200px] object-cover rounded-md mx-auto" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                  <p className="text-sm">{t('ClickToUploadCoverImage')}</p>
                  </div>
                )}
                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>
            </div>

            {/* Name & Cuisine */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('RestaurantName')}<span className="text-danger"> *</span></Label>
                <Input {...formik.getFieldProps("name")}   
                placeholder={t('EnterRestaurantName')}
                  maxLength={50}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}/>
                {formik.touched.name && formik.errors.name && <span className="text-sm text-danger">{formik.errors.name}</span>}
              </div>
              <div>
                <Label>{t('Cuisine')} <span className="text-danger"> *</span></Label>
                <Select value={formik.values.category} onValueChange={(val) => formik.setFieldValue("category", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('SelectCuisine')} />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="Italian">{t('Italian')}</SelectItem>
                  <SelectItem value="Mexican">{t('Mexican')}</SelectItem>
                  <SelectItem value="Indian">{t('Indian')}</SelectItem>
                  <SelectItem value="Asian">{t('Asian')}</SelectItem>
                  <SelectItem value="Spanish">{t('Spanish')}</SelectItem>
                    <SelectItem value="Others">{t('Others')}</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.category && formik.errors.category && <span className="text-sm text-danger">{formik.errors.category}</span>}
              </div>
            </div>

            {/* Address w/ autocomplete */}
            <div className="relative space-y-2">
              <Label>{t('Address')}<span className="text-danger"> *</span></Label>
              <Input
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t('EnterAddress')}
              maxLength={100}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value
                .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                .replace(/^\s+/g, ""); 

              }}
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-50 bg-white shadow border rounded w-full max-h-60 overflow-auto">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectPlace(s.place_id, s.description)}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
              {formik.touched.address && formik.errors.address && <span className="text-sm text-danger">{formik.errors.address}</span>}
            </div>

            {/* Lat/Lng Display */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('Latitude')}</Label>
                <Input value={formik.values.latitude} readOnly />
              </div>
              <div>
                <Label>{t('Longitude')}</Label>
                <Input value={formik.values.longitude} readOnly />
              </div>
            </div>

            {/* Contact & Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('Phone')}<span className="text-danger"> *</span></Label>
                <Input
                  name="phone"
                  placeholder={t('EnterPhoneNumber')}
                  value={formik.values.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    formik.setFieldValue("phone", digits)
                  }}
                  maxLength={15}
                />
                {formik.touched.phone && formik.errors.phone && <span className="text-sm text-danger">{formik.errors.phone}</span>}
              </div>
              <div>
                <Label>{t('Website')}</Label>
                <Input {...formik.getFieldProps("website")} 
                placeholder={t('EnterWebsiteURL')}

                maxLength={70} 
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                  .replace(/[^a-zA-Z0-9\s./:]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                  .replace(/^\s+/g, ""); 

                }}/>
                {formik.touched.website && formik.errors.website && <span className="text-sm text-danger ">{formik.errors.website}</span>}
              </div>
            </div>

            <div>
              <Label>{t('OpenHours')}<span className="text-danger"> *</span></Label>
              <Input {...formik.getFieldProps("open_hours")}   
             placeholder={t('BusinessHoursExample')}
              maxLength={200}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value
                .replace(/[^a-zA-Z0-9\s-:]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                .replace(/^\s+/g, ""); 

              }}/>
              {formik.touched.open_hours && formik.errors.open_hours && <span className="text-sm text-danger">{formik.errors.open_hours}</span>}
            </div>

            <div>
              <Label>{t('Description')}<span className="text-danger"> *</span></Label>
              <Textarea {...formik.getFieldProps("description")} rows={3}  
              placeholder={t('EnterDescription')}
              maxLength={200}
               onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                  .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                  .replace(/^\s+/g, ""); 

                }}/>
              {formik.touched.description && formik.errors.description && <span className="text-sm text-danger">{formik.errors.description}</span>}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/restaurants">{t('Cancel')}</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('AddingRestaurant') : t('AddRestaurant')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
