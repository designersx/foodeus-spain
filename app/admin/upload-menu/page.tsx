"use client";

import { useState, useRef } from "react";
import { Download, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added missing import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiService";

interface CSVRow {
  Restaurant_ID: string;
  Item_Name: string;
  Price: string;
  Menu_Type: string;
  Item_list?: string;
  Description?: string;
  Image_URL?: string;
}

export default function ImportMenuCSV() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Sample CSV content
  const sampleCSV = `Restaurant_ID,Item_Name,Price,Menu_Type,Item_list,Description,Image_URL
1,Cheeseburger,9.99,Dinner,"Fries, Soda","A juicy beef patty with cheese","https://example.com/cheeseburger.jpg"
2,Pizza Margherita,12.50,Lunch,"Salad","Classic tomato and mozzarella pizza","https://example.com/pizza.jpg"`;

  // Handle file upload and parse CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map(row => row.trim()).filter(row => row);
      const headers = rows[0].split(",").map(h => h.trim());
      const data = rows.slice(1).map(row => {
        const values = row.split(",").map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header as keyof CSVRow] = values[index] || "";
          return obj;
        }, {} as CSVRow);
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  // Download sample CSV with professional styling
  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_menu_import.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Validate required fields
  const validateRow = (row: CSVRow) => ({
    isValid: !!row.Restaurant_ID && !!row.Item_Name && !!row.Price && !!row.Menu_Type,
    missingFields: [
      !row.Restaurant_ID && "Restaurant_ID",
      !row.Item_Name && "Item_Name",
      !row.Price && "Price",
      !row.Menu_Type && "Menu_Type",
    ].filter(Boolean) as string[],
  });

  // Handle CSV upload to API
  const handleUpload = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    const invalidRows = csvData.map((row, index) => {
      const { isValid, missingFields } = validateRow(row);
      return !isValid ? { index, missingFields } : null;
    }).filter(Boolean);

    if (invalidRows.length > 0) {
      toast({
        title: "Validation Error",
        description: `Rows with missing fields: ${invalidRows.map(r => `Row ${r!.index + 2}: ${r!.missingFields.join(", ")}`).join("; ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      const csvBlob = new Blob([csvData.map(row => Object.values(row).join(",")).join("\n")], { type: "text/csv" });
      formData.append("file", csvBlob, "menu_import.csv");

      const token = localStorage.getItem("token");
      const response = await apiClient.post("/menus/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,

        });
        setCsvData([]);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(response.data.message || "Failed to import menu items");
      }
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

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <Card className="shadow-xl border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Import Restaurant Menus
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gray-50">
          {/* Upload Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="csv-upload" className="text-sm font-semibold text-gray-700 mb-2 block">
                Upload CSV File
              </Label>
              <div className="relative">
                <Input
                  id="csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={isLoading}
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {fileName && (
                <p className="mt-2 text-sm text-gray-600 truncate">Selected: {fileName}</p>
              )}
            </div>
            <div className="flex items-end gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadSample}
                className="bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm rounded-lg flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Sample CSV
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isLoading || csvData.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg flex items-center gap-2 transition-all"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Now
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          {csvData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview Uploaded Data</h3>
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Restaurant ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Item Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Price</TableHead>
                      <TableHead className="font-semibold text-gray-700">Menu Type</TableHead>
                      <TableHead className="font-semibold text-gray-700">Item List</TableHead>
                      <TableHead className="font-semibold text-gray-700">Description</TableHead>
                      <TableHead className="font-semibold text-gray-700">Image URL</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, index) => {
                      const { isValid, missingFields } = validateRow(row);
                      return (
                        <TableRow
                          key={index}
                          className={`hover:bg-gray-50 transition-colors ${!isValid ? "bg-red-50" : ""}`}
                        >
                          <TableCell className={!row.Restaurant_ID ? "text-red-600" : ""}>
                            {row.Restaurant_ID || "-"}
                          </TableCell>
                          <TableCell className={!row.Item_Name ? "text-red-600" : ""}>
                            {row.Item_Name || "-"}
                          </TableCell>
                          <TableCell className={!row.Price ? "text-red-600" : ""}>
                            {row.Price || "-"}
                          </TableCell>
                          <TableCell className={!row.Menu_Type ? "text-red-600" : ""}>
                            {row.Menu_Type || "-"}
                          </TableCell>
                          <TableCell>{row.Item_list || "-"}</TableCell>
                          <TableCell>{row.Description || "-"}</TableCell>
                          <TableCell className="truncate max-w-xs">
                            {row.Image_URL || "-"}
                          </TableCell>
                          <TableCell>
                            {isValid ? (
                              <Badge variant="success" className="bg-green-100 text-green-800">
                                Valid
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>Missing: {missingFields.join(", ")}</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}