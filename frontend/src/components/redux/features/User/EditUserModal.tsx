import { useForm } from "react-hook-form";
import axiosClient from "../../../api/axiosClient";
import { X } from "@phosphor-icons/react";
import type { User } from "../../../types/allType";

interface Props {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}

const ROLES = [
  "admin",
  "Developer",
  "Designer",
  "Quality Testing",
  "Bussiness Analyst",
];



const EditUserModal = ({ user, onClose, onUpdated }: Props) => {
  const { register, handleSubmit } = useForm<User>({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      
    },
  });

  const onSubmit = async (data: User) => {
    try {
      await axiosClient.put(`/api/users/edit/${user._id}`, data, {
        withCredentials: true,
      });

      alert("User updated successfully");

      onUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      
      {/* overlay */}

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}

      <div
        className="relative w-[520px] bg-white rounded-2xl shadow-2xl px-8 py-10"
        onClick={(e) => e.stopPropagation()}
      >

        {/* close */}

        <button
          onClick={onClose}
          className="absolute right-5 top-5 bg-black text-white rounded-full p-1"
        >
          <X size={16} />
        </button>

        {/* heading */}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black">
            Edit User
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Update user information
          </p>
        </div>

        {/* form */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <input
            {...register("name")}
            className="w-full px-6 py-4 border border-gray-300 rounded-full"
          />

          <input
            {...register("email")}
            className="w-full px-6 py-4 border border-gray-300 rounded-full"
          />

          <select
            {...register("role")}
            className="w-full px-6 py-4 border border-gray-300 rounded-full"
          >
            {ROLES.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>

          
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-black text-white font-semibold"
          >
            Update User
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditUserModal;