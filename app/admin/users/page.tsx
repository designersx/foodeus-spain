"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL, getMobileUsers, getRestaurantListforAdmin } from "@/services/apiService"
import {getMenuImagePath} from "@/utils/getImagePath"
interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  description: string;
  open_hours: string;
  cover_image: string;
  menu_count: number;
  g_image: string;
}

const ITEMS_PER_PAGE = 15

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [restaurantsData, setRestaurants] = useState<Restaurant[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchRestaurants = async () => {
      const response = await getMobileUsers()
      console.log(response,"response")
      const restaurants = await response
      setRestaurants(restaurants.data)
    }
    fetchRestaurants()
  }, [])

  const filteredRestaurants = restaurantsData?.filter(
    (restaurant) =>
      restaurant?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      restaurant?.category?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      restaurant?.address?.toLowerCase().includes(searchQuery?.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE)
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage your users</p>
        </div>
     
      </div>

      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // reset to page 1 on search
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedRestaurants?.map((restaurant) => {
        // console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);  
        const normalized =restaurant.cover_image
        let img=normalized?`${API_BASE_URL}/${normalized}`:'/Images/restaurent-fall.jpg'
          return (
            <Link href={`/admin/restaurants/${restaurant.id}`} className="text-decoration-none text-dark" key={restaurant.id}>
            <Card key={restaurant.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={img}
                  onError={(e) => {
                    e.currentTarget.onerror = null // Prevent infinite loop
                    e.currentTarget.src = "/Images/restaurent-fall.jpg"
                  }}
                  alt={restaurant?.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                   
                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                    <p className="text-sm text-muted-background">Restaurent ID : {restaurant.id}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{restaurant.category}</Badge>
                  <Badge variant="outline">{restaurant.menu_count} menu items</Badge>
                </div>
              </CardContent>
              {/* <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/restaurants/${restaurant.id}`}>View Details</Link>
                </Button>
              </CardFooter> */}
            </Card>
            </Link>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
