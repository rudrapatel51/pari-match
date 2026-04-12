import React, { useState } from "react";

import { FiSmartphone, FiLock, FiCheck } from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";
import { useToastStore } from "../../store/toastStore";

import AuthModalWrapper from "./AuthModalWrapper";

const ForgotPasswordModal: React.FC = () => {
  const { closeModal, openModal } = useUiStore();
  const toast = useToastStore();
  const {
    sendForgotPasswordOtp,
    isSendingForgotOtp,
    verifyForgotPasswordOtp,
    isVerifyingForgotOtp,
    resetPassword,
    isResettingPassword,
  } = useAuth();

  const [step, setStep] = useState<"phone" | "otp" | "reset">("phone");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendForgotPasswordOtp(
      { mobile, type: "forgot_password" },
      {
        onSuccess: () => setStep("otp"),
      },
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyForgotPasswordOtp(
      { mobile, otp, type: "forgot_password" },
      {
        onSuccess: (response) => {
          // response is VerifyOtpResponse ({ reset_token })
          const token = response.data?.reset_token;
          // Wait, verifyForgotPasswordOtp returns AxiosResponse<VerifyOtpResponse>
          // So response.data.reset_token
          if (token) {
            setResetToken(token);
            setStep("reset");
          }
        },
      },
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    resetPassword(
      {
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password reset successfully. Please login.");
          openModal("login");
        },
      },
    );
  };

  return (
    <AuthModalWrapper title="Forgot Password" size="md">
      <div className="space-y-6">
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-sm text-neutral-gray-600">
              Enter your registered mobile number to receive an OTP.
            </p>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile Number"
                className="w-full px-4 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded focus:outline-none focus:border-brand-primary transition-all text-sm"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600">
                <FiSmartphone />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSendingForgotOtp}
              className="w-full bg-brand-primary hover:bg-brand-primary-light text-brand-text font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70"
            >
              {isSendingForgotOtp ? "SENDING OTP..." : "SEND OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-neutral-gray-600">
              Enter the OTP sent to <strong>{mobile}</strong>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-4 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded focus:outline-none focus:border-brand-primary transition-all text-center text-lg tracking-widest"
              required
            />
            <button
              type="submit"
              disabled={isVerifyingForgotOtp}
              className="w-full bg-brand-primary hover:bg-brand-primary-light text-brand-text font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70"
            >
              {isVerifyingForgotOtp ? "VERIFYING..." : "VERIFY OTP"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-neutral-gray-600">
              Create a new password.
            </p>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-4 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded focus:outline-none focus:border-brand-primary transition-all text-sm"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600">
                <FiLock />
              </div>
            </div>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-4 py-3 border border-stroke-light rounded focus:border-brand-primary text-sm"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600">
                <FiCheck />
              </div>
            </div>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="w-full bg-brand-primary hover:bg-brand-primary-light text-brand-text font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70"
            >
              {isResettingPassword ? "RESETTING..." : "RESET PASSWORD"}
            </button>
          </form>
        )}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => openModal("login")}
            className="text-sm text-brand-text font-bold hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthModalWrapper>
  );
};

export default ForgotPasswordModal;
