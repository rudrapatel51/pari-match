import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiX,
  FiTrash2,
  FiTv,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import LoginForm from "../Auth/LoginForm";
import RegisterForm from "../Auth/RegisterForm";
import { useAuth } from "../../hooks/useAuth";
import { useBettingStore } from "../../store/bettingStore";
import { useToastStore } from "../../store/toastStore";
import { bettingApi } from "../../api/bettingClient";
import type { PlacedBet } from "../../types/domain";

const QUICK_STAKES = [100, 500, 1000, 5000];
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
  VOID: "text-brand-text/60 bg-bg-light-blue",
};
type MainTab = "betslip" | "mybets";
type MyBetsFilter = "active" | "settled";

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isEventPage = /\/betting\/event\//.test(location.pathname);

  const [mainTab, setMainTab] = useState<MainTab>("betslip");
  const [myBetsFilter, setMyBetsFilter] = useState<MyBetsFilter>("active");
  const [myBetsLoading, setMyBetsLoading] = useState(false);
  const [acceptOddsChanges, setAcceptOddsChanges] = useState(false);
  const [tvExpanded, setTvExpanded] = useState(false);
  const prevBetCountRef = useRef(0);
  const currentEvent = useBettingStore((s) => s.currentEvent);
  const {
    betItems,
    isSubmitting,
    lastResult,
    betError,
    availableBalance,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    setSubmitting,
    setLastResult,
    setBetError,
    activeBets,
    settledBets,
    setActiveBets,
    setSettledBets,
  } = useBettingStore();

  useEffect(() => {
    if (betItems.length > prevBetCountRef.current && isCollapsed) {
      onToggleCollapse();
    }
    prevBetCountRef.current = betItems.length;
  }, [betItems.length, isCollapsed, onToggleCollapse]);

  useEffect(() => {
    const handler = () => {
      if (isCollapsed) onToggleCollapse();
    };
    window.addEventListener("betting:open-sidebar", handler);
    return () => window.removeEventListener("betting:open-sidebar", handler);
  }, [isCollapsed, onToggleCollapse]);

  const totalStake = betItems.reduce((s, i) => s + (Number(i.stake) || 0), 0);

  const totalReturn = betItems.reduce((sum, i) => {
    const isSession = SESSION_MARKET_TYPES.includes(
      (i.marketType || "").toLowerCase(),
    );
    if (isSession)
      return i.betType === "BACK"
        ? sum + (i.odds * i.stake) / 100 + i.stake
        : sum + i.stake;
    return i.betType === "BACK"
      ? sum + (i.odds - 1) * i.stake + i.stake
      : sum + i.stake;
  }, 0);

  const totalLiability = betItems.reduce((sum, i) => {
    const isSession = SESSION_MARKET_TYPES.includes(
      (i.marketType || "").toLowerCase(),
    );
    if (isSession)
      return i.betType === "BACK"
        ? sum + i.stake
        : sum + (i.odds * i.stake) / 100;
    return i.betType === "LAY" ? sum + (i.odds - 1) * i.stake : sum + i.stake;
  }, 0);

  const hasOddsChanged = betItems.some((i) => i.oddsChanged);
  const canSubmit =
    betItems.length > 0 &&
    totalStake > 0 &&
    (!hasOddsChanged || acceptOddsChanges) &&
    !isSubmitting;

  const bets: PlacedBet[] =
    myBetsFilter === "active" ? activeBets : settledBets;

  const handlePlaceBets = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setBetError(null);
    const count = betItems.length;
    try {
      const results = await Promise.all(
        betItems.map((bet) => {
          const isSession = SESSION_MARKET_TYPES.includes(
            (bet.marketType || "").toLowerCase(),
          );
          const payload: Record<string, any> = {
            eventId: bet.eventId,
            marketId: bet.marketId,
            marketName: bet.marketName,
            marketType: bet.marketType,
            runnerId: bet.runnerId,
            runnerName: bet.runnerName,
            betType: bet.betType,
            odds: bet.odds,
            stake: bet.stake,
            line: bet.line ?? 0,
            idempotencyKey: crypto.randomUUID(),
          };
          if (isSession) {
            payload.selection = bet.betType === "BACK" ? "YES" : "NO";
            payload.rate = bet.odds;
          }
          return bettingApi.placeBet(payload);
        }),
      );
      setLastResult(results);
      useBettingStore.getState().clearBetSlip();
      useToastStore
        .getState()
        .success(`${count} bet${count > 1 ? "s" : ""} placed successfully`);
    } catch (err: any) {
      const msg = err.message || "Bet placement failed";
      setBetError(msg);
      useToastStore.getState().error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMyBets = (filter: MyBetsFilter) => {
    setMyBetsLoading(true);
    const req =
      filter === "active"
        ? bettingApi.getActiveBets()
        : bettingApi.getBetHistory();
    req
      .then((res: any) => {
        const data: PlacedBet[] =
          res?.data?.bets || res?.bets || res?.data || res || [];
        if (filter === "active") setActiveBets(Array.isArray(data) ? data : []);
        else setSettledBets(Array.isArray(data) ? data : []);
      })
      .catch(() => useToastStore.getState().error("Failed to load bets"))
      .finally(() => setMyBetsLoading(false));
  };

  useEffect(() => {
    if (mainTab === "mybets") fetchMyBets(myBetsFilter);
  }, [mainTab, myBetsFilter]);

  // ── Floating open button (desktop only — on mobile the bet slip
  //    opens as a bottom sheet so there's no floating button needed) ──────────
  const FloatingOpenBtn = (
    <button
      onClick={onToggleCollapse}
      className="hidden md:flex fixed right-0 top-1/4 z-50 bg-brand-primary text-white rounded-l-full p-2 shadow-lg hover:bg-brand-primary-light transition-colors items-center"
      aria-label="Open sidebar"
    >
      <FiChevronLeft className="w-4 h-4" />
    </button>
  );

  /* ============================================================
     AUTHENTICATED USER VIEW
  ============================================================ */
  if (isAuthenticated && user) {
    return (
      <>
        {/* Desktop floating open button (mobile uses bottom sheet) */}
        {isCollapsed && FloatingOpenBtn}

        {/*
          MOBILE: fixed full-screen bottom sheet that slides up from bottom.
          DESKTOP: fixed right sidebar as before.

          Mobile trigger: isCollapsed=false → sheet slides up to cover screen.
          Desktop: normal right sidebar behaviour.

          The key fix: on mobile (< md) this is position:fixed inset-0 z-50
          so it covers the ENTIRE screen including the betting event page.
          On desktop (md+) it's the normal sidebar column.
        */}
        {!isCollapsed && (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={onToggleCollapse}
              aria-hidden="true"
            />

            <div
              className={clsx(
                // ── MOBILE: full-screen bottom sheet ──
                // Slides up from bottom, covers entire viewport
                "fixed inset-x-0 bottom-0 z-50 md:hidden",
                "h-[92vh]", // 92% height — shows a sliver of the page behind
                "flex flex-col",
                "bg-bg-card",
                "rounded-t-2xl", // rounded top corners for sheet feel
                "shadow-[0_-8px_32px_rgba(0,0,0,0.3)]",
              )}
            >
              {/* Mobile sheet handle indicator */}
              <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-stroke-light" />
              </div>

              {/* Sheet content */}
              <SheetContent
                mainTab={mainTab}
                setMainTab={setMainTab}
                myBetsFilter={myBetsFilter}
                setMyBetsFilter={setMyBetsFilter}
                myBetsLoading={myBetsLoading}
                acceptOddsChanges={acceptOddsChanges}
                setAcceptOddsChanges={setAcceptOddsChanges}
                tvExpanded={tvExpanded}
                setTvExpanded={setTvExpanded}
                isEventPage={isEventPage}
                currentEvent={currentEvent}
                betItems={betItems}
                bets={bets}
                hasOddsChanged={hasOddsChanged}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                lastResult={lastResult}
                betError={betError}
                totalStake={totalStake}
                totalReturn={totalReturn}
                totalLiability={totalLiability}
                availableBalance={availableBalance}
                SESSION_MARKET_TYPES={SESSION_MARKET_TYPES}
                onClose={onToggleCollapse}
                onRemove={removeFromBetSlip}
                onUpdateStake={updateStake}
                onClear={clearBetSlip}
                onPlace={handlePlaceBets}
                onDone={() => setLastResult(null)}
                onAcceptChange={(v) => setAcceptOddsChanges(v)}
              />
            </div>

            {/* DESKTOP sidebar — normal right panel */}
            <div className="hidden md:flex relative h-full flex-col bg-bg-card border-l-2 border-bg-secondary overflow-hidden">
              <SheetContent
                mainTab={mainTab}
                setMainTab={setMainTab}
                myBetsFilter={myBetsFilter}
                setMyBetsFilter={setMyBetsFilter}
                myBetsLoading={myBetsLoading}
                acceptOddsChanges={acceptOddsChanges}
                setAcceptOddsChanges={setAcceptOddsChanges}
                tvExpanded={tvExpanded}
                setTvExpanded={setTvExpanded}
                isEventPage={isEventPage}
                currentEvent={currentEvent}
                betItems={betItems}
                bets={bets}
                hasOddsChanged={hasOddsChanged}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                lastResult={lastResult}
                betError={betError}
                totalStake={totalStake}
                totalReturn={totalReturn}
                totalLiability={totalLiability}
                availableBalance={availableBalance}
                SESSION_MARKET_TYPES={SESSION_MARKET_TYPES}
                onClose={onToggleCollapse}
                onRemove={removeFromBetSlip}
                onUpdateStake={updateStake}
                onClear={clearBetSlip}
                onPlace={handlePlaceBets}
                onDone={() => setLastResult(null)}
                onAcceptChange={(v) => setAcceptOddsChanges(v)}
              />
            </div>
          </>
        )}

        {/* Mobile floating bet slip button (when collapsed, shows over page) */}
        {isCollapsed && betItems.length > 0 && (
          <button
            onClick={onToggleCollapse}
            className="fixed bottom-20 right-4 z-50 md:hidden flex items-center gap-2 bg-brand-accent text-black px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
            aria-label="Open bet slip"
          >
            <span className="text-sm font-bold">BET SLIP</span>
            <span className="bg-black text-brand-accent text-xs font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
              {betItems.length}
            </span>
          </button>
        )}
      </>
    );
  }

  /* ============================================================
     NON-AUTH USER VIEW — Shows empty betslip, no login/signup
  ============================================================ */
  return (
    <>
      {isCollapsed && FloatingOpenBtn}

      {!isCollapsed && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onToggleCollapse}
            aria-hidden="true"
          />

          {/* Mobile bottom sheet — empty betslip state */}
          <div className="fixed inset-x-0 bottom-0 z-50 h-[85vh] flex flex-col bg-bg-card rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.3)] md:hidden">
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-stroke-light" />
            </div>
            <EmptyBetslipUnauthenticated onClose={onToggleCollapse} />
          </div>

          {/* Desktop sidebar — empty betslip state */}
          <div className="hidden md:block relative h-full bg-bg-card border-l-2 border-bg-secondary">
            <EmptyBetslipUnauthenticated onClose={onToggleCollapse} />
          </div>
        </>
      )}
    </>
  );
};

// ─── Extracted: Empty Betslip for Unauthenticated Users ───────────────────

interface EmptyBetslipUnauthenticatedProps {
  onClose: () => void;
}

const EmptyBetslipUnauthenticated: React.FC<
  EmptyBetslipUnauthenticatedProps
> = ({ onClose }) => (
  <div className="flex flex-col h-full w-full">
    {/* Header with Betslip title */}
    <div className="px-4 py-3 border-b border-bg-secondary bg-bg-card flex-shrink-0 flex items-center justify-center">
      <h2 className="text-brand-text font-semibold text-base">Betslip</h2>
    </div>

    {/* Empty state content — positioned near top */}
    <div className="flex-1 flex flex-col items-center justify-start pt-12 p-6 text-center">
      {/* Ticket Icon */}
      <div className="mb-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-gray-500"
        >
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
      </div>

      {/* Main text */}
      <h3 className="text-brand-text font-semibold text-sm mb-2">
        Your betslip is empty
      </h3>

      {/* Subtext */}
      <p className="text-neutral-gray-500 text-xs leading-relaxed max-w-xs">
        Click on odds to add a bet to the betslip
      </p>
    </div>
  </div>
);

// ─── Extracted: Auth panel content ───────────────────────────────────────────

interface AuthContentProps {
  authMode: "login" | "register";
  setAuthMode: (m: "login" | "register") => void;
  onClose: () => void;
}

const AuthContent: React.FC<AuthContentProps> = ({
  authMode,
  setAuthMode,
  onClose,
}) => (
  <div className="flex flex-col h-full">
    {/* Close */}
    <div className="px-3 py-2.5 border-b border-stroke-light bg-bg-card flex-shrink-0">
      <button
        onClick={onClose}
        className="bg-brand-primary text-white w-full px-3 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition"
      >
        Close
      </button>
    </div>
    {/* Tabs */}
    <div className="flex text-xs font-bold border-b border-stroke-light bg-bg-card flex-shrink-0">
      {(["register", "login"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setAuthMode(mode)}
          className={clsx(
            "flex-1 py-3 text-center transition-colors uppercase text-xs font-bold",
            authMode === mode
              ? "text-brand-text border-b-2 border-accent-green"
              : "text-neutral-gray-500 hover:text-brand-text",
          )}
        >
          {mode === "register" ? "Registration" : "Login"}
        </button>
      ))}
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      {authMode === "register" ? <RegisterForm /> : <LoginForm />}
    </div>
  </div>
);

// ─── Extracted: Main sheet content (shared between mobile and desktop) ────────

interface SheetContentProps {
  mainTab: MainTab;
  setMainTab: (t: MainTab) => void;
  myBetsFilter: MyBetsFilter;
  setMyBetsFilter: (f: MyBetsFilter) => void;
  myBetsLoading: boolean;
  acceptOddsChanges: boolean;
  setAcceptOddsChanges: (v: boolean) => void;
  tvExpanded: boolean;
  setTvExpanded: (v: boolean) => void;
  isEventPage: boolean;
  currentEvent: any;
  betItems: any[];
  bets: PlacedBet[];
  hasOddsChanged: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  lastResult: any;
  betError: string | null;
  totalStake: number;
  totalReturn: number;
  totalLiability: number;
  availableBalance: number;
  SESSION_MARKET_TYPES: string[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateStake: (id: string, stake: number) => void;
  onClear: () => void;
  onPlace: () => void;
  onDone: () => void;
  onAcceptChange: (v: boolean) => void;
}

const SheetContent: React.FC<SheetContentProps> = ({
  mainTab,
  setMainTab,
  myBetsFilter,
  setMyBetsFilter,
  myBetsLoading,
  acceptOddsChanges,
  tvExpanded,
  setTvExpanded,
  isEventPage,
  currentEvent,
  betItems,
  bets,
  hasOddsChanged,
  canSubmit,
  isSubmitting,
  lastResult,
  betError,
  totalStake,
  totalReturn,
  totalLiability,
  availableBalance,
  SESSION_MARKET_TYPES,
  onClose,
  onRemove,
  onUpdateStake,
  onClear,
  onPlace,
  onDone,
  onAcceptChange,
}) => (
  <div className="flex flex-col h-full min-h-0">
    {/* ── BET SLIP | MY BETS tabs ── */}
    <div className="flex gap-2 px-3 py-2 border-b-2 border-stroke-light bg-bg-card flex-shrink-0">
      <button
        onClick={() => setMainTab("betslip")}
        className={clsx(
          "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
          mainTab === "betslip"
            ? "bg-brand-primary text-white shadow-sm"
            : "bg-bg-light-blue text-neutral-gray-500",
        )}
      >
        BET SLIP
        {betItems.length > 0 && (
          <span className="bg-brand-accent text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {betItems.length}
          </span>
        )}
      </button>
      <button
        onClick={() => setMainTab("mybets")}
        className={clsx(
          "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
          mainTab === "mybets"
            ? "bg-brand-primary text-white shadow-sm"
            : "bg-bg-light-blue text-neutral-gray-500",
        )}
      >
        MY BETS
      </button>
    </div>

    {/* ── Scrollable body ── */}
    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
      {/* ── Live TV — collapsible, compact on mobile ── */}
      {isEventPage && currentEvent?.tvStream && (
        <div
          className="flex-shrink-0 border-b border-stroke-light"
          style={{ background: "var(--color-surface-dark)" }}
        >
          {/* TV header — always visible, tap to expand/collapse */}
          <button
            onClick={() => setTvExpanded(!tvExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-2">
              <FiTv size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Live TV
              </span>
            </div>
            {tvExpanded ? (
              <FiChevronUp
                size={14}
                style={{ color: "rgba(255,255,255,0.5)" }}
              />
            ) : (
              <FiChevronDown
                size={14}
                style={{ color: "rgba(255,255,255,0.5)" }}
              />
            )}
          </button>
          {/*
            On mobile: max-h-40 (160px) — just enough to see the stream
            without eating the whole bet slip area.
            On desktop: max-h-48 (192px) — slightly taller since there's more room.
          */}
          {tvExpanded && (
            <div
              className="w-full bg-black max-h-40 md:max-h-48 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: currentEvent.tvStream }}
            />
          )}
        </div>
      )}

      {/* ══════════ BET SLIP TAB ══════════ */}
      {mainTab === "betslip" && (
        <>
          {/* Success */}
          {lastResult && (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-white text-3xl">✓</span>
              </div>
              <h3 className="font-display text-lg font-bold text-brand-text">
                Bets Placed!
              </h3>
              <p className="text-brand-text/70 text-sm">
                {Array.isArray(lastResult) ? lastResult.length : 1} bet(s)
                placed successfully
              </p>
              <button onClick={onDone} className="btn-primary w-full py-3">
                Done
              </button>
            </div>
          )}

          {/* Empty */}
          {!lastResult && betItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 p-6 text-center">
              <span className="text-4xl">🎯</span>
              <p className="text-xs font-semibold text-neutral-gray-500 uppercase tracking-wider">
                Your Bets
              </p>
              <p className="text-neutral-gray-500 text-sm">
                Click any odds to add a selection
              </p>
            </div>
          )}

          {/* Bet cards */}
          {!lastResult && betItems.length > 0 && (
            <div className="p-2.5 space-y-2">
              {betItems.map((item) => {
                const isSessionItem = SESSION_MARKET_TYPES.includes(
                  (item.marketType || "").toLowerCase(),
                );
                const potentialReturn =
                  item.betType === "BACK"
                    ? isSessionItem
                      ? (item.odds * item.stake) / 100 + item.stake
                      : (item.odds - 1) * item.stake + item.stake
                    : item.stake;
                const liability =
                  item.betType === "LAY"
                    ? isSessionItem
                      ? (item.odds * item.stake) / 100
                      : (item.odds - 1) * item.stake
                    : item.stake;

                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "rounded-xl border border-l-4 overflow-hidden",
                      item.oddsChanged
                        ? "border-accent-orange border-l-accent-orange"
                        : item.betType === "BACK"
                          ? "border-stroke-light border-l-odds-back"
                          : "border-stroke-light border-l-odds-lay",
                    )}
                  >
                    {/* Card header */}
                    <div
                      className={clsx(
                        "flex items-center justify-between px-3 py-2.5 border-b border-stroke-light/50",
                        item.betType === "BACK"
                          ? "bg-odds-back/10"
                          : "bg-odds-lay/10",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 text-white",
                            item.betType === "BACK"
                              ? "bg-odds-back"
                              : "bg-odds-lay",
                          )}
                        >
                          {item.betType}
                        </span>
                        <span className="text-xs font-semibold text-brand-text truncate">
                          {item.runnerName}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-neutral-gray-500 hover:text-accent-red transition-colors ml-1 shrink-0 p-0.5"
                      >
                        <FiX size={14} />
                      </button>
                    </div>

                    {/* Card body */}
                    <div className="bg-bg-card px-3 py-2.5 space-y-2.5">
                      <p className="text-[11px] text-neutral-gray-500 truncate">
                        {item.marketName}
                      </p>

                      {/* Odds */}
                      <div
                        className={clsx(
                          "text-sm font-bold font-mono",
                          item.oddsChanged
                            ? "text-accent-orange"
                            : "text-brand-text",
                        )}
                      >
                        {isSessionItem && item.line !== undefined
                          ? `Line: ${item.line} @ `
                          : "@ "}
                        {Number(item.odds).toFixed(2)}
                        {item.oddsChanged && (
                          <span className="ml-1 text-xs">↕</span>
                        )}
                      </div>

                      {/* Stake input */}
                      <div className="flex items-center gap-1.5 bg-bg-secondary border border-stroke-primary rounded-lg px-2.5 py-2">
                        <span className="text-brand-text/50 text-sm font-mono shrink-0">
                          ₹
                        </span>
                        <input
                          type="number"
                          className="flex-1 bg-transparent text-brand-text text-sm font-mono outline-none min-w-0"
                          value={item.stake || ""}
                          min={10}
                          max={100000}
                          onChange={(e) =>
                            onUpdateStake(item.id, Number(e.target.value))
                          }
                          placeholder="0"
                        />
                      </div>

                      {/* Quick stakes — 2 rows of 4 on mobile for easier tapping */}
                      <div className="grid grid-cols-4 gap-1">
                        {QUICK_STAKES.map((amount) => (
                          <button
                            key={amount}
                            className="text-[11px] bg-bg-light-blue border border-stroke-light hover:bg-brand-primary hover:text-white rounded-md py-1.5 transition-colors font-mono text-brand-text"
                            onClick={() =>
                              onUpdateStake(item.id, (item.stake || 0) + amount)
                            }
                          >
                            +{amount >= 1000 ? `${amount / 1000}K` : amount}
                          </button>
                        ))}
                      </div>

                      {/* Return / Liability */}
                      <div className="flex justify-between items-center text-xs pt-0.5 border-t border-stroke-light">
                        <span className="text-brand-text/60">
                          {item.betType === "BACK"
                            ? "Potential Return"
                            : "Liability"}
                        </span>
                        <span
                          className={clsx(
                            "font-bold font-mono",
                            item.betType === "LAY"
                              ? "text-accent-red"
                              : "text-accent-green",
                          )}
                        >
                          ₹
                          {(item.betType === "BACK"
                            ? potentialReturn
                            : liability
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════ MY BETS TAB ══════════ */}
      {mainTab === "mybets" && (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-2 px-3 py-2 bg-bg-card sticky top-0 z-10 border-b border-stroke-light">
            {(["active", "settled"] as MyBetsFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setMyBetsFilter(f)}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize",
                  myBetsFilter === f
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-bg-light-blue text-neutral-gray-500",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {myBetsLoading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full" />
            </div>
          )}

          {!myBetsLoading && bets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-2 text-center px-4">
              <span className="text-3xl">
                {myBetsFilter === "active" ? "🎯" : "📋"}
              </span>
              <p className="text-neutral-gray-500 text-sm">
                No {myBetsFilter} bets found
              </p>
            </div>
          )}

          {!myBetsLoading && bets.length > 0 && (
            <div className="p-2.5 space-y-2">
              {bets.map((bet, idx) => {
                const isSession = SESSION_MARKET_TYPES.includes(
                  (bet.marketType || "").toLowerCase(),
                );
                const potentialReturn =
                  bet.betType === "BACK"
                    ? isSession
                      ? (Number(bet.odds) * Number(bet.stake)) / 100 +
                        Number(bet.stake)
                      : (Number(bet.odds) - 1) * Number(bet.stake) +
                        Number(bet.stake)
                    : Number(bet.stake);
                const liability =
                  bet.betType === "LAY"
                    ? isSession
                      ? (Number(bet.odds) * Number(bet.stake)) / 100
                      : (Number(bet.odds) - 1) * Number(bet.stake)
                    : Number(bet.stake);
                const statusClass =
                  STATUS_COLORS[bet.status ?? ""] ??
                  "text-brand-text/60 bg-bg-light-blue";

                return (
                  <div
                    key={bet.betId ?? idx}
                    className={clsx(
                      "border border-stroke-light border-l-4 rounded-xl overflow-hidden bg-bg-card",
                      bet.betType === "BACK"
                        ? "border-l-odds-back"
                        : "border-l-odds-lay",
                    )}
                  >
                    <div className="flex items-center justify-between px-2.5 py-2 bg-bg-light-blue border-b border-stroke-light flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={clsx(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-white",
                            bet.betType === "BACK"
                              ? "bg-odds-back"
                              : "bg-odds-lay",
                          )}
                        >
                          {bet.betType}
                        </span>
                        <span className="text-[11px] text-neutral-gray-500 truncate max-w-[80px]">
                          {bet.marketType}
                        </span>
                      </div>
                      {bet.status && (
                        <span
                          className={clsx(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                            statusClass,
                          )}
                        >
                          {bet.status}
                        </span>
                      )}
                    </div>
                    <div className="px-2.5 py-2.5">
                      <p className="text-xs font-semibold text-brand-text mb-2 truncate">
                        {bet.runnerName}
                      </p>
                      <div className="grid grid-cols-3 gap-1 text-center pt-2 border-t border-stroke-light">
                        {[
                          {
                            label: "Odds",
                            value: `${Number(bet.odds).toFixed(2)}`,
                          },
                          {
                            label: "Stake",
                            value: `₹${Number(bet.stake).toFixed(2)}`,
                          },
                          {
                            label:
                              bet.betType === "BACK" ? "Return" : "Liability",
                            value: `₹${(bet.betType === "BACK" ? potentialReturn : liability).toFixed(2)}`,
                            colored: true,
                            isLay: bet.betType === "LAY",
                          },
                        ].map(({ label, value, colored, isLay }) => (
                          <div key={label}>
                            <p className="text-[10px] text-neutral-gray-500 mb-0.5">
                              {label}
                            </p>
                            <p
                              className={clsx(
                                "text-xs font-mono font-bold",
                                colored
                                  ? isLay
                                    ? "text-accent-red"
                                    : "text-accent-green"
                                  : "text-brand-text",
                              )}
                            >
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>

    {/* ── Sticky footer: Place Bets ── */}
    {mainTab === "betslip" && !lastResult && betItems.length > 0 && (
      <div className="flex-shrink-0 border-t-2 border-stroke-primary bg-bg-card px-3 py-3 space-y-2">
        <div className="flex justify-end">
          <button
            onClick={onClear}
            className="text-xs text-neutral-gray-500 hover:text-accent-red flex items-center gap-1 transition-colors"
          >
            <FiTrash2 size={12} /> Clear all
          </button>
        </div>

        {hasOddsChanged && (
          <label className="flex items-center gap-2 text-xs text-accent-orange cursor-pointer">
            <input
              type="checkbox"
              checked={acceptOddsChanges}
              onChange={(e) => onAcceptChange(e.target.checked)}
              className="rounded"
            />
            Accept all odds changes
          </label>
        )}

        {betError && <p className="text-xs text-accent-red">{betError}</p>}

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-brand-text/60">Total Stake</span>
            <span className="font-mono font-bold text-brand-text">
              ₹{totalStake.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-brand-text/60">Potential Return</span>
            <span className="font-mono font-bold text-accent-green">
              ₹{totalReturn.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-brand-text/60">Liability</span>
            <span
              className={clsx(
                "font-mono font-bold",
                totalLiability > (availableBalance ?? 0)
                  ? "text-accent-red"
                  : "text-brand-text",
              )}
            >
              ₹{totalLiability.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Place Bets — larger tap target on mobile */}
        <button
          onClick={onPlace}
          disabled={!canSubmit}
          className={clsx(
            "w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-all",
            canSubmit
              ? "bg-brand-accent text-black hover:opacity-90 active:opacity-80"
              : "bg-stroke-light text-neutral-gray-500 cursor-not-allowed",
          )}
        >
          {isSubmitting
            ? "Placing..."
            : `Place ${betItems.length} Bet${betItems.length > 1 ? "s" : ""}`}
        </button>
      </div>
    )}
  </div>
);

export default RightSidebar;
