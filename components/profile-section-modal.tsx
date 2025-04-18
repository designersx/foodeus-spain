import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiClient } from "@/services/apiService";
import decodeToken from "@/lib/decode-token";
import PopUp from "./ui/custom-toast";
import { useLanguage } from "@/context/language-context";
import { error } from "console";

interface ProfileSectionModalProps {
  show: boolean;
  onClose: () => void;
}

type DecodedToken = {
  userId: string;
};

const ProfileSection: React.FC<ProfileSectionModalProps> = ({ show, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const token = localStorage.getItem("mobileToken");
  const getUserId: DecodedToken | null = token ? decodeToken(token) as DecodedToken : null;
  const { t, language } = useLanguage()
  useEffect(() => {
    if (getUserId?.userId) {
      apiClient
        .get(`/mobileUsers/getMobileUserWithId/${getUserId.userId}`)
        .then((res) => {
          const user = res.data?.data || {};
          setName(user.name || "");
          setEmail(user.email || "");
        })
        .catch((err) => {
          console.error("Error fetching user data", err);
        });
    }
  }, []);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleUpdate = () => {
    const newErrors: { name?: string; email?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (getUserId?.userId) {
      apiClient
        .put(`/mobileUsers/updateMobileUserWithId/${getUserId.userId}`, {
          name,
          email,
        })
        .then((response) => {
          if (response.data.success) {
            setToast({ show: true, message: "Updated successfully!", type: "success" });
          } else {
            setToast({ show: true, message: "Update failed!", type: "error" });
          }
        })
        .catch((err) => {
          setToast({ show: true, message: ` ${err.response.data.message}`, type: "error" });
          console.error("Error updating user data", err);
        });
    }

    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
      setIsEditing(false);
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center px-4 "
      style={{ backgroundColor: "#000000a3" }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative space-y-6 ">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>



        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-800 text-center border-b pb-3">
          {t("profileHeading")}
        </h2>

        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">{t("profileName")}</label>
          {isEditing ? (
            <>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </>
          ) : (
            <p className="text-gray-900 font-medium border p-2 rounded">{name}</p>
          )}

        </div>

        {/* Divider */}
        <hr className="my-2" />

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">{t("profileEmail")}</label>
          {isEditing ? (
            <>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </>
          ) : (
            <p className="text-gray-900 font-medium border p-2 rounded">{email}</p>
          )}
        </div>
        {/* Edit Button */}
        <button
          onClick={handleEditToggle}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          style={{ background: "#0d6efd", color: "#fff" }}
        >
          {isEditing ? ` ${t("ProfileCancel")}` : `${t("ProfileEdit")}`}
        </button>

        {/* Update Button */}
        {isEditing && (
          <Button
            onClick={handleUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            style={{ background: "#0d6efd" }}>

            {t("ProfileUpdate")}
          </Button>
        )}
      </div>

      {/* Toast */}
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

export default ProfileSection;
