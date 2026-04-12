import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";
import { useBettingStore } from "../../store/bettingStore";
import OddsButton from "./OddsButton";
import type { BettingMarket as Market } from "../../types/domain";
import clsx from "clsx";

// ─── Market type classification ────────────────────────────────────────────
// Matches old-code/src/components/betting/markets/MarketCard.jsx exactly

/** Betfair style: 3 back + 3 lay columns */
const BETFAIR_TYPES = ["match-odd", "tied-match", "completed-match"];

/** Bookmaker style: 1 back + 1 lay column per runner */
const BOOKMAKER_TYPES = ["bookmaker", "bookmaker2"];

/** Session style: one flat row per market (no individual card header) */
const SESSION_TYPES = [
  "session",
  "fancy",
  "fancy1",
  "ball-by-ball",
  "khado",
  "meter",
  "player-race",
  "odd-even",
  "other-market",
];

/** Back-only columns */
const BACK_ONLY_TYPES = ["cricket-casino", "jackpot", "virtual-match"];

/** Market types that use percentage-based P&L: (rate × stake) / 100 */
const SESSION_PNL_TYPES = [
  "session",
  "fancy",
  "fancy1",
  "ball-by-ball",
  "meter",
  "bookmaker",
  "bookmaker2",
  "khado",
];

// ─── Odds data helpers ─────────────────────────────────────────────────────

/**
 * Build runnerId → { b1,b2,b3,l1,l2,l3,br1...,lr1...,sb } from live odds.
 * Handles both runner-array format (Betfair) and root-level format (session/bookmaker).
 */
function buildRunnerOddsMap(
  oddsData: any,
  market: Market,
): Record<string, any> {
  const map: Record<string, any> = {};
  if (!oddsData) return map;

  if (oddsData.r && Array.isArray(oddsData.r)) {
    oddsData.r.forEach((r: any) => {
      map[r.rid] = {
        ...r,
        b1: r.b1 ?? r.b,
        l1: r.l1 ?? r.l,
        bs1: r.bs1 ?? r.bs,
        ls1: r.ls1 ?? r.ls,
      };
    });
  } else if (oddsData.b !== undefined || oddsData.l !== undefined) {
    // Root-level format (session, bookmaker single-runner)
    const runnerId = market.runners?.[0]?.runnerId ?? market.marketId;
    map[runnerId] = {
      b1: oddsData.b,
      bs1: oddsData.bs ?? oddsData.br ?? 0,
      l1: oddsData.l,
      ls1: oddsData.ls ?? oddsData.lr ?? 0,
      sb: oddsData.sb,
    };
  }

  return map;
}

/** Fallback: read from market.runners[].metadata (DB-stored snapshot). */
function buildFallbackOddsMap(market: Market): Record<string, any> {
  const map: Record<string, any> = {};
  if (!market.runners) return map;
  for (const runner of market.runners) {
    if (
      runner.metadata &&
      (runner.metadata.b1 !== undefined || runner.metadata.l1 !== undefined)
    ) {
      map[runner.runnerId] = runner.metadata;
    }
  }
  return map;
}

/**
 * Get the suspension overlay text.
 * sb: null/undefined = active | 'S' | 'SUSPENDED' → 'SUSPENDED' | 'B' | 'BALL_RUNNING' → 'BALL RUNNING'
 */
function getSuspensionOverlay(runnerOdds: any, marketData: any): string | null {
  const sb = runnerOdds?.sb ?? marketData?.sb;
  if (sb === "S" || sb === "SUSPENDED") return "SUSPENDED";
  if (sb === "B" || sb === "BALL_RUNNING") return "BALL RUNNING";
  if (marketData?.s === false || marketData?.s === "SUSPENDED")
    return "SUSPENDED";
  return null;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SuspensionOverlay({ text }: { text: string }) {
  const isBall = text === "BALL RUNNING";
  return (
    <div
      className={clsx(
        "absolute inset-0 flex items-center justify-center z-10 rounded text-xs font-bold font-display tracking-wider",
        isBall
          ? "bg-accent-yellow/95 text-neutral-gray-900"
          : "bg-accent-red/95 text-brand-text",
      )}
    >
      {text}
    </div>
  );
}

function MarketHeader({
  market,
  collapsed,
  setCollapsed,
  backLabel,
  layLabel,
}: {
  market: Market;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  backLabel: string;
  layLabel?: string | null;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-brand-text rounded-t bg-brand-primary">
      {/* Left: market name + cashout badge */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        <span className="font-display text-sm font-semibold truncate">
          {market.name}
        </span>
        {market.marketStatus === "OPEN" && market.infoComments && (
          <span className="shrink-0 text-[10px] bg-accent-yellow text-neutral-gray-900 font-bold px-1.5 py-0.5 rounded">
            CASHOUT
          </span>
        )}
      </div>
      {/* Right: column headers + info + collapse */}
      <div className="flex items-center gap-2 shrink-0">
        {backLabel && (
          <span className="text-[11px] bg-odds-back text-neutral-gray-900 font-bold px-2 py-0.5 rounded">
            {backLabel}
          </span>
        )}
        {layLabel && (
          <span className="text-[11px] bg-odds-lay text-neutral-gray-900 font-bold px-2 py-0.5 rounded">
            {layLabel}
          </span>
        )}
        <button
          className="text-brand-text/60 hover:text-brand-text transition-colors p-0.5"
          title="Market Info"
        >
          <FiInfo size={13} />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-brand-text/80 hover:text-brand-text transition-colors p-0.5"
        >
          {collapsed ? <FiChevronDown size={15} /> : <FiChevronUp size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main MarketCard ─────────────────────────────────────────────────────────

export default function MarketCard({
  market,
  marketType,
}: {
  market: Market;
  marketType?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const oddsData = useBettingStore((s) => s.oddsMap[market.marketId]);
  const betItems = useBettingStore((s) => s.betItems);
  const addToBetSlip = useBettingStore((s) => s.addToBetSlip);

  const runnerOddsMap = oddsData
    ? buildRunnerOddsMap(oddsData, market)
    : buildFallbackOddsMap(market);

  const type = marketType || market.marketType;

  const isRunnerInSlip = (runnerId: string, betType: "BACK" | "LAY") =>
    betItems.some(
      (i) =>
        i.marketId === market.marketId &&
        i.runnerId === runnerId &&
        i.betType === betType,
    );

  const getRunnerPnl = (runnerId: string): string => {
    const item = betItems.find(
      (i) => i.marketId === market.marketId && i.runnerId === runnerId,
    );
    if (!item || !item.stake) return "–";
    const isSession = SESSION_PNL_TYPES.includes(
      (item.marketType || "").toLowerCase(),
    );
    const pnl = isSession
      ? item.betType === "BACK"
        ? (item.odds * item.stake) / 100
        : -((item.odds * item.stake) / 100)
      : item.betType === "BACK"
        ? (item.odds - 1) * item.stake
        : -((item.odds - 1) * item.stake);
    return (pnl >= 0 ? "+" : "") + pnl.toFixed(2);
  };

  const handleOddsClick = (
    runner: { runnerId: string; name: string },
    betType: "BACK" | "LAY",
    odds: number | undefined | null,
    line?: number | null,
  ) => {
    if (!odds || Number(odds) <= 0) return;
    addToBetSlip({
      eventId: market.eventId,
      marketId: market.marketId,
      marketName: market.name,
      marketType: market.marketType,
      runnerId: runner.runnerId,
      runnerName: runner.name,
      betType,
      odds: Number(odds),
      ...(line !== null && line !== undefined ? { line: Number(line) } : {}),
    });
  };

  // ── Route to correct renderer ──────────────────────────────────────────────
  if (SESSION_TYPES.includes(type)) {
    return (
      <SessionMarketRow
        market={market}
        oddsData={oddsData}
        handleOddsClick={handleOddsClick}
        isRunnerInSlip={isRunnerInSlip}
        useNoYes={[
          "session",
          "fancy",
          "fancy1",
          "ball-by-ball",
          "khado",
          "meter",
          "player-race",
        ].includes(type)}
      />
    );
  }

  if (type === "line-market") {
    return (
      <LineMarket
        market={market}
        runnerOddsMap={runnerOddsMap}
        oddsData={oddsData}
        handleOddsClick={handleOddsClick}
        isRunnerInSlip={isRunnerInSlip}
      />
    );
  }

  if (BETFAIR_TYPES.includes(type)) {
    return (
      <BetfairMarket
        market={market}
        runnerOddsMap={runnerOddsMap}
        oddsData={oddsData}
        handleOddsClick={handleOddsClick}
        isRunnerInSlip={isRunnerInSlip}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    );
  }

  if (BOOKMAKER_TYPES.includes(type)) {
    return (
      <BookmakerMarket
        market={market}
        runnerOddsMap={runnerOddsMap}
        oddsData={oddsData}
        handleOddsClick={handleOddsClick}
        isRunnerInSlip={isRunnerInSlip}
        getRunnerPnl={getRunnerPnl}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    );
  }

  if (BACK_ONLY_TYPES.includes(type)) {
    return (
      <BackOnlyMarket
        market={market}
        runnerOddsMap={runnerOddsMap}
        oddsData={oddsData}
        handleOddsClick={handleOddsClick}
        isRunnerInSlip={isRunnerInSlip}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    );
  }

  // Default: odd-even, goals, other types → generic back/lay
  return (
    <BackLayMarket
      market={market}
      runnerOddsMap={runnerOddsMap}
      oddsData={oddsData}
      handleOddsClick={handleOddsClick}
      isRunnerInSlip={isRunnerInSlip}
      getRunnerPnl={getRunnerPnl}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      type={type}
    />
  );
}

// ─── BETFAIR MARKET — 3 back + 3 lay ────────────────────────────────────────

function BetfairMarket({
  market,
  runnerOddsMap,
  oddsData,
  handleOddsClick,
  isRunnerInSlip,
  collapsed,
  setCollapsed,
}: any) {
  return (
    <div className="bg-black rounded shadow-betting-card mb-3 overflow-hidden">
      <MarketHeader
        market={market}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        backLabel="BACK"
        layLabel="LAY"
      />
      {!collapsed && (
        <div className="divide-y divide-stroke-light">
          {market.runners?.map((runner: any) => {
            const ro = runnerOddsMap[runner.runnerId] ?? {};
            const overlay = getSuspensionOverlay(ro, oddsData);
            return (
              <div
                key={runner.runnerId}
                className="flex flex-col px-3 py-3 gap-3 border-b border-stroke-light last:border-b-0"
              >
                {/* Runner name */}
                <span className="text-sm font-medium text-brand-text">
                  {runner.name || `Runner ${runner.runnerId}`}
                </span>
                {/* Odds cells below - 3x2 on mobile, horizontal on larger screens */}
                <div className="relative w-full grid grid-cols-3 gap-1 sm:flex sm:flex-nowrap sm:gap-2 shrink-0">
                  {overlay ? (
                    /* ── Full-width suspension bar across all 6 cells ── */
                    <div className="relative w-full grid grid-cols-3 gap-1 sm:flex sm:flex-nowrap sm:gap-1">
                      {[ro.b3, ro.b2, ro.b1].map((o, i) => (
                        <div key={`b${i}`} className="flex-1 min-w-0">
                          <OddsButton
                            odds={o}
                            type="back"
                            size="sm"
                            suspended
                          />
                        </div>
                      ))}
                      {[ro.l1, ro.l2, ro.l3].map((o, i) => (
                        <div key={`l${i}`} className="flex-1 min-w-0">
                          <OddsButton odds={o} type="lay" size="sm" suspended />
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <SuspensionOverlay text={overlay} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 3 Back (light → bold) */}
                      <div className="flex-1 min-w-0">
                        <OddsButton
                          odds={ro.b3}
                          volume={ro.br3}
                          type="back"
                          size="md"
                          active={isRunnerInSlip(runner.runnerId, "BACK")}
                          onClick={() => handleOddsClick(runner, "BACK", ro.b3)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <OddsButton
                          odds={ro.b2}
                          volume={ro.br2}
                          type="back"
                          size="md"
                          active={isRunnerInSlip(runner.runnerId, "BACK")}
                          onClick={() => handleOddsClick(runner, "BACK", ro.b2)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <OddsButton
                          odds={ro.b1 ?? ro.b}
                          volume={ro.br1 ?? ro.br}
                          type="back"
                          size="md"
                          active={isRunnerInSlip(runner.runnerId, "BACK")}
                          onClick={() =>
                            handleOddsClick(runner, "BACK", ro.b1 ?? ro.b)
                          }
                        />
                      </div>
                      {/* 3 Lay (bold → light) */}
                      <div className="flex-1 min-w-0">
                        <OddsButton
                          odds={ro.l1 ?? ro.l}
                          volume={ro.lr1 ?? ro.lr}
                          type="lay"
                          size="md"
                          active={isRunnerInSlip(runner.runnerId, "LAY")}
                          onClick={() =>
                            handleOddsClick(runner, "LAY", ro.l1 ?? ro.l)
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <OddsButton
                          odds={ro.l2}
                          volume={ro.lr2}
                          type="lay"
                          size="md"
                          active={isRunnerInSlip(runner.runnerId, "LAY")}
                          onClick={() => handleOddsClick(runner, "LAY", ro.l2)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <OddsButton
                          odds={ro.l3}
                          volume={ro.lr3}
                          type="lay"
                          size="md"
                          active={isRunnerInSlip(runner.runnerId, "LAY")}
                          onClick={() => handleOddsClick(runner, "LAY", ro.l3)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LINE MARKET — 3 back + 3 lay, no card header ───────────────────────────
// (same odd structure as Betfair but shows market.name as runner label)

function LineMarket({
  market,
  runnerOddsMap,
  oddsData,
  handleOddsClick,
  isRunnerInSlip,
}: any) {
  return (
    <div className="bg-black rounded shadow-betting-card mb-3 overflow-hidden">
      <div className="divide-y divide-stroke-light">
        {market.runners?.map((runner: any) => {
          const ro = runnerOddsMap[runner.runnerId] ?? {};
          const overlay = getSuspensionOverlay(ro, oddsData);
          return (
            <div
              key={runner.runnerId}
              className="flex flex-col sm:flex-row sm:items-center px-2 py-2 gap-2 sm:gap-1.5"
            >
              <div className="flex-1 flex items-center min-w-0">
                <span className="text-sm font-medium text-brand-text truncate">
                  {market.name || `Runner ${runner.runnerId}`}
                </span>
              </div>
              <div className="relative w-full grid grid-cols-3 gap-1 sm:flex sm:flex-nowrap sm:gap-0.5 sm:shrink-0 sm:w-auto">
                {overlay ? (
                  <div className="relative w-full grid grid-cols-3 gap-1 sm:flex sm:flex-nowrap sm:gap-0.5">
                    {[ro.b3, ro.b2, ro.b1].map((o, i) => (
                      <OddsButton
                        key={`b${i}`}
                        odds={o}
                        type="back"
                        size="sm"
                        suspended
                      />
                    ))}
                    {[ro.l1, ro.l2, ro.l3].map((o, i) => (
                      <OddsButton
                        key={`l${i}`}
                        odds={o}
                        type="lay"
                        size="sm"
                        suspended
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <SuspensionOverlay text={overlay} />
                    </div>
                  </div>
                ) : (
                  <>
                    <OddsButton
                      odds={ro.b3}
                      volume={ro.br3 || 0}
                      type="back"
                      size="sm"
                      active={isRunnerInSlip(runner.runnerId, "BACK")}
                      onClick={() => handleOddsClick(runner, "BACK", ro.b3)}
                    />
                    <OddsButton
                      odds={ro.b2}
                      volume={ro.br2 || 0}
                      type="back"
                      size="sm"
                      active={isRunnerInSlip(runner.runnerId, "BACK")}
                      onClick={() => handleOddsClick(runner, "BACK", ro.b2)}
                    />
                    <OddsButton
                      odds={ro.b1 ?? ro.b}
                      volume={ro.br1 || ro.br || 0}
                      type="back"
                      size="md"
                      active={isRunnerInSlip(runner.runnerId, "BACK")}
                      onClick={() =>
                        handleOddsClick(runner, "BACK", ro.b1 ?? ro.b)
                      }
                    />
                    <OddsButton
                      odds={ro.l1 ?? ro.l}
                      volume={ro.lr1 || ro.lr || 0}
                      type="lay"
                      size="md"
                      active={isRunnerInSlip(runner.runnerId, "LAY")}
                      onClick={() =>
                        handleOddsClick(runner, "LAY", ro.l1 ?? ro.l)
                      }
                    />
                    <OddsButton
                      odds={ro.l2}
                      volume={ro.lr2 || 0}
                      type="lay"
                      size="sm"
                      active={isRunnerInSlip(runner.runnerId, "LAY")}
                      onClick={() => handleOddsClick(runner, "LAY", ro.l2)}
                    />
                    <OddsButton
                      odds={ro.l3}
                      volume={ro.lr3 || 0}
                      type="lay"
                      size="sm"
                      active={isRunnerInSlip(runner.runnerId, "LAY")}
                      onClick={() => handleOddsClick(runner, "LAY", ro.l3)}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BOOKMAKER MARKET — 1 back + 1 lay per runner ───────────────────────────

function BookmakerMarket({
  market,
  runnerOddsMap,
  oddsData,
  handleOddsClick,
  isRunnerInSlip,
  getRunnerPnl,
  collapsed,
  setCollapsed,
}: any) {
  return (
    <div className="bg-black rounded shadow-betting-card mb-3 overflow-hidden">
      <MarketHeader
        market={market}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        backLabel="BACK"
        layLabel="LAY"
      />
      {!collapsed && (
        <div className="divide-y divide-stroke-light">
          {market.runners?.map((runner: any) => {
            const ro = runnerOddsMap[runner.runnerId] ?? {};
            const overlay = getSuspensionOverlay(ro, oddsData);
            return (
              <div
                key={runner.runnerId}
                className="flex flex-col px-3 py-3 gap-3 border-b border-stroke-light last:border-b-0"
              >
                <div className="relative flex gap-2 shrink-0 w-full">
                  {overlay ? (
                    <div className="relative flex gap-2 w-full">
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton odds={ro.b1} type="back" suspended />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton odds={ro.l1} type="lay" suspended />
                      </div>
                      <SuspensionOverlay text={overlay} />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton
                          odds={ro.b1}
                          volume={ro.bs1}
                          type="back"
                          size="lg"
                          active={isRunnerInSlip(runner.runnerId, "BACK")}
                          onClick={() => handleOddsClick(runner, "BACK", ro.b1)}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton
                          odds={ro.l1}
                          volume={ro.ls1}
                          type="lay"
                          size="lg"
                          active={isRunnerInSlip(runner.runnerId, "LAY")}
                          onClick={() => handleOddsClick(runner, "LAY", ro.l1)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SESSION / FANCY MARKET ROW — flat row, NO + YES (or BACK + LAY) ─────────
// Used as a row inside a parent section (BettingEventPage handles the section header).
// Matches old-code renderSessionMarket exactly.

function SessionMarketRow({
  market,
  oddsData,
  handleOddsClick,
  isRunnerInSlip,
  useNoYes,
}: {
  market: Market;
  oddsData: any;
  handleOddsClick: (
    runner: any,
    betType: "BACK" | "LAY",
    odds: any,
    line?: number | null,
  ) => void;
  isRunnerInSlip: (runnerId: string, betType: "BACK" | "LAY") => boolean;
  useNoYes: boolean;
}) {
  // Distinguish session types (br/lr = rates, b/l = lines) from odd-even (b/l = odds, no line)
  const marketType = market.marketType || market.type || "session";
  const isSessionType =
    marketType.includes("session") ||
    marketType.includes("ball-by-ball") ||
    marketType.includes("meter") ||
    marketType.includes("khado") ||
    marketType === "fancy" ||
    marketType === "fancy1";

  const rawB =
    oddsData?.b ?? oddsData?.b1 ?? market.runners?.[0]?.metadata?.b1 ?? 0;
  const rawL =
    oddsData?.l ?? oddsData?.l1 ?? market.runners?.[0]?.metadata?.l1 ?? 0;
  const rawBr =
    oddsData?.br ??
    oddsData?.bs ??
    oddsData?.bs1 ??
    market.runners?.[0]?.metadata?.bs1 ??
    0;
  const rawLr =
    oddsData?.lr ??
    oddsData?.ls ??
    oddsData?.ls1 ??
    market.runners?.[0]?.metadata?.ls1 ??
    0;

  // Display values (what the button shows)
  const yesDisplayOdds = rawB;
  const yesDisplayVol = rawBr;
  const noDisplayOdds = rawL;
  const noDisplayVol = rawLr;

  // Click values (what gets stored in bet item)
  const yesClickOdds = isSessionType ? rawBr : rawB;
  const yesClickLine = isSessionType ? rawB : null;
  const noClickOdds = isSessionType ? rawLr : rawL;
  const noClickLine = isSessionType ? rawL : null;

  const overlay = getSuspensionOverlay(oddsData, oddsData);
  const runner = market.runners?.[0] ?? {
    runnerId: market.marketId,
    name: market.name,
  };

  return (
    <div className="flex flex-col px-3 py-3 gap-3 border-b border-stroke-light bg-black">
      {/* Top: pill/number + name + BOOK button */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {market.ballNumber ? (
          <span className="text-[11px] font-bold text-brand-text bg-bg-light-blue px-1.5 py-0.5 rounded shrink-0">
            {market.ballNumber}
          </span>
        ) : (
          <span className="text-neutral-gray-300 shrink-0 text-base leading-none">
            ♡
          </span>
        )}
        <span className="text-sm font-medium text-brand-text truncate">
          {market.name}
        </span>
        <button className="shrink-0 text-[10px] font-bold border border-stroke-primary text-brand-text px-1.5 py-0.5 rounded hover:bg-brand-primary-light hover:border-brand-primary-light transition-colors">
          BOOK
        </button>
      </div>
      {/* Bottom: NO + YES (or BACK + LAY) odds stretched full width */}
      <div className="relative flex gap-2 shrink-0 w-full">
        {overlay ? (
          <div className="relative flex gap-2 w-full">
            {useNoYes ? (
              <>
                <div className="flex-1 min-w-0 flex items-center justify-center">
                  <OddsButton
                    odds={noDisplayOdds}
                    volume={noDisplayVol}
                    type="no"
                    size="lg"
                    suspended
                  />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center">
                  <OddsButton
                    odds={yesDisplayOdds}
                    volume={yesDisplayVol}
                    type="yes"
                    size="lg"
                    suspended
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0 flex items-center justify-center">
                  <OddsButton
                    odds={yesDisplayOdds}
                    volume={yesDisplayVol}
                    type="back"
                    size="lg"
                    suspended
                  />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center">
                  <OddsButton
                    odds={noDisplayOdds}
                    volume={noDisplayVol}
                    type="lay"
                    size="lg"
                    suspended
                  />
                </div>
              </>
            )}
            <SuspensionOverlay text={overlay} />
          </div>
        ) : useNoYes ? (
          // NO/YES: NO first (left), YES second (right)
          <>
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <OddsButton
                odds={noDisplayOdds}
                volume={noDisplayVol}
                type="no"
                size="lg"
                active={isRunnerInSlip(runner.runnerId, "LAY")}
                onClick={() =>
                  handleOddsClick(runner, "LAY", noClickOdds, noClickLine)
                }
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <OddsButton
                odds={yesDisplayOdds}
                volume={yesDisplayVol}
                type="yes"
                size="lg"
                active={isRunnerInSlip(runner.runnerId, "BACK")}
                onClick={() =>
                  handleOddsClick(runner, "BACK", yesClickOdds, yesClickLine)
                }
              />
            </div>
          </>
        ) : (
          // BACK/LAY: BACK first (left), LAY second (right)
          <>
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <OddsButton
                odds={yesDisplayOdds}
                volume={yesDisplayVol}
                type="back"
                size="lg"
                active={isRunnerInSlip(runner.runnerId, "BACK")}
                onClick={() =>
                  handleOddsClick(runner, "BACK", yesClickOdds, yesClickLine)
                }
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <OddsButton
                odds={noDisplayOdds}
                volume={noDisplayVol}
                type="lay"
                size="lg"
                active={isRunnerInSlip(runner.runnerId, "LAY")}
                onClick={() =>
                  handleOddsClick(runner, "LAY", noClickOdds, noClickLine)
                }
              />
            </div>
          </>
        )}
        {/* Info button — matches old-code mc-info-btn-sm */}
        <button
          className="text-neutral-gray-600 hover:text-brand-primary dark:hover:text-brand-text transition-colors p-1"
          title="Market Info"
        >
          <FiInfo size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── BACK-ONLY MARKET (cricket-casino, jackpot) ──────────────────────────────

function BackOnlyMarket({
  market,
  runnerOddsMap,
  oddsData,
  handleOddsClick,
  isRunnerInSlip,
  collapsed,
  setCollapsed,
}: any) {
  return (
    <div className="bg-black rounded shadow-betting-card mb-3 overflow-hidden">
      <MarketHeader
        market={market}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        backLabel="BACK"
        layLabel={null}
      />
      {!collapsed && (
        <div className="divide-y divide-stroke-light">
          {market.runners?.map((runner: any) => {
            const ro = runnerOddsMap[runner.runnerId] ?? {};
            const overlay = getSuspensionOverlay(ro, oddsData);
            return (
              <div
                key={runner.runnerId}
                className="flex flex-col px-3 py-3 gap-3 border-b border-stroke-light last:border-b-0"
              >
                {/* Runner name */}
                <span className="text-sm font-medium text-brand-text">
                  {runner.name || `Runner ${runner.runnerId}`}
                </span>
                {/* BOOK button + back odds below */}
                <div className="flex gap-2 shrink-0 w-full">
                  <button className="text-[10px] font-bold border border-brand-primary text-brand-primary px-1.5 py-0.5 rounded hover:bg-brand-primary hover:text-brand-text transition-colors shrink-0">
                    BOOK
                  </button>
                  <div className="relative flex-1 min-w-0">
                    {overlay ? (
                      <div className="relative">
                        <OddsButton
                          odds={ro.b1}
                          type="back"
                          size="lg"
                          suspended
                        />
                        <SuspensionOverlay text={overlay} />
                      </div>
                    ) : (
                      <OddsButton
                        odds={ro.b1}
                        volume={ro.bs1}
                        type="back"
                        size="lg"
                        active={isRunnerInSlip(runner.runnerId, "BACK")}
                        onClick={() => handleOddsClick(runner, "BACK", ro.b1)}
                      />
                    )}
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

// ─── BACK/LAY MARKET (odd-even, winner-market, goals etc.) ───────────────────

function BackLayMarket({
  market,
  runnerOddsMap,
  oddsData,
  handleOddsClick,
  isRunnerInSlip,
  getRunnerPnl,
  collapsed,
  setCollapsed,
  type,
}: any) {
  return (
    <div className="bg-black rounded shadow-betting-card mb-3 overflow-hidden">
      <MarketHeader
        market={market}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        backLabel="BACK"
        layLabel="LAY"
      />
      {!collapsed && (
        <div className="divide-y divide-stroke-light">
          {market.runners?.map((runner: any) => {
            const ro = runnerOddsMap[runner.runnerId] ?? {};
            const overlay = getSuspensionOverlay(ro, oddsData);
            return (
              <div
                key={runner.runnerId}
                className="flex flex-col px-3 py-3 gap-3 border-b border-stroke-light last:border-b-0"
              >
                {/* BACK/LAY odds below - stretched full width */}
                <div className="relative flex gap-2 shrink-0 w-full">
                  {overlay ? (
                    <div className="relative flex gap-2 w-full">
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton
                          odds={ro.b1 ?? ro.b}
                          type="back"
                          size="lg"
                          suspended
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton
                          odds={ro.l1 ?? ro.l}
                          type="lay"
                          size="lg"
                          suspended
                        />
                      </div>
                      <SuspensionOverlay text={overlay} />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton
                          odds={ro.b1 ?? ro.b}
                          volume={ro.bs1 || ro.bs || 0}
                          type="back"
                          size="lg"
                          active={isRunnerInSlip(runner.runnerId, "BACK")}
                          onClick={() =>
                            handleOddsClick(runner, "BACK", ro.b1 ?? ro.b)
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <OddsButton
                          odds={ro.l1 ?? ro.l}
                          volume={ro.ls1 || ro.ls || 0}
                          type="lay"
                          size="lg"
                          active={isRunnerInSlip(runner.runnerId, "LAY")}
                          onClick={() =>
                            handleOddsClick(runner, "LAY", ro.l1 ?? ro.l)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
