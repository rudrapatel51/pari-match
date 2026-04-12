import React from "react";
import KycSection from "./KycSection";
import { FiShield } from "react-icons/fi";

const KycPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page header strip */}
      <div className="bg-brand-primary px-6 py-5">
        <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
          KYC Verification
        </h1>
        <p className="text-sm text-neutral-gray-200 mt-0.5">
          Verify your identity to unlock withdrawals and full account access
        </p>
      </div>

      <div className="p-4 md:p-6 max-w-8xl">
        <KycSection />
      </div>
    </div>
  );
};

export default KycPage;
