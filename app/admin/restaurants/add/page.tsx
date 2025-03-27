"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Upload } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/services/apiService"

export default function AddRestaurantPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    website: '',
    category: '',
    description: '',
    open_hours: '',
    latitude: '',
    longitude: '',
    placeId: '',
    cover_image: null as File | null,
  })

  const [addressInput, setAddressInput] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch suggestions using Google Places JS SDK
  useEffect(() => {
    if (!addressInput || typeof window === 'undefined' || !window.google) return
    if (!addressInput || addressInput.length < 5) return

    // Optional: prevent gibberish
    const isGibberish = !/[a-zA-Z0-9]/.test(addressInput)
    if (isGibberish) return
    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions({ input: addressInput, types: ["geocode"] }, (predictions) => {
      setSuggestions(predictions || [])
    })
  }, [addressInput])

  const handleSelectPlace = (placeId: string) => {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"))
    service.getDetails({ placeId, fields: ["formatted_address", "geometry"] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const lat = place?.geometry?.location?.lat()
        const lng = place?.geometry?.location?.lng()

        setRestaurantData((prev) => ({
          ...prev,
          address: place?.formatted_address || "",
          latitude: lat?.toString() || "",
          longitude: lng?.toString() || "",
          placeId,
        }))
        setAddressInput(place?.formatted_address || "")
        setSuggestions([])
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRestaurantData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setRestaurantData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setRestaurantData((prev) => ({ ...prev, cover_image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData()
    Object.entries(restaurantData).forEach(([key, value]) => {
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
        throw new Error('Failed to add restaurant')
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
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/restaurants">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurants
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Add Restaurant</h1>

      <form onSubmit={handleSubmit}>
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
                  <img
                    src={coverImagePreview}
                    alt="Preview"
                    className="max-h-[200px] object-cover rounded-md mx-auto"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm">Click to upload cover image</p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Name & Cuisine */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input name="name" value={restaurantData.name} onChange={handleChange} required />
              </div>
              <div>
                <Label>Cuisine</Label>
                <Select
                  value={restaurantData.category}
                  onValueChange={(val) => handleSelectChange("category", val)}
                >
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
              </div>
            </div>

            {/* Address w/ autocomplete */}
            <div className="relative space-y-2">
              <Label>Address</Label>
              <Input
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Type address"
                required
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
            </div>

            {/* Lat/Lng Display */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input value={restaurantData.latitude} readOnly />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input value={restaurantData.longitude} readOnly />
              </div>
            </div>

            {/* Contact & Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input name="phone" value={restaurantData.phone} onChange={handleChange} required />
              </div>
              <div>
                <Label>Website</Label>
                <Input name="website" value={restaurantData.website} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label>Business Hours</Label>
              <Input name="open_hours" value={restaurantData.open_hours} onChange={handleChange} required />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={restaurantData.description}
                onChange={handleChange}
                rows={3}
                required
              />
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
