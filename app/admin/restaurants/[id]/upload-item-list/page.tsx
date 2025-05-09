"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Download, Upload, FileText, AlertCircle, Check, Info,ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/services/apiService";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface CSVRow {
  Item_Name: string;
  Price: string;
  Description?: string;
  Image_URL?: string;
  Item_Type: string;
  Menu_ID: string;
}

export default function UploadMenuItemsCSV() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const params = useParams();
  const restaurantId = params.id as string;
  const router = useRouter();
// console.log('restaurantId',restaurantId)
  const sampleCSV = `Item_Name,Price,Description,Image_URL,Item_Type,Menu_ID
  "Grilled Chicken",14.99,"A grilled chicken item","https://example.com/grilled-chicken.jpg","Main Course","1"
  "Veggie Burger",12.99,"A healthy veggie burger","https://example.com/veggie-burger.jpg","Main Course","1"
  "Pasta",10.50,"A creamy pasta dish","https://example.com/pasta.jpg","Main Course","2"`;

  const expectedMenuHeaders = ["Item_Name", "Price", "Description", "Image_URL", "Item_Type", "Menu_ID"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row);

      const headers = rows[0].split(",").map((h) => h.trim());

      const missingHeaders = expectedMenuHeaders.filter((header) => !headers.includes(header));
      const extraHeaders = headers.filter((header) => !expectedMenuHeaders.includes(header));

      if (missingHeaders.length > 0) {
        toast({
          title: "Error",
          description: `Missing required fields: ${missingHeaders.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      if (extraHeaders.length > 0) {
        toast({
          title: "Error",
          description: `Extra fields detected: ${extraHeaders.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      try {
        const data = rows.slice(1).map((row) => {
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = "";

          for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(currentValue);
              currentValue = "";
            } else {
              currentValue += char;
            }
          }

          values.push(currentValue);

          return headers.reduce((obj, header, index) => {
            obj[header as keyof CSVRow] = values[index]?.replace(/^"|"$/g, "") || "";
            return obj;
          }, {} as CSVRow);
        });

        setCsvData(data);
        setActiveTab("preview");
        setSelectedFile(file);
        toast({
          title: "CSV Loaded",
          description: `Successfully loaded ${data.length} rows of data.`,
        });
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_menu_items_import.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sample Downloaded",
      description: "Sample CSV template has been downloaded.",
    });
  };

  const validateRow = (row: CSVRow) => ({
    isValid: !!row.Item_Name && !!row.Price && !!row.Item_Type && !!row.Menu_ID,
    missingFields: [
      !row.Item_Name && "Item_Name",
      !row.Price && "Price",
      !row.Item_Type && "Item_Type",
      !row.Menu_ID && "Menu_ID",
    ].filter(Boolean) as string[],
  });

  const handleUpload = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    const invalidRows = csvData
      .map((row, index) => {
        const { isValid, missingFields } = validateRow(row);
        return !isValid ? { index, missingFields } : null;
      })
      .filter(Boolean);

    if (invalidRows.length > 0) {
      toast({
        title: "Validation Error",
        description: `${invalidRows.length} rows have missing required fields.`,
        variant: "destructive",
      });
      setActiveTab("preview");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      const token = localStorage.getItem("token");
      if (!selectedFile) {
        throw new Error("No file selected.");
      }

      formData.append("file", selectedFile);
      const response = await apiClient.post(`/menuitems/uploadCSV/${restaurantId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 201) {
        throw new Error("Server responded with an error.");
      }

      toast({
        title: "Success",
        description: `Successfully imported ${csvData.length} menu items.`,
      });

      setCsvData([]);
      setFileName(null);
      setSelectedFile(null);
      setActiveTab("upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload CSV file. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const invalidRowsCount = csvData.filter((row) => !validateRow(row).isValid).length;

  return (
    <div className="flex flex-col h-full overflow-hidden px-4 py-6">
        <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/restaurants/${restaurantId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Restaurant
          </Link>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 text-black">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Import Menu Items
            </CardTitle>
            <CardDescription className="text-primary-foreground/90 mt-1">
              Upload your menu items in CSV format or download our template to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full rounded-none border-b grid grid-cols-2">
                <TabsTrigger
                  value="upload"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2"
                >
                  Upload CSV
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2"
                  disabled={csvData.length === 0}
                >
                  Preview Data{" "}
                  {invalidRowsCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {invalidRowsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="p-6 space-y-6 mt-2">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    All fields marked as required must be filled. Download our sample template to see the correct format.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-upload" className="text-base font-medium mb-2 block">
                        Upload CSV File
                      </Label>
                      <div
                        className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Drag and drop your CSV file here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">Supported format: .csv</p>
                        <Input
                          id="csv-upload"
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </div>
                      {fileName && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Selected:</span> {fileName}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <Button variant="outline" onClick={handleDownloadSample} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Sample
                      </Button>

                      <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Now
                          </>
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
                        <Badge variant="outline" className="font-mono">Item_Name</Badge>
                        <span className="text-sm">Name of the menu item</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">Price</Badge>
                        <span className="text-sm">Price of the item (numeric value)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">Item_Type</Badge>
                        <span className="text-sm">Type of item (e.g., Starters,Main Course,Desserts,Beverages)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">Menu_ID</Badge>
                        <span className="text-sm">Menu ID associated with the item</span>
                      </li>
                    </ul>

                    <h3 className="text-lg font-medium pt-2 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Optional Fields
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">Description</Badge>
                        <span className="text-sm">Detailed description of the item</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">Image_URL</Badge>
                        <span className="text-sm">URL to the item's image</span>
                      </li>
                    </ul>
                  </div>
                </div>

            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {csvData.length > 0 ? (
                <div>
                  <div className="p-4 flex items-center justify-between border-b">
                    <div>
                      <h3 className="text-lg font-medium">Preview Data</h3>
                      <p className="text-sm text-muted-foreground">
                        {csvData.length} rows loaded • {invalidRowsCount} rows with missing required fields
                      </p>
                    </div>
                    <Button onClick={handleUpload} disabled={isLoading || invalidRowsCount > 0} className="gap-2">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Now
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[1000px]">
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                          <TableHead className="font-semibold w-10">#</TableHead>
                          <TableHead className="font-semibold">Item Name*</TableHead>
                          <TableHead className="font-semibold">Price*</TableHead>
                          <TableHead className="font-semibold">Item Type*</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold">Image URL</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((row, index) => {
                          const { isValid, missingFields } = validateRow(row);
                          return (
                            <TableRow key={index} className={!isValid ? "bg-destructive/10" : ""}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell
                                className={!row.Item_Name ? "text-destructive font-medium bg-destructive/20" : ""}
                              >
                                {row.Item_Name || "Missing"}
                              </TableCell>
                              <TableCell className={!row.Price ? "text-destructive font-medium bg-destructive/20" : ""}>
                                {row.Price || "Missing"}
                              </TableCell>
                              <TableCell
                                className={!row.Item_Type ? "text-destructive font-medium bg-destructive/20" : ""}
                              >
                                {row.Item_Type || "Missing"}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">{row.Description || "-"}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{row.Image_URL || "-"}</TableCell>
                              <TableCell>
                                {isValid ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Missing Fields
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {invalidRowsCount > 0 && (
                    <div className="p-4 bg-destructive/10 border-t border-destructive/20">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>
                          {invalidRowsCount} rows have missing required fields. Please fix the highlighted fields before
                          uploading.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Data to Preview</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Upload a CSV file first to preview your data. Make sure all required fields are filled.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Go to Upload
                  </Button>
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
