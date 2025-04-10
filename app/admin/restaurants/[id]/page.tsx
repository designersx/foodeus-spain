"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { apiClient } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { getMenuImagePath } from "@/utils/getImagePath";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, getRestaurantByIdforAdmin} from "@/services/apiService";

// types/item.ts
export interface RestaurantItem {
  id: string;
  restaurant_id:string;
  item_name: string;
  price: number;
  image_url: string;
  item_type: "Starters" | "Main dishes" | "Desserts" | "Beverages";
  description?: string;
  created_at?: string;
  updated_at?: string;
  
}
interface ItemList {
  image: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean; // Optional if applicable
  updated_at: any;
  item_list?: ItemList[]; // Ensure this is an array of ItemList
 
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  category: string;
  rating: number;
  cover_image: any;
  description: string;
  phone: string;
  website: string;
  open_hours: string;
  menus: MenuItem[];
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const restaurantId = parseInt(params.id as string, 10);
  const [relod, setreload] = useState(false);
  const [fallback, setFallback] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("menu");
  // const [items, setItems] = useState<RestaurantItem[]>([]);
  const [items, setItems] = useState<RestaurantItem[]>([]);

  const fetchItemList = async () => {
    setLoading(true);
    try {
          const token = localStorage.getItem("token");
          const response = await apiClient.get(`/menuitems/getRestaurantMenuItemList/${restaurantId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
      setItems(response.data.data);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setItems([])
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const response = await getRestaurantByIdforAdmin(restaurantId);
        // console.log("responsesdds", response.data?.menus);
        const restaurants = await response;
        setRestaurant(restaurants.data);
        if (Array.isArray(restaurants?.data?.menus)) {
          const menusWithId = restaurants.data.menus
            .filter((menu: any) => menu.id != null)
            .sort(
              (a: any, b: any) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );
          // console.log("menusWithId", menusWithId,restaurants?.data?.menus);
          setMenus(menusWithId);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };
   

    fetchRestaurants();
    fetchItemList()
  }, [relod]);

  useEffect(() => {
    // Check if the active tab is stored in sessionStorage
    const storedTab = sessionStorage.getItem("activeTab");
    
    if (storedTab) {
      setActiveTab(storedTab); // Set the active tab based on the stored value
    }
  }, []);

  // const restaurantId = params.id as string
  // const restaurant = restaurantsData.find((r) => r.id === restaurantId)

  if (!restaurant && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Restaurant not found</h2>
        <p className="text-muted-foreground mb-4">
          The restaurant you're looking for doesn't exist
        </p>
        <Button asChild>
          <Link href="/admin/restaurants">Back to Restaurants</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Loading restaurant...</h2>
      </div>
    );
  }
  const handleDeleteRestaurant = async (restaurantId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.delete(
        `/restaurants/remove/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
  };

  const handleDeleteMenu = async (itemId: string) => {
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
        setreload((prev) => !prev);
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
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      // console.log(itemId)
      const token = localStorage.getItem("token");

      const response = await apiClient.delete(`/menuitems/deleteRestaurantMenuItem/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        await fetchItemList();
        toast({
          title: "Menu item deleted",
          description: "The menu item has been deleted successfully",
        });
      
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
  };

  const isValidUrl = (url: string) => {
    const pattern = new RegExp("^(https?:\\/\\/)"); // Simple regex to check for valid URL
    return pattern.test(url);
  };

  const handleEditItem = (item: any) => {
    // Store the item data in sessionStorage
    console.log("item clicked");
    sessionStorage.setItem("editMenuItem", JSON.stringify(item));
    // Redirect to edit page
    router.push(`/admin/edit-menu-item/edit-menu-item/${item.id}`);
  };

  const filteredMenus = menus?.filter(
    (menu) =>
      menu?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      menu?.category?.toLowerCase().includes(searchQuery?.toLowerCase())
  );
  const normalized = getMenuImagePath(restaurant?.cover_image);
  // console.log('normalize',normalized)
  const src = normalized
    ? `${API_BASE_URL}/${normalized}`
    : "/Images/restaurent-fall.jpg";
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
                  target.src = "/Images/restaurent-fall.jpg";
                }}
                className="h-full w-full object-contain"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="truncate w-full">
                  <CardTitle  className=""  style={{overflowWrap: "break-word"}}>{restaurant?.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {restaurant?.address}
                  </CardDescription>
                </div>
           
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground " style={{overflowWrap: "break-word"}}>
                    {restaurant?.description ? restaurant?.description : "NA"}{" "}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Cuisine</h4>
                  <p className="text-sm text-muted-foreground">
                    {restaurant?.category ? restaurant?.category :"NA"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Phone</h4>
                  <p className="text-sm text-muted-foreground">
                    {restaurant?.phone ? restaurant?.phone : "NA"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Website</h4>
                  <p className="text-sm text-muted-foreground"  style={{overflowWrap: "break-word"}}>
                    {restaurant?.website ? restaurant?.website :"NA"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium" style={{overflowWrap: "break-word"}}>Hours</h4>
                  <p className="text-sm text-muted-foreground" style={{overflowWrap: "break-word"}}> 
                    {restaurant?.open_hours
                      ? restaurant.open_hours
                          .replace(/�\?\?�\?\?/g, "-")
                          .replace(/�\?/g, " ")
                          .replace(/[^\w\s:.,/-]/g, "")
                      : "NA"}
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
                    sessionStorage.setItem(
                      "editRestaurant",
                      JSON.stringify(restaurant)
                    );
                    router.push(`/admin/restaurants/${restaurant.id}/edit`);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>

              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-[48%]">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Restaurant</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {restaurant?.name}? This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteRestaurant(restaurant!.id)}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        <div className="w-full lg:w-2/3">
          <Tabs
            defaultValue="menu"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              {/* <span></span> */}
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="menu" className="flex-1 sm:flex-initial">
                  Today's Special
                </TabsTrigger>
                <TabsTrigger
                  value="itemsList"
                  className="flex-1 sm:flex-initial"
                >
                  Item List
                </TabsTrigger>
                {/* <TabsTrigger value="analytics" className="flex-1 sm:flex-initial">
                  Analytics
                </TabsTrigger> */}
              </TabsList>
              <Button asChild>
                <Link
                  href={
                    activeTab === "menu"
                      ? `/admin/restaurants/${restaurant?.id}/add-menu-item`
                      : `/admin/restaurants/${restaurant?.id}/add-item`
                  }
                  onClick={() => {
                    sessionStorage.setItem("activeTab", activeTab); // Store the active tab in sessionStorage
                  }}
                >
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
                      setSearchQuery(e.target.value);
                    }}
                  />
                </div>
              </div>

              {filteredMenus &&
                filteredMenus?.length > 0 &&
                filteredMenus?.map((item) => {
                  const normalized = getMenuImagePath(item.image);
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
                                target.src = "/Images/fallback.jpg";
                              }}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-end mb-2">
                            {item.updated_at && (
                              <span className="text-sm text-end">
                                {" "}
                                Updated{" "}
                                {formatDistanceToNow(
                                  new Date(item?.updated_at),
                                  { addSuffix: true }
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item?.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">€{item?.price}</div>
                              <Badge variant="outline">{item.category}</Badge>
                              {/* {item.updated_at && <Badge className="ml-2"> Updated {formatDistanceToNow(new Date(item?.updated_at), { addSuffix: true })}
                            </Badge>} */}
                            </div>
                          </div>
                           {/* Display item list */}
                        {item.item_list && item.item_list?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-lg">Item List</h4>
                            <ul className="space-y-2 mt-2" style={{paddingLeft: "0rem"}}>
                              {item.item_list.map((menuItem, index) => (
                                <li key={index} className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {menuItem.image && (
                                      <img
                                        src={getMenuImagePath(menuItem.image)}
                                        alt={menuItem.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    )}
                                    <span className="text-sm text-gray-800">{menuItem.name}</span>
                                  </div>
                                  <div className="font-medium">€{menuItem.price}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                          
                              onClick={() => {
                                sessionStorage.setItem(
                                  "editMenuItem",
                                  JSON.stringify(item)
                                );
                                router.push(
                                  `/admin/restaurants/${restaurant?.id}/menu/${item?.id}/edit`
                                );
                                sessionStorage.setItem("activeTab", activeTab);
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
                                  <DialogTitle>Delete Menu</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete {item.name}?
                                    This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteMenu(item.id)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                
              {restaurant && restaurant.menus?.length <= 0 && (
                <>
                  <div className="flex justify-center items-center py-12">
                    <p>No menu items found.</p>
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="itemsList" className="space-y-4">
              {items.length > 0 ? (
                items.map((item) => (
                  <Card key={item.id}>
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/4">
                        <div className="aspect-square w-full overflow-hidden">
                          <img
                            src={getMenuImagePath(item?.image_url)} // replace with your API image URL later
                            alt={item.item_name}
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
                            <h3 className="font-semibold">{item.item_name}</h3>
                            <p className="text-sm text-muted-foreground">
                            {item.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{item.price}</div>
                            <Badge variant="outline">{item.item_type}</Badge>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              sessionStorage.setItem(
                                "editMenuItem",
                                JSON.stringify(item)
                              );
                              router.push(
                                `/admin/restaurants/${restaurant?.id}/item/${item?.id}/edit`
                              );
                              sessionStorage.setItem("activeTab", activeTab);

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
                                  Are you sure you want to delete {item.item_name}?
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No items found.
                </p>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics for this restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Analytics functionality will be implemented in the next
                    phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
