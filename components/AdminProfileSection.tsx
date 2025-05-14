// import React, { useEffect, useState } from "react";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { API_BASE_URL, apiClient } from "@/services/apiService";
// import decodeToken from "@/lib/decode-token";
// import PopUp from "./ui/custom-toast";
// import { useLanguage } from "@/context/language-context";

// interface AdminProfileSectionProps {
//   show: boolean;
//   onClose: () => void;
// }

// type DecodedToken = {
//   id: string;
// };

// const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({ show, onClose }) => {
//   const [adminData, setAdminData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     role: "",
//     profile: "",
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const [errors, setErrors] = useState<{ name?: string; email?: string; mobile?: string }>({});
//   const token = localStorage.getItem("token");
//   const getUserId: DecodedToken | null = token ? decodeToken(token) as DecodedToken : null;
//   const [loading, setLoading] = useState(true);
//   const { t } = useLanguage();

//   useEffect(() => {
//     if (show) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }

//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, [show]);

//   useEffect(() => {
//     if (getUserId?.id) {
//       apiClient
//         .get(`/admin/${getUserId.id}`,{
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         })
//         .then((res) => {
//           const user = res.data?.data || {};
//           setAdminData({
//             name: user.name || "",
//             email: user.email || "",
//             mobile: user.mobile || "",
//             role: user.role || "Admin",
//             profile: user.profile || "",
//           });
//         })
//         .catch((err) => {
//           console.error("Error fetching admin data", err);
//           setToast({ show: true, message: "Error fetching admin data", type: "error" });
//           setTimeout(() => {
//             localStorage.removeItem("adminToken");
//             handleCloseModal();
//           }, 1500);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, []);

//   const handleEditToggle = () => setIsEditing((prev) => !prev);

//   const handleUpdate = () => {
//     const newErrors: { name?: string; email?: string; mobile?: string } = {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^\d{10}$/;

//     if (!adminData.name.trim()) newErrors.name = "Name is required";
//     if (!adminData.email.trim()) newErrors.email = "Email is required";
//     else if (!emailRegex.test(adminData.email)) newErrors.email = "Invalid email";
//     if (!phoneRegex.test(adminData.mobile)) newErrors.mobile = "Invalid mobile number";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setErrors({});

//     if (getUserId?.id) {
//       apiClient
//         .put(`/admin/update/${getUserId.id}`, adminData,{
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         })
//         .then((res) => {
//           const success = res.data?.success;
//           setToast({
//             show: true,
//             message: success ? "Updated successfully!" : "Update failed!",
//             type: success ? "success" : "error",
//           });
//         })
//         .catch((err) => {
//           setToast({ show: true, message: err.response?.data?.message || "Error", type: "error" });
//           console.error("Update error:", err);
//         });

//       setTimeout(() => {
//         setToast({ show: false, message: "", type: "" });
//         setIsEditing(false);
//       }, 2000);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsEditing(false);
//     onClose();  
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex justify-center items-center px-4"
//       style={{ backgroundColor: "#000000a3", zIndex: 10000 }}
//     >
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative space-y-6">
//         {loading ? (
//           <div className="flex justify-center items-center h-screen w-screen bg-white">
//             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//         ) : (
//           <>
//             <button
//               onClick={handleCloseModal}
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-2xl"
//             >
//               &times;
//             </button>

//             <h2 className="text-2xl font-bold text-gray-800 text-center border-b pb-3">
//               {t("adminProfileHeading") || "Admin Profile"}
//             </h2>

//             {/* Profile Image */}
//             {/* {adminData.profile && (
//               <img
//                 src={`${API_BASE_URL}/${adminData.profile}`}
//                 alt="Admin Profile"
//                 className="mx-auto h-20 w-20 rounded-full object-cover border"
//               />
//             )} */}

//             {/* Fields */}
//             {["name", "email", "mobile"].map((field) => (
//               <div key={field} className="space-y-1">
//                 <label className="text-sm font-semibold text-gray-700 block">
//                   {t(`adminProfile${field.charAt(0).toUpperCase() + field.slice(1)}`) || field}
//                 </label>
//                 {isEditing ? (
//                   <>
//                     <Input
//                       type={field === "email" ? "email" : "text"}
//                       value={adminData[field as keyof typeof adminData]}
//                       onChange={(e) => {
//                         setAdminData((prev) => ({ ...prev, [field]: e.target.value }));
//                         setErrors((prev) => ({ ...prev, [field]: "" }));
//                       }}
//                     />
//                     {errors[field as keyof typeof errors] && (
//                       <p className="text-danger text-xs mt-1">{errors[field as keyof typeof errors]}</p>
//                     )}
//                   </>
//                 ) : (
//                   <p className="text-gray-900 font-medium border p-2 rounded">
//                     {adminData[field as keyof typeof adminData]}
//                   </p>
//                 )}
//               </div>
//             ))}

//             {/* Role - readonly */}
//             <div className="space-y-1">
//               <label className="text-sm font-semibold text-gray-700 block">Role</label>
//               <p className="text-gray-900 font-medium border p-2 rounded">{adminData.role}</p>
//             </div>

//             {/* Action Buttons */}
//             <button
//               onClick={handleEditToggle}
//               className="w-full font-semibold py-2 rounded-md"
//             >
//               {isEditing ? t("adminCancel") || "Cancel" : t("adminEdit") || "Edit"}
//             </button>

//             {isEditing && (
//               <Button
//                 onClick={handleUpdate}
//                 className="w-full font-semibold py-2 rounded-md"
//               >
//                 {t("adminUpdate") || "Update"}
//               </Button>
//             )}
//           </>
//         )}
//       </div>

//       {toast.show && (
//         <PopUp
//           type={toast.type}
//           message={toast.message}
//           onClose={() => setToast({ show: false, message: "", type: "" })}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminProfileSection;


import React, { useEffect, useState, useMemo, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { API_BASE_URL, apiClient } from "@/services/apiService";
import decodeToken from "@/lib/decode-token";
import PopUp from "./ui/custom-toast";
import { useLanguage } from "@/context/language-context";
import { UserCircle2 } from "lucide-react";

interface AdminProfileSectionProps {
  show: boolean;
  onClose: () => void;
}

type DecodedToken = {
  id: string;
};

interface AdminData {
  name: string;
  email: string;
  mobile: string;
  role: string;
  profile: string | File;
}

const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({ show, onClose }) => {
  const [adminData, setAdminData] = useState<AdminData>({
    name: "",
    email: "",
    mobile: "",
    role: "",
    profile: "",
  });
  const [originalData, setOriginalData] = useState<AdminData>(adminData);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; mobile?: string; profile?: string }>({});
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");
  const getUserId: DecodedToken | null = token ? (decodeToken(token) as DecodedToken) : null;
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Memoize avatar initials
  const avatarInitials = useMemo(() => {
    return adminData.name
      ? adminData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "AD";
  }, [adminData.name]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  useEffect(() => {
    if (getUserId?.id) {
      setLoading(true);
      apiClient
        .get(`/admin/${getUserId.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const user = res.data?.data || {};
          const newData = {
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            role: user.role || "Admin",
            profile: user.profile || "",
          };
        //   console.log("user", user);
          setAdminData(newData);
          setOriginalData(newData);
          setPreviewUrl(user.profile ? `${API_BASE_URL}/${user.profile}` : "");
        })
        .catch((err) => {
          console.error("Error fetching admin data", err);
          setToast({ show: true, message: t("errorFetch") || "Error fetching admin data", type: "error" });
          setTimeout(() => {
            localStorage.removeItem("adminToken");
            handleCloseModal();
          }, 1500);
        })
        .finally(() => setLoading(false));
    }
  }, [getUserId?.id, t]);

  const handleEditToggle = () => {
    if (isEditing) {
      setAdminData(originalData);
      setErrors({});
      setPreviewUrl(originalData.profile ? `${API_BASE_URL}/${originalData.profile}` : "");
    }
    setIsEditing((prev) => !prev);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, profile: t("errorInvalidImage") || "Invalid image format" }));
        return;
      }
      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, profile: t("errorImageSize") || "Image size exceeds 5MB" }));
        return;
      }
      setAdminData((prev) => ({ ...prev, profile: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profile: "" }));
    }
  };

  const handleUpdate = () => {
    const newErrors: { name?: string; email?: string; mobile?: string; profile?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!adminData.name.trim()) newErrors.name = t("errorNameRequired") || "Name is required";
    if (!adminData.email.trim()) newErrors.email = t("errorEmailRequired") || "Email is required";
    else if (!emailRegex.test(adminData.email)) newErrors.email = t("errorEmailInvalid") || "Invalid email";
    if (!phoneRegex.test(adminData.mobile)) newErrors.mobile = t("errorMobileInvalid") || "Invalid mobile number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (getUserId?.id) {
      const formData = new FormData();
      formData.append("name", adminData.name);
      formData.append("email", adminData.email);
      formData.append("mobile", adminData.mobile);
      if (adminData.profile instanceof File) {
        formData.append("profile", adminData.profile);
      }

      apiClient
        .put(`/admin/update/${getUserId.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          const success = res.data?.success;
          setToast({
            show: true,
            message: success ? t("updateSuccess") || "Updated successfully!" : t("updateFailed") || "Update failed!",
            type: success ? "success" : "error",
          });
        //   console.log("Update response:", res.data);
          if (success) {
            const updatedProfile = res.data?.data?.profile || adminData.profile;
            setOriginalData({
              ...adminData,
              profile: updatedProfile instanceof File ? updatedProfile : updatedProfile,
            });
            setAdminData((prev) => ({
              ...prev,
              profile: updatedProfile,
            }));
            setPreviewUrl(updatedProfile ? `${API_BASE_URL}/${updatedProfile}` : "");
          }
        })
        .catch((err) => {
          setToast({
            show: true,
            message: err.response?.data?.message || t("errorGeneric") || "Error",
            type: "error",
          });
          console.error("Update error:", err);
        });

      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
        setIsEditing(false);
      }, 2000);
    }
  };

  const handleCloseModal = () => {
    setAdminData(originalData);
    setErrors({});
    setPreviewUrl(originalData.profile ? `${API_BASE_URL}/${originalData.profile}` : "");
    setIsEditing(false);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center min-h-screen transition-opacity duration-300 overflow-y-auto ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)"}}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6 transform transition-all duration-300 scale-100 relative" >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-6 relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Admin Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = "/userIcon.png";
                    }}
                    style={{height: "150px", width: "150px"}}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-teal-400 flex items-center justify-center text-white text-xl font-semibold">
                    {avatarInitials}
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full"
                  >
                    {t("changeProfilePicture") || "Change Picture"}
                  </Button>
                  {errors.profile && <p className="text-danger text-xs mt-1 text-center">{errors.profile}</p>}
                </div>
              )}
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {t("adminProfileHeading") || "Admin Profile"}
              </h2>
              <p className="text-sm text-gray-500">{adminData.role}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {["name", "email", "mobile"].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t(`adminProfile${field.charAt(0).toUpperCase() + field.slice(1)}`) || field}
                  </label>
                  {isEditing ? (
                    <>
                      <Input
                        type={field === "email" ? "email" : "text"}
                        value={adminData[field as keyof AdminData]}
                        onChange={(e) => {
                          setAdminData((prev) => ({ ...prev, [field]: e.target.value }));
                          setErrors((prev) => ({ ...prev, [field]: "" }));
                        }}
                        className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
                        placeholder={t(`placeholder${field.charAt(0).toUpperCase() + field.slice(1)}`) || `Enter ${field}`}
                      />
                      {errors[field as keyof typeof errors] && (
                        <p className="text-danger text-xs mt-1">{errors[field as keyof typeof errors]}</p>
                      )}
                    </>
                  ) : (
                    <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {adminData[field as keyof AdminData] || "N/A"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 -mx-6 px-6">
              <Button
                onClick={handleEditToggle}
                variant={isEditing ? "outline" : "default"}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  isEditing
                    ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isEditing ? t("adminCancel") || "Cancel" : t("adminEdit") || "Edit"}
              </Button>
              {isEditing && (
                <Button
                  onClick={handleUpdate}
                  className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-all"
                >
                  {t("adminUpdate") || "Update"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {toast.show && (
        <PopUp
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default AdminProfileSection;