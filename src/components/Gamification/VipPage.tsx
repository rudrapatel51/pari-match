import React, { useEffect, useState } from "react";
import { userApi } from "../../api/client";
import Loader from "../Common/Loader";
import { FiAward, FiCheckCircle, FiCalendar, FiGift } from "react-icons/fi";
import "@mdi/font/css/materialdesignicons.min.css";

const criteriaLabels: Record<string, string> = {
  registeredDays: "Registered Days",
  depositAmount: "Deposit Amount",
  betCount: "Bet Count",
  profitLoss: "Profit/Loss",
  dmw: "DMW",
};

const getProgressBarColor = (percent: number) => {
  if (percent >= 100) return "bg-accent-green";
  if (percent >= 75) return "bg-brand-primary";
  if (percent >= 50) return "bg-accent-yellow";
  return "bg-accent-orange";
};

const formatNumber = (num: any) => {
  if (!num) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const VipPage: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getVipStatus().catch(() => ({ data: {} })),
      userApi.getVipProgress().catch(() => ({ data: {} })),
      userApi.getVipCategories().catch(() => ({ data: { data: [] } })),
      userApi.getVipHistory({ limit: 5 }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([statusRes, progressRes, catRes, historyRes]: any[]) => {
        setStatus(statusRes?.data?.data || statusRes?.data);
        setProgress(progressRes?.data?.data || progressRes?.data);
        setCategories(catRes?.data?.data || catRes?.data || []);
        setHistory(historyRes?.data?.data || historyRes?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading VIP status..." />;

  const currentTierName = status?.currentCategory?.categoryName || "No VIP";
  const isMaxLevel = progress?.isMaxLevel;
  const nextTierName = progress?.nextCategory?.categoryName;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page header strip */}
      <div className="bg-brand-primary-dark px-6 py-5">
        <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
          My VIP
        </h1>
        <p className="text-sm text-brand-text-70 mt-0.5">
          Your exclusive VIP tier, benefits and progression
        </p>
      </div>

      <div className="p-4 md:p-6 max-w-8xl space-y-5">
        {/* Current Tier Banner */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark p-6 text-brand-text text-center shadow-elevated">
          <div className="w-16 h-16 bg-white/10 flex items-center justify-center mx-auto mb-3">
            {status?.currentCategory?.icon ? (
              <img
                src={status.currentCategory.icon}
                alt={currentTierName}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden",
                  );
                }}
              />
            ) : null}
            <FiAward
              className={`w-8 h-8 text-brand-text ${status?.currentCategory?.icon ? "hidden" : ""}`}
            />
          </div>
          <h2 className="text-xl font-bold font-display">{currentTierName}</h2>
          <p className="text-brand-text-70 text-sm mt-1">
            {status?.hasVip ? "VIP Member" : "Play more to become a VIP!"}
          </p>
          {status?.assignedAt && (
            <p className="text-brand-text-50 text-xs mt-2">
              Member since: {new Date(status.assignedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Progress Bar Card */}
        {progress && (
          <div className="bg-bg-card border border-stroke-light shadow-betting-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                Progress to Next Tier
              </h3>
              {nextTierName && (
                <span className="text-xs font-bold text-brand-text bg-brand-text-10 px-2 py-1">
                  {nextTierName}
                </span>
              )}
            </div>

            {isMaxLevel ? (
              <div className="text-center py-4">
                <p className="text-sm text-brand-text font-medium">
                  You have reached the highest VIP level!
                </p>
              </div>
            ) : progress.currentCriteria && progress.nextCriteria ? (
              <div className="space-y-4">
                {Object.keys(progress.nextCriteria).map((key) => {
                  const currentVal = progress.currentCriteria[key] || 0;
                  const nextVal = progress.nextCriteria[key] || 1;
                  const percent =
                    nextVal > 0
                      ? Math.max(
                          0,
                          Math.min(
                            100,
                            Math.round((currentVal / nextVal) * 100),
                          ),
                        )
                      : 100;
                  const label = criteriaLabels[key] || key;
                  const isCurrency = key === "depositAmount" || key === "dmw";

                  return (
                    <div key={key}>
                      <div className="flex justify-between flex-wrap gap-2 text-xs mb-1.5">
                        <span className="font-medium text-brand-text">
                          {label}
                        </span>
                        <span className="text-brand-text-60">
                          {isCurrency ? "₹" : ""}
                          {formatNumber(currentVal)} / {isCurrency ? "₹" : ""}
                          {formatNumber(nextVal)}
                        </span>
                      </div>
                      <div className="h-3 bg-brand-text-10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getProgressBarColor(percent)}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <p className="text-right text-[10px] text-brand-text-60 mt-1">
                        {percent}%
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-brand-text-60 text-center">
                Progression details not available.
              </p>
            )}
          </div>
        )}

        {/* VIP Bonuses */}
        {status?.hasVip && status?.currentCategory?.levelUpBonus?.enabled && (
          <div className="bg-bg-card border border-stroke-light shadow-betting-card p-5">
            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiGift className="text-brand-text-70" />
              VIP Bonuses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reward Bonus */}
              <div className="bg-gradient-to-br from-accent-green to-accent-green-dark p-4 text-brand-text">
                <h4 className="text-sm font-bold mb-2">REWARD BONUS</h4>
                {status?.bonusApplied ? (
                  <div className="flex items-center gap-2">
                    <FiGift className="w-5 h-5" />
                    <p className="text-xl font-bold">Active</p>
                  </div>
                ) : (
                  <p className="text-base font-semibold">Available</p>
                )}
              </div>
              {/* Casino Losing Bonus */}
              <div className="bg-gradient-to-br from-accent-red to-accent-orange p-4 text-brand-text">
                <h4 className="text-sm font-bold mb-2">CASINO LOSING BONUS</h4>
                <p className="text-xl font-bold">NA</p>
              </div>
              {/* Sports Losing Bonus */}
              <div className="bg-gradient-to-br from-accent-blue to-accent-blue-dark p-4 text-brand-text">
                <h4 className="text-sm font-bold mb-2">SPORTS LOSING BONUS</h4>
                <p className="text-xl font-bold">NA</p>
              </div>
            </div>
          </div>
        )}

        {/* Update Condition & Guaranteed Level Condition */}
        {progress?.nextCriteria && !progress?.isMaxLevel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Update Condition — what you need for NEXT tier */}
            <div className="bg-bg-card border border-stroke-light shadow-betting-card p-5">
              <h3 className="text-sm font-bold text-brand-text mb-4">
                Update Condition
              </h3>
              <div className="space-y-3">
                {progress.nextCriteria.depositAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-60">
                      Total Deposit:
                    </span>
                    <span className="font-semibold text-brand-text">
                      ₹{formatNumber(progress.nextCriteria.depositAmount)}
                    </span>
                  </div>
                )}
                {progress.nextCriteria.betCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-60">Total Bets:</span>
                    <span className="font-semibold text-brand-text">
                      {formatNumber(progress.nextCriteria.betCount)}
                    </span>
                  </div>
                )}
                {progress.nextCriteria.dmw > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-60">
                      Bet Amount (DMW):
                    </span>
                    <span className="font-semibold text-brand-text">
                      ₹{formatNumber(progress.nextCriteria.dmw)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Guaranteed Level Condition — your current stats */}
            <div className="bg-bg-card border border-stroke-light shadow-betting-card p-5">
              <h3 className="text-sm font-bold text-brand-text mb-4">
                Guaranteed Level Condition
              </h3>
              <div className="space-y-3">
                {progress.currentCriteria?.depositAmount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-60">
                      Total Deposit:
                    </span>
                    <span className="font-semibold text-brand-text">
                      ₹{formatNumber(progress.currentCriteria.depositAmount)}
                    </span>
                  </div>
                )}
                {progress.currentCriteria?.betCount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-60">Total Bets:</span>
                    <span className="font-semibold text-brand-text">
                      {formatNumber(progress.currentCriteria.betCount)}
                    </span>
                  </div>
                )}
                {progress.currentCriteria?.dmw !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-60">
                      Bet Amount (DMW):
                    </span>
                    <span className="font-semibold text-brand-text">
                      ₹{formatNumber(progress.currentCriteria.dmw)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIP History */}
        {history.length > 0 && (
          <div className="bg-bg-card border border-stroke-light shadow-betting-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stroke-light bg-brand-primary-dark flex items-center gap-2">
              <FiCalendar className="text-brand-text-70 w-4 h-4" />
              <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                Recent VIP History
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {history.map((item: any, i: number) => (
                <div
                  key={item._id || i}
                  className="flex items-start gap-3 p-3 bg-bg-primary border border-stroke-light"
                >
                  <div
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-brand-text font-bold text-sm"
                    style={{
                      backgroundColor: item.vipCategoryId?.color || "var(--color-neutral-400)",
                    }}
                  >
                    {item.vipCategoryId?.categoryLevel ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-brand-text">
                        {item.vipCategoryId?.categoryName}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 font-semibold ${
                          item.assignmentType === "auto"
                            ? "bg-brand-text-10 text-brand-text-70"
                            : "bg-accent-yellow/20 text-accent-yellow"
                        }`}
                      >
                        {item.assignmentType}
                      </span>
                    </div>
                    <p className="text-xs text-brand-text-60 mb-1">
                      {item.previousVipCategoryId
                        ? `Upgraded from ${item.previousVipCategoryId.categoryName}`
                        : "First VIP assignment"}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-brand-text-60">
                      <span>{formatDate(item.assignedAt)}</span>
                      {item.levelUpBonusApplied && (
                        <span className="text-accent-green flex items-center gap-1">
                          <FiGift className="w-3 h-3" />
                          Bonus Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Progression Card */}
        {categories.length > 0 && (
          <div className="bg-bg-card border border-stroke-light shadow-betting-card overflow-hidden">
            <div className="px-3 md:px-5 py-3 md:py-3.5 border-b border-stroke-light bg-brand-primary-dark">
              <h3 className="text-xs md:text-sm font-semibold text-brand-text uppercase tracking-wider">
                VIP Tiers
              </h3>
            </div>
            <div className="p-3 md:p-4 space-y-3">
              {categories.map((cat: any, i: number) => {
                const isCurrent =
                  status?.currentCategory?._id === cat._id ||
                  status?.currentCategory?.categoryName === cat.categoryName;
                return (
                  <div
                    key={cat._id || i}
                    className={`p-3 md:p-4 border transition-all ${
                      isCurrent
                        ? "border-brand-text-10 bg-brand-primary/5"
                        : "border-stroke-light hover:bg-bg-light-blue"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 mb-3">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {cat.icon ? (
                          <img
                            src={cat.icon}
                            alt={cat.categoryName}
                            className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove(
                                "hidden",
                              );
                            }}
                          />
                        ) : null}
                        <FiAward
                          className={`w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-brand-text-70 ${cat.icon ? "hidden" : ""}`}
                          style={{ color: cat.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm md:text-base font-bold text-brand-text flex items-center gap-2 flex-wrap">
                            {cat.categoryName}
                            {isCurrent && (
                              <span className="text-[10px] md:text-xs text-brand-text bg-brand-text-10 px-1.5 md:px-2 py-0.5 md:py-1 uppercase font-semibold">
                                Current
                              </span>
                            )}
                          </p>
                          {cat.description && (
                            <p className="text-xs md:text-sm text-brand-text-60 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs md:text-sm font-bold text-brand-text bg-bg-light-blue px-2 md:px-3 py-1 md:py-1.5 border border-stroke-light whitespace-nowrap">
                          Level {cat.categoryLevel}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Summary */}
                    {cat.criteria && (
                      <div className="mt-3 pt-3 border-t border-stroke-light grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(cat.criteria).map(([key, val]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center bg-bg-primary p-2 md:p-2.5 border border-stroke-light text-[11px] md:text-sm gap-2"
                          >
                            <span className="text-brand-text-60 font-medium">
                              {criteriaLabels[key] || key}
                            </span>
                            <span className="font-bold text-brand-text">
                              {String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VipPage;
