'use client';

import { useState, useEffect ,useRef} from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiClient } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MapPin, Upload } from "lucide-react";

import Link from "next/link";
export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const menuItemId = params.menuItemId as string;
  const restaurantId = params.id as string;
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const formik = useFormik({
    initialValues: {
      item_name: "",
      description: "",
      price: "",
      item_type: "",
      image: null as File | null,
    },
    validationSchema: Yup.object({
      item_name: Yup.string().required("Item name is required").max(100),
      description: Yup.string().required("Description is required").max(200),
      price: Yup.string()
        .matches(/^\d+(\.\d{1,2})?$/, "Price must be a valid number")
        .required("Price is required"),
      item_type: Yup.string().required("Menu type is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        const data = new FormData();
        if(!values.image){
          toast({
            title: "Required !",
            description: "Item Image is Required",
            variant: "destructive",
          });
        }
        data.append("item_name", values.item_name);
        data.append("description", values.description);
        data.append("price", values.price);
        data.append("item_type", values.item_type);
        if (values.image) {
          data.append("menuItemImg", values.image);
        }

        const response = await apiClient.put(`/menuitems/updateRestaurantMenuItem/${menuItemId}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          toast({
            title: "Menu Item Updated",
            description: "The menu item has been updated successfully",
          });
          router.push(`/admin/restaurants/${restaurantId}`);
        } else {
          throw new Error(response.data.message || "Failed to update menu item");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "There was an error updating the menu item",
          variant: "destructive",
        });
        console.error("Error updating menu item:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    const data = sessionStorage.getItem("editMenuItem");
    if (data) {
      const parsed = JSON.parse(data);
      formik.setValues({
        item_name: parsed.item_name,
        description: parsed.description,
        price: parsed.price,
        item_type: parsed.item_type,
        image: null,
      });
      setIsDataLoaded(true);  
      setCoverImagePreview(getMenuImagePath(parsed.image_url || parsed.image || "/placeholder.svg"));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  if (!isDataLoaded) {
    return <div>Loading...</div>;  // Show a loading state until data is loaded
  }
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
        <h1 className="text-3xl font-bold tracking-tight">Edit Menu Item</h1>
        <p className="text-muted-foreground">
          Update the details of {formik.values.item_name}
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Item Image (Click to select a new image)</Label><span className="text-danger"> *</span>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
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

            <div>
              <Label>Item Name</Label><span className="text-danger"> *</span>
              <Input
                name="item_name"
                value={formik.values.item_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter item name"
                required
                maxLength={60}
              />
              {formik.touched.item_name && formik.errors.item_name && (
                <p className="text-sm text-danger">{formik.errors.item_name}</p>
              )}
            </div>

            <div>
              <Label>Description</Label><span className="text-danger"> *</span>
              <Textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter description"
                required
                maxLength={200}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-danger">{formik.errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Price</Label><span className="text-danger"> *</span>
                <Input
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Price"
                  required
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value
                    .replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'); 
                  }}
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="text-sm text-danger">{formik.errors.price}</p>
                )}
              </div>

              <div>
                <Label>Item Category</Label><span className="text-danger"> *</span>
                {formik.values.item_type}
                <Select
                  value={formik.values.item_type}
                  onValueChange={(value) => formik.setFieldValue("item_type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starters">Starters</SelectItem>
                    <SelectItem value="Main Dishes">Main Dishes</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
    </div>
  );
}
