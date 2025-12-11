import  { useState, useEffect, } from 'react';
import { X } from '@phosphor-icons/react';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [mobile, setMobile] = useState<string>('');

  // Disable body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] min-h-screen">
      <div className="w-full  max-w-4xl lg:max-w-4xl md:max-w-3xl bg-white rounded-none md:rounded-3xl overflow-hidden shadow-lg flex flex-col md:flex-row relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 bg-gray-500 rounded-full p-1 text-white hover:bg-gray-800 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Mobile Layout */}
        <div
          className="flex flex-col items-center justify-center text-center px-6 md:hidden overflow-y-auto"
          style={{ height: '100dvh', maxHeight: '100dvh' }}
        >
          <div className="w-full max-w-md flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-3">Welcome to</h2>
            <img
              src="/kes-new-2.png"
              alt="Kisan eStore"
              className="w-48 mx-auto mb-2"
            />
            <p className="text-green-600 font-medium mb-6">
              Join us for a better experience!
            </p>
            <form  className="w-full max-w-md">
              <div className="flex mb-4">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 text-gray-600 text-sm rounded-l-md">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-r-md text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded mb-4"
              >
                Continue
              </button>
            </form>
            {/* Divider */}
            <div className="flex items-center my-6 w-full max-w-md">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-400 text-sm">Or</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <button className="w-full max-w-md bg-gray-800 text-white font-medium py-2 rounded mb-3">
              Continue with Email
            </button>
            <button className="w-full max-w-md bg-green-600 text-white font-medium py-2 rounded mb-3">
              Continue as VLE
            </button>
            <button className="w-full max-w-md border border-gray-300 text-gray-700 py-2 rounded flex items-center justify-center gap-2">
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <p className="text-xs text-gray-500 text-center mt-4 px-2 max-w-xs">
              Your details are safe with us. <br />
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              &{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Layout */}
        <div className="hidden md:flex w-full">
          {/* Left Panel */}
          <div className="w-1/2 bg-blue-600 text-white p-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-8">Welcome to</h2>
            <img
              src="/kes-new-2.png"
              alt="Kisan eStore"
              className="mb-8 w-70"
            />
            <p className="text-center text-1xl">
              Your trusted partner for agricultural solutions
            </p>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 p-6 flex flex-col items-center text-center">
            <h3 className="text-2xl font-semibold mb-5 mt-6">Login or Sign Up</h3>
            <p className="text-gray-600 mb-6 text-1xl">
              Get access to your orders, wishlist and recommendations
            </p>
            <form  className="w-full max-w-md">
              <div className="flex mb-4">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 text-gray-600 text-sm rounded-l-md">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-r-md text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded mb-4"
              >
                Continue
              </button>
            </form>
            <div className="flex items-center my-4 w-full max-w-md">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-400 text-sm">Or</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <button className="w-full max-w-md bg-gray-800 text-white font-medium py-2 rounded mb-5">
              Continue with Email
            </button>
            <button className="w-full max-w-md bg-green-600 text-white font-medium py-2 rounded mb-5">
              Continue as VLE
            </button>
            <button className="w-full max-w-md border border-gray-300 text-gray-700 py-2 rounded flex items-center justify-center gap-2">
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <p className="text-xs text-gray-500 text-center mt-4 mb-2 px-2 max-w-md">
              Your details are safe with us.
            </p>
            <p className="text-xs text-gray-500 text-center  mb-2 px-2 max-w-md">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              &{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
