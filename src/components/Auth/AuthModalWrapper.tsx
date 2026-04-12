import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useUiStore } from "../../store/uiStore";

interface AuthModalWrapperProps {
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
}

const AuthModalWrapper: React.FC<AuthModalWrapperProps> = ({
  children,
  title,
  size = "md",
}) => {
  const { closeModal } = useUiStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeModal]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        ref={modalRef}
        className={`bg-bg-card rounded-lg shadow-2xl w-full ${sizeClasses[size]} relative flex flex-col max-h-[90vh] overflow-hidden animate-scale-in`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b border-stroke-light">
          <h2 className="text-xl font-bold text-brand-text uppercase">
            {title}
          </h2>
          <button
            onClick={closeModal}
            className="absolute right-4 text-brand-text hover:text-neutral-gray-900 transition-colors p-1 rounded-full hover:bg-bg-light-blue"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default AuthModalWrapper;
