"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Upload } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { getMenuImagePath } from "@/utils/getImagePath";
import { apiClient } from "@/services/apiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restaurantId = params.id as string;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "",
    cuisine: "",
    description: "",
    phone: "",
    website: "",
    open_hours: "",
    cover_image: null as File | null,
  });

  useEffect(() => {
    const data = sessionStorage.getItem("editRestaurant");
    
    if (data) {
      const parsed = JSON.parse(data);
      const cleanHours = parsed.open_hours
      ?.replace(/�\?\?�\?\?/g, "-")        // replace �?? with -
      .replace(/�\?/g, " ")           // replace �? with space
      .replace(/[^\w\s:.,/-]/g, "")   // remove remaining symbols/emojis
      || "";  

       setRestaurant(parsed);
      setFormData({
        name: parsed.name,
        address: parsed.address,
        latitude: parsed.latitude || "",
        longitude: parsed.longitude || "",
        category: parsed.category || "",
        cuisine: parsed.cuisine || "",
        description: parsed.description,
        phone: parsed.phone,
        website: parsed.website,
        open_hours: cleanHours,
        cover_image: null,
      });
      const normalized = getMenuImagePath(parsed.cover_image || parsed.image || "/placeholder.svg");
      setLoading(false);
      // console.log('ss',normalized);
      setCoverImagePreview(normalized);
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
        })
          return; 
        }
      setFormData((prev) => ({ ...prev, cover_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log(token)
      const data = new FormData();

      data.append("name", formData.name.trim());  
      data.append("address", formData.address.trim());
      data.append("latitude", formData.latitude.trim());
      data.append("longitude", formData.longitude.trim());
      data.append("category", formData.category.trim());
      data.append("cuisine", formData.cuisine.trim());
      data.append("description", formData.description.trim());
      data.append("phone", formData.phone.trim());
      data.append("website", formData.website.trim());
      data.append("open_hours", formData.open_hours.trim());
      data.append("ratings", "4.5"); // optional default value

      if (formData.cover_image) {
        data.append("cover_image", formData.cover_image);
      }

      const response = await apiClient.put(
        `/restaurants/update/${restaurantId}`,
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
          title: "Restaurant updated",
          description: "The restaurant has been updated successfully",
        });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error("Failed to update restaurant");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the restaurant",
        variant: "destructive",
      });
      console.error("Error updating restaurant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurant) {
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
  // console.log('formData.category',formData.category);
  if(loading){
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground mb-4">Please wait a moment</p>
      </div>
    );
  }
// console.log('dsdsdsd',coverImagePreview);
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
        <h1 className="text-3xl font-bold tracking-tight">Edit Restaurant</h1>
        <p className="text-muted-foreground">
          Update the details of {restaurant.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>Update the restaurant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Cover Image (Click Image to select new)</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      onError={()=>setCoverImagePreview('/Images/restaurent-fall.jpg')}
                      alt="Cover preview"
                      className="mx-auto max-h-[200px] rounded-md object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                      <p className="text-white font-medium">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended size: 1200x800px (16:9 ratio)
                    </p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  id="cover_image"
                  name="cover_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter restaurant name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category}  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
                {/* <Input
                  id="category"
                  name="category"
                  placeholder="e.g. Fast Food, Café"
                  value={formData.category}
                  onChange={handleChange}
                /> */}
              </div>
            </div>

      

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                   placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    placeholder="e.g. 40.7128"
                    value={formData.latitude}
                    onChange={handleChange}
                    maxLength={20}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      input.value = input.value.replace(/[^0-9.-]/g, ""); // allow numbers, dot, minus
                      
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    placeholder="e.g. -74.0060"
                    value={formData.longitude}
                    maxLength={20}
                    onChange={handleChange}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      input.value = input.value.replace(/[^0-9.-]/g, ""); 
                    }}
                  />
                </div>
              </div>
           

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={15}
                  minLength={9}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/[^0-9]/g, ""); // allow numbers
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                    placeholder="Enter Website URL"
                  value={formData.website}
                  onChange={handleChange}
                  maxLength={60}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s./:]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="open_hours">Business Hours</Label>
              <Input
                id="open_hours"
                name="open_hours"
                placeholder="Mon-Sat: 11am-10pm, Sun: 12pm-9pm"
                value={formData.open_hours}
                onChange={handleChange}
                required
                maxLength={100}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                  .replace(/[^a-zA-Z0-9\s-]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                  .replace(/^\s+/g, ""); 

                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter restaurant description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
                maxLength={200}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                  .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                  .replace(/^\s+/g, ""); 

                }}
              />
            </div>

          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/restaurants/${restaurantId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Restaurant"}
            </Button> 
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
