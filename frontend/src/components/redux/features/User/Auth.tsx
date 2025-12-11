import { useState, useEffect } from "react";
import { LoginView } from "./login/LoginView";
import { X } from "@phosphor-icons/react";
import { useAppSelector } from "../../app/hook"; // 🎯 Import useAppSelector

interface AuthModalProps {
  onClose: () => void; // function prop to close the modal
}

const Auth: React.FC<AuthModalProps> = ({ onClose }: AuthModalProps) => {
  const [isRegister, setIsRegister] = useState(false); // toggle between login & register
  const toggleView = () => setIsRegister(!isRegister);

  // 1. Listen to Redux state for successful operations
  // We check the 'redirectTo' field, as that is set only upon successful login/register
  const loginRedirectTo = useAppSelector((state) => state.login.redirectTo);
  const registerRedirectTo = useAppSelector((state) => state.register.redirectTo);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // 2. CRITICAL: Effect to close the modal after successful login or registration
  useEffect(() => {
    // If either authentication flow sets a dynamic redirect path, close the modal.
    if (loginRedirectTo || registerRedirectTo) {
      onClose();
    }
    // Dependency array ensures this runs only when the redirect path changes
  }, [loginRedirectTo, registerRedirectTo, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] min-h-screen">
      <div className="relative w-full max-w-4xl mx-auto h-[500px] bg-transparent rounded-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 bg-gray-500 rounded-full p-1 text-white hover:bg-gray-800 hover:text-white transition"
        >
          <X size={20} />
        </button>
        <div
          className={`relative max-w-7xl h-[500px] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-white transition-all duration-700 `}
        >
          {/* LEFT — Login Form */}
          <div
            className={`absolute top-0 left-0 h-full w-full bg-white flex flex-col justify-center items-center transition-transform duration-700`}
          >
            <LoginView />
          </div>

        
          
        </div>
      </div>
    </div>
  );
};

export default Auth;