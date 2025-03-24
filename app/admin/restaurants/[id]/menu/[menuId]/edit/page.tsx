"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

// Sample restaurant data with menu items
const restaurantsData = [
  {
    id: "1",
    name: "El Rincón",
    menuItems: [
      {
        id: "1",
        name: "Seafood Paella",
        description: "Traditional Spanish rice dish with fresh seafood, saffron, and vegetables",
        price: "24.99",
        image: "/placeholder.svg?height=200&width=300",
        category: "main-course",
        isPopular: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
      },
      {
        id: "2",
        name: "Patatas Bravas",
        description: "Crispy fried potatoes served with spicy tomato sauce and aioli",
        price: "8.99",
        image: "/placeholder.svg?height=200&width=300",
        category: "appetizer",
        isPopular: false,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
      },
      // Other menu items...
    ],
  },
  // Other restaurants...
]

export default function EditMenuItemPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const restaurantId = params.id as string
  const menuItemId = params.menuId as string

  const restaurant = restaurantsData.find((r) => r.id === restaurantId)
  const menuItem = restaurant?.menuItems.find((item) => item.id === menuItemId)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isPopular: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    image: null as File | null,
  })

  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        category: menuItem.category,
        isPopular: menuItem.isPopular,
        isVegetarian: menuItem.isVegetarian,
        isVegan: menuItem.isVegan,
        isGlutenFree: menuItem.isGlutenFree,
        image: null,
      })

      setImagePreview(menuItem.image)
    }
  }, [menuItem])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))

      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would call your API to update the menu item
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Menu item updated",
        description: "The menu item has been updated successfully",
      })

      router.push(`/admin/restaurants/${restaurantId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the menu item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!restaurant || !menuItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Menu item not found</h2>
        <p className="text-muted-foreground mb-4">The menu item you're looking for doesn't exist</p>
        <Button asChild>
          <Link href={`/admin/restaurants/${restaurantId}`}>Back to Restaurant</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="full-width-container space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/restaurants/${restaurantId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurant
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Menu Item</h1>
        <p className="text-muted-foreground">Update the details of {menuItem.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Menu Item Details</CardTitle>
            <CardDescription>Update the menu item details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Image Upload */}
            <div className="space-y-2">
              <Label>Item Image</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Item preview"
                      className="mx-auto max-h-[200px] rounded-md object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                      <p className="text-white font-medium">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload item image</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload a high-quality image of the menu item</p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter menu item name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter item description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="Enter price (e.g. 12.99)"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="main-course">Main Course</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="side">Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dietary Options */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h3 className="font-medium">Item Properties</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPopular">Popular Item</Label>
                  <p className="text-xs text-muted-foreground">Mark this as a popular menu item</p>
                </div>
                <Switch
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => handleSwitchChange("isPopular", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isVegetarian">Vegetarian</Label>
                  <p className="text-xs text-muted-foreground">This item is suitable for vegetarians</p>
                </div>
                <Switch
                  id="isVegetarian"
                  checked={formData.isVegetarian}
                  onCheckedChange={(checked) => handleSwitchChange("isVegetarian", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isVegan">Vegan</Label>
                  <p className="text-xs text-muted-foreground">This item is suitable for vegans</p>
                </div>
                <Switch
                  id="isVegan"
                  checked={formData.isVegan}
                  onCheckedChange={(checked) => handleSwitchChange("isVegan", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isGlutenFree">Gluten Free</Label>
                  <p className="text-xs text-muted-foreground">This item is gluten free</p>
                </div>
                <Switch
                  id="isGlutenFree"
                  checked={formData.isGlutenFree}
                  onCheckedChange={(checked) => handleSwitchChange("isGlutenFree", checked)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/restaurants/${restaurantId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Menu Item"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

