import React, { useState, useEffect, useCallback } from "react";
import { FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import clsx from "clsx";
import apiClient from "../../api/client";
import { Endpoints } from "../../api/endpoints";
import { useBettingStore } from "../../store/bettingStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchBetRecord {
  _id: string;
  description: string;
  bet_type: string; // 'BACK' | 'LAY' | 'YES' | 'NO'
  rate: number | string; // odds
  stake: number | string;
  temp_profitloss: number | string;
  marketRunner?: string;
}

interface Props {
  eventId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MatchedBetsPanel
 *
 * Collapsible panel showing the user's matched bets for this event.
 * Refetches automatically when a new bet is placed (lastResult changes).
 *
 * API: POST /betting/get-user-match-bet
 * Body: { perpage: 10, page: 1, eventId }
 */
export default function MatchedBetsPanel({ eventId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<MatchBetRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [stopCall, setStopCall] = useState(false);

  const lastResult = useBettingStore((s) => s.lastResult);

  const fetchBets = useCallback(
    async (perpage = 10) => {
      setLoading(true);
      try {
        const res: any = await apiClient.post(Endpoints.USER_MATCH_BET, {
          perpage,
          page: 1,
          eventId,
        });
        const data = res?.data ?? res;
        if (data?.status === 200 || data?.records) {
          const recs: MatchBetRecord[] =
            data?.data?.records ?? data?.records ?? [];
          const tot: number =
            data?.data?.pagiantion?.total ??
            data?.pagiantion?.total ??
            recs.length;
          setRecords(recs);
          setTotal(tot);
          if (recs.length >= tot) setStopCall(true);
        }
      } catch {
        // silently ignore — panel stays hidden
      } finally {
        setLoading(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    fetchBets(10);
    setPage(10);
    setStopCall(false);
  }, [eventId, lastResult, fetchBets]);

  const loadMore = () => {
    if (stopCall) return;
    const next = page + 10 < total ? page + 10 : total;
    setPage(next);
    fetchBets(next);
    if (next >= total) setStopCall(true);
  };

  // Hide entirely when no bets and not loading
  if (records.length === 0 && !loading) return null;

  return (
    <div className="mx-2 mt-2 mb-0 rounded-lg overflow-hidden shadow-betting-card border border-stroke-light">
      {/* ── Header toggle ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-brand-primary text-brand-text hover:bg-brand-primary-light transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiList size={14} className="shrink-0" />
          <span className="font-display text-sm font-semibold">
            My Matched Bets
          </span>
          {records.length > 0 && (
            <span className="text-[10px] bg-white/20 text-brand-text font-bold px-1.5 py-0.5 rounded-full leading-none">
              {records.length}
            </span>
          )}
        </div>
        {open ? (
          <FiChevronUp size={16} className="shrink-0 text-brand-text/80" />
        ) : (
          <FiChevronDown size={16} className="shrink-0 text-brand-text/80" />
        )}
      </button>

      {/* ── Collapsible body ── */}
      {open && (
        <div className="bg-bg-card">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_52px_52px_68px] px-3 py-2 border-b border-stroke-light bg-brand-primary-dark">
            <span className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wide">
              Description
            </span>
            <span className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wide text-center">
              Odds
            </span>
            <span className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wide text-center">
              Stake
            </span>
            <span className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wide text-right">
              P&amp;L
            </span>
          </div>

          {/* Loading spinner */}
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full" />
            </div>
          ) : records.length === 0 ? (
            <div className="px-3 py-4 text-center text-neutral-gray-500 text-xs">
              No bets found
            </div>
          ) : (
            <>
              {records.map((bet) => {
                const pnl = Number(bet.temp_profitloss);
                const isBack =
                  bet.bet_type === "BACK" || bet.bet_type === "YES";
                const positive = pnl > 0;

                return (
                  <div
                    key={bet._id}
                    className="grid grid-cols-[1fr_52px_52px_68px] px-3 py-2.5 border-b border-stroke-light hover:bg-bg-light-blue transition-colors last:border-b-0"
                  >
                    {/* Description + bet type badge */}
                    <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                      <span className="text-xs font-medium text-brand-text truncate leading-snug">
                        {bet.marketRunner && (
                          <span className="text-neutral-gray-500 mr-1">
                            {bet.marketRunner} ·
                          </span>
                        )}
                        {bet.description}
                      </span>
                      {/*
                                              Bet type badge:
                                              BACK/YES → bg-odds-back (blue pill)
                                              LAY/NO   → bg-odds-lay  (red/pink pill)
                                              Uses token classes that work in both
                                              light and dark themes.
                                            */}
                      <span
                        className={clsx(
                          "inline-flex items-center self-start",
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none mt-0.5",
                          isBack
                            ? "bg-odds-back text-brand-text"
                            : "bg-odds-lay text-brand-text",
                        )}
                      >
                        {bet.bet_type}
                      </span>
                    </div>

                    {/* Odds */}
                    <span className="text-xs font-mono font-bold text-brand-text text-center self-center tabular-nums">
                      {Number(bet.rate).toFixed(2)}
                    </span>

                    {/* Stake */}
                    <span className="text-xs font-mono text-brand-text text-center self-center tabular-nums">
                      {Number(bet.stake).toFixed(2)}
                    </span>

                    {/* P&L — green for profit, red for loss */}
                    <span
                      className={clsx(
                        "text-xs font-mono font-bold text-right self-center tabular-nums",
                        positive ? "text-accent-green" : "text-accent-red",
                      )}
                    >
                      {positive ? "+" : ""}
                      {pnl.toFixed(2)}
                    </span>
                  </div>
                );
              })}

              {/* Load more */}
              {!stopCall && (
                <button
                  onClick={loadMore}
                  className="w-full py-2.5 text-xs text-brand-primary font-semibold
                                               bg-bg-light-blue hover:bg-bg-secondary
                                               border-t border-stroke-light transition-colors"
                >
                  Load more ({records.length} of {total})
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
