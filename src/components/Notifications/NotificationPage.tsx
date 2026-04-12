import React, { useCallback, useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { userApi } from "../../api/client";
import {
  Notification,
  useNotificationStore,
} from "../../store/notificationStore";
import { useToastStore } from "../../store/toastStore";
import Loader from "../Common/Loader";
import EmptyState from "../Common/EmptyState";
import Pagination from "../Common/Pagination";

// ─── Filter types ─────────────────────────────────────────────────────────────

type StatusFilter = "all" | "unread" | "read";
type CategoryFilter =
  | "all"
  | "general"
  | "system"
  | "user"
  | "admin"
  | "security"
  | "promotion";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "system", label: "System" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "security", label: "Security" },
  { value: "promotion", label: "Promotion" },
];

const PER_PAGE = 10;

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function getNotificationIcon(n: Notification) {
  if (n.priority === "high" || n.type === "security")
    return <FiAlertTriangle className="w-5 h-5 text-accent-red" />;
  if (n.type === "admin")
    return <FiCheckCircle className="w-5 h-5 text-accent-green" />;
  if (n.type === "system")
    return <FiClock className="w-5 h-5 text-accent-yellow" />;
  return <FiBell className="w-5 h-5 text-neutral-gray-500" />;
}

function getIconBg(n: Notification): string {
  if (n.priority === "high" || n.type === "security") return "bg-accent-red/10";
  if (n.type === "admin") return "bg-accent-green/10";
  if (n.type === "system") return "bg-accent-yellow/10";
  return "bg-bg-light-blue";
}

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationPage: React.FC = () => {
  const {
    notifications,
    setNotifications,
    setUnreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    setLoading,
  } = useNotificationStore();

  const toast = useToastStore();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const payload: Record<string, any> = { page, per_page: PER_PAGE };
      if (categoryFilter !== "all") payload.category = categoryFilter;
      if (statusFilter === "unread") payload.unread_only = true;
      if (statusFilter === "read") payload.read_only = true;

      const res = (await userApi.getNotifications(payload)) as any;
      const data = res?.data || {};

      const records: Notification[] = (data.records || []).map((n: any) => ({
        ...n,
        is_read: n.is_viewed === 1,
      }));

      setNotifications(records);
      setTotalPages(data.last_page || 1);
      if (typeof data.unread_count === "number")
        setUnreadCount(data.unread_count);
    } catch (e: any) {
      toast.error(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handleCategoryChange = (val: CategoryFilter) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (n.is_read) return;
    try {
      await userApi.markNotificationClicked({ id: n._id });
      await userApi.changeNotificationStatus({ id: n._id, status: 1 });
      markAsRead(n._id);
    } catch {}
  };

  const handleMarkAll = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (!unread.length) return;
    try {
      await Promise.all(
        unread.map((n) =>
          userApi.changeNotificationStatus({ id: n._id, status: 1 }),
        ),
      );
      markAllAsRead();
    } catch {}
    setTimeout(() => doFetch(), 500);
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Page header ── */}
      <div className="bg-brand-primary px-6 py-5">
        <h1 className="text-xl font-display font-bold text-brand-text tracking-wide">
          Notifications
        </h1>
        <p className="text-sm text-brand-text/60 mt-0.5">
          Your alerts, updates, and messages
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-8xl">
        {/* ── Filter bar ── */}
        <div className="bg-bg-card border border-stroke-light rounded-xl p-4 space-y-3">
          {/* Status tabs — All / Unread / Read */}
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`
                                    flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold
                                    transition-colors duration-150
                                    ${
                                      statusFilter === opt.value
                                        ? /*
                                          Active: bg-brand-primary text-brand-text
                                          Works in both themes — brand-primary is the
                                          nav color, text-brand-text always reads on it.
                                        */
                                          "bg-brand-primary text-brand-text"
                                        : /*
                                          Inactive: bg-bg-light-blue text-neutral-gray-500
                                          In dark mode: bg-bg-light-blue = #1b3a52 (dark tint)
                                                        text-neutral-gray-500 = mid gray — readable
                                          In light mode: bg-bg-light-blue = #dff0fa (light tint)
                                                         text-neutral-gray-500 = medium gray — readable
                                        */
                                          "bg-bg-light-blue text-neutral-gray-500 hover:bg-brand-primary/20 hover:text-brand-text"
                                    }
                                `}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Category select + Mark all read */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) =>
                handleCategoryChange(e.target.value as CategoryFilter)
              }
              className="
                                flex-1 text-xs px-3 py-2 rounded-lg
                                border border-stroke-primary
                                bg-bg-card text-brand-text
                                focus:outline-none focus:border-brand-primary
                                transition-colors
                            "
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-bg-secondary text-brand-text"
                >
                  {opt.label}
                </option>
              ))}
            </select>

            {hasUnread && (
              <button
                onClick={handleMarkAll}
                className="
                                    flex items-center gap-1.5 text-xs font-semibold
                                    text-brand-text whitespace-nowrap
                                    px-3 py-2 rounded-lg
                                    border border-stroke-light
                                    bg-bg-card
                                    hover:bg-accent-green hover:text-brand-text
                                    hover:border-accent-green
                                    transition-colors duration-150
                                "
              >
                <FiCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ── Notification list ── */}
        {isLoading ? (
          <Loader text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You have no notifications matching your current filters."
            icon={<FiBell className="w-12 h-12" />}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`
                                    p-4 rounded-xl border transition-all duration-150
                                    ${
                                      n.is_read
                                        ? /*
                                          READ: plain card, no interaction highlight.
                                          bg-bg-card + border-stroke-light works in both themes.
                                        */
                                          "bg-bg-card border-stroke-light cursor-default"
                                        : /*
                                          UNREAD: accent-green tint instead of brand-primary tint.
                                          Reason: in dark theme brand-primary/5 = barely visible.
                                          accent-green is vivid in both themes so the tint reads clearly.
                                        */
                                          "bg-accent-green/5 border-accent-green/30 hover:border-accent-green/60 cursor-pointer"
                                    }
                                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${getIconBg(n)}`}
                  >
                    {getNotificationIcon(n)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title
                                            FIX: was text-neutral-gray-600 (read) / text-neutral-gray-800 (unread)
                                            In dark mode both of these render as light grays that
                                            look almost identical and wash out.
                                            FIX: text-neutral-gray-500 (read = muted) vs text-brand-text
                                            (unread = full brightness). brand-text = #ffffff dark / #0d2b45 light.
                                        */}
                    <p
                      className={`
                                            text-sm font-semibold leading-snug
                                            ${n.is_read ? "text-neutral-gray-500" : "text-brand-text"}
                                        `}
                    >
                      {n.title}
                    </p>

                    {/* Message body — always brand-text for readability */}
                    <p className="text-sm text-brand-text/80 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Meta row: timestamp + category + priority */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Timestamp */}
                      <span className="text-xs text-neutral-gray-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>

                      {/* Category badge
                                                FIX: was text-neutral-gray-700 which in dark mode is
                                                a light gray — fine but text-neutral-gray-500 is
                                                more consistent muted tone across both themes.
                                            */}
                      {n.category && (
                        <span
                          className="
                                                    text-[10px] font-semibold px-1.5 py-0.5
                                                    rounded-full uppercase tracking-wider
                                                    bg-bg-light-blue text-neutral-gray-500
                                                    border border-stroke-light
                                                "
                        >
                          {n.category}
                        </span>
                      )}

                      {/* High priority badge */}
                      {n.priority === "high" && (
                        <span
                          className="
                                                    text-[10px] font-bold px-1.5 py-0.5
                                                    rounded-full uppercase tracking-wider
                                                    bg-accent-red/10 text-accent-red
                                                "
                        >
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator dot
                                        FIX: was bg-brand-primary — in dark mode brand-primary
                                        is dark navy #1a3a5c, nearly invisible on dark card.
                                        FIX: bg-accent-green — vivid, visible in both themes,
                                        consistent with 1xBet-style live/active indicators.
                                    */}
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-green flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
