// RegisterView.tsx

import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { registerUser, clearRegisterState } from "./registerSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: "admin" | "tutor" | "student" | "";
  phone?: string;

}

export const RegisterView = () => {
  const dispatch = useAppDispatch();
  // Initialize useNavigate (THIS REQUIRES THE COMPONENT TO BE INSIDE <Router>)
  const navigate = useNavigate();
  const { loading, error, successMessage } = useAppSelector((state) => state.register);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      role: "",
    }
  });


  // 🚀 CRITICAL FIX: Effect for redirection and state cleanup
  useEffect(() => {
    // Redirect on success
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearRegisterState());
        navigate('/'); // Redirects to home/dashboard after successful registration
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Cleanup state on component unmount if necessary
    return () => {
      if (loading === 'succeeded' || loading === 'failed') {
        dispatch(clearRegisterState());
      }
    }
  }, [successMessage, navigate, dispatch, loading]);


  const submitHandler = (data: RegisterForm) => {
    dispatch(registerUser(data));
  };


  const FloatingInput = ({ name, label, type = "text", isRequired = false, isSelect = false }: { name: keyof RegisterForm, label: string, type?: string, isRequired?: boolean, isSelect?: boolean }) => {
    const fieldErrors = errors[name];
    const registrationProps = register(name, isRequired ? { required: `${label} is required` } : {});

    if (isSelect) {
      return (
        <div className="relative">
          <select
            className="border border-[#1B9B7D] rounded-md px-4 py-4 w-full appearance-none bg-white outline-none focus:outline-none 
             focus:border-[#1B9B7D] peer"
            {...registrationProps}
          >
            <option value="" disabled>Select Role</option>
            <option value="tutor">tutor</option>
            <option value="student">Student</option>
          </select>
          {fieldErrors && <p className="text-red-500 text-sm mt-1">{fieldErrors.message}</p>}
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          id={name}
          type={type}
          placeholder=" "
          className="peer w-full border-2 border-gray-300 rounded-md px-3 py-3 
             outline-none focus:outline-none 
             focus:border-[#1B9B7D]"
          {...registrationProps}
        />


        <label
          htmlFor={name}
          className=" absolute left-4 top-3 text-gray-500 bg-white px-1 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
peer-focus:top-0
peer-focus:left-2
peer-focus:-translate-y-1/2
peer-focus:text-xs
peer-focus:text-[#1B9B7D]
peer-focus:font-bold
peer-not-placeholder-shown:top-0
peer-not-placeholder-shown:-translate-y-1/2
peer-not-placeholder-shown:text-xs "
        >
          {label} {isRequired && "*"}
        </label>
      </div>
    );
  };


  return (
    <div className="py-24 px-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#feb238]">Register</h2>
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">

        {/* 🎯 Ensure ALL FloatingInput calls are present here */}
        <FloatingInput name="name" label="Name" isRequired={true} />
        <FloatingInput name="email" label="Email" type="email" isRequired={true} />
        <FloatingInput name="password" label="Password" type="password" isRequired={true} />
        <FloatingInput name="role" label="Role" isRequired={true} isSelect={true} />
        <FloatingInput name="phone" label="Phone (Optional)" isRequired={false} />

        {/* State Messages */}
        {(error || successMessage) && (
          <div className="pt-2">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm font-medium">{successMessage} Redirecting...</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading === "pending" || loading === "succeeded"}
          className="bg-black text-[#C4872B] w-full py-3 rounded-md hover:bg-neutral-900 transition mt-6"
        >
          {loading === "pending" ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};