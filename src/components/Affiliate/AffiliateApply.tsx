import React, { useState } from "react";
import { affiliateApi } from "../../api/client";
import { useToastStore } from "../../store/toastStore";
import { FiUsers, FiDollarSign, FiTrendingUp, FiShare2 } from "react-icons/fi";

interface AffiliateApplyProps {
  onApplied: () => void;
}

const BENEFITS = [
  {
    icon: FiDollarSign,
    text: "Earn commission on every referred player deposit",
  },
  { icon: FiTrendingUp, text: "Track referrals and earnings in real-time" },
  { icon: FiShare2, text: "Get a unique referral link to share anywhere" },
];

const AffiliateApply: React.FC<AffiliateApplyProps> = ({ onApplied }) => {
  const [applying, setApplying] = useState(false);
  const toast = useToastStore();

  const handleApply = async () => {
    setApplying(true);
    try {
      await affiliateApi.apply();
      toast.success("Application submitted! Pending admin approval.");
      onApplied();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-bg-card border border-stroke-light rounded-2xl shadow-elevated p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
          <FiUsers className="w-10 h-10 text-brand-primary" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-display font-bold text-brand-text mb-2">
          Become an Affiliate
        </h2>
        <p className="text-sm text-neutral-gray-700 mb-6">
          Share your referral link and earn commission on every deposit, loss,
          and profit from players you refer.
        </p>

        {/* Benefits */}
        <div className="space-y-3 text-left mb-6">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-sm text-brand-text">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={applying}
          className="w-full mt-2 py-3 bg-brand-primary text-brand-text text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {applying ? "Submitting…" : "Apply Now"}
        </button>
      </div>
    </div>
  );
};

export default AffiliateApply;
