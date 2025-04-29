
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiClient } from "@/services/apiService";
import PopUp from "./ui/custom-toast";
import { useLanguage } from "@/context/language-context";

interface RegisterPromptModalProps {
  show: boolean;
  onClose: () => void;
  onRegister: (data: { name: string; email: string }) => Promise<boolean>;
}
const RegisterPromptModal: React.FC<RegisterPromptModalProps> = ({
  show,
  onClose,
  onRegister
}) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [inputOtp, setInputOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [errors, setErrors] = useState<{ name?: string; email?: string; otp?: string }>({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isSending, setIsSending] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { t, language } = useLanguage()

  const handleSend = async () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!email.trim()) {
      newErrors.email = language=="es"?"El correo electrónico es obligatorio":"Email is required"
    } else if (!emailRegex.test(email)) {
      newErrors.email = language=="es"? "Ingrese una dirección de correo electrónico válida" :"Enter a valid email address"
    }

    if (!isLoginMode && !name.trim()) {
      newErrors.name =language === "es" 
      ? "El nombre es obligatorio" 
      : "Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSending(true);

    if (isLoginMode) {
      try {
        const response = await apiClient.post('/mobileUsers/loginMobileUser', { email });
        if (response.status === 200) {
          setShowOtp(true);
          setToast({ show: true, message: response.data.message, type: 'success' });
        }
      } catch (err) {
        console.log(err)
        setToast({ show: true, message: err.response.data.message, type: 'error' });
      }
      setIsSending(false);
    } else {
      const success = await onRegister({ name, email });
      setIsSending(false);
      if (success) setShowOtp(true);
    }
  };
  

  const handleOtpChange = (index: number, value: string) => {
    const updatedOtp = [...inputOtp];
    updatedOtp[index] = value.slice(0, 1);
    setInputOtp(updatedOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmitOtp = async () => {
    if (inputOtp.some(digit => digit.trim() === "")) {
      setErrors({ otp: "Please fill in all OTP fields" });
      return;
    }
    try {
      const otp = inputOtp.join("");
      const response = await apiClient.post('/mobileUsers/verifyMobileUserOtp', { email, otp });

      if (response.status === 200) {
        setToast({ show: true, message: response.data.message, type: 'success' });
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("mobileToken", response.data.token);
        setTimeout(() => {
          setInputOtp(["", "", "", ""]);
          onClose();
        }, 1000);
      } else {
        throw new Error();
      }
    } catch {
      setToast({ show: true, message: "Invalid OTP", type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setName("");
    setEmail("");
    setInputOtp(["", "", "", ""]);
    setShowOtp(false);
    setIsLoginMode(false);
    onClose();
  };
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w text-center relative MOdalWidth">
        <button
          onClick={handleCloseModal}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        >
          &times;
        </button>



        {showOtp ? "" : <div className="flex justify-center items-center space-x-4 bg-gray-100 p-4 rounded-t-lg ">
          <button
            onClick={() => setIsLoginMode(false)}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              width: "128px",
              transition: "all 0.3s ease-in-out",
              transform: "scale(1)",
              backgroundColor: !isLoginMode ? "#F1582E" : "#E5E7EB",
              color: !isLoginMode ? "white" : "#4B5563",
            }}
          >

            {t("registerHeading")}
          </button>
          <button
            onClick={() => setIsLoginMode(true)}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              width: "128px",
              transition: "all 0.3s ease-in-out",
              transform: "scale(1)",
              backgroundColor: isLoginMode ? "#F1582E" : "#E5E7EB",
              color: isLoginMode ? "white" : "#4B5563",
            }}
          >
            {t("loginHeading")}

          </button>
        </div>}
        {/* Email & Name Inputs */}
        {!showOtp ? (
          <>

            {!isLoginMode && (
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder={language == "es" ? "Nombre" : "Name"}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}
                />
                {errors.name && <p style={{color:"red"}} className="text-red-500 text-sm mt-1 text-left">{errors.name}</p>}
              </div>
            )}
            <div className="mb-4">
              <Input
                type="email"
                placeholder={language == "es" ? "Correo Electrónico" : "Email"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: "" }));
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                  .replace(/[^a-zA-Z0-9\s@.]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                  .replace(/^\s+/g, ""); 

                }}
              />
              {errors.email && <p style={{ color: "red" }} className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>}
            </div>
            <Button onClick={handleSend} className="w-full !bg-transparent bgSecondary !bg-[#FAC584]" disabled={isSending}>
              {isSending ? `${t("sendOtpButtonSending")}` : `${t("sendOtpButton1")}`}
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-3"> {t("verifyOtpHeading")}</h2>
            <div className="flex justify-center gap-2 mb-4">
              {inputOtp.map((digit, index) => (
                <Input
                  key={index}
                  type="number"
                  maxLength={1}
                  value={digit}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !inputOtp[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="text-center text-lg h-10 w-11 border rounded-md text-black"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value
                    .replace(/[^a-zA-Z0-9\s]/g, "")   // Remove invalid characters (anything that's not a letter, number, or space)
                    .replace(/^\s+/g, ""); 
  
                  }}
                />
              ))}
            </div>
            {errors.otp && <p style={{ color: "red" }} className="text-red-500 text-sm mb-2">{errors.otp}</p>}
            <Button onClick={handleSubmitOtp} className="w-auto">

              {t("sendOtpButton1")}
            </Button>
          </>
        )}
      </div>

      {toast.show && (
        <PopUp
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
          message={toast.message}
        />
      )}
    </div>
  );
};

export default RegisterPromptModal;
