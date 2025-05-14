
// v2
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { ArrowLeft, Upload, X } from "lucide-react";
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
import { API_BASE_URL, apiClient } from "@/services/apiService";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function UpdateMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const menuItemId = params.menuId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const restaurantId = params.id as string;
  const menuId = params.menuId as string;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form data for Step 1 (Menu Details)
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "Today's Special",
    start_time: "",
    end_time: "",
    image: null as File | null,
    item_list: [] as string[],
  });

  // Track existing item IDs to handle updates/deletions
  const [existingItemIds, setExistingItemIds] = useState<Map<string, string>>(new Map());
  // Track items to delete
  const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set());
  // Temporary form data for editing items in Step 2 (array per category)
  const [itemFormData, setItemFormData] = useState({
    Starter: [
      { item_name: "", image: null as File | null, imagePreview: null as string | null, id: "" },
    ],
    MainDish: [
      { item_name: "", image: null as File | null, imagePreview: null as string | null, id: "" },
    ],
    Dessert: [
      { item_name: "", image: null as File | null, imagePreview: null as string | null, id: "" },
    ],
    Drinks: [
      { item_name: "", image: null as File | null, imagePreview: null as string | null, id: "" },
    ],
  });

  // Fetch menu and items on mount
  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch menu details
        const menuResponse = await apiClient.get(`/menus/${menuId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (menuResponse.data.success) {
          const menu = menuResponse.data.data;
          setFormData({
            item_name: menu.item_name || "",
            description: menu.description || "",
            price: menu.price || "",
            menu_type: menu.menu_type || "Today's Special",
            start_time: menu.start_time || "",
            end_time: menu.end_time || "",
            image: null,
            item_list: menu.item_list || [],
          });
          setImagePreview(menu.image_urls || null);
          setSelectedItems(new Set(menu.item_list || []));
        }

        // Fetch all menu items for the restaurant
        const itemsResponse = await apiClient.get(`/menuitems/getRestaurantMenuItemList/${menuId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (itemsResponse.data.success) {
          const items = itemsResponse.data.data
   
          const newItemFormData = {
            Starter: [],
            MainDish: [],
            Dessert: [],
            Drinks: [],
          };
          const newExistingItemIds = new Map<string, string>();

          items.forEach((item: any) => {
            const category = item.item_type;
            newItemFormData[category].push({
              id: item.id.toString(),
              item_name: item.item_name || "",
              image: null,
              imagePreview: item.image_url || null,
            });
            newExistingItemIds.set(item.id.toString(), category);
          });
          // Ensure at least one empty row per category
          Object.keys(newItemFormData).forEach((category) => {
            if (newItemFormData[category].length === 0) {
              newItemFormData[category].push({
                id: "",
                item_name: "",
                image: null,
                imagePreview: null,
              });
            }
          });

          setItemFormData(newItemFormData);
          setExistingItemIds(newExistingItemIds);
        }
      } catch (error) {
        toast({
          title: t("ToastFetchErrorTitle"),
          description: t("ToastFetchErrorMessage"),
          variant: "destructive",
        });
        console.error("Fetch Menu Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if(menuId && restaurantId){
      fetchMenuData();
    }
    
  }, [menuId, restaurantId, toast, t]);

  // Handlers for Step 1
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("ToastInvalidFileTypeTitle"),
          description: t("ToastInvalidFileTypeMessage"),
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

  // Handlers for Step 2
  const handleItemChange = (
    category: string,
    rowIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setItemFormData((prev) => {
      const updatedCategory = [...prev[category]];
      updatedCategory[rowIndex] = { ...updatedCategory[rowIndex], [name]: value };
      return { ...prev, [category]: updatedCategory };
    });
  };

  const handleItemImageChange = (
    category: string,
    rowIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("ToastInvalidFileTypeTitle"),
          description: t("ToastInvalidFileTypeMessage"),
          variant: "destructive",
        });
        return;
      }
      setItemFormData((prev) => {
        const updatedCategory = [...prev[category]];
        updatedCategory[rowIndex] = { ...updatedCategory[rowIndex], image: file };
        return { ...prev, [category]: updatedCategory };
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemFormData((prev) => {
          const updatedCategory = [...prev[category]];
          updatedCategory[rowIndex] = {
            ...updatedCategory[rowIndex],
            imagePreview: reader.result as string,
          };
          return { ...prev, [category]: updatedCategory };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveRow = (category: string, rowIndex: number) => {
    setItemFormData((prev) => {
      const updatedCategory = [...prev[category]];
      const removedItem = updatedCategory[rowIndex];
      if (removedItem.id) {
        setItemsToDelete((prev) => new Set(prev).add(removedItem.id));
      }
      updatedCategory.splice(rowIndex, 1);
      if (updatedCategory.length === 0) {
        updatedCategory.push({
          id: "",
          item_name: "",
          image: null,
          imagePreview: null,
        });
      }
      return { ...prev, [category]: updatedCategory };
    });
  };

  const handleAddMore = (category: string) => {
    setItemFormData((prev) => ({
      ...prev,
      [category]: [
        ...prev[category],
        {
          id: "",
          item_name: "",
          image: null,
          imagePreview: null,
        },
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate Step 1
      if (!formData.item_name.trim()) {
        toast({
          title: t("ValidationErrorTitle"),
          description: t("ValidationMenuNameRequired"),
          variant: "destructive",
        });
        return;
      }
      if (!formData.price) {
        toast({
          title: t("ValidationErrorTitle"),
          description: t("ValidationPriceRequired"),
          variant: "destructive",
        });
        return;
      }
      if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
        toast({
          title: t("ValidationErrorTitle"),
          description: t("ValidationEndTimeAfterStart"),
          variant: "destructive",
        });
        return;
      }

      // Validate Step 2: At least one valid item
      const allItems = Object.keys(itemFormData).flatMap((category) =>
        itemFormData[category]
          .map((item:any, index:number) => ({ ...item, category, rowIndex: index }))
          .filter((item:any) => item.item_name.trim())
      );

      // if (allItems.length === 0) {
      //   toast({
      //     title: t("ValidationErrorTitle"),
      //     description: t("ValidationAtLeastOneItem"),
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // Validate each item
      for (const item of allItems) {
        if (item.item_name.length > 60) {
          toast({
            title: t("ValidationErrorTitle"),
            description: t("ValidationItemNameMax"),
            variant: "destructive",
          });
          return;
        }
      }

      const token = localStorage.getItem("token");  
      const newItemIds: string[] = [];
      const updatedItemIds = new Set(selectedItems);

      // Delete removed items
      for (const itemId of itemsToDelete) {
        // if (updatedItemIds.has(itemId)) {
          await apiClient.delete(`/menuitems/deleteRestaurantMenuItem/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          updatedItemIds.delete(itemId);
        // }
      }

      // Update or add items
      for (const item of allItems) {
        const data = new FormData();
        data.append("restaurant_id", restaurantId);
        data.append("item_name", item.item_name.trim());
        data.append("description", "");
        data.append("item_type", item.category);
        if (item.image) {
          data.append("menuItemImg", item.image);
        }
        if (item.id) {
          // Update existing item
          const response = await apiClient.put(`/menuitems/updateRestaurantMenuItem/${item.id}`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            updatedItemIds.add(item.id);
          } else {
            throw new Error(`Failed to update item: ${item.item_name}`);
          }
        } else {
          // Add new item
          const response = await apiClient.post(
            `/menuitems/addRestaurantMenuItem/${restaurantId}`,
            data,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            const newItemId = response.data.data?.id?.toString();
            if (newItemId) {
              newItemIds.push(newItemId);
              updatedItemIds.add(newItemId);
            }
          } else {
            throw new Error(`Failed to add item: ${item.item_name}`);
          }
        }
      }

      // Update menu
      const localDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const menuData = new FormData();
      menuData.append("restaurant_id", restaurantId);
      menuData.append("item_name", formData.item_name.trim());
      menuData.append("price", formData.price);
      menuData.append("menu_type", formData.menu_type);
      menuData.append("start_time", formData.start_time);
      menuData.append("end_time", formData.end_time);
      menuData.append("description", formData.description.trim());
      menuData.append("localDatetime", localDatetime);
      if (formData.image) {
        menuData.append("image_urls", formData.image);
      }
      Array.from(updatedItemIds).forEach((item) => menuData.append("item_list[]", item));

      const menuResponse = await apiClient.put(`/menus/update/${menuId}`, menuData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (menuResponse.data.success) {
        toast({
          title: t("ToastMenuUpdateSuccessTitle"),
          description: t("ToastMenuUpdateSuccessMessage"),
        });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error("Failed to update menu");
      }
    } catch (error) {
      toast({
        title: t("ToastMenuUpdateErrorTitle"),
        description: t("ToastMenuUpdateErrorMessage"),
        variant: "destructive",
      });
      console.error("Update Menu Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategorySection = (category: string) => {
    const forms = itemFormData[category];
    const canAddMore = forms.length < 10 && forms.every((form:any) => form.item_name.trim());

    return (
      <Card className="w-full">
        <div className="space-y-4 mb-5 p-6">
          <h3 className="text-lg font-semibold">{t(category)}</h3>
          <div className="space-y-6">
            {forms.map((form, rowIndex) => (
              <div
                key={rowIndex}
                className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6"
              >
                {/* Item Name */}
                <div className="flex-1">
                  <Label htmlFor={`item_name-${category}-${rowIndex}`} className="block mb-1">
                    {rowIndex + 1}. {t("ItemName")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id={`item_name-${category}-${rowIndex}`}
                    name="item_name"
                    placeholder={t("EnterItemName")}
                    value={form.item_name}
                    onChange={(e) => handleItemChange(category, rowIndex, e)}
                    maxLength={60}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value
                        .replace(/[^a-zA-Z0-9\s]/g, "")
                        .replace(/^\s+/g, "");
                    }}
                  />
                </div>

                {/* Upload Item Button */}
                <div className="flex-1">
                  <Label htmlFor={`image-${category}-${rowIndex}`} className="block mb-1">
                    {t("ItemImage")}
                  </Label>
                  <Button
                    variant="outline"
                    className="flex-1 max-w-[100px] truncate"
                    onClick={() =>
                      document.getElementById(`image-${category}-${rowIndex}`)?.click()
                    }
                 
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="resName">
                    {form?.image?.name
                      ? `${form.image.name.slice(0, 10)}...`
                      : form.imagePreview
                      ? `${form.imagePreview.split("/").pop()?.slice(0, 10)}...`
                      : t("ItemImageClickToChange")}                    
                    </span>
                  </Button>
                  {/* Preview Eye Button */}
                  {(form?.imagePreview || form?.image) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPreviewImage(form?.imagePreview || form.image?.name)}
                          title={t("PreviewImage")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <div className="flex justify-center">
                          {previewImage ? (
                            <img
                              src={previewImage?.startsWith('data:image/')?previewImage :`${API_BASE_URL}/${previewImage}`}
                              alt="Item preview"
                              className="max-h-[400px] max-w-full rounded-md object-contain"
                            />
                          ) : (
                            <p>{("NoImageAvailable")}</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {/* remove  row */}
                  {(forms.length > 1 || form.item_name || form.imagePreview) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveRow(category, rowIndex)}
                      title={t("RemoveRow")}
                    >
                      <X className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                  <Input
                    id={`image-${category}-${rowIndex}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleItemImageChange(category, rowIndex, e)}
                  />
                </div>

                {/* Remove Button */}
                {/* {(forms.length > 1 || form.item_name) && (
                  <div className="flex items-center pt-6 sm:pt-7">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRow(category, rowIndex)}
                      title={t("RemoveRow")}
                    >
                      <X className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                )} */}
              </div>

            ))}

            {/* Add More Button */}
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => handleAddMore(category)}
                disabled={isLoading || !canAddMore}
              >
                {t("AddMore")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      //   <Card className="w-full">
      //   <div className="space-y-4 mb-5 p-6">
      //     <h3 className="text-lg font-semibold">{t(category)}</h3>
      //     <div className="space-y-6">
      //       {forms.map((form, rowIndex) => (
             
      //       <div key={rowIndex} className="grid grid-cols-1 gap-4 md:grid-cols-12 items-start">

      //           {/* Item Name */}
      //           <div className="md:col-span-5">
      //             <Label htmlFor={`item_name-${category}-${rowIndex}`} className="block mb-1">
      //               {rowIndex + 1}. {t("ItemName")} <span className="text-danger">*</span>
      //             </Label>
      //             <Input
      //               id={`item_name-${category}-${rowIndex}`}
      //               name="item_name"
      //               placeholder={t("EnterItemName")}
      //               value={form.item_name}
      //               className="w-full"
      //               onChange={(e) => handleItemChange(category, rowIndex, e)}
      //               maxLength={60}
      //               onInput={(e) => {
      //                 const target = e.target as HTMLInputElement;
      //                 target.value = target.value
      //                   .replace(/[^a-zA-Z0-9\s]/g, "")
      //                   .replace(/^\s+/g, "");
      //               }}
      //             />
      //           </div>

      //           {/* Upload Item Button */}
      //           <div className="md:col-span-6">
      //             <Label htmlFor={`image-${category}-${rowIndex}`} className="block mb-1">
      //               {t("ItemImage")}
      //             </Label>
      //             <div className="flex items-center gap-2">
      //             <Button
      //               variant="outline"
      //                className="flex-1 max-w-[200px] truncate"
      //               onClick={() =>
      //                 document.getElementById(`image-${category}-${rowIndex}`)?.click()
      //               }
                 
      //             >
      //               <Upload className="h-4 w-4 mr-2" />
      //               <span className="resName">
      //               {form.image?.name
      //                 ? form.image.name
      //                 : form.imagePreview
      //                 ? `${form.imagePreview.split("/").pop()?.slice(0, 10)}...`
      //                 : t("ItemImageClickToChange")}                    
      //               </span>
      //             </Button>
      //             {/* Preview Eye Button */}
      //             {(form.imagePreview || form.image) && (
      //               <Dialog>
      //                 <DialogTrigger asChild>
      //                   <Button
      //                     variant="outline"
      //                     size="icon"
      //                     onClick={() => setPreviewImage(form.imagePreview || form.image?.name)}
      //                     title={t("PreviewImage")}
      //                     className="flex-shrink-0"
      //                   >
      //                     <Eye className="h-4 w-4" />
      //                   </Button>
      //                 </DialogTrigger>
      //                 <DialogContent className="sm:max-w-md">
      //                   <div className="flex justify-center">
      //                     {previewImage ? (
      //                       <img
      //                         src={`${API_BASE_URL}/${previewImage}`}
      //                         alt="Item preview"
      //                         className="max-h-[400px] max-w-full rounded-md object-contain"
      //                       />
      //                     ) : (
      //                       <p>{t("NoImageAvailable")}</p>
      //                     )}
      //                   </div>
      //                 </DialogContent>
      //               </Dialog>
      //             )}
      //             <Input
      //               id={`image-${category}-${rowIndex}`}
      //               type="file"
      //               accept="image/*"
      //               className="hidden"
      //               onChange={(e) => handleItemImageChange(category, rowIndex, e)}
      //             />
      //           </div>
      //           </div>
                

      //           {/* Remove Button */}
      //           <div className="md:col-span-1 flex justify-end items-center md:items-start md:pt-7">
      //           {(forms.length > 1 || form.item_name) && (
      //               <Button
      //                 variant="ghost"
      //                 size="icon"
      //                 onClick={() => handleRemoveRow(category, rowIndex)}
      //                 title={t("RemoveRow")}
      //               >
      //                 <X className="h-4 w-4 text-danger" />
      //               </Button>
      //           )}
      //         </div>
      //         </div>

      //       ))}

      //       {/* Add More Button */}
      //       <div className="flex justify-start">
      //         <Button
      //           variant="outline"
      //           onClick={() => handleAddMore(category)}
      //           disabled={isLoading || !canAddMore}
      //         >
      //           {t("AddMore")}
      //         </Button>
      //       </div>
      //     </div>
      //   </div>
      // </Card>
    );
  };

  return (
    <div className="full-width-container space-y-6 responsive-container">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/restaurants/${restaurantId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("BackToRestaurant")}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("UpdateMenu")}</h1>
        <p className="text-muted-foreground">{t("UpdateMenuDescription")}</p>
      </div>

      {/* Progress Indicator */}

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step === 1
                    ? "pindicatior-circle"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === 1 ? "pindicatior-text" : "text-gray-600"
                }`}
              >
                {t("MenuItemDetails")}
              </span>
            </div>

            {/* Connector Line */}
            <div
              className={`mx-4 h-1 w-16 rounded ${
                step === 2 ? "pindicatior-text" : "bg-gray-300"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step === 2
                    ? "pindicatior-circle"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === 2 ? "pindicatior-text" : "text-gray-600"
                }`}
              >
                {t("EditMenuItems")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Menu Details */}
      {step === 1 && (
        <form onSubmit={(e) => e.preventDefault()} className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("MenuItemDetails")}</CardTitle>
              <CardDescription>{t("MenuItemDetailsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Menu Image */}
              <div className="space-y-2">
                <Label>{t("ItemImageClickToChange")}</Label>
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
                        <p className="text-white font-medium">{t("ChangeImage")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col items-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">{t("UploadItemImage")}</p>
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
                <Label htmlFor="item_name">
                  {t("MenuName")} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="item_name"
                  name="item_name"
                  placeholder={t("EnterMenuName")}
                  value={formData.item_name}
                  onChange={handleChange}
                  maxLength={60}
                  required
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "")
                      .replace(/^\s+/g, "");
                  }}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t("EnterItemDescription")}
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={200}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "")
                      .replace(/^\s+/g, "");
                  }}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  {t("Price")} € <span className="text-danger">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  placeholder={t("PricePlaceholder")}
                  value={formData.price}
                  onChange={handleChange}
                  required
                  maxLength={7}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value
                      .replace(/[^0-9.]/g, "")
                      .replace(/(\..*?)\..*/g, "$1");
                  }}
                  title="Enter a valid price (e.g. 9.99)"
                />
              </div>

              {/* Serving Hours */}
              <div className="space-y-2" style={{ width: "50%" }}>
                <Label>{t("ServingHours")}</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="start_time" className="text-xs">
                      {t("StartTime")}
                    </Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="end_time" className="text-xs">
                      {t("EndTime")}
                    </Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => {
                        const selectedEndTime = e.target.value;
                        if (formData.start_time && selectedEndTime <= formData.start_time) {
                          toast({
                            title: t("ValidationErrorTitle"),
                            description: t("ValidationEndTimeAfterStart"),
                            variant: "destructive",
                          });
                          return;
                        }
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/admin/restaurants/${restaurantId}`}>{t("Cancel")}</Link>
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.item_name || !formData.price}
              >
                {t("Next")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 2: Edit Menu Items */}
      {step === 2 && (
        <div className="space-y-8 mb-2 p-6">
          {["Starter", "MainDish", "Dessert", "Drinks"].map((category) =>
            renderCategorySection(category)
          )}
          <div className="flex justify-between mt-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              {t("Back")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading
                //  ||
                // !Object.values(itemFormData)
                //   .flat()
                //   .some((item) => item.item_name.trim())
              }
            >
              {isLoading ? t("saving") : t("SaveChanges")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}