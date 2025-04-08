"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");
  const restaurantId = params.id as string;
  const menuItemId = params.menuId as string;

  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "",
    item_list: [] as string[], // Array for item list
    image: null as File | null,
  });

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Selected items as a Set
  const [items, setItems] = useState<any[]>([]); // Fetched items for selection
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for item selection
const [isDataLoaded, setIsDataLoaded] = useState(false); // State to track data loading

useEffect(() => {
  const data = sessionStorage.getItem("editMenuItem");
  if (data) {
    const parsed = JSON.parse(data);
    setSelectedCategory(parsed.category);

    // Pre-fill form data
    setFormData({
      item_name: parsed.name || "",
      description: parsed.description || "",
      price: parsed.price || "",
      menu_type: parsed.category || "",
      item_list: parsed.item_list || [], // Store item list data from parsed
      image: null,
    });

    const normalized = getMenuImagePath(parsed.cover_image || parsed.image);
    setImagePreview(normalized);

    // Pre-select the items by storing their IDs in the selectedItems Set
    const initialSelectedItems = new Set(parsed.item_list.map((item: any) => item.id.toString()));  // Ensure IDs are strings
    setSelectedItems(initialSelectedItems);
    setIsDataLoaded(true); // Mark data as loaded
  }
}, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      data.append("item_name", formData.item_name);
      data.append("price", formData.price);
      data.append("menu_type", formData.menu_type);
      data.append("item_list", JSON.stringify(Array.from(selectedItems))); // Storing selected items list
      data.append("description", formData.description);

      if (formData.image) data.append("image_urls", formData.image);

      const response = await apiClient.put(`/menus/update/${menuItemId}`, data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast({ title: "Menu item updated", description: "The menu item has been updated successfully" });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else throw new Error(response.data.message || "Failed to update menu item");
    } catch (error) {
      toast({ title: "Error", description: "There was an error updating the menu item", variant: "destructive" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch menu items for selection
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get(`/menuitems/getRestaurantMenuItemList/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setItems(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching items", error);
      }
    };
    fetchItems();
  }, [restaurantId]);

  const toggleItemSelection = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
  
    // Toggle selection
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId); // Deselect item
    } else {
      newSelectedItems.add(itemId); // Select item
    }
  
    setSelectedItems(newSelectedItems);  // Update selected items
    setFormData((prev) => ({
      ...prev,
      item_list: Array.from(newSelectedItems), // Save the selected item IDs in formData
    }));
  };
  
  if (!isDataLoaded) {
    return <div>Loading...</div>;  // Show a loading state until data is loaded
  }
  console.log("selectedItems", selectedItems);

  return (
    <div className="full-width-container space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/restaurants/${restaurantId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurant
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Edit Menu Item</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Item Details</CardTitle>
            <CardDescription>Modify details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Menu Image */}
            <div>
              <div className="space-y-2">
                <Label>Item Image (click to change)</Label>
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-md">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="max-h-full max-w-full object-fill"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                        <p className="text-white font-medium">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload item image</p>
                    </div>
                  )}

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name <span className="text-danger">*</span></Label>
              <Input name="item_name" value={formData.item_name} placeholder="Item Name" onChange={handleChange} maxLength={50} required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-danger">*</span></Label>
              <Textarea name="description" value={formData.description} placeholder="Description" onChange={handleChange} maxLength={200} required />
            </div>

            {/* Price and Menu Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price € <span className="text-danger">*</span></Label>
                <Input name="price" value={formData.price} placeholder="Price" onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_type">Menu Type <span className="text-danger">*</span></Label>
                <Select value={formData.menu_type} onValueChange={(value) => setFormData(prev => ({ ...prev, menu_type: value }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.menu_type || "Select Menu Type"} />
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
                  
            {/* Item List Selection */}
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
              {isLoading ? "Updating..." : "Update Menu Item"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Item Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg">
    <DialogHeader>
      <DialogTitle>Select Items</DialogTitle>
      <DialogDescription>
        Choose items from the list to add to this menu.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Available Items</Label>
        <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
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
                  <span className="text-sm text-gray-800">{item.item_name}</span>
                  <span className="text-sm text-gray-500">€{item.price || "N/A"}</span>
                </div>
                {/* Display the checkmark if item is selected */}
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
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button
        onClick={() => {
          setFormData((prev) => ({
            ...prev,
            item_list: Array.from(selectedItems), // Save selected items
          }));
          setIsModalOpen(false);  // Close the modal
        }}
      >
        Save Selection
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
