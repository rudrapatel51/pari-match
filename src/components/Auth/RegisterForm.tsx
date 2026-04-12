import React, { useState, useEffect } from "react";
import {
  FiSmartphone,
  FiUser,
  FiCode,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";
import { useToastStore } from "../../store/toastStore";
import { getIpAddress } from "../../utils/network";
import { useSearchParams } from "react-router-dom";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const INPUT_CLS =
  "w-full pl-4 pr-10 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-neutral-gray-600";

function getErrorMessage(error: unknown): string {
  if (!error) return "";
  const err = error as any;
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong. Please try again."
  );
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { openModal } = useUiStore();
  const toast = useToastStore();
  const {
    registerSendOtp,
    isSendingRegisterOtp,
    registerVerifyOtp,
    isRegistering,
    countryCodes,
    isLoadingCountryCodes,
  } = useAuth();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [ageVerification, setAgeVerification] = useState(false);

  // Auto-populate referral code from URL ?ref=CODE or localStorage
  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl) {
      setReferralCode(refFromUrl);
      localStorage.setItem("referral_code", refFromUrl);
      return;
    }
    const refFromStorage = localStorage.getItem("referral_code");
    if (refFromStorage) setReferralCode(refFromStorage);
  }, [searchParams]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = window.setInterval(
      () => setOtpTimer((prev) => prev - 1),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ip = await getIpAddress();
    try {
      await registerSendOtp({
        mobile,
        username: username || `user${Math.floor(Math.random() * 10000)}`,
        ip_address: ip,
      });
      setStep("otp");
      setOtpTimer(60);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0 || isSendingRegisterOtp) return;
    const ip = await getIpAddress();
    try {
      await registerSendOtp({
        mobile,
        username: username || `user${Math.floor(Math.random() * 10000)}`,
        ip_address: ip,
      });
      setOtpTimer(60);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const ip = await getIpAddress();
    registerVerifyOtp(
      {
        otp,
        name,
        username: username || `user${Math.floor(Math.random() * 10000)}`,
        mobile,
        password: password || "DefaultPass@123",
        country_code: countryCode,
        referral_code: referralCode,
        age_verification: ageVerification,
        ip_address: ip,
      },
      {
        onSuccess: () => {
          localStorage.removeItem("referral_code");
          if (onSuccess) onSuccess();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Step indicator ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
            step === "details"
              ? "bg-brand-primary text-brand-text"
              : "bg-brand-accent text-black"
          }`}
        >
          {step === "details" ? "1" : <FiCheck className="w-3.5 h-3.5" />}
        </div>
        <div
          className={`flex-1 h-0.5 transition-colors ${step === "otp" ? "bg-brand-primary" : "bg-stroke-light"}`}
        />
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
            step === "otp"
              ? "bg-brand-primary text-brand-text"
              : "bg-bg-light-blue text-neutral-gray-700 border border-stroke-light"
          }`}
        >
          2
        </div>
      </div>
      <div className="flex justify-between text-xs px-0 -mt-2">
        <span
          className={
            step === "details"
              ? "text-brand-text font-semibold"
              : "text-accent-green font-semibold"
          }
        >
          Your Details
        </span>
        <span
          className={
            step === "otp"
              ? "text-brand-text font-semibold"
              : "text-neutral-gray-600"
          }
        >
          Verify OTP
        </span>
      </div>

      {/* ── Form ────────────────────────────────────────────────────── */}
      <form
        onSubmit={step === "details" ? handleSendOtp : handleVerifyAndRegister}
        className="space-y-4"
      >
        {/* ── Step 1: Details ─────────────────────────────────────── */}
        {step === "details" && (
          <>
            {/* Country code + Mobile */}
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-16 py-2 px-2 text-sm bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary transition-all"
                disabled={isLoadingCountryCodes}
              >
                {countryCodes.map((cc) => (
                  <option key={cc._id} value={cc.number}>
                    {cc.number}
                  </option>
                ))}
              </select>
              <div className="flex-1 relative">
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Phone Number *"
                  className={INPUT_CLS}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 pointer-events-none">
                  <FiSmartphone className="w-4 h-4 text-brand-text" />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username *"
                className={INPUT_CLS}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 pointer-events-none">
                <FiUser className="w-4 h-4 text-brand-text" />
              </div>
            </div>

            {/* Full Name */}
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name *"
                className={INPUT_CLS}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 pointer-events-none">
                <FiUser className="w-4 h-4 text-brand-text" />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password *"
                className={INPUT_CLS}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 hover:text-brand-text transition-colors"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4 text-brand-text" />
                ) : (
                  <FiEye className="w-4 h-4 text-brand-text" />
                )}
              </button>
            </div>

            {/* Referral Code */}
            <div className="relative">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Referral Code (Optional)"
                className={INPUT_CLS}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 pointer-events-none">
                <FiCode className="w-4 h-4 text-brand-text" />
              </div>
            </div>
            {referralCode && (
              <div className="flex items-center gap-2 px-3 py-2 bg-accent-green/10 border border-accent-green/20 rounded-lg">
                <FiCheck className="w-3.5 h-3.5 text-accent-green shrink-0" />
                <p className="text-xs text-accent-green">
                  Referral code{" "}
                  <span className="font-mono font-bold">{referralCode}</span>{" "}
                  applied
                </p>
              </div>
            )}

            {/* Age Verification */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={ageVerification}
                onChange={(e) => setAgeVerification(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-stroke-primary dark:border-neutral-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                required
              />
              <span className="text-sm text-brand-text transition-colors leading-snug">
                I confirm that I am at least 18 years old and accept the{" "}
                <a
                  href="/terms"
                  className="text-brand-text underline font-medium"
                >
                  terms and conditions
                </a>
                .
              </span>
            </label>
          </>
        )}

        {/* ── Step 2: OTP ─────────────────────────────────────────── */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="text-center space-y-0.5">
              <p className="text-sm text-neutral-gray-700">OTP sent to</p>
              <p className="font-semibold text-brand-text">
                {countryCode} {mobile}
              </p>
            </div>

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="• • • • • •"
              className="w-full py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-center text-2xl tracking-[0.6em] font-mono placeholder-neutral-gray-300 transition-all"
              required
              maxLength={6}
              autoFocus
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-gray-700">
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Didn't receive it?"}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 0 || isSendingRegisterOtp}
                className="text-brand-text font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSendingRegisterOtp ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("details");
                setOtp("");
              }}
              className="w-full text-sm text-neutral-gray-700 hover:text-brand-text transition-colors text-center py-1"
            >
              ← Change details
            </button>
          </div>
        )}

        {/* ── Submit ──────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={
            isSendingRegisterOtp ||
            isRegistering ||
            (step === "details" && !ageVerification)
          }
          className="w-full bg-brand-accent hover:brightness-110 text-black font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {step === "details"
            ? isSendingRegisterOtp
              ? "SENDING OTP..."
              : "SEND OTP & CONTINUE"
            : isRegistering
              ? "CREATING ACCOUNT..."
              : "VERIFY & CREATE ACCOUNT"}
        </button>

        <div className="text-center pt-1">
          <p className="text-sm text-neutral-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => openModal("login")}
              className="text-brand-text font-bold hover:underline transition-all"
            >
              Log In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
