"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Check, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CaptureMenuPage() {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("manual")
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  const [manualFormData, setManualFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    restaurant: "",
  })

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setManualFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setManualFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your device or browser doesn't support camera access",
          variant: "destructive",
        })
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraStream(stream)
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture menu images",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      setCameraActive(false)
    }
  }

  const handleCapture = () => {
    if (isMobile) {
      // On mobile, start the camera
      startCamera()
    } else {
      // On desktop, simulate a capture
      setIsCapturing(true)
      setTimeout(() => {
        setCapturedImage("/placeholder.svg?height=400&width=600")
        setIsCapturing(false)
      }, 1500)
    }
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL("image/png")
        setCapturedImage(imageDataUrl)

        // Stop the camera
        stopCamera()
      }
    }
  }

  const handleProcessImage = () => {
    if (!capturedImage) return

    setIsProcessing(true)

    // Simulate processing the image
    setTimeout(() => {
      setIsProcessing(false)

      toast({
        title: "Menu captured",
        description: "The menu has been successfully processed",
      })

      // Reset the form
      setCapturedImage(null)
    }, 2000)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Menu item added",
      description: "The menu item has been added successfully",
    })

    // Reset the form
    setManualFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      restaurant: "",
    })
  }

  const handleCancelCapture = () => {
    setCapturedImage(null)
    stopCamera()
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="full-width-container space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capture Menu</h1>
        <p className="text-muted-foreground">Capture or manually add menu items</p>
      </div>

      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          {/* <TabsTrigger value="capture" className="flex-1 sm:flex-initial">
            Capture Menu
          </TabsTrigger> */}
          <TabsTrigger value="manual" className="flex-1 sm:flex-initial">
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Capture Menu with Camera</CardTitle>
              <CardDescription>Take a photo of a menu to automatically extract items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 w-full md:w-1/2 lg:w-1/3">
                <Label htmlFor="restaurant-select">Select Restaurant</Label>
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger id="restaurant-select" className="w-full">
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="el-rincon">El Rincón</SelectItem>
                    <SelectItem value="sushi-spot">Sushi Spot</SelectItem>
                    <SelectItem value="la-trattoria">La Trattoria</SelectItem>
                    <SelectItem value="thai-delight">Thai Delight</SelectItem>
                    <SelectItem value="burger-joint">Burger Joint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!capturedImage && !cameraActive ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 md:p-12 w-full min-h-[300px]">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Capture Menu</h3>
                      <p className="text-sm text-muted-foreground">
                        {isMobile
                          ? "Take a photo of the menu to extract items"
                          : "Upload a clear photo of the menu to extract items"}
                      </p>
                    </div>
                    <Button
                      onClick={isMobile ? handleCapture : handleFileUpload}
                      disabled={isCapturing || !selectedRestaurant}
                      className="w-full sm:w-auto"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isMobile ? "Opening Camera..." : "Processing..."}
                        </>
                      ) : (
                        <>
                          {isMobile ? (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Open Camera
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Image
                            </>
                          )}
                        </>
                      )}
                    </Button>

                    {!isMobile && (
                      <>
                        <div className="text-xs text-muted-foreground">Or take a photo</div>
                        <Button variant="outline" onClick={handleCapture} disabled={!selectedRestaurant}>
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Menu
                        </Button>
                      </>
                    )}

                    <Input
                      ref={fileInputRef}
                      id="menu-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!selectedRestaurant}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : cameraActive ? (
                <div className="space-y-4 w-full">
                  <div className="relative w-full max-w-lg mx-auto">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border" />
                    <canvas ref={canvasRef} className="hidden" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleCancelCapture}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={takePicture} className="w-full max-w-xs">
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="relative w-full">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured menu"
                      className="w-full rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleCancelCapture}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancelCapture}>
                      Cancel
                    </Button>
                    <Button onClick={handleProcessImage} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Process Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Manual Menu Entry</CardTitle>
              <CardDescription>Manually add menu items to a restaurant</CardDescription>
            </CardHeader>
            <form onSubmit={handleManualSubmit} className="w-full">
              <CardContent className="space-y-4">
                <div className="space-y-2 w-full md:w-1/2 lg:w-1/3">
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <Select
                    value={manualFormData.restaurant}
                    onValueChange={(value) => handleSelectChange("restaurant", value)}
                    required
                  >
                    <SelectTrigger id="restaurant" className="w-full">
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="el-rincon">El Rincón</SelectItem>
                      <SelectItem value="sushi-spot">Sushi Spot</SelectItem>
                      <SelectItem value="la-trattoria">La Trattoria</SelectItem>
                      <SelectItem value="thai-delight">Thai Delight</SelectItem>
                      <SelectItem value="burger-joint">Burger Joint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter menu item name"
                    value={manualFormData.name}
                    onChange={handleManualChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter item description"
                    value={manualFormData.description}
                    onChange={handleManualChange}
                    rows={3}
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      placeholder="Enter price"
                      value={manualFormData.price}
                      onChange={handleManualChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={manualFormData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                      required
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appetizer">Appetizer</SelectItem>
                        <SelectItem value="main-course">Main Course</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="beverage">Beverage</SelectItem>
                        <SelectItem value="side">Side</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-image">Item Image</Label>
                  <div className="flex items-center gap-4 w-full">
                    <Input id="item-image" type="file" accept="image/*" className="w-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload a high-quality image of the menu item</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto">
                  Add Menu Item
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

