"use client"

import { useState ,useEffect} from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, MapPin, Plus, Star, Trash2 } from "lucide-react"
import {apiClient} from "@/services/apiService";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input"
import {getMenuImagePath} from "@/utils/getImagePath"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL, getRestaurantByIdforAdmin } from "@/services/apiService"


// types/item.ts
export interface RestaurantItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "Starters" | "Main dishes" | "Desserts" | "Beverages";
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean; // Optional if applicable
  updated_at:any
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  category: string;
  rating: number;
  cover_image: any ;
  description: string;
  phone: string;
  website: string;
  open_hours: string;
  menus: MenuItem[]; 
}



export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const restaurantId = parseInt(params.id as string, 10) 
  const [relod,setreload] = useState(false)
  const [fallback, setFallback] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("menu");
  // const [items, setItems] = useState<RestaurantItem[]>([]);
  const [items, setItems] = useState([
    {
      id: "item1",
      name: "Grilled Chicken",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      category: "Main dishes",
      description: "Tender grilled chicken served with herbs and rice.",
    },
    {
      id: "item2",
      name: "Caesar Salad",
      price: 7.5,
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90",
      category: "Starters",
      description: "Classic caesar salad with parmesan and croutons.",
    },
    {
      id: "item3",
      name: "Chocolate Lava Cake",
      price: 5.25,
      image: "https://images.unsplash.com/photo-1605478031513-0547e82c1e3a",
      category: "Desserts",
      description: "Molten chocolate cake served warm with vanilla ice cream.",
    },
    {
      id: "item4",
      name: "Lemon Iced Tea",
      price: 3.0,
      image: "https://images.unsplash.com/photo-1625942124215-5935a9c5fa6d",
      category: "Beverages",
      description: "Refreshing lemon iced tea with mint.",
    },
  ]);
  

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const response = await getRestaurantByIdforAdmin(restaurantId);
        const restaurants = await response;
        setRestaurant(restaurants.data);
        if (Array.isArray(restaurants?.data?.menus)) {
          const menusWithId = restaurants.data.menus
            .filter((menu: any) => menu.id != null)
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        
          setMenus(menusWithId);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRestaurants();
  }, [relod]);

  // const restaurantId = params.id as string
  // const restaurant = restaurantsData.find((r) => r.id === restaurantId)

  if (!restaurant && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Restaurant not found</h2>
        <p className="text-muted-foreground mb-4">The restaurant you're looking for doesn't exist</p>
        <Button asChild>
          <Link href="/admin/restaurants">Back to Restaurants</Link>
        </Button>
      </div>
    )
  }

  if(loading){
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Loading restaurant...</h2>
      </div>
    )
  }
  const handleDeleteRestaurant=async(restaurantId:number) =>{
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.delete(`/restaurants/remove/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        toast({
          title: "Restaurant deleted",
          description: "The restaurant has been deleted successfully",
        });
        router.push("/admin/restaurants");
      } else {
        throw new Error(response.data.message || "Failed to delete restaurant");
    
        }
    } catch (error) { 
      toast({
        title: "Error",
        description: "There was an error deleting the restaurant.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    }
  }

  const handleDeleteMenuItem = async(itemId: string) => {
    try {
      // console.log(itemId)
      const token = localStorage.getItem("token");
  
      const response = await apiClient.delete(`/menus/delete/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.success) {
        toast({
          title: "Menu item deleted",
          description: "The menu item has been deleted successfully",
        });
        setreload((prev)=>!prev)
        // Optionally refresh the menu list or remove the item from local state
      } else {
        throw new Error(response.data.message || "Failed to delete item");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the menu item.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    }
  }

  const isValidUrl = (url:string) => {
    const pattern = new RegExp('^(https?:\\/\\/)');  // Simple regex to check for valid URL
    return pattern.test(url);
  };

  const filteredMenus = menus?.filter(
    (menu) =>
      menu?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      menu?.category?.toLowerCase().includes(searchQuery?.toLowerCase())
  );
const normalized = getMenuImagePath(restaurant?.cover_image)
// console.log('normalize',normalized)
 const src= normalized?`${API_BASE_URL}/${normalized}`: '/Images/restaurent-fall.jpg'
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/restaurants">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3">
          <Card>
            <div className="aspect-video w-full overflow-hidden">
            <img
              src={src}
              alt={restaurant?.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src ="/Images/restaurent-fall.jpg"}}
              className="h-full w-full object-contain"
            />
                        </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{restaurant?.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {restaurant?.address}
                  </CardDescription>
                </div>
                {/* <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {restaurant?.rating}
                </Badge> */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{restaurant?.description ? restaurant?.description : "NIL"} </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Cuisine</h4>
                  <p className="text-sm text-muted-foreground">{restaurant?.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Phone</h4>
                  <p className="text-sm text-muted-foreground">{restaurant?.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Website</h4>
                  <p className="text-sm text-muted-foreground">{restaurant?.website}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Hours</h4>
                  <p className="text-sm text-muted-foreground">
                  {restaurant?.open_hours
                    ? restaurant.open_hours
                        .replace(/�\?\?�\?\?/g, "-")
                        .replace(/�\?/g, " ")
                        .replace(/[^\w\s:.,/-]/g, "")
                    : "NIL"}
                </p>       
               </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
                  <Button
      variant="outline"
      className="w-full sm:w-[48%]"
      onClick={() => {
        if (restaurant) {
          sessionStorage.setItem('editRestaurant', JSON.stringify(restaurant))
          router.push(`/admin/restaurants/${restaurant.id}/edit`)
        }
      }}
    >
      <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>

                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-[48%]">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Restaurant</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete {restaurant?.name}? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteRestaurant(restaurant!.id)}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
            </CardFooter>

          </Card>
        </div>

        <div className="w-full lg:w-2/3">
          <Tabs defaultValue="menu" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              {/* <span></span> */}
              {/* <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="menu" className="flex-1 sm:flex-initial">
                  Menu List
                </TabsTrigger>
                <TabsTrigger value="itemsList" className="flex-1 sm:flex-initial">
                  Item List
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1 sm:flex-initial">
                  Analytics
                </TabsTrigger>
              </TabsList> */}
              <Button asChild>
              <Link href={
                activeTab === "menu"
                  ? `/admin/restaurants/${restaurant?.id}/add-menu-item`
                  : `/admin/restaurants/${restaurant?.id}/add-item`
              }>
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === "menu" ? "Add Menu" : "Add Item"}
              </Link>
            </Button>
            </div>

            <TabsContent value="menu" className="space-y-4">
            <div className="flex items-center gap-2 w-full">

              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search Menu or category"
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                  }}
                />
              </div>
            </div>
              
              {filteredMenus && filteredMenus?.length>0 && filteredMenus?.map((item) =>{
                const normalized = getMenuImagePath(item.image)
                // console.log('normalized1', normalized)
                // let src=isValidUrl(item.image) ?item.image :`${API_BASE_URL}/${item.image}`
                return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                   
                    <div className="sm:w-1/4">
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={normalized}
                          alt={item.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src ="/Images/fallback.jpg"}}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                    <div className="flex justify-end mb-2">
                    {item.updated_at && <span className="text-sm text-end"> Updated {formatDistanceToNow(new Date(item?.updated_at), { addSuffix: true })}</span>}
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item?.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€{item?.price}</div>
                         <Badge variant="outline">{item.category}</Badge>
                         {/* {item.updated_at && <Badge className="ml-2"> Updated {formatDistanceToNow(new Date(item?.updated_at), { addSuffix: true })}
                            </Badge>} */}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          sessionStorage.setItem("editMenuItem", JSON.stringify(item));
                          router.push(`/admin/restaurants/${restaurant?.id}/menu/${item?.id}/edit`);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Menu Item</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {item.name}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                              <Button variant="destructive" onClick={() => handleDeleteMenuItem(item.id)}>
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              )})}
              {restaurant && restaurant.menus?.length<=0 &&
              <>
              <div className="flex justify-center items-center py-12">
                <p>No menu items found.</p>
              </div>
              </>
              }
            </TabsContent>
            <TabsContent value="itemsList" className="space-y-4">
              {items.length > 0 ? items.map((item) => (
                <Card key={item.id}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/4">
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={item.image}// replace with your API image URL later
                        alt="Paneer Tikka"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/Images/fallback.jpg";
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Delicious spicy Indian starter with marinated paneer and veggies grilled to perfection.
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€9.99</div>
                        <Badge variant="outline">Starters</Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              )) : (
                <p className="text-center text-muted-foreground py-8">No items found.</p>
              )}
            </TabsContent>


            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Performance metrics for this restaurant</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Analytics functionality will be implemented in the next phase.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

