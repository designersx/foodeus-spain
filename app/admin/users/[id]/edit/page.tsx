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
  const id = params.id as string;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
    // address: "",
    // latitude: "",
    // longitude: "",
    // category: "",
    // cuisine: "",
    // description: "",
    // phone: "",
    // website: "",
    // open_hours: "",
    // cover_image: null as File | null,
  });

  useEffect(() => {
    const data = sessionStorage.getItem("editUsersDetails");

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
        email: parsed.email
        // address: parsed.address,
        // latitude: parsed.latitude || "",
        // longitude: parsed.longitude || "",
        // category: parsed.category || "",
        // cuisine: parsed.cuisine || "",
        // description: parsed.description,
        // phone: parsed.phone,
        // website: parsed.website,
        // open_hours: cleanHours,
        // cover_image: null,
      });
      // const normalized = getMenuImagePath(parsed.cover_image || parsed.image || "/placeholder.svg");
      setLoading(false);
      // console.log('ss',normalized);
      // setCoverImagePreview(normalized);
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
      // const data = new FormData();
      // data.append("name", formData.name.trim());
      // data.append("email", formData.email.trim());
      const data={
        name:formData.name,
        email:formData.email
      }
      const response = await apiClient.put(
        `/mobileUsers/updateMobileUsersWithId/${id}`,
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
          title: "User updated",
          description: "The User has been updated successfully",
        });
        router.push(`/admin/users`);
      } else {
        toast({
          title: "Error",
          description: "There was an error updating the restaurant",
          variant: "destructive",
        });
        throw new Error("Failed to update restaurant");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "There was an error updating the restaurant",
        variant: "destructive",
      });
      console.error("Error updating restaurant:", error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground mb-4">
          The User you're looking for doesn't exist
        </p>
        <Button asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground mb-4">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="full-width-container space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/users`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Users</h1>
        <p className="text-muted-foreground">
          Update the details of {restaurant.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update the user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* <div className="space-y-2">
              <Label>Cover Image (Click Image to select new)</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      onError={() => setCoverImagePreview('/Images/restaurent-fall.jpg')}
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
            </div> */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name"> Name</Label>
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
              </div>   <div className="space-y-2">
                <Label htmlFor="email"> Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter user email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Allow only valid email characters (letters, numbers, @, ., _, and -)
                    const cleanedValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
                    target.value = cleanedValue;
                  }}
                />
              </div> </div>

          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
