import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl font-extrabold font-display text-brand-primary opacity-20 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold font-display text-neutral-gray-800 mb-2">
        Page Not Found
      </h1>
      <p className="brand-text mb-8 max-w-md">
        The page you are looking for might have been moved, deleted, or never
        existed.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-bg-light-blue hover:bg-stroke-light text-brand-text font-medium rounded transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-brand-text font-medium rounded transition-colors"
        >
          <FiHome className="w-4 h-4" />
          Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
