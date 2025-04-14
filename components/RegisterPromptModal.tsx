
import React, { useRef, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { apiClient } from "@/services/apiService";
import { toast, ToastContainer } from "react-toastify";
interface RegisterPromptModalProps {
  show: boolean;
  onClose: () => void;
  onRegister: (data: { name: string; email: string }) => void;
}

const RegisterPromptModal: React.FC<RegisterPromptModalProps> = ({
  show,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [inputOtp, setInputOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const handleSend = () => {
    onRegister({ name, email });
    setShowOtp(true);
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
    const isOtpComplete = inputOtp.every(digit => digit !== "");

    if (!isOtpComplete) {
      toast.error("Please fill in all OTP fields");
      return; // Stop form submission if OTP is incomplete
    }
    try {
      const otp = inputOtp.join("")
      const response = await apiClient.post('/mobileUsers/verifyMobileUserOtp', { email, otp });
      if (response.status === 200) {
        toast.success(response.data.message)
        console.log("OTP verify", response.data);
        setInputOtp(["", "", "", ""])
        localStorage.setItem("isLoggedIn","true")
        setTimeout(() => {
          setInputOtp(["", "", "", ""]);
          onClose();
        }, 2000)
      }
      else {
        toast.error("Invalid OTP, please try again!")
      }
    } catch (error) {
      toast.error("Invalid OTP, please try again!")
      console.error("Error registering user", error);

    }

  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          &times;
        </button>
        {/* Input Fields for Name and Email */}
        {!showOtp ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            <p className="mb-4">You must be logged in to access the menu.</p>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Send Button */}
            <Button
              variant="default"
              size="default"
              className="w-full"
              onClick={handleSend}
            >
              Send Otp
            </Button>
          </>
        ) : (
          <>
            {/* OTP Input Fields with Flexbox */}
            <h2 className="text-xl font-semibold mb-3">Verify Email</h2>
            <div className="flex justify-center gap-2 mb-4">
              {inputOtp.map((digit, index) => (
                <Input
                  key={index}
                  type="number"
                  required
                  maxLength={2}
                  value={digit}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !inputOtp[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="text-center text-lg h-10 w-11 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            {/* Submit OTP Button */}
            <div className="flex justify-center mt-4">
              <Button
                variant="default"
                size="sm"
                className="w-auto"
                onClick={handleSubmitOtp}
              >
                Submit OTP
              </Button>
            </div>
          </>
        )}
      </div>
      <ToastContainer style={{ width: '400px' }} />
    </div>
  );
};

export default RegisterPromptModal;
