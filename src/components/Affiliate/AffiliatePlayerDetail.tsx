import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { affiliateApi } from "../../api/client";
import Loader from "../Common/Loader";
import {
  FiChevronLeft,
  FiUser,
  FiActivity,
  FiDollarSign,
} from "react-icons/fi";
import { PlayerDetail } from "../../types/affiliate";

const AffiliatePlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    affiliateApi
      .getPlayerDetail(id)
      .then((res: any) => {
        // Interceptor returns response.data directly — res IS the API body.
        // Shape: { success, player: {...}, commission_summary: {...} }
        if (res?.success && res?.player) {
          setData(res as PlayerDetail);
        } else {
          setError(res?.message || "Failed to load player data");
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Failed to load player data");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader text="Loading player details..." />;

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-primary p-6">
        <button
          onClick={() => navigate("/affiliate/players")}
          className="flex items-center gap-2 text-brand-text mb-6 hover:text-brand-primary dark:hover:text-brand-text transition-colors"
        >
          <FiChevronLeft /> Back to Players
        </button>
        <div className="bg-bg-card border border-stroke-light rounded-xl p-8 text-center text-brand-text">
          <p>{error || "Player not found"}</p>
        </div>
      </div>
    );
  }

  const { player, commission_summary } = data;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-brand-primary px-6 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/affiliate/players")}
            className="text-brand-text/80 hover:text-brand-text transition-colors"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
              {player.username}
            </h1>
            <p className="text-sm text-brand-text/60 mt-0.5">
              Player Details & Statistics
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Info Card */}
        <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                <FiUser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text">
                  {player.username}
                </h3>
                <p className="text-sm text-brand-text opacity-70">
                  Joined{" "}
                  {new Date(player.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${player.status === 1 ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red"}`}
            >
              {player.status === 1 ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-brand-text opacity-70 mb-1">
                Total Deposits
              </p>
              <p className="text-lg font-bold text-brand-text">
                ₹{player.totalDeposit.toFixed(2)}
              </p>
              <p className="text-xs text-brand-text opacity-50 mt-1">
                {player.depositCount} deposits
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-text opacity-70 mb-1">
                Total Withdrawals
              </p>
              <p className="text-lg font-bold text-brand-text">
                ₹{player.totalWithdrawal.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-text opacity-70 mb-1">
                Total Loss
              </p>
              <p className="text-lg font-bold text-brand-text">
                ₹{player.total_loss.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-text opacity-70 mb-1">
                Generated Earnings
              </p>
              <p className="text-lg font-bold text-accent-green">
                ₹{commission_summary.total_earned_from_player.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-card border border-stroke-light rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-brand-text opacity-70">
                Total Commission
              </p>
              <p className="text-xl font-bold text-brand-text">
                ₹{commission_summary.total_earned_from_player.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-bg-card border border-stroke-light rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-accent-yellow/10 rounded-lg text-accent-yellow">
              <FiActivity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-brand-text opacity-70">Pending</p>
              <p className="text-xl font-bold text-brand-text">
                ₹{commission_summary.pending.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-bg-card border border-stroke-light rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-accent-green/10 rounded-lg text-accent-green">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-brand-text opacity-70">Settled</p>
              <p className="text-xl font-bold text-brand-text">
                ₹{commission_summary.settled.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePlayerDetail;
