"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter, useParams } from "next/navigation"
import { User, Eye, EyeOff, Save, ArrowLeft, Upload, Shield,Check,X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/context/language-context"
import { API_BASE_URL, apiClient } from "@/services/apiService"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function EditAdminUserPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "admin",
    role_id: "2",
    profile: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingProfile, setExistingProfile] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const password = formData.password;

const passwordChecks = {
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[^A-Za-z0-9]/.test(password),
};

  // Load user data from sessionStorage
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("editUserDetails") || "{}")
    if (user && user.id) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        password: "",
        role: user.role || "admin",
        role_id: user.role_id?.toString() || "2",
        profile: null,
      })
      if (user.profile) {
        setExistingProfile(`${API_BASE_URL}/${user.profile}`)
      }
    }
  }, [])

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

    if (formData.password && formData.password.length < 8) {
      newErrors.password = t("PasswordTooShort") || "Password must be at least 8 characters"
    } else if (
      formData.password &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(formData.password)
    ) {
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
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("mobile", formData.mobile)
      if (formData.password) {
        formDataToSend.append("password", formData.password)
      }
      formDataToSend.append("role", formData.role)
      formDataToSend.append("role_id", formData.role_id)
      if (formData.profile) {
        formDataToSend.append("profile", formData.profile)
      }

      const response = await apiClient.put(`/admin/update/${params.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast({
          title: t("Success") || "Success",
          description: t("UserUpdatedSuccessfully") || "User updated successfully",
        })
        router.push("/admin/adminUser")
      } else {
        throw new Error(response.data.message || "Failed to update user")
      }
    } catch (error) {
      toast({
        title: t("Error") || "Error",
        description: error.message || t("FailedToUpdateUser") || "Failed to update user",
        variant: "destructive",
      })
    } finally {
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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/adminUser")}
          className="mb-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("BackToUsers") || "Back to Users"}
        </Button>

        <Card className="overflow-hidden ">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight">{t("EditAdminUser") || "Edit Admin User"}</h1>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6 mb-3">
                 <h1 className="text-3xl font-bold tracking-tight">{t("EditUser") || "User Details"}</h1>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="text-sm mb-2">
                  {t("UserDetails") || "User Details"}
                </TabsTrigger>
                <TabsTrigger value="security" className="text-sm mb-2">
                  {t("PasswordSettings") || "Password Settings"}
                </TabsTrigger> 
              </TabsList>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <TabsContent value="details" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Image Column */}
                    <div className="md:col-span-1">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                          <div className="h-40 w-40 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-4 border-orange-200 group-hover:border-orange-300 transition-all duration-300">
                            {imagePreview || existingProfile ? (
                              <img
                                src={imagePreview || existingProfile || ""}
                                alt="Profile Preview"
                                className="h-full w-full object-cover"
                                onError={
                                        (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                            e.currentTarget.src = "http://localhost:8081/profile/1747379234341-userIcon.png";
                                        }
                                    }
                                style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                              />
                            ) : (
                              <User className="h-20 w-20 text-orange-500" />
                            )}
                          </div>
                          <label
                            htmlFor="profile"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
                          >
                            <div className="flex flex-col items-center">
                              <Upload className="h-6 w-6" />
                              <span className="text-xs mt-1">{t("AdminUsersChangePhoto") || "Change Photo"}</span>
                            </div>
                          </label>
                          <Input
                            id="profile"
                            name="profile"
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleInputChange}
                            className="hidden"
                          />
                        </div>
                        {errors.profile && <p className="text-sm text-danger text-center">{errors.profile}</p>}
                        <p className="text-xs text-gray-500 text-center">
                          {t("AdminUsersProfileHint") || "Click to upload a profile image (JPEG, PNG, GIF, max 5MB)"}
                        </p>
                      </div>
                    </div>

                    {/* User Details Column */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          {t("Name") || "Name"}
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          maxLength={50}
                          placeholder={t("EnterName") || "Enter name"}
                          className={`w-full ${errors.name ? "text-danger focus-visible:ring-red-500" : ""}`}
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
                          className={`w-full ${errors.email ? "text-danger focus-visible:ring-red-500" : ""}`}
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
                          className={`w-full ${errors.mobile ? "text-danger focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.mobile && <p className="text-sm text-danger">{errors.mobile}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium">
                          {t("Role") || "Role"}
                        </Label>
                        <Select name="role" value={formData.role} onValueChange={handleRoleChange}>
                          <SelectTrigger
                            className={`w-full ${errors.role_id ? "text-danger focus-visible:ring-red-500" : ""}`}
                          >
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
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800 text-sm">
                      <p>
                        {t("PasswordChangeInfo") || "Leave the password field empty if you don't want to change it."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {t("NewPassword") || "New Password"}
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
                          placeholder={t("EnterNewPassword") || "Enter new password (leave blank to keep current)"}
                          className={`w-full pr-10 ${errors.password ? "text-danger focus-visible:ring-red-500" : ""}`}
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

                      <div className="mt-2">
                        <p className="text-xs text-gray-500">{t("PasswordRequirements") || "Password must:"}</p>
                        {/* <ul className="text-xs text-gray-500 list-disc pl-5 mt-1 space-y-1">
                          <li>{t("PasswordLength") || "Be at least 8 characters long"}</li>
                          <li>{t("PasswordUppercase") || "Include at least one uppercase letter"}</li>
                          <li>{t("PasswordLowercase") || "Include at least one lowercase letter"}</li>
                          <li>{t("PasswordNumber") || "Include at least one number"}</li>
                          <li>{t("PasswordSpecial") || "Include at least one special character"}</li>
                        </ul> */}
                        <ul className="text-xs text-gray-500 list-none pl-0 mt-1 space-y-1">
                        <li className="flex items-center gap-2">
                            {passwordChecks.length ? <Check className="text-success w-4 h-4 fw-bold" /> : <X className="text-danger w-4 h-4" />}
                            {t("PasswordLength") || "Be at least 8 characters long"}
                        </li>
                        <li className="flex items-center gap-2">
                            {passwordChecks.uppercase ? <Check className="text-success w-4 h-4" /> : <X className="text-danger w-4 h-4" />}
                            {t("PasswordUppercase") || "Include at least one uppercase letter"}
                        </li>
                        <li className="flex items-center gap-2">
                            {passwordChecks.lowercase ? <Check className="text-success w-4 h-4" /> : <X className="text-danger w-4 h-4" />}
                            {t("PasswordLowercase") || "Include at least one lowercase letter"}
                        </li>
                        <li className="flex items-center gap-2">
                            {passwordChecks.number ? <Check className="text-success w-4 h-4" /> : <X className="text-danger w-4 h-4" />}
                            {t("PasswordNumber") || "Include at least one number"}
                        </li>
                        <li className="flex items-center gap-2">
                            {passwordChecks.specialChar ? <Check className="text-success w-4 h-4" /> : <X className="text-danger w-4 h-4" />}
                            {t("PasswordSpecial") || "Include at least one special character"}
                        </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/adminUser")}
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    disabled={isSubmitting}
                  >
                    {t("Cancel") || "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t("Saving") || "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("SaveChanges") || "Save Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
