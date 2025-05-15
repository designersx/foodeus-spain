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
import { useLanguage } from "@/context/language-context";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";

interface RestaurantCSVRow {
  placeId: string;
  Cuisine: string;
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
  const { t,language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<RestaurantCSVRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openSkipDialog, setOpenSkipDialog] = useState(false);
  const [skippedList, setSkippedList] = useState<{ name: string; reason?: string }[]>([]);

const sampleCSV = language === 'es' ? `Nombre,Descripcion,Direccion,Cocina,Telefono,Sitio Web,Horario de Apertura
Cena Elegante,Comida fina en Madrid,Calle Madrid 123,Italiana,+34123456789,https://fancydine.com,Lun-Vie: 10:00-22:00
Frijoles Soleados,Café acogedor en el centro,Avenida Café 456,Mexicana,+34987654321,https://sunnybeans.com,Diario: 8:00-20:00
` : `Name,Description,Address,Cuisine,Phone,Website,Opening Hours
Fancy Dine,Fine dining in Madrid,123 Madrid St,Italian,+34123456789,https://fancydine.com,Mon-Fri: 10AM-10PM
Sunny Beans,Cozy cafe in downtown,456 Coffee Ave,Mexican,+34987654321,https://sunnybeans.com,Daily: 8AM-8PM
`;

const expectedHeaders = [
     "Name", "Description", "Cuisine","Address", 
    "Phone", "Website","Opening_Hours"
  ];


  const headerTranslations: Record<string, string> = {
    Name: 'HeaderName',
    Description: 'HeaderDescription',
    Address: 'HeaderAddress',
    Cuisine: 'HeaderCuisine',
    Phone: 'HeaderPhone',
    Website: 'HeaderWebsite',
    Opening_Hours: 'HeaderOpeningHours',
  };

  // Map translated headers back to English
  const reverseHeaderTranslations: Record<string, Record<string, string>> = {
    en: {
      Name: 'Name',
      Description: 'Description',
      Address: 'Address',
      Cuisine: 'Cuisine',
      Phone: 'Phone',
      Website: 'Website',
      'Opening Hours': 'Opening_Hours',
    },
    es: {
      Nombre: 'Name',
      Descripcion: 'Description',
      Direccion: 'Address',
      Cocina: 'Cuisine',
      Telefono: 'Phone',
      'Sitio Web': 'Website',
      'Horario de Apertura': 'Opening_Hours',
    },
  };

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
   const translatedToEnglishHeaders = headers.map(
        (header) => reverseHeaderTranslations[language][header] || header
      );
      // Check for missing or extra headers
      const missingHeaders = expectedHeaders.filter((header) => !translatedToEnglishHeaders.includes(header));
      const extraHeaders = translatedToEnglishHeaders.filter((header) => !expectedHeaders.includes(header));
     
      if (missingHeaders.length > 0) {
        toast({
          title: t("MissingFieldsTitle"),
          description: t("MissingFieldsDesc").replace("{fields}", missingHeaders.join(", ")),
          variant: "destructive"
        });
        return;
      }

      if (extraHeaders.length > 0) {
        toast({
          title: t("ExtraFieldsTitle"),
          description: t("ExtraFieldsDesc").replace("{fields}", extraHeaders.join(", ")),
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
  
          return translatedToEnglishHeaders.reduce((obj, header, index) => {
            obj[header as keyof RestaurantCSVRow] = values[index]?.replace(/^"|"$/g, "") || "";
            return obj;
          }, {} as RestaurantCSVRow);
        });
  
        setCsvData(data);
        setActiveTab("preview");
        toast({
          title: t("CSVLoadedTitle"),
          description: t("CSVLoadedDesc").replace("{count}", data.length),
        });
      } catch (error) {
        toast({
          title: t("CSVParseErrorTitle"),
          description: t("CSVParseErrorDesc"),
          variant: "destructive"
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
    a.download = language=="en"? "sample_restaurant_import.csv":"importación_restaurantes_ejemplo.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Sample Downloaded", description: language=="en"?"Sample CSV template has been downloaded.":"La plantilla de ejemplo CSV se ha descargado." });
  };

  const validateRow = (row: RestaurantCSVRow) => ({
    isValid:
      !!row.Cuisine &&
      !!row.Name &&
      !!row.Address,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const text = await selectedFile.text();
    const rows = text.split("\n").map((row) => row.trim()).filter(Boolean);
    const headers = rows[0].split(",").map((h) => h.trim());

    // Map translated headers to English
    const englishHeaders = headers.map(
      (header) => reverseHeaderTranslations[language][header] || header
    );

    // Create new CSV content with English headers
    const transformedCSV = [englishHeaders.join(","), ...rows.slice(1)].join("\n");

    // Create a new Blob with the transformed CSV
    const transformedFile = new Blob([transformedCSV], { type: "text/csv" });

      const formData = new FormData();
      const token = localStorage.getItem("token");
      formData.append("file", transformedFile,selectedFile.name);

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
          setSkippedList(skippedRestaurants);
          setOpenSkipDialog(true); // 👈 Open the dialog
        }
        // console.log(inserted, skippedRestaurants,message);
        toast({
          title: t("ImportSummaryTitle"),
          description: t("ImportSummaryDesc").replace("{message}", message),
          variant: skippedRestaurants.length > 0 ? "destructive" : "default"
        });
      }
      setCsvData([]);
      setSelectedFile(null);
      setFileName(null);
      setActiveTab("upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({
        title: t("UploadErrorTitle"),
        description: t("UploadErrorDesc"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const invalidRowsCount = csvData.filter((row) => !validateRow(row).isValid).length;

  return (
        <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 text-black">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {t('ImportRestaurantsTitle')}
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 mt-1">
            {t('ImportRestaurantsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b grid grid-cols-2">
              <TabsTrigger value="upload" className="data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2">
                {t('UploadCSV')}
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={csvData.length === 0}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {t('PreviewData')} {invalidRowsCount > 0 && <Badge variant="destructive" className="ml-2">{invalidRowsCount}</Badge>}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="p-6 space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t('ImportantNote')}</AlertTitle>
                <AlertDescription>{t('ImportantDesc')}</AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="csv-upload">{t('UploadCSVLabel')}</Label>
                  <div
                    className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm mb-1">{t('DropCSVHint')}</p>
                    <p className="text-xs">{t('SupportedFormat')}</p>
                    <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                  </div>
                  {fileName && <p className="text-sm mt-2">{t('SelectedFile')}: <strong>{fileName}</strong></p>}
                  <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" onClick={handleDownloadSample} className="gap-2">
                      <Download className="h-4 w-4" />
                      {t('DownloadSample')}
                    </Button>
                    <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
                      {isLoading ? <span>{t('Uploading')}</span> : <><Upload className="h-4 w-4" />{t('UploadNow')}</>}
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">{t('RequiredFieldsTitle')}</h3>
               <ul className="text-sm space-y-2">
                      <li><strong>{t('HeaderName')}</strong> – {t('RequiredFieldNameDesc')}</li>
                      {/* <li><strong>{t('HeaderDescription')}</strong> – {t('RequiredFieldDescDesc')}</li> */}
                      <li><strong>{t('HeaderAddress')}</strong> – {t('RequiredFieldAddressDesc')}</li>
                      <li><strong>{t('HeaderCuisine')}</strong> – {t('RequiredFieldCuisineDesc')}</li>
                    </ul>
                </div>
              </div>
            </TabsContent>
          
          <TabsContent
            value="preview"
            className="flex flex-col flex-1 p-0 overflow-hidden h-[calc(100vh-180px)]"
          >
            {csvData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('NoDataToPreview')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                  <h3 className="text-lg font-medium">{t('PreviewTitle')}</h3>
                  <Button onClick={handleUpload} disabled={isLoading} className="gap-2">
                    {isLoading ? t('Uploading'): <> <Upload className="h-4 w-4" /> {t('UploadNow')} </>}
                  </Button>
                </div>

                <div className="flex-1 overflow-auto px-4 pb-4">
                  <div className="min-w-[1000px] w-full overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          {Object.keys(csvData[0]).map((header) => (
                            <TableHead key={header}>{t(headerTranslations[header] || header)}</TableHead>
                          ))}
                          <TableHead>{t('Status')}</TableHead>
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
                                  <Badge className="bg-green-100 text-green-800 border-green-200">{t('StatusValid')}</Badge>
                                ) : (
                                  <Badge variant="destructive">{t('StatusInvalid')}</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 md:hidden">
                    {t('SwipeHint')}
                  </p>
                </div>
              </>
            )}
          </TabsContent>
            



          </Tabs>
        </CardContent>
      </Card>
      {
        openSkipDialog && (
        <Dialog open={openSkipDialog} onOpenChange={setOpenSkipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("SkippedDialogTitle")}</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {t("SkippedDialogDescription")}
              </DialogDescription>
            </DialogHeader>

            <ul className="mt-4 space-y-2 max-h-[300px] overflow-y-auto text-sm">
              {skippedList.map((item, index) => (
                <li key={index} className="border-b pb-2">
                  <strong>{item?.name || "-"}</strong>{" - "}{item?.reason || "-"} 
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </div>
  );
}




// "use client";

// import React, { useState, useRef } from "react";
// import { Download, Upload, FileText, AlertCircle, Check, Info } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { apiClient } from "@/services/apiService";
// import { useLanguage } from "@/context/language-context";
// import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";

// interface RestaurantCSVRow {
//   placeId: string;
//   Cuisine: string;
//   Name: string;
//   Description: string;
//   Original_Latitude: string;
//   Original_Longitude: string;
//   Address: string;
//   Phone?: string;
//   Website?: string;
//   Rating?: string;
//   Total_Ratings?: string;
//   Photo_References?: string;
//   Opening_Hours?: string;
// }

// export default function ImportRestaurantCSV() {
//   const { t } = useLanguage();
//   const { toast } = useToast();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [csvData, setCsvData] = useState<RestaurantCSVRow[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [fileName, setFileName] = useState<string | null>(null)
//   const [activeTab, setActiveTab] = useState("upload");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [openSkipDialog, setOpenSkipDialog] = useState(false);
//   const [skippedList, setSkippedList] = useState<{ name: string; reason?: string }[]>([]);

//   const sampleCSV = `Name,Description,Address,Cuisine,Phone,Website,Opening_Hours
// Fancy Dine,"Fine dining in Madrid","123 Madrid St","Italian",+34123456789,https://fancydine.com,"Mon-Fri: 10AM-10PM"
// Sunny Beans,"Cozy cafe in downtown","456 Coffee Ave","Mexican",+34987654321,https://sunnybeans.com,"Daily: 8AM-8PM"`;

// const expectedHeaders = [
//      "Name", "Description", "Cuisine","Address", 
//     "Phone", "Website","Opening_Hours"
//   ];
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
  
//       // Check if the uploaded CSV contains the expected headers
//       const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));
//       const extraHeaders = headers.filter((header) => !expectedHeaders.includes(header));
  
//       if (missingHeaders.length > 0) {
//         toast({
//           title: t("MissingFieldsTitle"),
//           description: t("MissingFieldsDesc").replace("{fields}", missingHeaders.join(", ")),
//           variant: "destructive"
//         });
//         return;
//       }
  
//       if (extraHeaders.length > 0) {
//       toast({
//         title: t("ExtraFieldsTitle"),
//         description: t("ExtraFieldsDesc").replace("{fields}", extraHeaders.join(", ")),
//         variant: "destructive"
//       });
//         return;
//       }
  
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
//         toast({
//           title: t("CSVLoadedTitle"),
//           description: t("CSVLoadedDesc").replace("{count}", data.length),
//         });
//       } catch (error) {
//         toast({
//           title: t("CSVParseErrorTitle"),
//           description: t("CSVParseErrorDesc"),
//           variant: "destructive"
//         });
//       }
//     };
//     reader.readAsText(file);
//   };

//   const handleDownloadSample = () => {
//     const blob = new Blob([sampleCSV], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "sample_restaurant_import.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//     toast({ title: "Sample Downloaded", description: "Sample CSV template has been downloaded." });
//   };

//   const validateRow = (row: RestaurantCSVRow) => ({
//     isValid:
//       !!row.Cuisine &&
//       !!row.Name &&
//       !!row.Description &&
//       !!row.Address,
//   });

//   const handleUpload = async () => {
//     if (!selectedFile) return;
//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       const token = localStorage.getItem("token");
//       formData.append("file", selectedFile);

//       const response = await apiClient.post("/restaurants/admin_upload-csv", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       console.log(response);  
//       if (response.status !== 201) throw new Error("Upload failed");
//       const { inserted, skippedRestaurants= [] } = response.data;
//       // console.log(inserted, skippedRestaurants);
//       if (inserted > 0 || skippedRestaurants.length > 0) {
//         let message = "";
        
//         if (inserted > 0) {
//           message += `✅ ${inserted} restaurant(s) imported successfully.\n`;
//         }
  
//         if (skippedRestaurants.length > 0) {
//           const skippedNames = skippedRestaurants.map((item: any) => `• ${item.name}`).join("\n");
//           message += `⚠️ ${skippedRestaurants.length} skipped:\n${skippedNames}`;
//           setSkippedList(skippedRestaurants);
//           setOpenSkipDialog(true); // 👈 Open the dialog
//         }
//         // console.log(inserted, skippedRestaurants,message);
//         toast({
//           title: t("ImportSummaryTitle"),
//           description: t("ImportSummaryDesc").replace("{message}", message),
//           variant: skippedRestaurants.length > 0 ? "destructive" : "default"
//         });
//       }
//       setCsvData([]);
//       setSelectedFile(null);
//       setFileName(null);
//       setActiveTab("upload");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (error) {
//       toast({
//         title: t("UploadErrorTitle"),
//         description: t("UploadErrorDesc"),
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const invalidRowsCount = csvData.filter((row) => !validateRow(row).isValid).length;

//   return (
//         <div className="flex flex-col h-full overflow-hidden">
//         <div className="flex-1 overflow-y-auto">
//       <Card className="shadow-lg border-0 overflow-hidden">
//         <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 text-black">
//           <CardTitle className="text-2xl font-bold flex items-center gap-2">
//             <FileText className="h-6 w-6" />
//             {t('ImportRestaurantsTitle')}
//           </CardTitle>
//           <CardDescription className="text-primary-foreground/90 mt-1">
//             {t('ImportRestaurantsDesc')}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="w-full border-b grid grid-cols-2">
//               <TabsTrigger value="upload" className="data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2">
//                 {t('UploadCSV')}
//               </TabsTrigger>
//               <TabsTrigger
//                 value="preview"
//                 disabled={csvData.length === 0}
//                 className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
//               >
//                 {t('PreviewData')} {invalidRowsCount > 0 && <Badge variant="destructive" className="ml-2">{invalidRowsCount}</Badge>}
//               </TabsTrigger>
//             </TabsList>
//             <TabsContent value="upload" className="p-6 space-y-6">
//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertTitle>{t('ImportantNote')}</AlertTitle>
//                 <AlertDescription>{t('ImportantDesc')}</AlertDescription>
//               </Alert>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <Label htmlFor="csv-upload">{t('UploadCSVLabel')}</Label>
//                   <div
//                     className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-muted/50"
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     <Upload className="h-8 w-8 mx-auto mb-2" />
//                     <p className="text-sm mb-1">{t('DropCSVHint')}</p>
//                     <p className="text-xs">{t('SupportedFormat')}</p>
//                     <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
//                   </div>
//                   {fileName && <p className="text-sm mt-2">{t('SelectedFile')}: <strong>{fileName}</strong></p>}
//                   <div className="flex justify-between items-center pt-4">
//                     <Button variant="outline" onClick={handleDownloadSample} className="gap-2">
//                       <Download className="h-4 w-4" />
//                       {t('DownloadSample')}
//                     </Button>
//                     <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
//                       {isLoading ? <span>{t('Uploading')}</span> : <><Upload className="h-4 w-4" />{t('UploadNow')}</>}
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="bg-muted/30 rounded-lg p-6">
//                   <h3 className="text-lg font-medium mb-4">{t('RequiredFieldsTitle')}</h3>
//                   <ul className="text-sm space-y-2">
//                     <li><strong>Name</strong> – Restaurant Name</li>
//                     <li><strong>Description</strong> – Brief about the restaurant</li>
//                     <li><strong>Address</strong> – Full address</li>
//                     <li><strong>Cuisine</strong> – e.g., spanish,Mexican</li>
//                   </ul>
//                 </div>
//               </div>
//             </TabsContent>
          
//           <TabsContent
//             value="preview"
//             className="flex flex-col flex-1 p-0 overflow-hidden h-[calc(100vh-180px)]"
//           >
//             {csvData.length === 0 ? (
//               <div className="flex-1 flex items-center justify-center text-center py-12">
//                 <FileText className="h-12 w-12 text-muted-foreground mb-4" />
//                 <p className="text-muted-foreground">{t('NoDataToPreview')}</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
//                   <h3 className="text-lg font-medium">{t('PreviewTitle')}</h3>
//                   <Button onClick={handleUpload} disabled={isLoading} className="gap-2">
//                     {isLoading ? t('Uploading'): <> <Upload className="h-4 w-4" /> {t('UploadNow')} </>}
//                   </Button>
//                 </div>

//                 <div className="flex-1 overflow-auto px-4 pb-4">
//                   <div className="min-w-[1000px] w-full overflow-x-auto">
//                     <Table className="w-full">
//                       <TableHeader>
//                         <TableRow>
//                           {Object.keys(csvData[0]).map((header) => (
//                             <TableHead key={header}>{header}</TableHead>
//                           ))}
//                           <TableHead>Status</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {csvData.map((row, index) => {
//                           const { isValid } = validateRow(row);
//                           return (
//                             <TableRow key={index} className={!isValid ? "bg-destructive/10" : ""}>
//                               {Object.values(row).map((val, i) => (
//                                 <TableCell key={i} className="max-w-[200px] truncate">
//                                   {val || "-"}
//                                 </TableCell>
//                               ))}
//                               <TableCell>
//                                 {isValid ? (
//                                   <Badge className="bg-green-100 text-green-800 border-green-200">{t('StatusValid')}</Badge>
//                                 ) : (
//                                   <Badge variant="destructive">{t('StatusInvalid')}</Badge>
//                                 )}
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })}
//                       </TableBody>
//                     </Table>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2 md:hidden">
//                     {t('SwipeHint')}
//                   </p>
//                 </div>
//               </>
//             )}
//           </TabsContent>
            



//           </Tabs>
//         </CardContent>
//       </Card>
//       {
//         openSkipDialog && (
//         <Dialog open={openSkipDialog} onOpenChange={setOpenSkipDialog}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>{t("SkippedDialogTitle")}</DialogTitle>
//               <DialogDescription className="text-sm text-gray-600">
//                 {t("SkippedDialogDescription")}
//               </DialogDescription>
//             </DialogHeader>

//             <ul className="mt-4 space-y-2 max-h-[300px] overflow-y-auto text-sm">
//               {skippedList.map((item, index) => (
//                 <li key={index} className="border-b pb-2">
//                   <strong>{item?.name || "-"}</strong>{" - "}{item?.reason || "-"} 
//                 </li>
//               ))}
//             </ul>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//     </div>
//   );
// }


// "use client";

// import React, { useState, useRef } from "react";
// import { Download, Upload, FileText, AlertCircle, Check, Info } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { apiClient } from "@/services/apiService";
// import { useLanguage } from "@/context/language-context";

// interface RestaurantCSVRow {
//   placeId: string;
//   Cuisine: string;
//   Name: string;
//   Description: string;
//   Original_Latitude: string;
//   Original_Longitude: string;
//   Address: string;
//   Phone?: string;
//   Website?: string;
//   Rating?: string;
//   Total_Ratings?: string;
//   Photo_References?: string;
//   Opening_Hours?: string;
// }

// export default function ImportRestaurantCSV() {
//   const { t } = useLanguage();
//   const { toast } = useToast();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [csvData, setCsvData] = useState<RestaurantCSVRow[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState("upload");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const sampleCSV = `placeId,Cuisine,Name,Description,Original_Latitude,Original_Longitude,Address,Phone,Website,Rating,Total_Ratings,Opening_Hours
// abc123,Restaurant,Fancy Dine,"Fine dining in Madrid",40.4168,-3.7038,"123 Madrid St",+34123456789,https://fancydine.com,4.5,210,"Mon-Fri: 10AM-10PM"
// xyz456,Cafe,Sunny Beans,"Cozy cafe in downtown",40.4178,-3.7025,"456 Coffee Ave",+34987654321,https://sunnybeans.com,4.2,180,"Daily: 8AM-8PM"`;

// const expectedHeaders = [
//     "placeId", "Cuisine", "Name", "Description", 
//     "Original_Latitude", "Original_Longitude", "Address", 
//     "Phone", "Website", "Rating", "Total_Ratings", "Opening_Hours"
//   ];
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
  
//       // Check if the uploaded CSV contains the expected headers
//       const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));
//       const extraHeaders = headers.filter((header) => !expectedHeaders.includes(header));
  
//       if (missingHeaders.length > 0) {
//         toast({
//           title: t("MissingFieldsTitle"),
//           description: t("MissingFieldsDesc").replace("{fields}", missingHeaders.join(", ")),
//           variant: "destructive"
//         });
//         return;
//       }
  
//       if (extraHeaders.length > 0) {
//       toast({
//         title: t("ExtraFieldsTitle"),
//         description: t("ExtraFieldsDesc").replace("{fields}", extraHeaders.join(", ")),
//         variant: "destructive"
//       });
//         return;
//       }
  
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
//         toast({
//           title: t("CSVLoadedTitle"),
//           description: t("CSVLoadedDesc").replace("{count}", data.length),
//         });
//       } catch (error) {
//         toast({
//           title: t("CSVParseErrorTitle"),
//           description: t("CSVParseErrorDesc"),
//           variant: "destructive"
//         });
//       }
//     };
//     reader.readAsText(file);
//   };

//   const handleDownloadSample = () => {
//     const blob = new Blob([sampleCSV], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "sample_restaurant_import.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//     toast({ title: "Sample Downloaded", description: "Sample CSV template has been downloaded." });
//   };

//   const validateRow = (row: RestaurantCSVRow) => ({
//     isValid:
//       !!row.placeId &&
//       !!row.Cuisine &&
//       !!row.Name &&
//       !!row.Description &&
//       !!row.Original_Latitude &&
//       !!row.Original_Longitude &&
//       !!row.Address,
//   });

//   const handleUpload = async () => {
//     if (!selectedFile) return;
//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       const token = localStorage.getItem("token");
//       formData.append("file", selectedFile);

//       const response = await apiClient.post("/restaurants/admin_upload-csv", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       // console.log(response);
//       if (response.status !== 201) throw new Error("Upload failed");
//       const { inserted, skippedRestaurants= [] } = response.data;
//       // console.log(inserted, skippedRestaurants);
//       if (inserted > 0 || skippedRestaurants.length > 0) {
//         let message = "";
        
//         if (inserted > 0) {
//           message += `✅ ${inserted} restaurant(s) imported successfully.\n`;
//         }
  
//         if (skippedRestaurants.length > 0) {
//           const skippedNames = skippedRestaurants.map((item: any) => `• ${item.name}`).join("\n");
//           message += `⚠️ ${skippedRestaurants.length} skipped:\n${skippedNames}`;
//         }
//         // console.log(inserted, skippedRestaurants,message);
//         toast({
//           title: t("ImportSummaryTitle"),
//           description: t("ImportSummaryDesc").replace("{message}", message),
//           variant: skippedRestaurants.length > 0 ? "destructive" : "default"
//         });
//       }
//       setCsvData([]);
//       setSelectedFile(null);
//       setFileName(null);
//       setActiveTab("upload");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (error) {
//       toast({
//         title: t("UploadErrorTitle"),
//         description: t("UploadErrorDesc"),
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const invalidRowsCount = csvData.filter((row) => !validateRow(row).isValid).length;

//   return (
//         <div className="flex flex-col h-full overflow-hidden">
//         <div className="flex-1 overflow-y-auto">
//       <Card className="shadow-lg border-0 overflow-hidden">
//         <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 text-black">
//           <CardTitle className="text-2xl font-bold flex items-center gap-2">
//             <FileText className="h-6 w-6" />
//             {t('ImportRestaurantsTitle')}
//           </CardTitle>
//           <CardDescription className="text-primary-foreground/90 mt-1">
//             {t('ImportRestaurantsDesc')}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="w-full border-b grid grid-cols-2">
//               <TabsTrigger value="upload" className="data-[state=active]:border-b-2 data-[state=active]:border-primary mb-2">
//                 {t('UploadCSV')}
//               </TabsTrigger>
//               <TabsTrigger
//                 value="preview"
//                 disabled={csvData.length === 0}
//                 className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
//               >
//                 {t('PreviewData')} {invalidRowsCount > 0 && <Badge variant="destructive" className="ml-2">{invalidRowsCount}</Badge>}
//               </TabsTrigger>
//             </TabsList>
//             <TabsContent value="upload" className="p-6 space-y-6">
//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertTitle>{t('ImportantNote')}</AlertTitle>
//                 <AlertDescription>{t('ImportantDesc')}</AlertDescription>
//               </Alert>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <Label htmlFor="csv-upload">{t('UploadCSVLabel')}</Label>
//                   <div
//                     className="border-2 border-dashed p-8 rounded-lg text-center cursor-pointer hover:bg-muted/50"
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     <Upload className="h-8 w-8 mx-auto mb-2" />
//                     <p className="text-sm mb-1">{t('DropCSVHint')}</p>
//                     <p className="text-xs">{t('SupportedFormat')}</p>
//                     <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
//                   </div>
//                   {fileName && <p className="text-sm mt-2">{t('SelectedFile')}: <strong>{fileName}</strong></p>}
//                   <div className="flex justify-between items-center pt-4">
//                     <Button variant="outline" onClick={handleDownloadSample} className="gap-2">
//                       <Download className="h-4 w-4" />
//                       {t('DownloadSample')}
//                     </Button>
//                     <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
//                       {isLoading ? <span>{t('Uploading')}</span> : <><Upload className="h-4 w-4" />{t('UploadNow')}</>}
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="bg-muted/30 rounded-lg p-6">
//                   <h3 className="text-lg font-medium mb-4">{t('RequiredFieldsTitle')}</h3>
//                   <ul className="text-sm space-y-2">
//                     <li><strong>placeId</strong> – Google Place ID</li>
//                     <li><strong>Cuisine</strong> – e.g., Restaurant, Cafe</li>
//                     <li><strong>Name</strong> – Restaurant Name</li>
//                     <li><strong>Description</strong> – Brief about the restaurant</li>
//                     <li><strong>Original_Latitude</strong> – Latitude of the place</li>
//                     <li><strong>Original_Longitude</strong> – Longitude of the place</li>
//                     <li><strong>Address</strong> – Full address</li>
//                   </ul>
//                 </div>
//               </div>
//             </TabsContent>
//             {/* <TabsContent value="preview" className="p-6">
//               {csvData.length === 0 ? (
//                 <div className="text-center py-12">
//                   <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//                   <p className="text-muted-foreground">Upload a CSV file to preview data</p>
//                 </div>
//               ) : (
//                 <div className="w-full overflow-x-auto">
//                     <Button onClick={handleUpload} disabled={isLoading || csvData.length === 0} className="gap-2">
//                       {isLoading ? <span>Uploading...</span> : <><Upload className="h-4 w-4" />Upload Now</>}
//                     </Button>
                
//                     <Table className="min-w-[1000px]">
//                     <TableHeader>
//                       <TableRow>
//                         {Object.keys(csvData[0]).map((header) => (
//                           <TableHead key={header}>{header}</TableHead>
//                         ))}
//                         <TableHead>Status</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {csvData.map((row, index) => {
//                         const { isValid } = validateRow(row);
//                         return (
//                           <TableRow key={index} className={!isValid ? "bg-destructive/10" : ""}>
//                             {Object.values(row).map((val, i) => (
//                               <TableCell key={i}>{val || "-"}</TableCell>
//                             ))}
//                             <TableCell>
//                               {isValid ? (
//                                 <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>
//                               ) : (
//                                 <Badge variant="destructive">Missing Fields</Badge>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </TabsContent> */}
//           <TabsContent
//             value="preview"
//             className="flex flex-col flex-1 p-0 overflow-hidden h-[calc(100vh-180px)]"
//           >
//             {csvData.length === 0 ? (
//               <div className="flex-1 flex items-center justify-center text-center py-12">
//                 <FileText className="h-12 w-12 text-muted-foreground mb-4" />
//                 <p className="text-muted-foreground">{t('NoDataToPreview')}</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
//                   <h3 className="text-lg font-medium">{t('PreviewTitle')}</h3>
//                   <Button onClick={handleUpload} disabled={isLoading} className="gap-2">
//                     {isLoading ? t('Uploading'): <> <Upload className="h-4 w-4" /> {t('UploadNow')} </>}
//                   </Button>
//                 </div>

//                 <div className="flex-1 overflow-auto px-4 pb-4">
//                   <div className="min-w-[1000px] w-full overflow-x-auto">
//                     <Table className="w-full">
//                       <TableHeader>
//                         <TableRow>
//                           {Object.keys(csvData[0]).map((header) => (
//                             <TableHead key={header}>{header}</TableHead>
//                           ))}
//                           <TableHead>Status</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {csvData.map((row, index) => {
//                           const { isValid } = validateRow(row);
//                           return (
//                             <TableRow key={index} className={!isValid ? "bg-destructive/10" : ""}>
//                               {Object.values(row).map((val, i) => (
//                                 <TableCell key={i} className="max-w-[200px] truncate">
//                                   {val || "-"}
//                                 </TableCell>
//                               ))}
//                               <TableCell>
//                                 {isValid ? (
//                                   <Badge className="bg-green-100 text-green-800 border-green-200">{t('StatusValid')}</Badge>
//                                 ) : (
//                                   <Badge variant="destructive">{t('StatusInvalid')}</Badge>
//                                 )}
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })}
//                       </TableBody>
//                     </Table>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2 md:hidden">
//                     {t('SwipeHint')}
//                   </p>
//                 </div>
//               </>
//             )}
//           </TabsContent>
            



//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//     </div>
//   );
// }



