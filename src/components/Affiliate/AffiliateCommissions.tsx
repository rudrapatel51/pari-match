import React, { useEffect, useState, useCallback } from "react";
import { clsx } from "clsx";
import { affiliateApi } from "../../api/client";
import { useToastStore } from "../../store/toastStore";
import Loader from "../Common/Loader";
import EmptyState from "../Common/EmptyState";
import Pagination from "../Common/Pagination";
import DateRangeFilter from "../Common/DateRangeFilter";
import { FiFileText } from "react-icons/fi";
import { Commission } from "../../types/affiliate";

const PERPAGE = 20;

const formatCurrency = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_FILTERS = ["All", "Pending", "Settled", "Cancelled"] as const;
const TYPE_FILTERS = ["All", "Deposit", "Loss", "Profit"] as const;

const TYPE_BADGE: Record<string, string> = {
  deposit: "bg-brand-primary/10 text-brand-primary",
  loss: "bg-accent-orange/10 text-accent-orange",
  profit: "bg-accent-green/10 text-accent-green",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-accent-yellow/10 text-accent-yellow",
  settled: "bg-accent-green/10 text-accent-green",
  cancelled: "bg-bg-light-blue text-neutral-gray-700",
};

interface Filters {
  status: string;
  commission_type: string;
  start_date: string;
  end_date: string;
}

const AffiliateCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    commission_type: "",
    start_date: "",
    end_date: "",
  });
  const toast = useToastStore();

  const load = useCallback(
    async (p: number, f: Filters) => {
      setLoading(true);
      try {
        const payload: any = { page: p, perpage: PERPAGE };
        if (f.status) payload.status = f.status;
        if (f.commission_type) payload.commission_type = f.commission_type;
        if (f.start_date) payload.start_date = f.start_date + "T00:00:00.000Z";
        if (f.end_date) payload.end_date = f.end_date + "T23:59:59.999Z";

        // res IS the parsed API body — interceptor returns response.data directly
        const res: any = await affiliateApi.getCommissionHistory(payload);
        setCommissions(res?.commissions || []);
        const rows = res?.totalRows || 0;
        setTotalPages(res?.totalPages || Math.ceil(rows / PERPAGE) || 1);
      } catch (e: any) {
        toast.error(e.message || "Failed to load commissions");
        setCommissions([]);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load(page, filters);
  }, [page, load, filters]);

  const applyFilter = (next: Partial<Filters>) => {
    const updated = { ...filters, ...next };
    setFilters(updated);
    setPage(1);
  };

  const applyDateRange = () => load(1, filters);

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-gray-700 uppercase tracking-wider">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => {
            const val = s === "All" ? "" : s.toLowerCase();
            return (
              <button
                key={s}
                onClick={() => applyFilter({ status: val })}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  filters.status === val
                    ? "bg-brand-primary text-brand-text"
                    : "bg-bg-light-blue text-brand-text hover:bg-brand-primary/10",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Type filter pills */}
        <p className="text-xs font-semibold text-neutral-gray-700 uppercase tracking-wider pt-1">
          Commission Type
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => {
            const val = t === "All" ? "" : t.toLowerCase();
            return (
              <button
                key={t}
                onClick={() => applyFilter({ commission_type: val })}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  filters.commission_type === val
                    ? "bg-brand-primary text-brand-text"
                    : "bg-bg-light-blue text-brand-text hover:bg-brand-primary/10",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Date range */}
        <DateRangeFilter
          fromDate={filters.start_date}
          toDate={filters.end_date}
          onFromChange={(v) => setFilters((f) => ({ ...f, start_date: v }))}
          onToChange={(v) => setFilters((f) => ({ ...f, end_date: v }))}
          onApply={applyDateRange}
          className="pt-1"
        />
      </div>

      {loading ? (
        <Loader text="Loading commissions…" />
      ) : commissions.length === 0 ? (
        <EmptyState
          title="No Commissions Found"
          description="No commission records match the selected filters"
          icon={<FiFileText className="w-10 h-10" />}
        />
      ) : (
        <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke-light bg-bg-light-blue">
                  {[
                    "Player",
                    "Type",
                    "Trigger Amount",
                    "Rate",
                    "Commission",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-brand-text uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-light">
                {commissions.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-bg-light-blue transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-brand-text">
                      {c.player_id?.username || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-semibold capitalize",
                          TYPE_BADGE[c.commission_type] ||
                            "bg-bg-light-blue text-brand-text",
                        )}
                      >
                        {c.commission_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-gray-700">
                      {formatCurrency(c.trigger_amount)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {c.commission_percentage}%
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-accent-green">
                      {formatCurrency(c.commission_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-semibold capitalize",
                          STATUS_BADGE[c.status] ||
                            "bg-bg-light-blue text-brand-text",
                        )}
                      >
                        {c.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-gray-700 whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-stroke-light">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AffiliateCommissions;
