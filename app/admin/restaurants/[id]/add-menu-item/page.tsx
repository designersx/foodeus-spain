
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";
export default function AddMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Use Set for unique items
  const [items, setItems] = useState<any[]>([]); // API-fetched items
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for item selection
  const [isEmptyItemPromptOpen, setIsEmptyItemPromptOpen] = useState(false); // Empty item list modal state
  const [loadingItems, setLoadingItems] = useState(true); // Add loading state for item fetch

  const restaurantId = params.id as string;

  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "",
    image: null as File | null,
    item_list: [] as string[], // Change to array
  });

  const [customMenuType, setCustomMenuType] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, menu_type: value }));
    if (value !== "Other") {
      setCustomMenuType("");
    }
  };

  console.log("Selected Items:", formData, selectedItems); // Debugging line
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      if (!formData.menu_type) {
        toast({
          title: "Warning !",
          description: "Please select menu category",
          variant: "destructive",
        });
        return;
      }
      if (!formData.image) {
        toast({
          title: "Warning !",
          description: "Please upload Dish Image",
          variant: "destructive",
        });
        return;
      }
      if (formData.item_list.length === 0) {
        toast({
          title: "Warning !",
          description: "Please Add at least one item to the menu",
          variant: "destructive",
        });
        return;
      }

      data.append("restaurant_id", restaurantId);
      data.append("item_name", formData.item_name);
      data.append("price", formData.price);
      data.append("menu_type", formData.menu_type === "Other" ? customMenuType : formData.menu_type || "");
      formData.item_list.forEach((item) => data.append("item_list[]", item)); // Append as array
      data.append("description", formData.description);
      if (formData.image) {
        data.append("image_urls", formData.image);
      }

      const response = await apiClient.post("/menus/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({
          title: "Menu added",
          description: "The menu has been added successfully",
        });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error("Failed to add menu ");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding the menu",
        variant: "destructive",
      });
      console.error("Add Menu Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get(`/menuitems/getRestaurantMenuItemList/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response:", response.data); // Debug here
        if (response.data.success) {
          setItems(response.data.data);
        }
        if (response.data.data.length === 0) {
          setIsEmptyItemPromptOpen(true);
        }
      } catch (error) {
        console.error("Fetch Items Error:", error);
        setIsEmptyItemPromptOpen(true);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, [restaurantId]);
  const toggleItemSelection = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    setFormData((prev) => ({ ...prev, item_list: Array.from(newSelectedItems) }));
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Add Menu</h1>
        <p className="text-muted-foreground">Add a new menu to this restaurant</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Menu Item Details</CardTitle>
            <CardDescription>Enter the details of the new menu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Menu Image */}
            <div className="space-y-2">
              <Label>Menu Image <span className="text-danger">*</span></Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
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

            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="item_name">Menu Name <span className="text-danger">*</span></Label>
              <Input
                id="item_name"
                name="item_name"
                placeholder="Enter item name"
                value={formData.item_name}
                onChange={handleChange}
                maxLength={60}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-danger">*</span></Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter item description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                required
              />
            </div>

            {/* Price and Menu Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price € <span className="text-danger">*</span></Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 12.99"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  maxLength={7}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value
                    .replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'); 
                  }}
                  title="Enter a valid price (e.g. 9.99)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_type">Menu Type <span className="text-danger">*</span></Label>
                <Select value={formData.menu_type} onValueChange={handleSelectChange}>
                  <SelectTrigger id="menu_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today's Special">Today's Special</SelectItem>
                    <SelectItem value="Buffet">Buffet</SelectItem>
                    <SelectItem value="A La Carte">A La Carte</SelectItem>
                    <SelectItem value="Combo Meals">Combo Meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Menu Type */}
            {formData.menu_type === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="custom_menu_type">Custom Menu Type</Label>
                <Input
                  id="custom_menu_type"
                  placeholder="e.g. Seasonal Special"
                  value={customMenuType}
                  onChange={(e) => setCustomMenuType(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Select Items */}
            <div className="space-y-2">
              <Label htmlFor="item_list">Item List <span className="text-danger">*</span></Label>
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full justify-start"
              >
                {selectedItems.size > 0
                  ? `${selectedItems.size} item(s) selected`
                  : "Select Items from List"}
              </Button>
              {selectedItems.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected: {Array.from(selectedItems).join(", ")}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/restaurants/${restaurantId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Menu"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Select Items</DialogTitle>
              <DialogDescription className="text-gray-600">
                Choose items from the list or add new ones.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Available Items</Label>
                <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-all"
                        onClick={() => toggleItemSelection(item.id.toString())}
                      >
                        <div className="flex items-center gap-2">
                          {item.image_url && (
                            <img
                              src={getMenuImagePath(item.image_url)}
                              alt={item.item_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm text-gray-800">{item.item_name || "Unnamed Item"}</span>
                          <span className="text-sm text-gray-500">€{item.price || "N/A"}</span>
                        </div>
                        {selectedItems.has(item.id.toString()) && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-gray-500">No items available</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between space-x-4 w-full">
              {/* <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button> */}
              {items.length > 0 ? (

                // <Button variant="outline"
                //   onClick={() => {
                //     setFormData((prev) => ({ ...prev, item_list: Array.from(selectedItems) }));
                //     setIsModalOpen(false);
                //   }}
                //   className="flex-1"
                // >
                //   Save Selection
                // </Button>
                <></>
              ) : (
                <Button variant="outline"
                  onClick={() => {
                    setIsEmptyItemPromptOpen(false);
                    router.push(`/admin/restaurants/${restaurantId}/add-item`);
                  }}
                  className="flex-1"
                >
                  Add Item
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Empty Item Prompt Modal */}
      {isEmptyItemPromptOpen && (
        <Dialog open={isEmptyItemPromptOpen} onOpenChange={setIsEmptyItemPromptOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Empty Item List</DialogTitle>
              <DialogDescription className="text-gray-600">
                You need to add at least one item. Would you like to add a new item?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between space-x-4 w-full">
              <Button variant="outline" onClick={() => setIsEmptyItemPromptOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="outline"
                onClick={() => {
                  setIsEmptyItemPromptOpen(false);
                  router.push(`/admin/restaurants/${restaurantId}/add-item`);
                }}
                className="flex-1"
              >
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
