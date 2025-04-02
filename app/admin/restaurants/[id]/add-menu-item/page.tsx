"use client";

import { useState, useRef } from "react";
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

export default function AddMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const restaurantId = params.id as string;

  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "",
    item_list: "",
    image: null as File | null,
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
     if(!formData.menu_type){
      toast({
        title: "Error",
        description: "Please select menu category",
        variant: "destructive",
      });
      return ;
     }
      data.append("restaurant_id", restaurantId);
      data.append("item_name", formData.item_name);
      data.append("price", formData.price);
      data.append("menu_type", formData.menu_type === "Other" ? customMenuType : formData.menu_type || "");
      data.append("item_list", formData.item_list);
      data.append("description", formData.description);

      if (formData.image) {
        data.append("image_urls", formData.image);
      }else{
        toast({
          title: "Error",
          description: "Please upload Dish Image",
          variant: "destructive",
        });
        return ;
      }

      const response = await apiClient.post("/menus/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({
          title: "Menu item added",
          description: "The menu item has been added successfully",
        });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error("Failed to add menu item");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding the menu item",
        variant: "destructive",
      });
      console.error("Add Menu Item Error:", error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Add Menu Item</h1>
        <p className="text-muted-foreground">Add a new menu item to this restaurant</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Menu Item Details</CardTitle>
            <CardDescription>Enter the details of the new menu item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Item Image <span className="text-danger">*</span></Label>
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

            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name <span className="text-danger">*</span></Label>
              <Input
                id="item_name"
                name="item_name"
                placeholder="Enter item name"
                value={formData.item_name}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </div>

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
              onInput={(e) => {
                const input = e.currentTarget;
                input.value = input.value
                .replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'); 
              }}
              required
              maxLength={7}
              title="Enter a valid price (e.g. 9.99)"
            />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_type">Menu Type <span className="text-danger">*</span></Label>
                <Select
                  value={formData.menu_type}
                  onValueChange={handleSelectChange}
                >
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

            <div className="space-y-2">
              <Label htmlFor="item_list">Item List <span className="text-danger">*</span></Label>
              <Input
                id="item_list"
                name="item_list"
                placeholder="Comma-separated items"
                value={formData.item_list}
                maxLength={100}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/restaurants/${restaurantId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Menu Item"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
