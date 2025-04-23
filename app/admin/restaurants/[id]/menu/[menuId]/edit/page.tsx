"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ArrowLeft, Upload, ChevronDownIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";
import { debounce } from "lodash";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [suggestionss, setSuggestionss] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");
  const restaurantId = params.id as string;
  const menuItemId = params.menuId as string;
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({
    item_name: "",
    description: "",
    item_type: "",
    image: null as File | null,
    imagePreview: null as string | null,
  });
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "Today's Special",
    item_list: [] as string[], 
    image: null as File | null,
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<any[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
   useState<number>(-1);
  const itemNameInputRef = useRef<HTMLInputElement>(null);
  // Debounced API call to reduce requests
  const fetchSuggestions = debounce(async (query: string) => {
    try {
      const res = await apiClient.get(
        `/menus/get-item/${restaurantId}?search=${query}`
      );
      if (res.data.success) {
        setSuggestionss(res.data.data);
      } else {
        setSuggestionss([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestionss([]);
    }
  }, 300);
  useEffect(() => {
    const data = sessionStorage.getItem("editMenuItem");
    if (data) {
      const parsed = JSON.parse(data);
      setSelectedCategory(parsed.category);
      setFormData({
        item_name: parsed.name || "",
        description: parsed.description || "",
        price: parsed.price || "",
        menu_type: parsed.category || "",
        item_list: parsed.item_list || [], 
        image: null,
      });
      const normalized = getMenuImagePath(parsed.cover_image || parsed.image);
      setImagePreview(normalized);
      const initialSelectedItems = new Set(
        parsed.item_list.map((item: any) => item.id.toString())
      ); 
      setSelectedItems(initialSelectedItems);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveEditedItem = (updatedItem: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setIsModalOpen(false);
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item); 
    setIsModalOpen(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      if (formData.item_list.length === 0) {
        toast({
          title: "Warning !",
          description: "Please Add at least one item to the menu",
          variant: "destructive",
        });
        return;
      }
      data.append("item_name", formData.item_name.trim());
      data.append("price", formData.price);
      data.append("menu_type", formData.menu_type);
      data.append("item_list", JSON.stringify(Array.from(selectedItems)));
      data.append("description", formData.description.trim());
      if (formData.image) data.append("image_urls", formData.image);
      const response = await apiClient.put(
        `/menus/update/${menuItemId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast({
          title: "Menu item updated",
          description: "The menu item has been updated successfully",
        });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else
        throw new Error(response.data.message || "Failed to update menu item");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the menu item",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const updateEditedItem = async () => {
    if (!editingItem) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("item_name", editingItem.item_name.trim());
      formData.append("description", editingItem.description?.trim() || "");
      formData.append("item_type", editingItem.item_type);
      if (editingItem.image) {
        formData.append("menuItemImg", editingItem.image);
      }
      const response = await apiClient.put(
        `/menuitems/updateRestaurantMenuItem/${editingItem.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast({
          title: "Item Updated",
          description: "The menu item has been updated successfully.",
        });
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? response.data.data : item
          )
        );
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to update item");
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating the item.",
        variant: "destructive",
      });
      console.error(err);
    }
  };
  // Fetch menu items for selection
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get(
          `/menuitems/getRestaurantMenuItemList/${menuItemId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setItems(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching items", error);
      } finally {
        setIsDataLoaded(true); 
      }
    };
    fetchItems();
  }, [menuItemId]);

  const handleAddMenuItem = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("item_name", newItemData.item_name.trim());
      formData.append("description", newItemData.description.trim());
      formData.append("item_type", newItemData.item_type);
      if (newItemData.image) {
        formData.append("menuItemImg", newItemData.image);
      }
      const response = await apiClient.post(
        `/menuitems/addRestaurantMenuItem/${restaurantId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast({
          title: "Item Added",
          description: "New menu item added successfully.",
        });

        const newItem = response.data.data;
        setItems((prev) => [...prev, newItem]); 
        const newId = newItem?.id?.toString();
        if (newId) {
          const updatedSet = new Set(selectedItems);
          updatedSet.add(newId);
          setSelectedItems(updatedSet);
          setFormData((prev) => ({
            ...prev,
            item_list: Array.from(updatedSet),
          }));
        }
        setNewItemData({
          item_name: "",
          description: "",
          item_type: "",
          image: null,
          imagePreview: null,
        });
        setIsAddModalOpen(false);
      } else {
        throw new Error(response.data.message || "Add failed");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not add new item.",
        variant: "destructive",
      });
      console.error(err);
    }
  };
  const toggleItemSelection = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId); 
    } else {
      newSelectedItems.add(itemId);
    }

    setSelectedItems(newSelectedItems); 
    setFormData((prev) => ({
      ...prev,
      item_list: Array.from(newSelectedItems), 
    }));
  };

  if (!isDataLoaded) {
    return <div>Loading...</div>; 
  }
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
                      <p className="text-sm font-medium">
                        Click to upload item image
                      </p>
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
              <Label htmlFor="item_name">
                Item Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="item_name"
                value={formData.item_name}
                placeholder="Item Name"
                onChange={handleChange}
                maxLength={50}
                required
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "") 
                    .replace(/^\s+/g, "");
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-danger">*</span>
              </Label>
              <Textarea
                name="description"
                value={formData.description}
                placeholder="Description"
                onChange={handleChange}
                maxLength={200}
                required
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")
                    .replace(/^\s+/g, "");
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price € <span className="text-danger">*</span>
                </Label>
                <Input
                  name="price"
                  value={formData.price}
                  placeholder="Price"
                  onChange={handleChange}
                  required
                  maxLength={7}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value
                      .replace(/[^0-9.]/g, "")
                      .replace(/(\..*?)\..*/g, "$1");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_list">
                  Category List<span className="text-danger">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    setNewItemData((prev) => ({ ...prev, item_type: value }));
                    setIsAddModalOpen(true);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category from List" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starters">Starters</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>{" "}
            </div>
            {items.length > 0 && (
              <div className="mt-6 space-y-4">
                <Label className="text-sm font-semibold text-gray-800">
                  Existing Menu Items
                </Label>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) =>
                    item ? (
                      <div
                        key={item.id}
                        className="relative border rounded-lg p-4 shadow-sm bg-white"
                      >
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-black hover:text-black focus:outline-none"
                          onClick={() => handleEditClick(item)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={
                              item.image_url
                                ? `https://foodeus.truet.net/${item.image_url}`
                                : "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg"
                            }
                            alt={item.item_name || "Menu item image"}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
                            }}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900">
                              {item.item_name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {item.item_type}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {item.description || (
                            <em className="text-gray-400">No description</em>
                          )}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
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
      {isModalOpen && editingItem && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                Edit Menu Item
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-center mt-1">
                Update item details below
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="modal-image">Item Image</Label>
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    document.getElementById("modal-image")?.click()
                  }
                >
                  {editingItem.imagePreview || editingItem.image_url ? (
                    <div className="relative flex items-center justify-center">
                      <img
                        src={
                          editingItem.imagePreview ||
                          `https://foodeus.truet.net/${editingItem.image_url}`
                        }
                        alt="Preview"
                        className="max-h-32 object-cover rounded-md mx-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium text-sm">
                          Change Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                      <p className="text-sm">Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="modal-image"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingItem({
                            ...editingItem,
                            image: file,
                            imagePreview: reader.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Item Name</Label>
                <Input
                  value={editingItem.item_name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => updateEditedItem()}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Enter details for the new item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Image</Label>
              <div
                className="border-dashed border-2 p-4 rounded cursor-pointer text-center"
                onClick={() =>
                  document.getElementById("add-image-input")?.click()
                }
              >
                {newItemData.imagePreview ? (
                  <img
                    src={newItemData.imagePreview}
                    alt="Preview"
                    className="h-24 mx-auto object-cover"
                  />
                ) : (
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                )}
                <input
                  id="add-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewItemData({
                          ...newItemData,
                          image: file,
                          imagePreview: reader.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="relative">
                <Label>Item Name</Label>
                <Input
                  ref={itemNameInputRef}
                  value={newItemData.item_name}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setNewItemData({ ...newItemData, item_name: value });
                    setActiveSuggestionIndex(-1);
                    if (!value.trim()) {
                      setSuggestions([]);
                      return;
                    }
                    if (value.trim().length > 1) {
                      try {
                        const res = await apiClient.get(
                          `/menus/get-item/${restaurantId}?search=${value}`
                        );
                        if (res.data.success) {
                          setSuggestions(res.data.data);
                        } else {
                          setSuggestions([]);
                        }
                      } catch (err) {
                        console.error("Error fetching suggestions", err);
                        setSuggestions([]);
                      }
                    } else {
                      setSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) =>
                        prev > 0 ? prev - 1 : suggestions.length - 1
                      );
                    } else if (
                      e.key === "Enter" &&
                      activeSuggestionIndex >= 0
                    ) {
                      e.preventDefault();
                      const selected = suggestions[activeSuggestionIndex];
                      if (selected) {
                        setNewItemData((prev) => ({
                          ...prev,
                          item_name: selected,
                        }));
                        setSuggestions([]);
                        setActiveSuggestionIndex(-1);
                      }
                    }
                  }}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow z-50 max-h-40 overflow-y-auto">
                    {suggestions.map((itemName, index) => (
                      <li
                        key={index}
                        className={`px-4 py-2 cursor-pointer text-sm ${
                          index === activeSuggestionIndex
                            ? "bg-gray-200 text-black font-medium"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setNewItemData({
                            ...newItemData,
                            item_name: itemName,
                          });
                          setSuggestions([]);
                          setActiveSuggestionIndex(-1);
                        }}
                      >
                        {itemName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Label>Description</Label>
              <Textarea
                value={newItemData.description}
                onChange={(e) =>
                  setNewItemData({
                    ...newItemData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMenuItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
