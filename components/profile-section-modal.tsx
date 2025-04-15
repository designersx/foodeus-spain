import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiClient } from "@/services/apiService";
import decodeToken from "@/lib/decode-token";
import PopUp from "./ui/custom-toast";

interface ProfileSectionModalProps {
    show: boolean;
    onClose: () => void;

}
type DecodedToken = {
    userId: string;
};
const ProfileSection: React.FC<ProfileSectionModalProps> = ({
    show,
    onClose,

}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const token = localStorage.getItem("token");
    const getUserId: DecodedToken | null = token ? decodeToken(token) as DecodedToken : null;
    // Fetch user details
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
        // Clear errors
        setErrors({});
        // Call the update API to update user details
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
                    setToast({ show: true, message: "An error occurred. Please try again.", type: "error" });
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
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full text-center relative">
                <button
                    style={{ width: "40px", height: "40px", fontSize: "25px" }}
                    onClick={handleCloseModal}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                    &times;
                </button>
                <button
                    onClick={handleEditToggle}
                    className="absolute top-2 left-2 text-gray-600 hover:text-black text-xl"
                >
                    {isEditing ? "Cancel" : "Edit"}
                </button>

                <h2 className="text-xl font-semibold mb-4">Profile Details</h2>

                <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-medium">Name</label>
                    {isEditing ? (
                        <>
                            <Input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setErrors((prev) => ({ ...prev, name: "" }));
                                }}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </>
                    ) : (
                        <p className="mt-2 text-gray-800">{name}</p>
                    )}
                </div>
                <br />

                <div className="flex justify-between items-center gap-4">
                    <label className="text-sm font-medium">Email</label>
                    {isEditing ? (
                        <>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors((prev) => ({ ...prev, email: "" }));
                                }}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </>
                    ) : (
                        <p className="mt-2 text-gray-800">{email}</p>
                    )}
                </div>
                <br />
                {isEditing && (
                    <Button variant="default" className="w-full" onClick={handleUpdate}>
                        Update
                    </Button>
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

export default ProfileSection;
