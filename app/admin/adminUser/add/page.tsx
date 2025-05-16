"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Plus, User, Eye, EyeOff,ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/context/language-context"
import { apiClient } from "@/services/apiService"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FormData {
  name: string
  email: string
  mobile: string
  password: string
  role: string
  role_id: string
  profile: File | null
}

interface FormErrors {
  name?: string
  email?: string
  mobile?: string
  password?: string
  role_id?: string
  profile?: string
}

const roleOptions = [
  { label: "Admin", value: "admin", role_id: "2" },
  { label: "Field User", value: "field user", role_id: "3" },
]

export default function AddAdminUserPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "admin",
    role_id: "2", // Default to Admin
    profile: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation function
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t("NameRequired") || "Name is required"
    } else if (formData.name.length > 50) {
      newErrors.name = t("NameTooLong") || "Name must be 50 characters or less"
    }

    if (!formData.email.trim()) {
      newErrors.email = t("EmailRequired") || "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("InvalidEmail") || "Invalid email format"
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = t("MobileRequired") || "Mobile number is required"
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = t("InvalidMobile") || "Mobile number must be 10 digits"
    }

    if (!formData.password) {
      newErrors.password = t("PasswordRequired") || "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = t("PasswordTooShort") || "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(formData.password)) {
      newErrors.password =
        t("PasswordStrength") || "Password must contain uppercase, lowercase, number, and special character"
    }

    if (!formData.role_id) {
      newErrors.role_id = t("RoleIdRequired") || "Role is required"
    } else if (!["2", "3"].includes(formData.role_id)) {
      newErrors.role_id = t("InvalidRoleId") || "Invalid role selected"
    }

    if (formData.profile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (!allowedTypes.includes(formData.profile.type)) {
        newErrors.profile = t("InvalidFileType") || "Only JPEG, PNG, or GIF files are allowed"
      } else if (formData.profile.size > maxSize) {
        newErrors.profile = t("FileTooLarge") || "File size must be less than 5MB"
      }
    }

    return newErrors
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (name === "profile" && files && files[0]) {
      const file = files[0]
      setFormData({ ...formData, profile: file })
      setImagePreview(URL.createObjectURL(file))
    } else {
      setFormData({ ...formData, [name]: value })
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // Handle role selection
  const handleRoleChange = (value: string) => {
    const selectedRole = roleOptions.find((role) => role.value === value)
    if (selectedRole) {
      setFormData({
        ...formData,
        role: selectedRole.value,
        role_id: selectedRole.role_id,
      })
      setErrors((prev) => ({ ...prev, role_id: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data before validation:", formData)
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("mobile", formData.mobile)
      formDataToSend.append("password", formData.password)
      formDataToSend.append("role", formData.role)
      formDataToSend.append("role_id", formData.role_id)
      if (formData.profile) {
        formDataToSend.append("profile", formData.profile)
      }

      const response = await apiClient.post("/admin/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Response from API:", response)
      if (response.data.success) {
        toast({
          title: t("Success") || "Success",
          description: t("UserCreatedSuccessfully") || "User created successfully",
        })
        router.push("/admin/users")
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      toast({
        title: t("Error") || "Error",
        description: error.message || t("FailedToCreateUser") || "Failed to create user",
        variant: "destructive",
      })
    }finally {
        setIsSubmitting(false)
    }
  }

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  return (
    <div className="container mx-auto py-2 px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden">
        <div className="p-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/adminUser")}
          className="mb-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("BackToUsers") || "Back to Users"}
        </Button>
         <Card className="overflow-hidden p-3">
          <div className="flex items-center mb-4 mt-1"> 
            <User className="h-8 w-8 mr-3 text-orange-500 pb-2" />
            <h1 className="text-3xl font-bold tracking-tight">{t("AddAdminUser") || "Add Admin User"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t("Name") || "Name"}<span className="text-danger"> *</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder={t("EnterName") || "Enter name"}
                    className="w-full"
                  />
                  {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("Email") || "Email"}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder={t("EnterEmail") || "Enter email"}
                    className="w-full"
                  />
                  {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium">
                    {t("Mobile") || "Mobile"}
                  </Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder={t("EnterMobile") || "Enter mobile number"}
                    className="w-full"
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                    }}
                  />
                  {errors.mobile && <p className="text-sm text-danger">{errors.mobile}</p>}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t("Password") || "Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={8}
                      maxLength={50}
                      placeholder={t("EnterPassword") || "Enter password"}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    {t("Role") || "Role"}
                  </Label>
                  <Select name="role" value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("SelectRole") || "Select a role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label) || option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && <p className="text-sm text-danger">{errors.role_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile" className="text-sm font-medium">
                    {t("ProfileImage") || "Profile Image"}
                  </Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          id="profile"
                          name="profile"
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div
                        className={`relative rounded-lg overflow-hidden border-2 ${imagePreview ? "border-orange-500" : "border-dashed border-gray-300"} h-40 w-40 flex items-center justify-center`}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Profile Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <User className="h-10 w-10 mx-auto text-gray-400" />
                            <p className="text-sm text-gray-500 mt-2">{t("ProfilePreview") || "Profile Preview"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.profile && <p className="text-sm text-danger">{errors.profile}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-8">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/users")}
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  {t("Cancel") || "Cancel"}
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting?t("saving") :t("Save")|| "Save"}
                </Button>
              </div>
            </div>
          </form>
        </Card> 
        </div>
      </div>
    </div>
  )
}
