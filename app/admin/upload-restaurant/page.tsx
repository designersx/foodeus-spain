"use client";

import React, { useState, useRef } from "react";
import { Download, Upload, FileText, AlertCircle, Check, Info } from "lucide-react";
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

interface RestaurantCSVRow {
  placeId: string;
  Category: string;
  Name: string;
  Description: string;
  Original_Latitude: string;
  Original_Longitude: string;
  Address: string;
  Phone?: string;
  Website?: string;
  Rating?: string;
  Total_Ratings?: string;
  Photo_References?: string;
  Opening_Hours?: string;
}

export default function ImportRestaurantCSV() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<RestaurantCSVRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sampleCSV = `placeId,Category,Name,Description,Original_Latitude,Original_Longitude,Address,Phone,Website,Rating,Total_Ratings,Opening_Hours
abc123,Restaurant,Fancy Dine,"Fine dining in Madrid",40.4168,-3.7038,"123 Madrid St",+34123456789,https://fancydine.com,4.5,210,"Mon-Fri: 10AM-10PM"
xyz456,Cafe,Sunny Beans,"Cozy cafe in downtown",40.4178,-3.7025,"456 Coffee Ave",+34987654321,https://sunnybeans.com,4.2,180,"Daily: 8AM-8PM"`;

const expectedHeaders = [
    "placeId", "Category", "Name", "Description", 
    "Original_Latitude", "Original_Longitude", "Address", 
    "Phone", "Website", "Rating", "Total_Ratings", "Opening_Hours"
  ];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSelectedFile(file);
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map((row) => row.trim()).filter(Boolean);
      const headers = rows[0].split(",").map((h) => h.trim());
  
      // Check if the uploaded CSV contains the expected headers
      const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));
      const extraHeaders = headers.filter((header) => !expectedHeaders.includes(header));
  
      if (missingHeaders.length > 0) {
        toast({ 
          title: "Error", 
          description: `Missing required fields: ${missingHeaders.join(", ")}`, 
          variant: "destructive" 
        });
        return;
      }
  
      if (extraHeaders.length > 0) {
        toast({ 
          title: "Error", 
          description: `Extra fields detected: ${extraHeaders.join(", ")}`, 
          variant: "destructive" 
        });
        return;
      }
  
      try {
        const data = rows.slice(1).map((row) => {
          const values: string[] = [];
          let inQuotes = false, currentValue = "";
  
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === "," && !inQuotes) {
              values.push(currentValue);
              currentValue = "";
            } else currentValue += char;
          }
          values.push(currentValue);
  
          return headers.reduce((obj, header, index) => {
            obj[header as keyof RestaurantCSVRow] = values[index]?.replace(/^"|"$/g, "") || "";
            return obj;
          }, {} as RestaurantCSVRow);
        });
  
        setCsvData(data);
        setActiveTab("preview");
        toast({ title: "CSV Loaded", description: `Successfully loaded ${data.length} rows.` });
      } catch (error) {
        toast({ title: "Error", description: "Failed to parse CSV.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setFileName(file.name);
//     setSelectedFile(file);

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const text = event.target?.result as string;
//       const rows = text.split("\n").map((row) => row.trim()).filter(Boolean);
//       const headers = rows[0].split(",").map((h) => h.trim());

//       try {
//         const data = rows.slice(1).map((row) => {
//           const values: string[] = [];
//           let inQuotes = false, currentValue = "";

//           for (let i = 0; i < row.length; i++) {
//             const char = row[i];
//             if (char === '"') inQuotes = !inQuotes;
//             else if (char === "," && !inQuotes) {
//               values.push(currentValue);
//               currentValue = "";
//             } else currentValue += char;
//           }
//           values.push(currentValue);

//           return headers.reduce((obj, header, index) => {
//             obj[header as keyof RestaurantCSVRow] = values[index]?.replace(/^"|"$/g, "") || "";
//             return obj;
//           }, {} as RestaurantCSVRow);
//         });

//         setCsvData(data);
//         setActiveTab("preview");
//         toast({ title: "CSV Loaded", description: `Successfully loaded ${data.length} rows.` });
//       } catch (error) {
//         toast({ title: "Error", description: "Failed to parse CSV.", variant: "destructive" });
//       }
//     };
//     reader.readAsText(file);
//   };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_restaurant_import.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Sample Downloaded", description: "Sample CSV template has been downloaded." });
  };

  const validateRow = (row: RestaurantCSVRow) => ({
    isValid:
      !!row.placeId &&
      !!row.Category &&
      !!row.Name &&
      !!row.Description &&
      !!row.Original_Latitude &&
      !!row.Original_Longitude &&
      !!row.Address,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      const token = localStorage.getItem("token");
      formData.append("file", selectedFile);

      const response = await apiClient.post("/restaurants/admin_upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response);
      if (response.status !== 201) throw new Error("Upload failed");
      const { inserted, skippedRestaurants= [] } = response.data;
      // console.log(inserted, skippedRestaurants);
      if (inserted > 0 || skippedRestaurants.length > 0) {
        let message = "";
        
        if (inserted > 0) {
          message += `✅ ${inserted} restaurant(s) imported successfully.\n`;
        }
  
        if (skippedRestaurants.length > 0) {
          const skippedNames = skippedRestaurants.map((item: any) => `• ${item.name}`).join("\n");
          message += `⚠️ ${skippedRestaurants.length} skipped:\n${skippedNames}`;
        }
        // console.log(inserted, skippedRestaurants,message);
        toast({
          title: "Import Summary",
          description: message,
          variant: skippedRestaurants.length > 0 ? "destructive" : "default",
        });
      }
      setCsvData([]);
      setSelectedFile(null);
      setFileName(null);
      setActiveTab("upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({ title: "Upload Error", description: "Failed to upload CSV.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const invalidRowsCount = csvData.filter((row) => !validateRow(row).isValid).length;

  return (
        <div className="flex flex-col h-full overflow-hidden px-4 py-6">
        <div className="flex-1 overflow-y-auto">
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 text-black">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Import Restaurants
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 mt-1">
            Upload your restaurants data in CSV format or download our template to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b grid grid-cols-2">
              <TabsTrigger value="upload" className="data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2">
                Upload CSV
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={csvData.length === 0}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Preview Data {invalidRowsCount > 0 && <Badge variant="destructive" className="ml-2">{invalidRowsCount}</Badge>}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="p-6 space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>Make sure all required fields are filled before uploading.</AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="csv-upload">Upload CSV File</Label>
                  <div
                    className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm mb-1">Click to browse or drop your CSV file</p>
                    <p className="text-xs">Supported format: .csv</p>
                    <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                  </div>
                  {fileName && <p className="text-sm mt-2">Selected File: <strong>{fileName}</strong></p>}
                  <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" onClick={handleDownloadSample} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Sample
                    </Button>
                    <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
                      {isLoading ? <span>Uploading...</span> : <><Upload className="h-4 w-4" />Upload Now</>}
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Required Fields</h3>
                  <ul className="text-sm space-y-2">
                    <li><strong>placeId</strong> – Google Place ID</li>
                    <li><strong>Category</strong> – e.g., Restaurant, Cafe</li>
                    <li><strong>Name</strong> – Restaurant Name</li>
                    <li><strong>Description</strong> – Brief about the restaurant</li>
                    <li><strong>Original_Latitude</strong> – Latitude of the place</li>
                    <li><strong>Original_Longitude</strong> – Longitude of the place</li>
                    <li><strong>Address</strong> – Full address</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            {/* <TabsContent value="preview" className="p-6">
              {csvData.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Upload a CSV file to preview data</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                    <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
                      {isLoading ? <span>Uploading...</span> : <><Upload className="h-4 w-4" />Upload Now</>}
                    </Button>
                
                    <Table className="min-w-[1000px]">
                    <TableHeader>
                      <TableRow>
                        {Object.keys(csvData[0]).map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.map((row, index) => {
                        const { isValid } = validateRow(row);
                        return (
                          <TableRow key={index} className={!isValid ? "bg-destructive/10" : ""}>
                            {Object.values(row).map((val, i) => (
                              <TableCell key={i}>{val || "-"}</TableCell>
                            ))}
                            <TableCell>
                              {isValid ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>
                              ) : (
                                <Badge variant="destructive">Missing Fields</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent> */}
          <TabsContent
            value="preview"
            className="flex flex-col flex-1 p-0 overflow-hidden h-[calc(100vh-180px)]"
          >
            {csvData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Upload a CSV file to preview data</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                  <h3 className="text-lg font-medium">Preview</h3>
                  <Button onClick={handleUpload} disabled={isLoading} className="gap-2">
                    {isLoading ? "Uploading..." : <> <Upload className="h-4 w-4" /> Upload Now </>}
                  </Button>
                </div>

                <div className="flex-1 overflow-auto px-4 pb-4">
                  <div className="min-w-[1000px] w-full overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          {Object.keys(csvData[0]).map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((row, index) => {
                          const { isValid } = validateRow(row);
                          return (
                            <TableRow key={index} className={!isValid ? "bg-destructive/10" : ""}>
                              {Object.values(row).map((val, i) => (
                                <TableCell key={i} className="max-w-[200px] truncate">
                                  {val || "-"}
                                </TableCell>
                              ))}
                              <TableCell>
                                {isValid ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>
                                ) : (
                                  <Badge variant="destructive">Missing Fields</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 md:hidden">
                    👆 Swipe left/right to view all columns.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
            



          </Tabs>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
