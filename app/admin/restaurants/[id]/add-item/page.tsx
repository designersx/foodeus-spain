
"use client";

import React, { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { compressAndResizeImage } from "@/utils/imageCompressor"; // Import the compression function
import { apiClient } from "@/services/apiService";
import { Upload } from "lucide-react";
import Link from "next/link";

export default function AddItemPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    item_type: "Starters",
    menuItemImg: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      try {
        // Compress and resize the image before setting it
        const compressedImage = await compressAndResizeImage(file);
        console.log("Compressed Image: ", compressedImage);

        // Convert the Blob to a File object
        const compressedFile = new File([compressedImage], file.name, {
          type: file.type,
        });

        // Set the compressed file in the form data
        setFormData((prev) => ({ ...prev, menuItemImg: compressedFile }));

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to compress image.",
          variant: "destructive",
        });
      }
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if(!formData.menuItemImg){
      toast({
        title: "Error",
        description: "Please select an image for the menu item.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("restaurant_id", restaurantId)
    formDataToSubmit.append("item_name", formData.item_name);
    formDataToSubmit.append("price", formData.price);
    formDataToSubmit.append("item_type", formData.item_type);
    formDataToSubmit.append("description", formData.description);
    console.log("Form Data: ", formData.menuItemImg);
    if (formData.menuItemImg) {
      formDataToSubmit.append("menuItemImg", formData.menuItemImg);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.post(`/menuitems/addRestaurantMenuItem/${restaurantId}`, formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({ title: "Menu Item Added", description: "The menu item has been added successfully." });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error("Failed to add menu item.");
      }
    } catch (error) {
      toast({ title: "Error", description: "There was an error adding the menu item", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/restaurants/${restaurantId}`}>
          Back to Restaurant
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Add Menu Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Item Details</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Item Image (click to upload)</Label><span className="text-danger"> *</span>
                <div
                  className="border-2 border-dashed p-4 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ height: '250px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full flex justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-contain"
                      />
                    </div>  
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 mb-2" />
                    <p>Click to upload item image</p>
                    </div>
                  )}

                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div>
                <Label>Item Name</Label><span className="text-danger"> *</span>
                <Input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  required
                  maxLength={60}
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <Label>Description</Label><span className="text-danger"> *</span>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  placeholder="Enter item description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label><span className="text-danger"> *</span>
                  <Input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="Enter item price"
                    inputMode="decimal"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value
                        .replace(/[^0-9.]/g, "") // Allow only numbers and one decimal point
                        .replace(/(\..*?)\..*/g, "$1") // Ensure only one decimal point
                        .slice(0, 7); // Limit the input length to 7
                      setFormData({ ...formData, price: target.value });
                    }}
                  />
                </div>

                <div>
                  <Label>Category</Label><span className="text-danger"> *</span>
                  <Select
                    name="item_type"
                    value={formData.item_type}
                    onValueChange={(value) => setFormData({ ...formData, item_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Starters">Starters</SelectItem>
                      <SelectItem value="Main Course">Main Course</SelectItem>
                      <SelectItem value="Desserts">Desserts</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
