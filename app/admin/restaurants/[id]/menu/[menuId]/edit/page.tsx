// "use client";
// import { useState, useRef, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { useLanguage } from "@/context/language-context";
// import Link from "next/link";
// import { Pencil } from "lucide-react";
// import axios from "axios";
// import { ArrowLeft, Upload, ChevronDownIcon } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogOverlay
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { apiClient } from "@/services/apiService";
// import { getMenuImagePath } from "@/utils/getImagePath";
// import { debounce } from "lodash";

// export default function EditMenuItemPage() {
//   const router = useRouter();
//   const params = useParams();
//   const { toast } = useToast();
//   const [suggestionss, setSuggestionss] = useState<string[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string | "">("");
//   const restaurantId = params.id as string;
//   const menuItemId = params.menuId as string;
//   const [editingItem, setEditingItem] = useState<any | null>(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const { t } = useLanguage();
//   const [newItemData, setNewItemData] = useState({
//     item_name: "",
//     description: "",
//     item_type: "",
//     image: null as File | null,
//     imagePreview: null as string | null,
//   });
//   const [formData, setFormData] = useState({
//     item_name: "",
//     description: "",
//     price: "",
//     menu_type: "Today's Special",
//     item_list: [] as string[],
//     image: null as File | null,
//   });
//   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
//   const [items, setItems] = useState<any[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//   const [activeSuggestionIndex, setActiveSuggestionIndex] =
//     useState<number>(-1);
//   const itemNameInputRef = useRef<HTMLInputElement>(null);
//   // Debounced API call to reduce requests
//   const fetchSuggestions = debounce(async (query: string) => {
//     try {
//       const res = await apiClient.get(
//         `/menus/get-item/${restaurantId}?search=${query}`
//       );
//       if (res.data.success) {
//         setSuggestionss(res.data.data);
//       } else {
//         setSuggestionss([]);
//       }
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       setSuggestionss([]);
//     }
//   }, 300);
  
//   useEffect(() => {
//     const data = sessionStorage.getItem("editMenuItem");
//     if (data) {
//       const parsed = JSON.parse(data);
//       setSelectedCategory(parsed.category);
//       setFormData({
//         item_name: parsed.name || "",
//         description: parsed.description || "",
//         price: parsed.price || "",
//         menu_type: parsed.category || "",
//         item_list: parsed.item_list || [],
//         image: null,
//       });
//       const normalized = getMenuImagePath(parsed.cover_image || parsed.image);
//       setImagePreview(normalized);
//       const initialSelectedItems = new Set(
//         parsed.item_list.map((item: any) => item.id.toString())
//       );
//       setSelectedItems(initialSelectedItems);
//     }
//   }, []);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         toast({
//           title: t("ToastInvalidFileTypeTitle"),
//           description: t("ToastInvalidFileTypeMessage"),
//           variant: "destructive",
//         });
//         return;
//       }
//       setFormData((prev) => ({ ...prev, image: file }));
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const saveEditedItem = (updatedItem: any) => {
//     setItems((prev) =>
//       prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
//     );
//     setIsModalOpen(false);
//   };

//   const handleEditClick = (item: any) => {
//     setEditingItem(item);
//     setIsModalOpen(true);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const data = new FormData();
//       // if (formData.item_list.length === 0) {
//       //   toast({
//       //     title: "Warning !",
//       //     description: "Please Add at least one item to the menu",
//       //     variant: "destructive",
//       //   });
//       //   return;
//       // }
//       data.append("item_name", formData.item_name.trim());
//       data.append("price", formData.price);
//       data.append("menu_type", formData.menu_type);
//       data.append("item_list", JSON.stringify(Array.from(selectedItems)));
//       data.append("description", formData.description.trim());
//       if (formData.image) data.append("image_urls", formData.image);
//       const response = await apiClient.put(
//         `/menus/update/${menuItemId}`,
//         data,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.data.success) {
//         toast({
//           title: t('MenuItemUpdatedTitle'),
//           description: t('MenuItemUpdatedDescription'),
//         })
//         router.push(`/admin/restaurants/${restaurantId}`);
//       } else
//         throw new Error(response.data.message || "Failed to update menu item");
//     } catch (error) {
//       toast({
//         title: t('MenuItemUpdateErrorTitle'),
//         description: t('MenuItemUpdateErrorDescription'),
//         variant: 'destructive',
//       })
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   const updateEditedItem = async () => {
//     console.log(editingItem.image);
//     if (!editingItem) return;

//     const trimmedName = editingItem.item_name.trim();
//     const trimmedDesc = editingItem.description?.trim() || "";

//     // 🔒 Validations
//     if (!trimmedName) {
//       toast({
//         title: t('ValidationErrorTitle'),
//         description: t('ValidationItemNameRequired'),
//         variant: 'destructive',
//       })
//       return;
//     }

//     if (trimmedName.length > 50) {
//       toast({
//         title: t('ValidationErrorTitle'),
//         description: t('ValidationItemNameMax'),
//         variant: 'destructive',
//       })
//       return;
//     }

//     if (trimmedDesc.length > 100) {
//       toast({
//         title: t('ValidationErrorTitle'),
//         description: t('ValidationDescriptionMax'),
//         variant: 'destructive',
//       })
//       return;
//     }
//     try {
//       const token = localStorage.getItem("token");
//       const formData = new FormData();
//       formData.append("item_name", editingItem.item_name.trim());
//       formData.append("description", editingItem.description?.trim() || "");
//       formData.append("item_type", editingItem.item_type);
//       if (editingItem.image) {
//         formData.append("menuItemImg", editingItem.image);
//       }
//       const response = await apiClient.put(
//         `/menuitems/updateRestaurantMenuItem/${editingItem.id}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.data.success) {
//         toast({
//           title: t('ItemUpdatedTitle'),
//           description: t('ItemUpdatedDescription'),
//         })
//         setItems((prev) =>
//           prev.map((item) =>
//             item.id === editingItem.id ? response.data.data : item
//           )
//         );
//         setIsModalOpen(false);
//       } else {
//         throw new Error(response.data.message || "Failed to update item");
//       }
//     } catch (err) {
//       toast({
//         title: t('ItemUpdateFailedTitle'),
//         description: t('ItemUpdateFailedDescription'),
//         variant: 'destructive',
//       })
//       console.error(err);
//     }
//   };
//   // Fetch menu items
//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await apiClient.get(
//           `/menuitems/getRestaurantMenuItemList/${menuItemId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (response.data.success) {
//           setItems(response.data.data);
//         }
//       } catch (error:unknown) {
//         let errorMessage = "Something went wrong.";
//         if (axios.isAxiosError(error)) {
//           errorMessage =
//             error.response?.data?.message || error.message || errorMessage;
//         } else if (error instanceof Error) {
//           errorMessage = error.message;
//         }
//         console.error("Error fetching items", error);
//       } finally {
//         setIsDataLoaded(true);
//       }
//     };
//     fetchItems();
//   }, [menuItemId]);

//   const handleAddMenuItem = async () => {
//     try {
//       const trimmedName = newItemData.item_name.trim();
//       const trimmedDesc = newItemData.description.trim();
//       if (!newItemData.item_name.trim()) {
//         toast({
//           title: "Validation Error",
//           description: "Item name is required.",
//           variant: "destructive",
//         });
//         return;
//       }
//       if (trimmedName.length > 50) {
//         toast({
//           title: t('ValidationErrorTitle'),
//           description: t('ValidationItemNameMax'),
//           variant: 'destructive',
//         })
//         return;
//       }

//       if (trimmedDesc.length > 100) {
//         toast({
//           title: t('ValidationErrorTitle'),
//           description: t('ValidationDescriptionMax'),
//           variant: 'destructive',
//         })
//         return;
//       }
//       const token = localStorage.getItem("token");
//       console.log("add newItemData:", newItemData);
//       const formData = new FormData();
//       formData.append("item_name", newItemData.item_name.trim());
//       formData.append("description", newItemData.description.trim());
//       formData.append("item_type", newItemData.item_type);
//       if (newItemData.image) {
//         formData.append("menuItemImg", newItemData.image);
//       }
//       const response = await apiClient.post(
//         `/menuitems/addRestaurantMenuItem/${restaurantId}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.data.success) {
//         toast({
//           title: t('ItemAddedTitle'),
//           description: t('ItemAddedDescription'),
//         })
//         console.log("Item added response:", response.data.data);
//         const newItem = response.data.data;
//         console.log("New item added:", newItem,items);
//         setItems((prev) => [...prev, newItem]);
//         const newId = newItem?.id?.toString();
//         if (newId) {
//           const updatedSet = new Set(selectedItems);
//           updatedSet.add(newId);
//           setSelectedItems(updatedSet);
//           setFormData((prev) => ({
//             ...prev,
//             item_list: Array.from(updatedSet),
//           }));
//         }
//         setNewItemData({
//           item_name: "",
//           description: "",
//           item_type: "",
//           image: null,
//           imagePreview: null,
//         });
//         setIsAddModalOpen(false);
//       } else {
//         throw new Error(response.data.message || "Add failed");
//       }
//     } catch (err) {
//     toast({
//   title: t('ItemAddErrorTitle'),
//   description: t('ItemAddErrorDescription'),
//   variant: 'destructive',
// })
//       console.error(err);
//     }
//   };
//   const toggleItemSelection = (itemId: string) => {
//     const newSelectedItems = new Set(selectedItems);
//     if (newSelectedItems.has(itemId)) {
//       newSelectedItems.delete(itemId);
//     } else {
//       newSelectedItems.add(itemId);
//     }

//     setSelectedItems(newSelectedItems);
//     setFormData((prev) => ({
//       ...prev,
//       item_list: Array.from(newSelectedItems),
//     }));
//   };

//   if (!isDataLoaded) {
//     return <div>Loading...</div>;
//   }

//   const handleOpenDialog = (itemId: string) => {
//     setSelectedItemId(itemId);
//     setIsDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setSelectedItemId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (selectedItemId) {
//       try {
//         const token = localStorage.getItem("token");

//         const response = await apiClient.delete(
//           `/menuitems/deleteRestaurantMenuItem/${selectedItemId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // Check if the deletion was successful
//         if (response.data.success) {
//           // Show success toast
//           toast({
//             title: t('MenuItemDeletedTitle'),
//             description: t('MenuItemDeletedDescription'),
//           })

//           setItems((prevItems) =>
//             prevItems.filter((item) => item.id !== selectedItemId)
//           );

//           // Optionally, refresh the item list or update the local state
//           // Example: fetchItemList(); // This could refetch the list of items or update the local state
//         } else {
//           throw new Error(response.data.message || "Failed to delete item");
//         }
//       } catch (error) {
//         toast({
//           title: t('MenuItemDeleteErrorTitle'),
//           description: t('MenuItemDeleteErrorDescription'),
//           variant: 'destructive',
//         })
//         console.error("Delete error:", error);
//       }

//       setIsDialogOpen(false); // Close the dialog after confirming
//     }
//   };
//   return (
//     <div className="full-width-container space-y-6 responsive-container">
//       <Button variant="ghost" size="sm" asChild>
//         <Link href={`/admin/restaurants/${restaurantId}`}>
//           <ArrowLeft className="h-4 w-4 mr-1" /> {t('BackToRestaurant')}
//         </Link>
//       </Button>

//       <h1 className="text-3xl font-bold tracking-tight">{t('EditMenuItem')}</h1>
//       <form onSubmit={handleSubmit}>
//         <Card>
//           <CardHeader>
//             <CardTitle>{t('EditItemDetails')}</CardTitle>
//             <CardDescription>{t('ModifyDetailsBelow')}</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div>
//               <div className="space-y-2">
//                 <Label>{t('ItemImageClickToChange')}</Label>
//                 <div
//                   className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center"
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   {imagePreview ? (
//                     <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-md">
//                       <img
//                         src={imagePreview}
//                         // alt={t('ItemPreview')}
//                         className="mx-auto max-h-[200px] rounded-md object-cover"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
//                         <p className="text-white font-medium">{t('ChangeImage')}</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center text-center">
//                       <Upload className="h-10 w-10 text-muted-foreground mb-2" />
//                       <p className="text-sm font-medium">
//                         {t('ClickToUploadItemImage')}
//                       </p>
//                     </div>
//                   )}

//                   <Input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleFileChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Menu Name */}
//             <div className="space-y-2">
//               <Label htmlFor="item_name">
//               {t("MenuName")}  <span className="text-danger">*</span>
//               </Label>
//               <Input
//                 name="item_name"
//                 value={formData.item_name}
//                 placeholder={t("EnterMenuName")}
//                 onChange={handleChange}
//                 maxLength={50}
//                 required
//                 onInput={(e) => {
//                   const target = e.target as HTMLInputElement;
//                   target.value = target.value
//                     .replace(/[^a-zA-Z0-9\s]/g, "")
//                     .replace(/^\s+/g, "");
//                 }}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="description">
//               {t("Description")}  <span className="text-danger">*</span>
//               </Label>
//               <Textarea
//                 name="description"
//                 value={formData.description}
//                 placeholder={t("EnterItemDescription")}
//                 onChange={handleChange}
//                 maxLength={150}
//                 required
//                 onInput={(e) => {
//                   const target = e.target as HTMLInputElement;
//                   target.value = target.value
//                     .replace(/[^a-zA-Z0-9\s]/g, "")
//                     .replace(/^\s+/g, "");
//                 }}
//               />
//             </div>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="price">
//                 {t("Price")} € <span className="text-danger">*</span>
//                 </Label>
//                 <Input
//                   name="price"
//                   value={formData.price}
//                   placeholder={t("PricePlaceholder")}
//                   onChange={handleChange}
//                   required
//                   maxLength={7}
//                   onInput={(e) => {
//                     const input = e.currentTarget;
//                     input.value = input.value
//                       .replace(/[^0-9.]/g, "")
//                       .replace(/(\..*?)\..*/g, "$1");
//                   }}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="item_list">
//                 {t("CategoryList")}<span className="text-danger">*</span>
//                 </Label>
//                 <Select
//                   onValueChange={(value) => {
//                     setNewItemData((prev) => ({ ...prev, item_type: value }));
//                     setIsAddModalOpen(true);
//                   }}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder={t("SelectCategoryFromList")} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Starter">{t("Starter")}</SelectItem>
//                     <SelectItem value="MainDish">{t("MainDish")}</SelectItem>
//                     <SelectItem value="Dessert">{t("Dessert")}</SelectItem>
//                     <SelectItem value="Drinks">{t("Drinks")}</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>{" "}
//             </div>
//             {items.length > 0 && (
//               <div className="mt-6 space-y-4">
//                 <Label className="text-sm font-semibold text-gray-800">
//                 {t("ExistingMenuItems")}
//                 </Label>
//                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                   {items.map((item) =>
//                     item ? (
//                       <div
//                         key={item.id}
//                         className="relative border rounded-lg p-4 shadow-sm bg-white"
//                       >
//                         <button
//                           type="button"
//                           className="absolute top-2 right-2 text-black hover:text-black focus:outline-none"
//                           onClick={() => handleEditClick(item)}
//                           title="Edit"
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </button>
//                         <div className="flex items-center gap-3 mb-2">
//                           <img
//                             src={
//                               item.image_url
//                                 ? `https://foodeus.truet.net/${item.image_url}`
//                                 : "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg"
//                             }
//                             alt={item.item_name || "Menu item image"}
//                             onError={(e) => {
//                               e.currentTarget.src =
//                                 "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
//                             }}
//                             className="w-12 h-12 object-cover rounded-md border"
//                           />
//                           <div>
//                             <h4
//                               className="font-semibold text-sm text-gray-900 resName"
//                               style={{
//                                 wordBreak: "break-all", 
//                                 whiteSpace: "normal", 
//                               }}
//                             >
//                               {item.item_name}
//                             </h4>
//                             <p className="text-xs text-gray-500">
//                               {t(item.item_type)}
//                             </p>
//                           </div>
//                         </div>
//                         <p
//                           className="text-sm text-gray-700 mb-1 "
//                           style={{
//                             wordBreak: "break-all", // Breaks long words that have no spaces
//                             whiteSpace: "normal", // Allows text to wrap normally
//                           }}
//                         >
//                           {item.description || (
//                             <em className="text-gray-400">{t("NoDescription")}</em>
//                           )}
//                         </p>
//                         <div className="flex justify-end mt-2">
//                           <span
//                             className="text-xs text-danger"
//                             onClick={() => handleOpenDialog(item.id)}
//                           >
//                             {t('Remove')}
//                           </span>
//                         </div>
//                       </div>
//                     ) : null
//                   )}
//                 </div>
//               </div>
//             )}
//           </CardContent>
//           <CardFooter className="flex justify-between">
//             <Button variant="outline" asChild>
//               <Link href={`/admin/restaurants/${restaurantId}`}>{t('Cancel')}</Link>
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? t('Updating') : t('UpdateMenuItem')}
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//       {isModalOpen && editingItem && (
//         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//           <DialogOverlay className="bg-black/10 fixed inset-0 transition-opacity" /> 
//           <DialogContent className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8" style={{maxHeight: "90vh" ,overflowY: "auto"}}>
//             <DialogHeader>
//               <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
//                 {t('EditMenuItem')}
//               </DialogTitle>
//               <DialogDescription className="text-gray-600 text-center mt-1">
//                 {t('UpdateItemDetails')}
//               </DialogDescription>
//             </DialogHeader>

//             <div className="grid gap-4 mt-4">
//               <div className="space-y-2">
//                 <Label htmlFor="modal-image">{t('ItemImage')}</Label>
//                 <div
//                   className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors"
//                   onClick={() =>
//                     document.getElementById("modal-image")?.click()
//                   }
//                 >
//                   {editingItem.imagePreview || editingItem.image_url ? (
//                     <div className="relative flex items-center justify-center ">
//                       {/* <img
//                         src={
//                           editingItem.imagePreview ||
//                           `https://foodeus.truet.net/${editingItem.image_url}`
//                         }
//                         onError={(
//                           e: React.SyntheticEvent<HTMLImageElement, Event>
//                         ) => {
//                           const target = e.target as HTMLImageElement;
//                           target.onerror = null;
//                           target.src =
//                             "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
//                         }}
//                         alt={('Preview')}
//                         className="max-h-[200px] object-cover rounded-md mx-auto "
//                       /> */}
//                       <div className="flex justify-center items-center overflow-hidden rounded-md border " style={{width: "200px", height: "100px"}}>
//                         <img
//                           src={
//                             editingItem.imagePreview ||
//                             `https://foodeus.truet.net/${editingItem.image_url}`
//                           }
//                           onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
//                             const target = e.target as HTMLImageElement;
//                             target.onerror = null;
//                             target.src =
//                               "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
//                           }}
//                           alt="Preview"
//                           className="h-auto max-h-[200px] w-auto object-contain"
//                         />
//                       </div>
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
//                         <span className="text-white font-medium text-sm">
//                           {t('ChangeImage')}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center text-center">
//                       <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
//                       <p className="text-sm">{t('ClickToUpload')}</p>
//                     </div>
//                   )}
//                   <input
//                     type="file"
//                     id="modal-image"
//                     className="hidden"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         const reader = new FileReader();
//                         reader.onloadend = () => {
//                           setEditingItem({
//                             ...editingItem,
//                             image: file,
//                             imagePreview: reader.result as string,
//                           });
//                         };
//                         reader.readAsDataURL(file);
//                       }
//                     }}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label>{t('ItemName')} <span className="text-danger">*</span></Label>
//                 <Input
//                   maxLength={50}
//                   value={editingItem.item_name}
//                   onChange={(e) =>
//                     setEditingItem({
//                       ...editingItem,
//                       item_name: e.target.value,
//                     })
//                   }
//                   onInput={(e) => {
//                     const target = e.target as HTMLInputElement;
//                     target.value = target.value
//                       .replace(/[^a-zA-Z0-9\s]/g, "") // Remove invalid characters (anything that's not a letter, number, or space)
//                       .replace(/^\s+/g, "");
//                   }}
//                 />
//               </div>
//               <div>
//                 <Label>{t('Description')}</Label>
//                 <Textarea
//                   value={editingItem.description}
//                   maxLength={100}
//                   onChange={(e) =>
//                     setEditingItem({
//                       ...editingItem,
//                       description: e.target.value,
//                     })
//                   }
//                   onInput={(e) => {
//                     const target = e.target as HTMLInputElement;
//                     target.value = target.value
//                       .replace(/[^a-zA-Z0-9\s]/g, "") // Remove invalid characters (anything that's not a letter, number, or space)
//                       .replace(/^\s+/g, "");
//                   }}
//                 />
//               </div>
//             </div>
//             <DialogFooter className="mt-5">
//               <Button variant="outline" onClick={() => setIsModalOpen(false)}>
//                 {t('Cancel')}
//               </Button>
//               <Button onClick={() => updateEditedItem()}>{t('SaveChanges')}</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}
//       {isAddModalOpen && (
//         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//           <DialogOverlay className="bg-black/10 fixed inset-0 transition-opacity" /> 
//           <DialogContent className="max-w-md" style={{maxHeight: "90vh" ,overflowY: "auto"}}>
//             <DialogHeader>
//               <DialogTitle>{t('AddNewMenuItem')}</DialogTitle>
//               <DialogDescription>
//                {t('EnterNewItemDetails')}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               <Label>{t('Image')}</Label>
//               <div
//                 className="border-dashed border-2 p-2 rounded cursor-pointer text-center"
//                 onClick={() =>
//                   document.getElementById("add-image-input")?.click()
//                 }
//               >
//                <div className="flex justify-center items-center overflow-hidden rounded-md border " style={{ height: "100px"}}>
//                 {newItemData.imagePreview ? (
//                   <img
//                     src={newItemData.imagePreview}
//                     alt="Preview"
//                     className="h-24 mx-auto object-cover"
//                   />
//                 ) : (
//                   <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
//                 )}
//                  </div>
//                 <input
//                   id="add-image-input"
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
                
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) {
//                       const reader = new FileReader();
//                       reader.onloadend = () => {
//                         setNewItemData({
//                           ...newItemData,
//                           image: file,
//                           imagePreview: reader.result as string,
//                         });
//                       };
//                       reader.readAsDataURL(file);
//                     }
//                   }}
//                 />
//               </div>
//               <div className="relative">
//                 <Label>{t('ItemName')} <span className="text-danger">*</span></Label>
//                 <Input
//                   ref={itemNameInputRef}
//                   value={newItemData.item_name}
//                   maxLength={50}
//                   onChange={async (e) => {
//                     const value = e.target.value;
//                     setNewItemData({ ...newItemData, item_name: value });
//                     setActiveSuggestionIndex(-1);
//                     if (!value.trim()) {
//                       setSuggestions([]);
//                       return;
//                     }
//                     if (value.trim().length > 1) {
//                       try {
//                         const res = await apiClient.get(
//                           `/menus/get-item/${restaurantId}?search=${value}`
//                         );
//                         if (res.data.success) {
//                           setSuggestions(res.data.data);
//                         } else {
//                           setSuggestions([]);
//                         }
//                       } catch (err) {
//                         console.error("Error fetching suggestions", err);
//                         setSuggestions([]);
//                       }
//                     } else {
//                       setSuggestions([]);
//                     }
//                   }}
//                   onKeyDown={(e) => {
//                     if (e.key === "ArrowDown") {
//                       e.preventDefault();
//                       setActiveSuggestionIndex((prev) =>
//                         prev < suggestions.length - 1 ? prev + 1 : 0
//                       );
//                     } else if (e.key === "ArrowUp") {
//                       e.preventDefault();
//                       setActiveSuggestionIndex((prev) =>
//                         prev > 0 ? prev - 1 : suggestions.length - 1
//                       );
//                     } else if (
//                       e.key === "Enter" &&
//                       activeSuggestionIndex >= 0
//                     ) {
//                       e.preventDefault();
//                       const selected = suggestions[activeSuggestionIndex];
//                       if (selected) {
//                         setNewItemData((prev) => ({
//                           ...prev,
//                           item_name: selected,
//                         }));
//                         setSuggestions([]);
//                         setActiveSuggestionIndex(-1);
//                       }
//                     }
//                   }}
//                 />
//                 {suggestions.length > 0 && (
//                   <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow z-50 max-h-40 overflow-y-auto">
//                     {suggestions.map((itemName, index) => (
//                       <li
//                         key={index}
//                         className={`px-4 py-2 cursor-pointer text-sm ${
//                           index === activeSuggestionIndex
//                             ? "bg-gray-200 text-black font-medium"
//                             : "hover:bg-gray-100"
//                         }`}
//                         onClick={() => {
//                           setNewItemData({
//                             ...newItemData,
//                             item_name: itemName,
//                           });
//                           setSuggestions([]);
//                           setActiveSuggestionIndex(-1);
//                         }}
//                       >
//                         {itemName}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//               <Label>{t('Description')}</Label>
//               <Textarea
//               maxLength={100}
//                 value={newItemData.description}
//                 onChange={(e) =>
//                   setNewItemData({
//                     ...newItemData,
//                     description: e.target.value,
//                   })
//                 }
//               />
//             </div>
//             <DialogFooter className="mt-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsAddModalOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleAddMenuItem}>{t('AddItem')}</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//       <DialogOverlay className="bg-black/10 fixed inset-0 transition-opacity" /> 
//         <DialogContent className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8" style={{maxHeight: "90vh" ,overflowY: "auto"}}>
//           <DialogHeader>
//             <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
//               {t('ConfirmDeletion')}
//             </DialogTitle>
//             <DialogDescription className="text-gray-600 text-center mt-1">
//               {t('ConfirmDeleteMenuItem')}
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter className="mt-5 flex justify-between">
//             <Button
//               variant="outline"
//               onClick={handleCloseDialog}
//               className="w-full sm:w-auto"
//             >
//               {t('Cancel')}
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleConfirmDelete}
//               className="w-full sm:w-auto"
//             >
//               {t('ConfirmDelete')}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/context/language-context";
import Link from "next/link";
import { ArrowLeft, Upload, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
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
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiService";
import { getMenuImagePath } from "@/utils/getImagePath";
import { debounce } from "lodash";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const restaurantId = params.id as string;
  const menuItemId = params.menuId as string;
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Menu Details, Step 2: Manage Items
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form data for Step 1 (Menu Details)
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "Today's Special",
    item_list: [] as string[],
    image: null as File | null,
  });

  // State for Step 2: Categorized items
  const [categorizedItems, setCategorizedItems] = useState({
    Starter: [] as { id: string; item_name: string; description: string; image_url: string; item_type: string }[],
    MainDish: [] as { id: string; item_name: string; description: string; image_url: string; item_type: string }[],
    Dessert: [] as { id: string; item_name: string; description: string; image_url: string; item_type: string }[],
    Drinks: [] as { id: string; item_name: string; description: string; image_url: string; item_type: string }[],
  });

  // Temporary form data for adding items in Step 2
  const [itemFormData, setItemFormData] = useState({
    Starter: {
      item_name: "",
      description: "",
      image: null as File | null,
      imagePreview: null as string | null,
      suggestions: [] as string[],
      activeSuggestionIndex: -1,
    },
    MainDish: {
      item_name: "",
      description: "",
      image: null as File | null,
      imagePreview: null as string | null,
      suggestions: [] as string[],
      activeSuggestionIndex: -1,
    },
    Dessert: {
      item_name: "",
      description: "",
      image: null as File | null,
      imagePreview: null as string | null,
      suggestions: [] as string[],
      activeSuggestionIndex: -1,
    },
    Drinks: {
      item_name: "",
      description: "",
      image: null as File | null,
      imagePreview: null as string | null,
      suggestions: [] as string[],
      activeSuggestionIndex: -1,
    },
  });

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Debounced API call for autocomplete suggestions
  const fetchSuggestions = debounce(async (query: string, category: string) => {
    if (!query.trim() || query.trim().length <= 1) {
      setItemFormData((prev) => ({
        ...prev,
        [category]: { ...prev[category], suggestions: [], activeSuggestionIndex: -1 },
      }));
      return;
    }
    try {
      const res = await apiClient.get(`/menus/get-item/${restaurantId}?search=${query}`);
      if (res.data.success) {
        setItemFormData((prev) => ({
          ...prev,
          [category]: { ...prev[category], suggestions: res.data.data },
        }));
      } else {
        setItemFormData((prev) => ({
          ...prev,
          [category]: { ...prev[category], suggestions: [], activeSuggestionIndex: -1 },
        }));
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setItemFormData((prev) => ({
        ...prev,
        [category]: { ...prev[category], suggestions: [], activeSuggestionIndex: -1 },
      }));
    }
  }, 300);

  // Load initial menu data from sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem("editMenuItem");
    if (data) {
      const parsed = JSON.parse(data);
      setFormData({
        item_name: parsed.name || "",
        description: parsed.description || "",
        price: parsed.price || "",
        menu_type: parsed.category || "Today's Special",
        item_list: parsed.item_list?.map((item: any) => item.id.toString()) || [],
        image: null,
      });
      const normalized = getMenuImagePath(parsed.cover_image || parsed.image);
      setImagePreview(normalized);
      setSelectedItems(new Set(parsed.item_list?.map((item: any) => item.id.toString()) || []));
    }
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get(
          `/menuitems/getRestaurantMenuItemList/${menuItemId }`, // Fixed to use restaurantId
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          const items = response.data.data;
          console.log('items',items)
          // Organize items by category
          const newCategorizedItems = {
            Starter: [],
            MainDish: [],
            Dessert: [],
            Drinks: [],
          };
          items.forEach((item: any) => {
            if (newCategorizedItems[item.item_type] && formData.item_list.includes(item.id.toString())) {
              newCategorizedItems[item.item_type].push(item);
            }
          });
          setCategorizedItems(newCategorizedItems);
        }
      } catch (error) {
        console.error("Error fetching items", error);
        toast({
          title: t("MenuItemFetchErrorTitle"),
          description: t("MenuItemFetchErrorDescription"),
          variant: "destructive",
        });
      } finally {
        setIsDataLoaded(true);
      }
    };
    if(menuItemId){
      fetchItems();
    }
  
  }, [menuItemId, formData.item_list, toast, t,menuItemId]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setItemFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [name]: value },
    }));
    if (name === "item_name") {
      fetchSuggestions(value, category);
    }
  };

  const handleItemImageChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
      setItemFormData((prev) => ({
        ...prev,
        [category]: { ...prev[category], image: file },
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemFormData((prev) => ({
          ...prev,
          [category]: { ...prev[category], imagePreview: reader.result as string },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (category: string) => {
    const itemData = itemFormData[category];
    const trimmedName = itemData.item_name.trim();
    const trimmedDesc = itemData.description.trim();

    if (!trimmedName) {
      toast({
        title: t("ValidationErrorTitle"),
        description: t("ValidationItemNameRequired"),
        variant: "destructive",
      });
      return;
    }
    if (trimmedName.length > 50) {
      toast({
        title: t("ValidationErrorTitle"),
        description: t("ValidationItemNameMax"),
        variant: "destructive",
      });
      return;
    }
    if (trimmedDesc.length > 100) {
      toast({
        title: t("ValidationErrorTitle"),
        description: t("ValidationDescriptionMax"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("restaurant_id", restaurantId);
      formData.append("item_name", trimmedName);
      formData.append("description", trimmedDesc);
      formData.append("item_type", category);
      if (itemData.image) {
        formData.append("menuItemImg", itemData.image);
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
          title: t("ItemAddedTitle"),
          description: t("ItemAddedDescription"),
        });

        const newItem = response.data.data;
        setCategorizedItems((prev) => ({
          ...prev,
          [category]: [newItem, ...prev[category]],
        }));

        const newId = newItem?.id?.toString();
        if (newId) {
          const newSelectedItems = new Set(selectedItems);
          newSelectedItems.add(newId);
          setSelectedItems(newSelectedItems);
          setFormData((prev) => ({
            ...prev,
            item_list: Array.from(newSelectedItems),
          }));
        }

        // Reset form for this category
        setItemFormData((prev) => ({
          ...prev,
          [category]: {
            item_name: "",
            description: "",
            image: null,
            imagePreview: null,
            suggestions: [],
            activeSuggestionIndex: -1,
          },
        }));
      } else {
        throw new Error(response.data.message || "Failed to add item");
      }
    } catch (error) {
      toast({
        title: t("ItemAddErrorTitle"),
        description: t("ItemAddErrorDescription"),
        variant: "destructive",
      });
      console.error("Add item error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem({
      ...item,
      image: null,
      imagePreview: item.image_url ? `https://foodeus.truet.net/${item.image_url}` : null,
    });
    setIsModalOpen(true);
  };

  const updateEditedItem = async () => {
    if (!editingItem) return;

    const trimmedName = editingItem.item_name.trim();
    const trimmedDesc = editingItem.description?.trim() || "";

    if (!trimmedName) {
      toast({
        title: t("ValidationErrorTitle"),
        description: t("ValidationItemNameRequired"),
        variant: "destructive",
      });
      return;
    }
    if (trimmedName.length > 50) {
      toast({
        title: t("ValidationErrorTitle"),
        description: t("ValidationItemNameMax"),
        variant: "destructive",
      });
      return;
    }
    // if (trimmedDesc.length > 100) {
    //   toast({
    //     title: t("ValidationErrorTitle"),
    //     description: t("ValidationDescriptionMax"),
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("item_name", trimmedName);
      formData.append("description", trimmedDesc);
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
          title: t("ItemUpdatedTitle"),
          description: t("ItemUpdatedDescription"),
        });

        setCategorizedItems((prev) => {
          const updated = { ...prev };
          updated[editingItem.item_type] = updated[editingItem.item_type].map((item) =>
            item.id === editingItem.id ? response.data.data : item
          );
          return updated;
        });

        setIsModalOpen(false);
        setEditingItem(null);
      } else {
        throw new Error(response.data.message || "Failed to update item");
      }
    } catch (error) {
      toast({
        title: t("ItemUpdateFailedTitle"),
        description: t("ItemUpdateFailedDescription"),
        variant: "destructive",
      });
      console.error("Update item error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.item_list.length === 0) {
        toast({
          title: t("ValidationErrorTitle"),
          description: t("ValidationAtLeastOneItem"),
          variant: "destructive",
        });
        return;
      }
      if (!formData.item_name.trim()) {
        toast({
          title: t("ValidationErrorTitle"),
          description: t("ValidationMenuNameRequired"),
          variant: "destructive",
        });
        return;
      }
      // if (!formData.description.trim()) {
      //   toast({
      //     title: t("ValidationErrorTitle"),
      //     description: t("ValidationDescriptionRequired"),
      //     variant: "destructive",
      //   });
      //   return;
      // }
      if (!formData.price) {
        toast({
          title: t("ValidationErrorTitle"),
          description: t("ValidationPriceRequired"),
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("item_name", formData.item_name.trim());
      data.append("price", formData.price);
      data.append("menu_type", formData.menu_type);
      data.append("item_list", JSON.stringify(Array.from(selectedItems)));
      data.append("description", formData.description.trim());
      if (formData.image) {
        data.append("image_urls", formData.image);
      }

      const response = await apiClient.put(`/menus/update/${menuItemId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({
          title: t("MenuItemUpdatedTitle"),
          description: t("MenuItemUpdatedDescription"),
        });
        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error(response.data.message || "Failed to update menu item");
      }
    } catch (error) {
      toast({
        title: t("MenuItemUpdateErrorTitle"),
        description: t("MenuItemUpdateErrorDescription"),
        variant: "destructive",
      });
      console.error("Update menu error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItemId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.delete(
          `/menuitems/deleteRestaurantMenuItem/${selectedItemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast({
            title: t("MenuItemDeletedTitle"),
            description: t("MenuItemDeletedDescription"),
          });

          setCategorizedItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((category) => {
              updated[category] = updated[category].filter((item) => item.id !== selectedItemId);
            });
            return updated;
          });

          const newSelectedItems = new Set(selectedItems);
          newSelectedItems.delete(selectedItemId);
          setSelectedItems(newSelectedItems);
          setFormData((prev) => ({
            ...prev,
            item_list: Array.from(newSelectedItems),
          }));
        } else {
          throw new Error(response.data.message || "Failed to delete item");
        }
      } catch (error) {
        toast({
          title: t("MenuItemDeleteErrorTitle"),
          description: t("MenuItemDeleteErrorDescription"),
          variant: "destructive",
        });
        console.error("Delete error:", error);
      } finally {
        setIsLoading(false);
        setIsDialogOpen(false);
      }
    }
  };

  const renderCategorySection = (category: string) => {
    const items = categorizedItems[category];
    const form = itemFormData[category];

    return (
      <div className="space-y-4 mb-5">
        <h3 className="text-lg font-semibold">{t(category)}</h3>
        <div className="space-y-4">
          {/* Single Row: Item Name, Upload Item, Add Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
            {/* Item Name with Autocomplete */}
            <div className="flex-1 space-y-2 px-2 relative">
              <Label htmlFor={`item_name-${category}`}>
                {t("ItemName")} <span className="text-danger">*</span>
              </Label>
              <Input
                id={`item_name-${category}`}
                name="item_name"
                placeholder={t("EnterItemName")}
                value={form.item_name}
                onChange={(e) => handleItemChange(category, e)}
                maxLength={50}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")
                    .replace(/^\s+/g, "");
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setItemFormData((prev) => ({
                      ...prev,
                      [category]: {
                        ...prev[category],
                        activeSuggestionIndex:
                          prev[category].activeSuggestionIndex < prev[category].suggestions.length - 1
                            ? prev[category].activeSuggestionIndex + 1
                            : 0,
                      },
                    }));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setItemFormData((prev) => ({
                      ...prev,
                      [category]: {
                        ...prev[category],
                        activeSuggestionIndex:
                          prev[category].activeSuggestionIndex > 0
                            ? prev[category].activeSuggestionIndex - 1
                            : prev[category].suggestions.length - 1,
                      },
                    }));
                  } else if (e.key === "Enter" && form.activeSuggestionIndex >= 0) {
                    e.preventDefault();
                    const selected = form.suggestions[form.activeSuggestionIndex];
                    if (selected) {
                      setItemFormData((prev) => ({
                        ...prev,
                        [category]: {
                          ...prev[category],
                          item_name: selected,
                          suggestions: [],
                          activeSuggestionIndex: -1,
                        },
                      }));
                    }
                  }
                }}
              />
              {form.suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow z-50 max-h-40 overflow-y-auto">
                  {form.suggestions.map((itemName, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 cursor-pointer text-sm ${
                        index === form.activeSuggestionIndex
                          ? "bg-gray-200 text-black font-medium"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setItemFormData((prev) => ({
                          ...prev,
                          [category]: {
                            ...prev[category],
                            item_name: itemName,
                            suggestions: [],
                            activeSuggestionIndex: -1,
                          },
                        }));
                      }}
                    >
                      {itemName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Upload Item Button */}
            <div className="flex-1 space-y-2">
              <Label htmlFor={`image-${category}`} className="sm:hidden">
                {t("ItemImageClickToChange")}
              </Label>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => document.getElementById(`image-${category}`)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("UploadItemImage")}
              </Button>
              <Input
                id={`image-${category}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleItemImageChange(category, e)}
              />
            </div>

            {/* Add Button */}
            <Button
              onClick={() => handleAddItem(category)}
              disabled={isLoading || !form.item_name.trim()}
              className="w-full sm:w-auto"
              style={{ alignSelf: "center" }}
            >
              {t("AddItem")}
            </Button>
          </div>

          {/* Added Items */}
          {items.length > 0 && (
            <div className="mt-6 space-y-4">
              <Label className="text-sm font-semibold text-gray-800">{t("ExistingMenuItems")}</Label>
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
                          <h4
                            className="font-semibold text-sm text-gray-900 resName"
                            style={{
                              wordBreak: "break-all",
                              whiteSpace: "normal",
                            }}
                          >
                            {item.item_name}
                          </h4>
                          <p className="text-xs text-gray-500">{t(item.item_type)}</p>
                        </div>
                      </div>
                      {/* <p
                        className="text-sm text-gray-700 mb-1"
                        style={{
                          wordBreak: "break-all",
                          whiteSpace: "normal",
                        }}
                      >
                        {item.description || (
                          <em className="text-gray-400">{t("NoDescription")}</em>
                        )}
                      </p> */}
                      <div className="flex justify-end mt-2">
                        <span
                          className="text-xs text-danger"
                          onClick={() => handleOpenDialog(item.id)}
                        >
                          {t("Remove")}
                        </span>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

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
        <h1 className="text-3xl font-bold tracking-tight">{t("EditMenuItem")}</h1>
        <p className="text-muted-foreground">{t("ModifyDetailsBelow")}</p>
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
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === 1 ? "text-primary" : "text-gray-600"
                }`}
              >
                {t("EditItemDetails")}
              </span>
            </div>

            {/* Connector Line */}
            <div
              className={`mx-4 h-1 w-16 rounded ${
                step === 2 ? "bg-primary" : "bg-gray-300"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step === 2
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === 2 ? "text-primary" : "text-gray-600"
                }`}
              >
                {t("ManageMenuItems")}
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
              <CardTitle>{t("EditItemDetails")}</CardTitle>
              <CardDescription>{t("ModifyDetailsBelow")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Menu Image */}
              <div className="space-y-2">
                <Label>
                  {t("ItemImageClickToChange")} 
                </Label>
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
                      <p className="text-sm font-medium">{t("ClickToUploadItemImage")}</p>
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("Description")} 
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t("EnterItemDescription")}
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={150}
                  required
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/admin/restaurants/${restaurantId}`}>{t("Cancel")}</Link>
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.item_name  || !formData.price}
              >
                {t("Next")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 2: Manage Menu Items */}
      {step === 2 && (
        <div className="space-y-8 mb-2">
          {["Starter", "MainDish", "Dessert", "Drinks"].map((category) => renderCategorySection(category))}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              {t("Back")}
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || formData.item_list.length === 0}>
              {isLoading ? t("Updating") : t("UpdateMenuItem")}
            </Button>
          </div>
        </div>
      )}

      {/* Dialog for confirming item deletion */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogOverlay className="bg-black/10 fixed inset-0 transition-opacity" />
        <DialogContent
          className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              {t("ConfirmDeletion")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-1">
              {t("ConfirmDeleteMenuItem")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 flex justify-between">
            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto">
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto"
            >
              {t("ConfirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isModalOpen && editingItem && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogOverlay className="bg-black/10 fixed inset-0 transition-opacity" />
          <DialogContent
            className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                {t("EditMenuItem")}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-center mt-1">
                {t("UpdateItemDetails")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="modal-image">{t("ItemImage")}</Label>
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("modal-image")?.click()}
                >
                  {editingItem.imagePreview || editingItem.image_url ? (
                    <div className="relative">
                      <img
                        src={editingItem.imagePreview || `https://foodeus.truet.net/${editingItem.image_url}`}
                        alt="Preview"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
                        }}
                        className="mx-auto max-h-[200px] rounded-md object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                        <span className="text-white font-medium">{t("ChangeImage")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                      <p className="text-sm">{t("ClickToUpload")}</p>
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
                        if (!file.type.startsWith("image/")) {
                          toast({
                            title: t("ToastInvalidFileTypeTitle"),
                            description: t("ToastInvalidFileTypeMessage"),
                            variant: "destructive",
                          });
                          return;
                        }
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
                <Label>
                  {t("ItemName")} <span className="text-danger">*</span>
                </Label>
                <Input
                  maxLength={50}
                  value={editingItem.item_name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item_name: e.target.value,
                    })
                  }
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "")
                      .replace(/^\s+/g, "");
                  }}
                />
              </div>

              {/* <div>
                <Label>{t("Description")}</Label>
                <Textarea
                  value={editingItem.description}
                  maxLength={100}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "")
                      .replace(/^\s+/g, "");
                  }}
                />
              </div> */}
            </div>

            <DialogFooter className="mt-5">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={updateEditedItem} disabled={isLoading}>
                {isLoading ? t("Updating") : t("SaveChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )} 
    </div>
  );
}