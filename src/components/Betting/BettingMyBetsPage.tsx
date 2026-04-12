import React, { useEffect, useState } from "react";
import { FiClock, FiCheckCircle } from "react-icons/fi";
import { bettingApi } from "../../api/bettingClient";
import { useBettingStore } from "../../store/bettingStore";
import { useToastStore } from "../../store/toastStore";
import type { PlacedBet } from "../../types/domain";
import clsx from "clsx";

type Filter = "active" | "settled";

const SESSION_MARKET_TYPES = [
  "session",
  "fancy",
  "fancy1",
  "ball-by-ball",
  "meter",
  "bookmaker",
  "bookmaker2",
  "khado",
];

const STATUS_COLORS: Record<string, string> = {
  MATCHED: "text-brand-text bg-bg-light-blue",
  PENDING: "text-accent-yellow bg-accent-yellow/10",
  WON: "text-accent-green bg-accent-green/10",
  LOST: "text-accent-red bg-accent-red/10",
  VOID: "text-neutral-gray-700 bg-bg-light-blue",
};

export default function BettingMyBetsPage() {
  const [filter, setFilter] = useState<Filter>("active");
  const [loading, setLoading] = useState(true);
  const { activeBets, settledBets, setActiveBets, setSettledBets } =
    useBettingStore();

  useEffect(() => {
    setLoading(true);
    const req =
      filter === "active"
        ? bettingApi.getActiveBets()
        : bettingApi.getBetHistory();
    req
      .then((res: any) => {
        const bets: PlacedBet[] =
          res?.data?.bets || res?.bets || res?.data || res || [];
        if (filter === "active") setActiveBets(Array.isArray(bets) ? bets : []);
        else setSettledBets(Array.isArray(bets) ? bets : []);
      })
      .catch(() => {
        useToastStore.getState().error("Failed to load bets");
      })
      .finally(() => setLoading(false));
  }, [filter, setActiveBets, setSettledBets]);

  const bets = filter === "active" ? activeBets : settledBets;

  return (
    <div className="p-3">
      {/* Page title */}
      <div className="mb-4">
        <h1 className="font-display text-xl font-bold text-neutral-gray-800">
          My Bets
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 bg-bg-card rounded-lg p-1 shadow-betting-card">
        <button
          onClick={() => setFilter("active")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-display font-semibold transition-all",
            filter === "active"
              ? "bg-brand-primary text-brand-text shadow-sm"
              : "text-neutral-gray-700 hover:text-brand-text",
          )}
        >
          <FiClock size={14} />
          Active
        </button>
        <button
          onClick={() => setFilter("settled")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-display font-semibold transition-all",
            filter === "settled"
              ? "bg-brand-primary text-brand-text shadow-sm"
              : "text-neutral-gray-700 hover:text-brand-text",
          )}
        >
          <FiCheckCircle size={14} />
          Settled
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="text-4xl">{filter === "active" ? "🎯" : "📋"}</span>
          <p className="text-neutral-gray-700 text-sm">
            No {filter} bets found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map((bet, idx) => {
            const isSession = SESSION_MARKET_TYPES.includes(
              (bet.marketType || "").toLowerCase(),
            );
            const potentialReturn =
              bet.betType === "BACK"
                ? isSession
                  ? (bet.odds * bet.stake) / 100 + bet.stake
                  : (bet.odds - 1) * bet.stake + bet.stake
                : bet.stake;
            const liability =
              bet.betType === "LAY"
                ? isSession
                  ? (bet.odds * bet.stake) / 100
                  : (bet.odds - 1) * bet.stake
                : bet.stake;

            return (
              <div
                key={(bet as any).betId || idx}
                className="bg-bg-card rounded-lg shadow-betting-card overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-3 py-2 bg-bg-light-blue border-b border-stroke-light">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-xs font-bold px-2 py-0.5 rounded uppercase",
                        bet.betType === "BACK"
                          ? "bg-odds-back text-neutral-gray-900"
                          : "bg-odds-lay text-neutral-gray-900",
                      )}
                    >
                      {bet.betType}
                    </span>
                    <span className="text-xs font-medium text-neutral-gray-600 uppercase tracking-wide">
                      {bet.marketType?.replace(/-/g, " ")}
                    </span>
                  </div>
                  {bet.status && (
                    <span
                      className={clsx(
                        "text-xs font-bold px-2 py-0.5 rounded uppercase",
                        STATUS_COLORS[bet.status] ??
                          "text-neutral-gray-700 bg-bg-light-blue",
                      )}
                    >
                      {bet.status}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="px-3 py-3">
                  <p className="text-sm font-semibold text-neutral-gray-800 mb-2">
                    {bet.runnerName}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-gray-600 block">Odds</span>
                      <span className="font-mono font-bold text-neutral-gray-800">
                        {Number(bet.odds).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-gray-600 block">Stake</span>
                      <span className="font-mono font-bold text-neutral-gray-800">
                        ₹{Number(bet.stake).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-gray-600 block">
                        {bet.betType === "BACK" ? "Return" : "Liability"}
                      </span>
                      <span
                        className={clsx(
                          "font-mono font-bold",
                          bet.betType === "LAY"
                            ? "text-accent-red"
                            : "text-accent-green",
                        )}
                      >
                        ₹
                        {(bet.betType === "BACK"
                          ? potentialReturn
                          : liability
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
