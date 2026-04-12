import React from "react";
import { Runner } from "../../types/domain";
import { clsx } from "clsx";

interface RunnerRowProps {
  runner: Runner;
  onBetClick: (runner: Runner, price: number, side: "BACK" | "LAY") => void;
  isSuspended?: boolean;
}

export const RunnerRow: React.FC<RunnerRowProps> = ({
  runner,
  onBetClick,
  isSuspended,
}) => {
  // KEEP IDENTICAL: odds button renderer
  const renderOddBtn = (
    prices: { price: number; size: number }[],
    side: "BACK" | "LAY",
  ) => {
    const bestPrice = prices[0]; // KEEP IDENTICAL: always index 0
    const isRunnerActive = (runner.status || "").toUpperCase() === "ACTIVE";
    const isDisabled = isSuspended || !isRunnerActive;

    if (isDisabled || !bestPrice || !bestPrice.price) {
      return (
        <div className="w-16 h-10 rounded-lg bg-bg-light-blue border border-stroke-light flex items-center justify-center mx-0.5 cursor-not-allowed opacity-60">
          <span className="text-xs font-bold text-neutral-gray-600">—</span>
        </div>
      );
    }

    const isBack = side === "BACK";
    return (
      <button
        onClick={() => onBetClick(runner, bestPrice.price, side)}
        className={clsx(
          "w-16 h-10 rounded-lg flex flex-col items-center justify-center mx-0.5 cursor-pointer transition-all duration-150 hover:shadow-odds-hover hover:brightness-110 active:scale-95",
          isBack ? "bg-odds-back" : "bg-odds-lay",
        )}
      >
        <span className="text-sm font-bold font-mono text-neutral-gray-900 leading-tight">
          {bestPrice.price}
        </span>
        {!!bestPrice.size && (
          <span className="text-[9px] font-mono text-neutral-gray-600 leading-tight">
            {bestPrice.size}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between py-2.5 px-4 bg-bg-card hover:bg-bg-light-blue transition-colors">
      {/* Runner name */}
      <div className="flex-1 min-w-0 mr-3">
        <span className="font-medium text-sm text-neutral-gray-800 truncate block">
          {runner.runnerName}
        </span>
        {runner.handicap !== 0 && (
          <span className="text-[10px] text-brand-text">
            ({runner.handicap})
          </span>
        )}
      </div>

      {/* Odds buttons */}
      <div className="flex items-center gap-2">
        {renderOddBtn(runner.price.back, "BACK")}
        {renderOddBtn(runner.price.lay, "LAY")}
      </div>
    </div>
  );
};
