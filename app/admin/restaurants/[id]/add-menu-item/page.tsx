"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
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
export default function AddMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setModalLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Use Set for unique items
  const [items, setItems] = useState<any[]>([]); // API-fetched items
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for item selection
  // const [isEmptyItemPromptOpen, setIsEmptyItemPromptOpen] = useState(false); // Empty item list modal state
  const [loadingItems, setLoadingItems] = useState(true); // Add loading state for item fetch
  const [selectedItem, setSelectedItem] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState({
    item_name: "",
    description: "",
    image: null as File | null,
  });
  const [newItems, setNewItems] = useState<any[]>([]);
  const currentItems = [...newItems];
  // console.log("Current Items:", currentItems); // Debugging line

  const [modalImagePreview, setModalImagePreview] = useState<string | null>(
    null
  );

  const restaurantId = params.id as string;

  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    price: "",
    menu_type: "Today's Special",
    image: null as File | null,
    item_list: [] as string[], // Change to array
  });

  const [customMenuType, setCustomMenuType] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setModalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setModalFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setModalImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, menu_type: value }));
    if (value !== "Other") {
      setCustomMenuType("");
    }
  };

  // console.log("Selected Items:", formData, selectedItems); // Debugging line
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

      // console.log(formData.item_list, "itemList");
      if (!formData.menu_type) {
        toast({
          title: t("ToastMenuCategoryMissingTitle"),
          description: t("ToastMenuCategoryMissingMessage"),
          variant: "destructive",
        });
        return;
      }
      if (!formData.image) {
        toast({
          title: t("ToastDishImageMissingTitle"),
          description: t("ToastDishImageMissingMessage"),
          variant: "destructive",
        });
        return;
      }
      // if (formData.item_list.length === 0) {
      //   toast({
      //     title: "Warning !",
      //     description: "Please Add at least one item to the menu",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      data.append("restaurant_id", restaurantId);
      data.append("item_name", formData.item_name.trim());
      data.append("price", formData.price);
      data.append(
        "menu_type",
        formData.menu_type === "Other"
          ? customMenuType
          : formData.menu_type || ""
      );
      formData.item_list.forEach((item) => data.append("item_list[]", item)); // Append as array
      data.append("description", formData.description.trim());
      if (formData.image) {
        data.append("image_urls", formData.image);
      }

      const response = await apiClient.post("/menus/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data, "response data");
      if (response.data.success) {
        toast({
          title: t("ToastMenuAddSuccessTitle"),
          description: t("ToastMenuAddSuccessMessage"),
        });

        router.push(`/admin/restaurants/${restaurantId}`);
      } else {
        throw new Error("Failed to add menu ");
      }
    } catch (error) {
      toast({
        title: t("ToastMenuAddErrorTitle"),
        description: t("ToastMenuAddErrorMessage"),
        variant: "destructive",
      });
      console.error("Add Menu Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get(
        `/menuitems/getRestaurantMenuItemList/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("API Response:", response.data); // Debug here
      if (response.data.success) {
        setItems(response.data.data);
      }
      if (response.data.data.length === 0) {
        // setIsEmptyItemPromptOpen(true);
      }
    } catch (error) {
      console.error("Fetch Items Error:", error);
      // setIsEmptyItemPromptOpen(true);
    } finally {
      setLoadingItems(false);
    }
  };
  useEffect(() => {
    fetchItems();
  }, [restaurantId]);

  const handleModalSubmit = async () => {
    if (!modalFormData.item_name.trim()) {
      toast({
        title: t("ToastItemNameMissingTitle"),
        variant: "destructive",
      });
      return;
    }
    setModalLoading(true);
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("restaurant_id", restaurantId);
    data.append("item_name", modalFormData.item_name.trim());
    data.append("description", modalFormData.description.trim());
    data.append("item_type", selectedItem);
    if (modalFormData.image) {
      data.append("menuItemImg", modalFormData.image);
    }
    try {
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
        toast({
          title: t("ToastItemAddSuccessTitle"),
          description: t("ToastItemAddSuccessMessage"),
        });

        // Add to selecteItems
        const newItemId = response.data.data?.id?.toString();
        const newItem = {
          id: newItemId,
          item_name: modalFormData.item_name,
          description: modalFormData.description,
          image_url: response.data.data?.image_url || "", // or set fallback
          item_type: selectedItem,
        };

        setNewItems((prev) => [newItem, ...prev]);

        if (newItemId) {
          const newSelectedItems = new Set(selectedItems);
          newSelectedItems.add(newItemId);
          setSelectedItems(newSelectedItems);
          setFormData((prev) => ({
            ...prev,
            item_list: Array.from(newSelectedItems),
          }));
        }

        setModalFormData({ item_name: "", description: "", image: null });
        setModalImagePreview(null);
        setIsModalOpen(false);
        setSelectedItem("");
        // fetchItems();
      }
    } catch (error) {
      toast({
        title: t("ToastItemAddErrorTitle"),
        description: t("ToastItemAddErrorMessage"),
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
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

        // Check if the deletion was successful
        if (response.data.success) {
          // Show success toast
          toast({
            title: t("ToastItemDeleteSuccessTitle"),
            description: t("ToastItemDeleteSuccessMessage"),
          });

          setNewItems((prevItems) =>
            prevItems.filter((item) => item.id !== selectedItemId)
          );

          // Optionally, refresh the item list or update the local state
          // Example: fetchItemList(); // This could refetch the list of items or update the local state
        } else {
          throw new Error(response.data.message || "Failed to delete item");
        }
      } catch (error) {
        toast({
          title: t("ToastItemDeleteErrorTitle"),
          description: t("ToastItemDeleteErrorMessage"),
          variant: "destructive",
        });
        console.error("Delete error:", error);
      }

      setIsDialogOpen(false); // Close the dialog after confirming
    }
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
        <h1 className="text-3xl font-bold tracking-tight">{t("AddMenu")}</h1>
        <p className="text-muted-foreground">{t("AddMenuDescription")}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("MenuItemDetails")}</CardTitle>
            <CardDescription>{t("MenuItemDetailsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Menu Image */}
            <div className="space-y-2">
              <Label>
                {t("MenuImage")} <span className="text-danger">*</span>
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
                      <p className="text-white font-medium">
                        {t("ChangeImage")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      {t("UploadItemImage")}
                    </p>
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
                    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, "");
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t("Description")} <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t("EnterItemDescription")}
                value={formData.description}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                required
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, "");
                }}
              />
            </div>

            {/* Price and Menu Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              {/* <div className="space-y-2">
                <Label htmlFor="menu_type">Menu Type <span className="text-danger">*</span></Label>
                <Select value={formData.menu_type} onValueChange={handleSelectChange}>
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
              </div> */}
              {/* <div className="space-y-2">
              <Label htmlFor="item_list">Item List <span className="text-danger">*</span></Label>
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full justify-start"
              >
                {selectedItems.size > 0
                  ? `${selectedItems.size} item(s) selected`
                  : "Select Items from List"}
                    <ChevronDownIcon className="w-5 h-5 ml-2" />
              </Button>
              {selectedItems.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected Items Count: {selectedItems.size}
                </div>
              )}
      
            </div> */}

              <div className="space-y-2">
                <Label htmlFor="item_list">
                  {t("CategoryList")}
                </Label>

                <Select
                  value={selectedItem}
                  onValueChange={(value) => {
                    setSelectedItem(value);
                    setIsModalOpen(true);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("SelectCategoryFromList")} />
                    {/* <ChevronDownIcon className="w-5 h-5 ml-2" /> */}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="Starter"
                      onClick={() => {
                        setSelectedItem("Starter");
                        setIsModalOpen(true);
                      }}
                    >
                      {t("Starter")}
                    </SelectItem>
                    <SelectItem
                      value="MainDish"
                      onClick={() => {
                        setSelectedItem("MainDish");
                        setIsModalOpen(true);
                      }}
                    >
                      {t("MainDish")}
                    </SelectItem>
                    <SelectItem
                      value="Dessert"
                      onClick={() => {
                        setSelectedItem("Dessert");
                        setIsModalOpen(true);
                      }}
                    >
                      {t("Dessert")}
                    </SelectItem>
                    <SelectItem
                      value="Drinks"
                      onClick={() => {
                        setSelectedItem("Drinks");
                        setIsModalOpen(true);
                      }}
                    >
                      {t("Drinks")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* {selectedItem && (
                  <div className="text-sm text-muted-foreground">
                    Selected Item: {selectedItem}
                  </div>
                )} */}
              </div>
            </div>

            {/* Custom Menu Type */}
            {/* {formData.menu_type === "Other" && (
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
            )} */}

            {/* Menu Items Preview */}

            {/* Menu Items Preview */}
            {/* {currentItems.length > 0 && (
              <div className="mt-6 space-y-4">
                <Label className="text-sm font-semibold text-gray-800">
                  Existing Menu Items
                </Label>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 shadow-sm bg-white"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={`https://foodeus.truet.net/${item.image_url}`}
                          alt={item.item_name}
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
                  ))}
                </div>
              </div>
            )} */}
            {currentItems.length > 0 && (
              <div className="mt-6 space-y-4">
                <Label className="text-sm font-semibold text-gray-800">
                  {t("ExistingMenuItems")}
                </Label>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 shadow-sm bg-white flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={`https://foodeus.truet.net/${item.image_url}`}
                          alt={item.item_name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://foodeus.truet.net/menuItemImg/1744265346165-restfall.jpeg";
                          }}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                        <div className="flex flex-col">
                          {/* Item Name */}
                          <h4
                            className="font-semibold text-sm text-gray-900 resName"
                            style={{
                              wordBreak: "break-all", // Breaks long words that have no spaces
                              whiteSpace: "normal", // Allows text to wrap normally
                            }}
                          >
                            {item.item_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {t(item.item_type)}
                          </p>
                        </div>
                      </div>

                      {/* Item Description */}
                      <CardDescription
                        className="text-sm text-gray-700 mb-1 "
                        style={{
                          wordBreak: "break-all", // Breaks long words that have no spaces
                          whiteSpace: "normal", // Allows text to wrap normally
                        }}
                      >
                        {item.description || (
                          <em className="text-gray-400">
                            {t("NoDescription")}
                          </em>
                        )}
                      </CardDescription>

                      {/* Button to remove item */}
                      <div className="flex justify-end mt-2">
                        <button
                          className="text-xs text-danger"
                          onClick={() => handleOpenDialog(item.id)}
                        >
                          {t("Remove")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dialog for confirming item deletion */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                  {t("ConfirmDeletion")}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-center mt-1">
                    {t("DeleteMenuItemPrompt")}
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-5 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="w-full sm:w-auto"
                  >
                    {t("Cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    className="w-full sm:w-auto"
                  >
                    {t("ConfirmDeletion")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/restaurants/${restaurantId}`}>
                {t("Cancel")}
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("Adding") : t("AddMenu")}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setSelectedItem(""); // <-- Reset selectedItem when Dialog closes
            }
          }}
          className="transition-opacity duration-500 ease-in-out opacity-0"
        >
          <DialogContent className="w-full max-w-md bg-white shadow-lg rounded-lg px-4 py-6 sm:px-6 sm:py-8">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                {t('AddMenuItem')}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-center mt-1">
                {/* {`Add ${
                  selectedItem == "MainDish" ? " Main Dish" : selectedItem
                } Item Details`} */}
                {t('AddItemDetails').replace("{item}", selectedItem)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 mt-4">
              {t("ImageUpload")}
              <div>
                <Label
                  htmlFor="item-image"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("UploadImage")}
                </Label>
                <input
                  type="file"
                  id="item-image"
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  onChange={handleModalImageChange}
                />
              </div>

              {/* Item Name */}
              <div>
                <Label
                  htmlFor="item-name"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("ItemName")} <span className="text-danger">*</span>
                </Label>
                <input
                  type="text"
                  id="item-name"
                  name="item_name"
                  maxLength={60}
                  placeholder={t("EnterItemName")}
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  value={modalFormData.item_name}
                  onChange={handleModalChange}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove invalid characters (anything that's not a letter, number, or space)
                      .replace(/^\s+/g, "");
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="item-description"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("Description")}{" "}
                  <span className="text-gray-400 font-normal">
                    ({t("Optional")})
                  </span>
                </Label>
                <textarea
                  id="item-description"
                  name="description"
                  rows={3}
                  maxLength={150}
                  placeholder={t("EnterItemDescription")}
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  value={modalFormData.description}
                  onChange={handleModalChange}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove invalid characters (anything that's not a letter, number, or space)
                      .replace(/^\s+/g, "");
                  }}
                />
              </div>
            </div>

            {/* Footer Button */}
            <DialogFooter className="mt-5">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleModalSubmit}
                disabled={isModalLoading}
              >
                {isModalLoading ? t("Adding") : t("AddItem")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Empty Item Prompt Modal */}
      {/* {isEmptyItemPromptOpen && (
        <Dialog open={isEmptyItemPromptOpen} onOpenChange={setIsEmptyItemPromptOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Empty Item List</DialogTitle>
              <DialogDescription className="text-gray-600">
                You need to add at least one item. Would you like to add a new item?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between space-x-4 w-full">
              <Button variant="outline" onClick={() => setIsEmptyItemPromptOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="outline"
                onClick={() => {
                  setIsEmptyItemPromptOpen(false);
                  router.push(`/admin/restaurants/${restaurantId}/add-item`);
                }}
                className="flex-1"
              >
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )} */}
    </div>
  );
}
