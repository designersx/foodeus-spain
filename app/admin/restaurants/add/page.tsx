// "use client"

// import React, { useState, useEffect, useRef } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { ArrowLeft, MapPin, Upload } from "lucide-react"

// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
// import { apiClient } from "@/services/apiService"

// export default function AddRestaurantPage() {
//   const router = useRouter()
//   const { toast } = useToast()

//   const [restaurantData, setRestaurantData] = useState({
//     name: '',
//     cuisine: '',
//     address: '',
//     phone: '',
//     website: '',
//     category: '',
//     description: '',
//     open_hours: '',
//     latitude: '',
//     longitude: '',
//     placeId: '',
//     cover_image: null as File | null,
//   })

//   const [addressInput, setAddressInput] = useState("")
//   const [suggestions, setSuggestions] = useState<any[]>([])
//   const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   // Fetch suggestions using Google Places JS SDK
//   useEffect(() => {
//     if (!addressInput || typeof window === 'undefined' || !window.google) return
//     if (!addressInput || addressInput.length < 5) return

//     // Optional: prevent gibberish
//     const isGibberish = !/[a-zA-Z0-9]/.test(addressInput)
//     if (isGibberish) return
//     const service = new window.google.maps.places.AutocompleteService()
//     service.getPlacePredictions({ input: addressInput, types: ["geocode"] }, (predictions) => {
//       setSuggestions(predictions || [])
//     })
//   }, [addressInput])

//   const handleSelectPlace = (placeId: string) => {
//     const service = new window.google.maps.places.PlacesService(document.createElement("div"))
//     service.getDetails({ placeId, fields: ["formatted_address", "geometry"] }, (place, status) => {
//       if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//         const lat = place?.geometry?.location?.lat()
//         const lng = place?.geometry?.location?.lng()

//         setRestaurantData((prev) => ({
//           ...prev,
//           address: place?.formatted_address || "",
//           latitude: lat?.toString() || "",
//           longitude: lng?.toString() || "",
//           placeId,
//         }))
//         setAddressInput(place?.formatted_address || "")
//         setSuggestions([])
//       }
//     })
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setRestaurantData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSelectChange = (name: string, value: string) => {
//     setRestaurantData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null
//     if (file) {
//       setRestaurantData((prev) => ({ ...prev, cover_image: file }))
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setCoverImagePreview(reader.result as string)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     const formData = new FormData()
//     Object.entries(restaurantData).forEach(([key, value]) => {
//       if (value !== null) {
//         formData.append(key, value as any)
//       }
//     })

//     try {
//       const token = localStorage.getItem('token')
//       const response = await apiClient.post('/restaurants/add', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${token}`,
//         },
//       })

//       if (response.data.success) {
//         toast({
//           title: "Restaurant added",
//           description: "The restaurant has been added successfully",
//         })
//         router.push("/admin/restaurants")
//       } else {
//         throw new Error('Failed to add restaurant')
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "There was an error adding the restaurant",
//         variant: "destructive",
//       })
//       console.error("Error adding restaurant:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Button variant="ghost" size="sm" asChild>
//         <Link href="/admin/restaurants">
//           <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurants
//         </Link>
//       </Button>

//       <h1 className="text-3xl font-bold tracking-tight">Add Restaurant</h1>

//       <form onSubmit={handleSubmit}>
//         <Card>
//           <CardHeader>
//             <CardTitle>Restaurant Info</CardTitle>
//             <CardDescription>Provide restaurant details</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Cover Image */}
//             <div>
//               <Label>Cover Image</Label>
//               <div
//                 className="border-dashed border-2 rounded-lg p-4 cursor-pointer hover:bg-muted/50"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 {coverImagePreview ? (
//                   <img
//                     src={coverImagePreview}
//                     alt="Preview"
//                     className="max-h-[200px] object-cover rounded-md mx-auto"
//                   />
//                 ) : (
//                   <div className="text-center">
//                     <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
//                     <p className="text-sm">Click to upload cover image</p>
//                   </div>
//                 )}
//                 <Input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   ref={fileInputRef}
//                   onChange={handleFileChange}
//                 />
//               </div>
//             </div>

//             {/* Name & Cuisine */}
//             <div className="grid sm:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="name">Restaurant Name</Label>
//                 <Input name="name" value={restaurantData.name} onChange={handleChange} required />
//               </div>
//               <div>
//                 <Label>Cuisine</Label>
//                 <Select
//                   value={restaurantData.category}
//                   onValueChange={(val) => handleSelectChange("category", val)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select cuisine" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Italian">Italian</SelectItem>
//                     <SelectItem value="Mexican">Mexican</SelectItem>
//                     <SelectItem value="Indian">Indian</SelectItem>
//                     <SelectItem value="Asian">Asian</SelectItem>
//                     <SelectItem value="Spanish">Spanish</SelectItem>
//                     <SelectItem value="Others">Others</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Address w/ autocomplete */}
//             <div className="relative space-y-2">
//               <Label>Address</Label>
//               <Input
//                 value={addressInput}
//                 onChange={(e) => setAddressInput(e.target.value)}
//                 placeholder="Type address"
//                 required
//               />
//               {suggestions.length > 0 && (
//                 <div className="absolute top-full left-0 z-50 bg-white shadow border rounded w-full max-h-60 overflow-auto">
//                   {suggestions.map((s) => (
//                     <div
//                       key={s.place_id}
//                       className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                       onClick={() => handleSelectPlace(s.place_id)}
//                     >
//                       {s.description}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Lat/Lng Display */}
//             <div className="grid sm:grid-cols-2 gap-4">
//               <div>
//                 <Label>Latitude</Label>
//                 <Input value={restaurantData.latitude} readOnly />
//               </div>
//               <div>
//                 <Label>Longitude</Label>
//                 <Input value={restaurantData.longitude} readOnly />
//               </div>
//             </div>

//             {/* Contact & Details */}
//             <div className="grid sm:grid-cols-2 gap-4">
//               <div>
//                 <Label>Phone</Label>
//                 <Input name="text" value={restaurantData.phone} onChange={handleChange} required minLength={10} maxLength={15}   
//                 onInput={(e) => {
//   const input = e.target as HTMLInputElement;
//   input.value = input.value.replace(/[^0-9]/g, '');
// }}/>
//               </div>
//               <div>
//                 <Label>Website</Label>
//                 <Input name="website" value={restaurantData.website} onChange={handleChange} maxLength={60} />
//               </div>
//             </div>

//             <div>
//               <Label>Business Hours</Label>
//               <Input name="open_hours" value={restaurantData.open_hours} onChange={handleChange} required maxLength={100}/>
              
//             </div>

//             <div>
//               <Label>Description</Label>
//               <Textarea
//                 name="description"
//                 value={restaurantData.description}
//                 onChange={handleChange}
//                 rows={3}
//                 required
//                 maxLength={200}
//               />
//             </div>
//           </CardContent>
//           <CardFooter className="justify-between">
//             <Button type="button" variant="outline" asChild>
//               <Link href="/admin/restaurants">Cancel</Link>
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? "Adding..." : "Add Restaurant"}
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//     </div>
//   )
// }
"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Upload } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/services/apiService"

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Restaurant name is required"),
  category: Yup.string().required("Cuisine is required"),
  address: Yup.string().required("Address is required"),
  phone: Yup.string().matches(/^\d+$/, "Phone must be digits only").min(9).max(15).required(),
  // website: Yup.string().url("Invalid URL").nullable(),
  description: Yup.string().max(200).required("Description is required"),
  open_hours: Yup.string().max(100).required("Business hours are required"),
})

export default function AddRestaurantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
          title: "Error",
          description: "There was an error adding the restaurant",
          variant: "destructive",
        })
        console.error("Error adding restaurant:", error)
      } finally {
        setIsLoading(false)
      }
    },
  })

  useEffect(() => {
    if (!formik.values.address || typeof window === 'undefined' || !window.google) return
    if (formik.values.address.length < 5 || !/[a-zA-Z0-9]/.test(formik.values.address)) return

    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions({ input: formik.values.address, types: ["geocode"] }, (predictions) => {
      setSuggestions(predictions || [])
    })
  }, [formik.values.address])

  const handleSelectPlace = (placeId: string) => {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"))
    service.getDetails({ placeId, fields: ["formatted_address", "geometry"] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const lat = place?.geometry?.location?.lat()?.toString() || ""
        const lng = place?.geometry?.location?.lng()?.toString() || ""
        const formatted = place?.formatted_address || ""

        formik.setValues((prev) => ({
          ...prev,
          address: formatted,
          latitude: lat,
          longitude: lng,
          placeId,
        }))
        setSuggestions([])
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      formik.setFieldValue("cover_image", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/restaurants">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurants
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Add Restaurant</h1>

      <form onSubmit={formik.handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Info</CardTitle>
            <CardDescription>Provide restaurant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover Image */}
            <div>
              <Label>Cover Image</Label>
              <div
                className="border-dashed border-2 rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImagePreview ? (
                  <img src={coverImagePreview} alt="Preview" className="max-h-[200px] object-cover rounded-md mx-auto" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm">Click to upload cover image</p>
                  </div>
                )}
                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>
            </div>

            {/* Name & Cuisine */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Restaurant Name</Label>
                <Input {...formik.getFieldProps("name")} />
                {formik.touched.name && formik.errors.name && <p className="text-sm text-danger">{formik.errors.name}</p>}
              </div>
              <div>
                <Label>Cuisine</Label>
                <Select value={formik.values.category} onValueChange={(val) => formik.setFieldValue("category", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.category && formik.errors.category && <p className="text-sm text-danger">{formik.errors.category}</p>}
              </div>
            </div>

            {/* Address w/ autocomplete */}
            <div className="relative space-y-2">
              <Label>Address</Label>
              <Input
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Type address"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-50 bg-white shadow border rounded w-full max-h-60 overflow-auto">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectPlace(s.place_id)}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
              {formik.touched.address && formik.errors.address && <p className="text-sm text-danger">{formik.errors.address}</p>}
            </div>

            {/* Lat/Lng Display */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input value={formik.values.latitude} readOnly />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input value={formik.values.longitude} readOnly />
              </div>
            </div>

            {/* Contact & Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formik.values.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    formik.setFieldValue("phone", digits)
                  }}
                />
                {formik.touched.phone && formik.errors.phone && <p className="text-sm text-danger">{formik.errors.phone}</p>}
              </div>
              <div>
                <Label>Website</Label>
                <Input {...formik.getFieldProps("website")} />
                {formik.touched.website && formik.errors.website && <p className="text-sm text-danger">{formik.errors.website}</p>}
              </div>
            </div>

            <div>
              <Label>Business Hours</Label>
              <Input {...formik.getFieldProps("open_hours")} />
              {formik.touched.open_hours && formik.errors.open_hours && <p className="text-sm text-danger">{formik.errors.open_hours}</p>}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...formik.getFieldProps("description")} rows={3} />
              {formik.touched.description && formik.errors.description && <p className="text-sm text-danger">{formik.errors.description}</p>}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/restaurants">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Restaurant"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
