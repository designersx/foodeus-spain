"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Info, Upload, Download, ArrowLeft } from "lucide-react";
import { apiClient } from "@/services/apiService";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface XLSXRow {
  Sr_No: number;
  Menu_Name: string;
  Price: string;
  Menu_Description: string;
  Category: string;
  Item_Name: string;
  Item_Description: string;
}

const VALID_CATEGORIES = ["Starter", "Main Dish", "Dessert", "Drinks"];

export default function ImportMenuXLSX() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xlsxData, setXlsxData] = useState<XLSXRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasInvalidData, setHasInvalidData] = useState(false);
  const params = useParams();
  const restaurantId = params.id as string;
  // Handle XLSX file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target?.result as string;
      const wb = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];

      const data: XLSXRow[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      const headers = data[0] as string[];
      if (
        headers &&
        headers.includes("Menu_Name") &&
        headers.includes("Price") &&
        headers.includes("Category")
      ) {
        const rows = data.slice(1);
        const formattedData = rows.map((row: string[]) => ({
          Sr_No: row[0] || "",
          Menu_Name: row[1] || "",
          Price: row[2] || "",
          Menu_Description: row[3] || "",
          Category: row[4] || "",
          Item_Name: row[5] || "",
          Item_Description: row[6] || "",
        }));

        // Validate data
        const isValid = formattedData.every(
          (row) =>
            row.Menu_Name &&
            row.Price &&
            row.Menu_Description &&
            VALID_CATEGORIES.includes(row.Category)
        );
        setHasInvalidData(!isValid);

        setXlsxData(formattedData);
        setActiveTab("preview");
        setSelectedFile(file);
        toast({
          title: "Menu Uploaded",
          description: `Successfully loaded ${formattedData.length} rows.${
            isValid ? "" : " Some rows have invalid data."
          }`,
        });
      } else {
        toast({
          title: "Invalid File",
          description:
            "The uploaded file must have headers: Menu_Name, Price, Category.",
          variant: "destructive",
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  // Handle download of sample XLSX template with category dropdown options
  const handleDownloadSample = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Menu");

    // Define columns
    worksheet.columns = [
      { header: "Sr No", key: "Sr_No", width: 10 },
      { header: "Menu_Name", key: "Menu_Name", width: 20 },
      { header: "Price", key: "Price", width: 15 },
      { header: "Menu_Description", key: "Menu_Description", width: 30 },
      { header: "Category", key: "Category", width: 20 },
      { header: "Item_Name", key: "Item_Name", width: 25 },
      { header: "Item_Description", key: "Item_Description", width: 40 },
    ];
    // Add sample rows
    const sampleData = [
      [
        "Sr No",
        "Menu_Name",
        "Price",
        "Menu_Description",
        "Category",
        "Item_Name",
        "Item_Description",
      ],
      [
        1,
        "Italian Feast",
        22.99,
        "Classic Italian menu",
        "Starter",
        "Bruschetta",
        "Toasted bread with tomatoes and basil",
      ],
      [
        1,
        "Italian Feast",
        22.99,
        "Classic Italian menu",
        "Main Dish",
        "Lasagna",
        "Pasta layered with cheese and sauce",
      ],
      [
        1,
        "Italian Feast",
        22.99,
        "Classic Italian menu",
        "Dessert",
        "Tiramisu",
        "Coffee-flavored Italian dessert",
      ],
      [
        1,
        "Italian Feast",
        22.99,
        "Classic Italian menu",
        "Drinks",
        "Limoncello",
        "Sweet Italian lemon liqueur",
      ],
      [
        2,
        "American BBQ",
        19.99,
        "Traditional BBQ menu",
        "Starter",
        "Buffalo Wings",
        "Spicy fried chicken wings",
      ],
      [
        2,
        "American BBQ",
        19.99,
        "Traditional BBQ menu",
        "Main Dish",
        "BBQ Ribs",
        "Tender ribs with BBQ sauce",
      ],
      [
        2,
        "American BBQ",
        19.99,
        "Traditional BBQ menu",
        "Dessert",
        "Apple Pie",
        "Cinnamon apple pie",
      ],
      [
        2,
        "American BBQ",
        19.99,
        "Traditional BBQ menu",
        "Drinks",
        "Iced Tea",
        "Refreshing cold tea with lemon",
      ],
    ];

    sampleData.forEach((row, index) => {
      if (index === 0) return; // Skip header
      worksheet.addRow(row);
    });

    // Define the dropdown options for the Category column
    const categories = ["Starter", "Main Dish", "Dessert", "Drinks"];
    const categoryList = `"${categories.join(",")}"`; // e.g., "Starter,Main Dish,Dessert,Drinks"

    // Apply data validation to the "Category" column (Column D) for data rows
    const startRow = 2; // Start from row 2 (after header)
    const endRow = sampleData.length; // Number of data rows + header
    for (let row = startRow; row <= endRow; row++) {
      const cell = worksheet.getCell(`E${row}`);
      cell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [categoryList], // Use formulae array for list
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: "Invalid Category",
        error: "Please select a category from the list.",
      };
    }

    // Optionally, add more rows with dropdowns for user input
    for (let row = endRow + 1; row <= endRow; row++) {
      const cell = worksheet.getCell(`D${row}`);
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [categoryList],
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: "Invalid Category",
        error: "Please select a category from the list.",
      };
    }

    // Save the workbook to a file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu_sample_with_dropdown.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle file upload to backend
  const handleUpload = async () => {
    if (xlsxData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload an XLSX file first.",
        variant: "destructive",
      });
      return;
    }

    // if (hasInvalidData) {
    //   toast({
    //     title: "Invalid Data",
    //     description:
    //       "Please ensure all rows have valid Menu_Name, Price, and Category values.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsLoading(true);
    try {
      const formData = new FormData();
      const token = localStorage.getItem("token");
      if (!selectedFile) {
        throw new Error("No file selected.");
      }
      const menuMap = new Map<string, any>();
      xlsxData.forEach((row) => {
        const menuKey = row.Menu_Name.trim();

        if (!menuMap.has(menuKey)) {
          menuMap.set(menuKey, {
            restaurant_id: restaurantId, // 🔥 Change to dynamic restaurant_id if needed!
            menu_name: row.Menu_Name,
            price: parseFloat(row.Price),
            menu_description: row.Menu_Description || "",
            menu_type: row.Category == "Main Dish" ? "MainDish" : row.Category, // "Starter", "Main Dish", etc.
            items: [],
          });
        }

        // Push item into items array
        menuMap.get(menuKey).items.push({
          item_name: row.Item_Name,
          item_description: row.Item_Description || "",
          menu_type: row.Category == "Main Dish" ? "MainDish" : row.Category, // "Starter", "Dessert", etc.
        });
      });

      const payload = {
        menus: Array.from(menuMap.values()),
      };
      console.log("Sending Payload:", payload); // Debugging
      //   formData.append("file", selectedFile);

      const response = await apiClient.post(
        "/menus/uploadRestaurantMenusWithItems",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response); // Debugging
      if (response.status !== 201) {
        throw new Error("Server responded with an error.");
      }

      toast({
        title: "Success",
        description: `Successfully imported ${xlsxData.length} menu items.`,
      });

      setXlsxData([]);
      setFileName(null);
      setSelectedFile(null);
      setActiveTab("upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload XLSX file. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden px-4 py-6">
      
      <div className="flex-1 overflow-y-auto">
     
        <Card className="shadow-lg border-0 overflow-hidden">
        <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/restaurants/${restaurantId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurant
        </Link>
      </Button>
          <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 text-black">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Import Restaurant Menu
            </CardTitle>
            <CardDescription className="text-primary-foreground/90 mt-1">
              Upload your menu items in XLSX format or download our template to
              get started
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full rounded-none border-b grid grid-cols-2">
                <TabsTrigger
                  value="upload"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2"
                >
                  Upload XLSX
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  disabled={xlsxData.length === 0}
                >
                  Preview Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="p-6 space-y-6 mt-2">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    All fields marked as required (Menu_Name, Price, Category)
                    must be filled. Category must be one of:{" "}
                    {VALID_CATEGORIES.join(", ")}. Download our sample template
                    to see the correct format.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="xlsx-upload"
                        className="text-base font-medium mb-2 block"
                      >
                        Upload XLSX File
                      </Label>
                      <div
                        className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Drag and drop your XLSX file here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported format: .xlsx
                        </p>
                        <Input
                          id="xlsx-upload"
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </div>
                      {fileName && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Selected:</span>{" "}
                          {fileName}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleDownloadSample}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Sample
                      </Button>

                      <Button
                        onClick={handleUpload}
                        disabled={
                          isLoading || xlsxData.length === 0 || hasInvalidData
                        }
                        className="gap-2"
                      >
                        {isLoading ? (
                          <span>Uploading...</span>
                        ) : (
                          <span>Upload Now</span>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Required Fields
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Menu_Name
                        </Badge>
                        <span className="text-sm">
                          Name of the menu (e.g., Italian Feast)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Price
                        </Badge>
                        <span className="text-sm">
                          Price of the menu (numeric value)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Menu_Description
                        </Badge>
                        <span className="text-sm">
                          Brief description about the menu
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Category
                        </Badge>
                        <span className="text-sm">
                          Menu category (Starter, Main Dish, Dessert, Drinks)
                        </span>
                      </li>
                    </ul>

                    <h3 className="text-lg font-medium pt-2 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Optional Fields
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Item_Name
                        </Badge>
                        <span className="text-sm">
                          Name of an item inside the menu
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Item_Description
                        </Badge>
                        <span className="text-sm">
                          Detailed description of the item
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                {xlsxData.length > 0 ? (
                  <div>
                    <div className="p-4 flex items-center justify-between border-b">
                      <div>
                        <h3 className="text-lg font-medium">Preview Data</h3>
                        <p className="text-sm text-muted-foreground">
                          {xlsxData.length} rows loaded
                          {hasInvalidData && " (some rows have invalid data)"}
                        </p>
                      </div>
                      <Button
                        onClick={handleUpload}
                        disabled={isLoading || xlsxData.length === 0}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <span>Uploading...</span>
                        ) : (
                          <span>Upload Now</span>
                        )}
                      </Button>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <Table className="min-w-[1000px]">
                        <TableHeader className="bg-muted/50 sticky top-0">
                          <TableRow>
                            <TableHead className="font-semibold">
                              Menu Sr No
                            </TableHead>
                            <TableHead className="font-semibold">
                              Menu Name*
                            </TableHead>
                            <TableHead className="font-semibold">
                              Price*
                            </TableHead>
                            <TableHead className="font-semibold">
                              Menu Description*
                            </TableHead>
                            <TableHead className="font-semibold">
                              Category*
                            </TableHead>
                            <TableHead className="font-semibold">
                              Item Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Item Description
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {xlsxData.map((row, index) => {
                            const isValid =
                              !!row.Menu_Name &&
                              !!row.Price &&
                              VALID_CATEGORIES.includes(row.Category);
                            return (
                              <TableRow
                                key={index}
                                className={!isValid ? "bg-destructive/10" : ""}
                              >
                                <TableCell>{row.Sr_No}</TableCell>
                                <TableCell>
                                  {row.Menu_Name || (
                                    <span className="text-destructive">
                                      Missing
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {row.Price || (
                                    <span className="text-destructive">
                                      Missing
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {row.Menu_Description || (
                                    <span className="text-destructive">
                                      Missing
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {row.Category &&
                                  VALID_CATEGORIES.includes(row.Category) ? (
                                    row.Category
                                  ) : (
                                    <span className="text-destructive">
                                      {row.Category || "Missing"} (Invalid)
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>{row.Item_Name || "-"}</TableCell>
                                <TableCell>
                                  {row.Item_Description || "-"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Data to Preview
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Upload an XLSX file first to preview your data.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
