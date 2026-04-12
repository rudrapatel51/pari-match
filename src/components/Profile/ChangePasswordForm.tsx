import React, { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useToastStore } from "../../store/toastStore";

const ChangePasswordForm: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToastStore();

  const { changePassword, isChangingPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-brand-text-10">
          <FiLock className="w-5 h-5 text-brand-text-70" />
        </div>
        <h3 className="text-lg font-bold text-brand-text">Change Password</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Old Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-bg-card border border-stroke-light text-brand-text focus:bg-bg-light-blue focus:outline-none focus:border-brand-primary focus:ring-0 transition-all placeholder:text-neutral-gray-500"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-gray-600 hover:text-brand-text transition-colors"
            >
              {showOldPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-bg-card border border-stroke-light text-brand-text focus:bg-bg-light-blue focus:outline-none focus:border-brand-primary focus:ring-0 transition-all placeholder:text-neutral-gray-500"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-gray-600 hover:text-brand-text transition-colors"
            >
              {showNewPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-brand-text-60">
            Minimum 6 characters. Recommended: 1 uppercase, 1 lowercase, 1
            number, 1 special character
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-bg-card border border-stroke-light text-brand-text focus:bg-bg-light-blue focus:outline-none focus:border-brand-primary focus:ring-0 transition-all placeholder:text-neutral-gray-500"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-gray-600 hover:text-brand-text transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full bg-accent-green hover:opacity-90 text-black font-bold py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isChangingPassword ? "CHANGING PASSWORD..." : "CHANGE PASSWORD"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
