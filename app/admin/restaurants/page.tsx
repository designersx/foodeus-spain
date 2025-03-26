"use client"

import { useState,useEffect } from "react"
import Link from "next/link"
import { Edit, Plus, Search, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getRestaurantListforAdmin } from "@/services/apiService"
// Sample restaurant data
// const restaurantsData = [
//   {
//     id: "1",
//     name: "El Rincón",
//     address: "456 Oak Ave, Somewhere",
//     cuisine: "Spanish",
//     rating: 4.7,
//     image: "/placeholder.svg?height=200&width=300",
//     menuCount: 12,
//     distance: "11526.9km",
//   },
//   {
//     id: "2",
//     name: "Sushi Spot",
//     address: "789 Pine Rd, Elsewhere",
//     cuisine: "Japanese",
//     rating: 4.5,
//     image: "/placeholder.svg?height=200&width=300",
//     menuCount: 24,
//     distance: "11526.9km",
//   },
//   {
//     id: "3",
//     name: "La Trattoria",
//     address: "123 Main St, Anytown",
//     cuisine: "Italian",
//     rating: 4.8,
//     image: "/placeholder.svg?height=200&width=300",
//     menuCount: 18,
//     distance: "11527.3km",
//   },
//   {
//     id: "4",
//     name: "Thai Delight",
//     address: "202 Maple Dr, Anyplace",
//     cuisine: "Thai",
//     rating: 4.4,
//     image: "/placeholder.svg?height=200&width=300",
//     menuCount: 15,
//     distance: "11527.3km",
//   },
//   {
//     id: "5",
//     name: "Burger Joint",
//     address: "101 Elm St, Nowhere",
//     cuisine: "American",
//     rating: 4.3,
//     image: "/placeholder.svg?height=200&width=300",
//     menuCount: 10,
//     distance: "11527.4km",
//   },
//   {
//     id: "6",
//     name: "Taj Mahal",
//     address: "303 Cedar Ln, Somewhere",
//     cuisine: "Indian",
//     rating: 4.6,
//     image: "/placeholder.svg?height=200&width=300",
//     menuCount: 20,
//     distance: "11528.1km",
//   },
// ]

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  description: string;
  open_hours: string;
  cover_image:string;
  menu_count: number; // You can adjust this based on your actual schema
}


export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [restaurantsData, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    // Fetch restaurants from the API
    const fetchRestaurants = async () => {
    const response = await getRestaurantListforAdmin();
    const restaurants = await response;
    console.log('dssd',restaurants)
    setRestaurants(restaurants.data)
    }
    fetchRestaurants();
  }, [])

  const filteredRestaurants = restaurantsData?.filter(
    (restaurant) =>
      restaurant?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      restaurant?.category?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      restaurant?.address?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-muted-foreground">Manage your restaurant listings</p>
        </div>
        <Button asChild>
          <Link href="/admin/restaurants/add">
            <Plus className="mr-2 h-4 w-4" /> Add Restaurant
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
          <Input
            type="search"
            placeholder="Search restaurants..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRestaurants?.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={restaurant?.cover_image || "/placeholder.svg"}
                alt={restaurant?.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                </div>
                {/* <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {restaurant.rating}
                </Badge> */}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">{restaurant.category}</Badge>
                <Badge variant="outline">{restaurant.menu_count} menu items</Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/restaurants/${restaurant.id}`}>View Details</Link>
              </Button>
              {/* <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/restaurants/${restaurant.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Link>
              </Button> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

