"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/services/apiService"

export default function AddRestaurantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    website: '',
    category: '',
    description: '',
    open_hours: '',
    ratings: '',
    latitude: '',
    longitude: '',
    placeId:'',
    cover_image: null as File | null,
  })

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
      const token = localStorage.getItem('token') // Replace with real token or use auth logic
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
    <div className="full-width-container space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/restaurants">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurants
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Restaurant</h1>
        <p className="text-muted-foreground">Add a new restaurant to your platform</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>Enter the details of the new restaurant</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="mx-auto max-h-[200px] rounded-md object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                      <p className="text-white font-medium">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload cover image</p>
                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x800px (16:9 ratio)</p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  id="cover_image"
                  name="cover_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={restaurantData.name}
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select
                  value={restaurantData.cuisine}
                  onValueChange={(value) => handleSelectChange("cuisine", value)}
                >
                  <SelectTrigger id="cuisine">
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hamburguesas">Hamburguesas</SelectItem>
                    <SelectItem value="Carnívoros">Carnívoros</SelectItem>
                    <SelectItem value="Mexicano">Mexicano</SelectItem>
                    <SelectItem value="Asiático">Asiático</SelectItem>
                    <SelectItem value="Japonés">Japonés</SelectItem>
                    <SelectItem value="Italiano">Italiano</SelectItem>
                    <SelectItem value="Fusión">Fusión</SelectItem>
                    <SelectItem value="Latino">Latino</SelectItem>
                    <SelectItem value="Español">Español</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={restaurantData.description}
                onChange={handleChange}
                placeholder="Enter restaurant description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Location Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={restaurantData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    value={restaurantData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 40.7128"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    value={restaurantData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. -74.0060"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={restaurantData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={restaurantData.website}
                  onChange={handleChange}
                  placeholder="www.example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="open_hours">Business Hours</Label>
              <Input
                id="open_hours"
                name="open_hours"
                value={restaurantData.open_hours}
                onChange={handleChange}
                placeholder="Mon-Sat: 11am-10pm, Sun: 12pm-9pm"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
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
