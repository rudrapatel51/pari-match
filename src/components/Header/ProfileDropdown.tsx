import React from "react";
import { FiUser } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ProfileDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/my-account")}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-primary hover:bg-brand-primary-light transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
      aria-label="Account menu"
      title={`${user?.username || "Account"}`}
    >
      <FiUser className="w-5 h-5 text-white" />
    </button>
  );
};

export default ProfileDropdown;
