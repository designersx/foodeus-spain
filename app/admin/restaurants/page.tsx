"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus ,Search } from "lucide-react"
import decodeToken from "@/lib/decode-token";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL, getRestaurantListforAdmin } from "@/services/apiService"
import { useLanguage } from "@/context/language-context"
import {getMenuImagePath} from "@/utils/getImagePath"
import PopUp from "@/components/ui/custom-toast";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/Spinner";

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
  restaurant_updated_at:Date|any
}

const ITEMS_PER_PAGE = 15

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [restaurantsData, setRestaurants] = useState<Restaurant[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()
  // const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const { toast } = useToast();
  const storedFilter = sessionStorage.getItem('selectedFilter') || 'latestMenu'; // Default to 'latest' if nothing is stored
  const [selectedFilter, setSelectedFilter] = useState(storedFilter); // State for filter
  const [errorMessage, setErrorMessage] = useState("") 

  const handleFilterChange = (e:any) => {
    const filterValue = e.target.value;
    setSelectedFilter(filterValue); // Update state with selected filter

    // Store the selected filter in sessionStorage
    sessionStorage.setItem('selectedFilter', filterValue);
  };  
  // console.log('selectedFilter',selectedFilter)

  const handleSearchChange = (e:any) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to page 1 on search
  };

 
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      try {
        const response = await getRestaurantListforAdmin()
        const restaurants = await response
        setRestaurants(restaurants.data)
      }
      catch (error) {
        
        console.error("Error fetching restaurants:", error)
        setErrorMessage(t("ErrorFetchingRestaurants"))
        // setToast({ show: true, message: t("ErrorFetchingRestaurants"), type: "error" });
      } finally {
        setLoading(false)
      }
    }
  
    fetchRestaurants()
  }, [])

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (token) {
     try {
      const decoded = decodeToken(token)|| ""
      const now = Math.floor(Date.now() / 1000); 
  
      if (decoded?.exp < now) {
        toast({
          title: t("SessionExpired"),
          description: t("PleaseLoginAgain"),
          variant: "destructive",
        });
        localStorage.removeItem("foodeus-admin-auth")
        setTimeout(() => {
          
          window.location.href = "/auth/login";
        }, 2000);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      toast({
        title: t("InvalidSession"),
        description: t("PleaseLoginAgain"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    }
    }
  },[])

  // const filteredRestaurants = restaurantsData?.filter(
  //   (restaurant) =>
  //     restaurant?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
  //     restaurant?.category?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
  //     restaurant?.address?.toLowerCase().includes(searchQuery?.toLowerCase())
  // )

  // const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE)
  // const paginatedRestaurants = filteredRestaurants.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // )


  const filterAndSortRestaurants = (restaurants: Restaurant[]) => {
    let filtered = [...restaurants]; // Clone to avoid mutation of original data

    // Filter by search query
    filtered = filtered.filter(
      (restaurant) =>
        restaurant?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        restaurant?.category?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        restaurant?.address?.toLowerCase().includes(searchQuery?.toLowerCase())
    );

    // Apply selected filter
    if (selectedFilter === "latestRest") {
      filtered = filtered.sort((a, b) => (new Date(b.restaurant_updated_at).getTime() - new Date(a.restaurant_updated_at).getTime())); // Latest updated first
    } else if (selectedFilter === "menuCountDesc") {
      filtered = filtered.sort((a, b) => b.menu_count - a.menu_count); // Menu count (Higher to Lower)
    } else if (selectedFilter === "menuCountAsc") {
      filtered = filtered.sort((a, b) => a.menu_count - b.menu_count); // Menu count (Lower to Higher)
    }

    return filtered;
  };

  const filteredRestaurants = filterAndSortRestaurants(restaurantsData);

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


// console.log('errorMessage',errorMessage)
  return (
    <div className="w-full space-y-6 responsive-container ">
      {loading?
      (
        <div className="flex flex-col items-center justify-center z-50 bg-white"     style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("Loading")}</span>
        </div>
        <p className="text-muted-foreground mt-4">{t("Loading")}</p>
      </div>
  
      ): errorMessage ? ( // Show error message if there is an error
        <div className="flex justify-center items-center text-red-500">
          <p>{errorMessage}</p>
        </div>
      ):(
        <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Restaurants')}</h1>
          <p className="text-muted-foreground">{t('ManageRestaurants')}</p>
        </div>
        <Button asChild  style={{ textDecoration: "none" }}>
          <Link href="/admin/restaurants/add">
            <Plus className="mr-2 h-4 w-4" /> {t('AddRestaurant')} 
          </Link>
        </Button>
      </div>

      <div className="flex flex-col xs:flex-row sm:flex-row md:flex-row lg:flex-row xl:flex-row items-left gap-4 w-full">
      <div className="relative flex-1 px-1 xs:w-full sm:w-full md:w-8/12 lg:w-8/12 xl:w-8/12">
      <Input
          type="search"
          placeholder={t('SearchRestaurants')}
          className="w-full py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
   
      </div>

      {/* Filter Button */}
      <div className="relative xs:w-full sm:w-full md:w-4/12 lg:w-4/12 xl:w-4/12">
      <select
        className="px-1 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 xs:w-full sm:w-full"
        value={selectedFilter}
        onChange={handleFilterChange}
        style={{width:"100%"}}
      >
        {/* <option value="" disabled>
          {t('SelectFilter')}
        </option> */}
        <option value="latestMenu">{t('LatestUpdatedMenu')}</option>
        <option value="latestRest">{t('LatestUpdatedRest')}</option>
        <option value="menuCountDesc">{t('MenuCountDesc')}</option>
        <option value="menuCountAsc">{t('MenuCountAsc')}</option>
      </select>
    </div>
    </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedRestaurants?.map((restaurant) => {
        // console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);  
        const normalized =restaurant.cover_image
        let img=normalized?`${API_BASE_URL}/${normalized}`:'/Images/restaurent-fall.jpg'
        // let img = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant?.g_image}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
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
                   
                    <h3 className="font-semibold text-lg resName"     style={{
                              wordBreak: "break-all",
                              whiteSpace: "normal", 
                            }}>{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 "   style={{
                        minHeight: '6em', 
                        lineHeight: '2em', 
                        wordBreak: "break-word", 
                        whiteSpace: "normal", 
                      }}>{restaurant.address}</p>
                    <p className="text-sm text-muted-background">{t('RestaurantID')} : {restaurant.id}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{restaurant.category}</Badge>
                  <Badge variant="outline">{restaurant.menu_count} {t('Menus')}</Badge>
                </div>
              </CardContent>
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
            {t('Previous')}
          </Button>
          <span className="text-sm">{t('Page')} {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            {t('Next')}
          </Button>
        </div>
      )}
      </>
      )}
    </div>
         
  )
}
