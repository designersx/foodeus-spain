"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

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

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const restaurantId = params.id as string;
  const menuItemId = params.menuId as string;

  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "",
    item_list: "",
    image: null as File | null,
  });

  useEffect(() => {
    const data = sessionStorage.getItem("editMenuItem");
    if (data) {
      const parsed = JSON.parse(data);
      console.log('ds',parsed);
      setFormData({
        item_name: parsed.name || "",
        description: parsed.description || "",
        price: parsed.price || "",
        menu_type: parsed.category || "",
        item_list: parsed.item_list || "",
        image: null,
      });
      const normalized = getMenuImagePath(parsed.cover_image || parsed.image) 
      console.log('normalized',normalized)
      setImagePreview(normalized);
      // sessionStorage.removeItem("editMenuItem");
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
      data.append("item_list", formData.item_list);
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
            <Label>Item Image</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              style={{ height: '150px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative h-full w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-full w-full rounded-md object-scale-down"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                    <p className="text-white font-medium">Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center h-full">
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
            <Input name="item_name" value={formData.item_name} placeholder="Item Name" onChange={handleChange} maxLength={50} required />
            <Textarea name="description" value={formData.description} placeholder="Description" onChange={handleChange} maxLength={200} required />
            <Input name="price" value={formData.price} placeholder="Price" onChange={handleChange} maxLength={5} pattern="^\d{1,3}(\.\d{0,2})?$" required />

            <Select value={formData.menu_type} onValueChange={(value) => setFormData(prev => ({ ...prev, menu_type: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder={formData.menu_type || "Select Menu Type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today's Special">Today's Special</SelectItem>
                <SelectItem value="Buffet">Buffet</SelectItem>
                <SelectItem value="A La Carte">A La Carte</SelectItem>
                <SelectItem value="Combo Meals">Combo Meals</SelectItem>
                {/* <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
                <SelectItem value="Dessert">Dessert</SelectItem>
                <SelectItem value="Drinks">Drinks</SelectItem> */}
              </SelectContent>
            </Select>

            <Input name="item_list" value={formData.item_list} placeholder="Item List (comma-separated)" onChange={handleChange} maxLength={100} />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update"}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
