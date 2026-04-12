import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { affiliateApi } from "../../api/client";
import { useToastStore } from "../../store/toastStore";
import Loader from "../Common/Loader";
import AffiliateApply from "./AffiliateApply";
import AffiliateStatus from "./AffiliateStatus";
import AffiliateReferrals from "./AffiliateReferrals";
import AffiliateCommissions from "./AffiliateCommissions";
import AffiliateEarnings from "./AffiliateEarnings";
import AffiliatePlayers from "./AffiliatePlayers";
import AffiliateSettlements from "./AffiliateSettlements";
import {
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiFileText,
  FiTrendingUp,
  FiCopy,
  FiLink,
  FiShare2,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import {
  AffiliateStats,
  AffiliateApplicationStatus,
} from "../../types/affiliate";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: FiActivity },
  { id: "referrals", label: "Referrals", Icon: FiUsers },
  { id: "players", label: "Players", Icon: FiUsers },
  { id: "commissions", label: "Commissions", Icon: FiDollarSign },
  { id: "earnings", label: "Earnings", Icon: FiTrendingUp },
  { id: "settlements", label: "Settlements", Icon: FiFileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  Icon: React.ElementType;
  accentClass?: string;
}> = ({ label, value, Icon, accentClass = "text-brand-primary" }) => (
  <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-4 flex items-center gap-3">
    <div
      className={clsx(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-primary/10",
        accentClass,
      )}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-neutral-gray-700 truncate">{label}</p>
      <p className="text-base font-mono font-bold text-brand-text mt-0.5 truncate">
        {value}
      </p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const AffiliateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastStore();

  // Derive active tab from URL path
  const getTab = (): TabId => {
    const segment = location.pathname.split("/").pop() as TabId;
    return TABS.some((t) => t.id === segment) ? segment : "dashboard";
  };

  const activeTab = getTab();

  // ── State ─────────────────────────────────────────────────────────────────
  const [appStatus, setAppStatus] = useState<AffiliateApplicationStatus | null>(
    null,
  );
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Interceptor returns response.data directly — so res IS the API body.
        // GET /affiliate/application-status response shape:
        //   { success, is_affiliate, affiliate_status, affiliate_type,
        //     affiliate_approved_at, referral_code, referral_link, message }
        const res: any = await affiliateApi.getApplicationStatus();
        setAppStatus(res as AffiliateApplicationStatus);

        if (res?.affiliate_status === "active") {
          // GET /affiliate/stats response shape:
          //   { success, stats: { total_referrals, active_players,
          //     total_commission_earned, pending_commission, settled_commission,
          //     last_updated } }
          const statsRes: any = await affiliateApi.getStats();
          setStats(statsRes?.stats ?? null);
        }
      } catch {
        setAppStatus(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTabChange = (id: TabId) => navigate(`/affiliate/${id}`);

  const copyText = (text: string, label: string) =>
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied!`));

  const handleApplied = async () => {
    try {
      const res: any = await affiliateApi.getApplicationStatus();
      setAppStatus(res as AffiliateApplicationStatus);
    } catch {
      setAppStatus((prev) =>
        prev
          ? { ...prev, is_affiliate: true, affiliate_status: "pending" }
          : null,
      );
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return <Loader text="Loading affiliate dashboard…" />;

  // ── Not yet applied ───────────────────────────────────────────────────────
  if (!appStatus?.is_affiliate) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="bg-brand-primary px-6 py-5">
          <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
            Affiliate Program
          </h1>
          <p className="text-sm text-brand-text/60 mt-0.5">
            Earn commissions by referring players to the platform
          </p>
        </div>
        <AffiliateApply onApplied={handleApplied} />
      </div>
    );
  }

  // ── Pending / rejected / blocked / deleted ────────────────────────────────
  const status = appStatus.affiliate_status;
  if (
    status === "pending" ||
    status === "rejected" ||
    status === "blocked" ||
    status === "deleted"
  ) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="bg-brand-primary px-6 py-5">
          <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
            Affiliate Program
          </h1>
          <p className="text-sm text-brand-text/60 mt-0.5">
            Earn commissions by referring players to the platform
          </p>
        </div>
        <AffiliateStatus status={status} />
      </div>
    );
  }

  // ── Active affiliate — full dashboard ─────────────────────────────────────

  const referralCode = appStatus.referral_code || "";
  const referralLink = appStatus.referral_link || "";
  const affiliateType = appStatus.affiliate_type || "";
  const approvedAt = appStatus.affiliate_approved_at || "";
  const message = appStatus.message || "";

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page header */}
      <div className="bg-brand-primary px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
              Affiliate Dashboard
            </h1>
            <p className="text-sm text-brand-text/60 mt-0.5">
              Track your referrals, earnings and settlements
            </p>
          </div>
          {affiliateType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-semibold text-brand-text capitalize flex-shrink-0 mt-1">
              <FiShield className="w-3.5 h-3.5" />
              {affiliateType}
            </span>
          )}
        </div>
        {approvedAt && (
          <p className="text-xs text-brand-text/50 mt-2">
            Member since{" "}
            {new Date(approvedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-5">
        {/* Active status banner */}
        {message && (
          <div className="flex items-start gap-3 bg-accent-green/10 border border-accent-green/30 rounded-xl px-4 py-3">
            <FiCheckCircle className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent-green font-medium">{message}</p>
          </div>
        )}

        {/* Referral code card */}
        {referralCode && (
          <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-neutral-gray-700 uppercase tracking-wider mb-1">
                  Your Referral Code
                </p>
                <p className="text-xl font-bold font-mono text-brand-text tracking-widest">
                  {referralCode}
                </p>
              </div>
              <button
                onClick={() => copyText(referralCode, "Referral code")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-brand-text text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <FiCopy className="w-4 h-4" /> Copy Code
              </button>
            </div>

            {referralLink && (
              <>
                <div className="flex items-center gap-2 bg-bg-secondary rounded-lg px-3 py-2 border border-stroke-light">
                  <FiLink className="w-3.5 h-3.5 text-brand-text flex-shrink-0" />
                  <p className="text-xs text-brand-text truncate flex-1 font-mono">
                    {referralLink}
                  </p>
                  <button
                    onClick={() => copyText(referralLink, "Referral link")}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-lg hover:bg-brand-primary/20 transition-colors flex-shrink-0"
                  >
                    <FiCopy className="w-3 h-3" /> Copy Link
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <FiShare2 className="w-3.5 h-3.5 text-brand-text flex-shrink-0" />
                  <span className="text-xs text-brand-text">Share via:</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent("Join using my referral link: " + referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#25D366] text-brand-text text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join using my referral link!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#0088CC] text-brand-text text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Telegram
                  </a>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab bar + content */}
        <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-stroke-light">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold",
                  "whitespace-nowrap transition-colors border-b-2 flex-shrink-0",
                  activeTab === id
                    ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                    : "border-transparent text-brand-text hover:bg-bg-light-blue",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {/* ── Dashboard tab — stat cards ── */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    Icon={FiUsers}
                    label="Total Referrals"
                    value={stats?.total_referrals ?? 0}
                  />
                  <StatCard
                    Icon={FiActivity}
                    label="Active Players"
                    value={stats?.active_players ?? 0}
                  />
                  <StatCard
                    Icon={FiDollarSign}
                    label="Total Earnings"
                    value={formatCurrency(stats?.total_commission_earned ?? 0)}
                    accentClass="text-accent-green"
                  />
                  <StatCard
                    Icon={FiFileText}
                    label="Pending Commission"
                    value={formatCurrency(stats?.pending_commission ?? 0)}
                    accentClass="text-accent-yellow"
                  />
                </div>
                {stats?.settled_commission != null && (
                  <StatCard
                    Icon={FiCheckCircle}
                    label="Settled Commission"
                    value={formatCurrency(stats.settled_commission)}
                    accentClass="text-accent-green"
                  />
                )}
                {stats?.last_updated && (
                  <p className="text-xs text-neutral-gray-600">
                    Stats updated:{" "}
                    <span className="font-mono">
                      {new Date(stats.last_updated).toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* ── Sub-component tabs ── */}
            {activeTab === "referrals" && <AffiliateReferrals />}
            {activeTab === "players" && <AffiliatePlayers />}
            {activeTab === "commissions" && <AffiliateCommissions />}
            {activeTab === "earnings" && <AffiliateEarnings />}
            {activeTab === "settlements" && <AffiliateSettlements />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
