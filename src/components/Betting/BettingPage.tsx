import React, { useState, useEffect, useCallback } from "react";

import { clsx } from "clsx";
import { FiRadio, FiActivity } from "react-icons/fi";

import { usePolling } from "../../hooks/usePolling";
import { bettingApi } from "../../api/bettingClient";
import { BETTING_SPORT_IDS } from "../../api/endpoints";

import Loader from "../Common/Loader";
import EmptyState from "../Common/EmptyState";
import { EventRow } from "../shared/EventRow";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: "inplay", label: "IN-PLAY", icon: "🔴" },
  { id: "cricket", label: "Cricket", icon: "🏏" },
  { id: "football", label: "Football", icon: "⚽" },
  { id: "tennis", label: "Tennis", icon: "🎾" },
  { id: "hockey", label: "Hockey", icon: "🏒" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SPORT_API: Record<Exclude<TabId, "inplay">, () => Promise<any>> = {
  cricket: () => bettingApi.getEventsBySport(BETTING_SPORT_IDS.cricket),
  football: () => bettingApi.getEventsBySport(BETTING_SPORT_IDS.football),
  tennis: () => bettingApi.getEventsBySport(BETTING_SPORT_IDS.tennis),
  hockey: () => bettingApi.getEventsBySport(BETTING_SPORT_IDS.hockey),
};

// ─── In-Play panel ────────────────────────────────────────────────────────────
const InPlayPanel: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const allEvents = categories.flatMap((c: any) => c.records || c.events || []);
  const selectedCat = categories.find(
    (c: any) => (c._id || c.name) === selectedCatId,
  );
  const displayEvents = selectedCat
    ? selectedCat.records || selectedCat.events || []
    : allEvents;

  if (loading && categories.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <Loader text="Loading live matches..." />
      </div>
    );
  }

  return (
    <div>
      {/* Live count badge */}
      {allEvents.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-green text-brand-text text-xs font-bold rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE {allEvents.length}
          </span>
        </div>
      )}

      {/* Category sub-tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-stroke-light">
          {categories.map((cat: any) => {
            const catId = cat._id || cat.name;
            const count = (cat.records || cat.events || []).length;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCatId(catId)}
                className={clsx(
                  "px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors border flex-shrink-0",
                  selectedCatId === catId
                    ? "bg-accent-red/10 border-accent-red text-accent-red"
                    : "border-stroke-light text-brand-text hover:border-brand-text",
                )}
              >
                {cat.name} <span className="font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Events */}
      {displayEvents.length === 0 ? (
        <EmptyState
          title="No Live Matches"
          description="No live matches are available right now. Check back soon."
        />
      ) : (
        <div className="divide-y divide-stroke-light/50">
          {displayEvents.map((event: any) => (
            <EventRow
              key={event.id || event.eventId || event._id}
              event={{
                ...event,
                eventId: event.id || event.eventId || event._id,
                eventName: event.name || event.eventName,
                dateTime: event.startTime,
                matchType: "IN_PLAY",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sport panel ──────────────────────────────────────────────────────────────
interface SportPanelProps {
  tabId: Exclude<TabId, "inplay">;
  title: string;
}

const SportPanel: React.FC<SportPanelProps> = ({ tabId, title }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesFilter, setSeriesFilter] = useState<string>("all");

  const fetchEvents = useCallback(async () => {
    try {
      const res = (await SPORT_API[tabId]()) as any;
      // bettingClient interceptor returns response.data directly
      const data = res?.data || res || [];
      setEvents(
        Array.isArray(data) ? data.filter((e: any) => !e.isGameOver) : [],
      );
    } catch (err) {
      console.error(`[BettingPage] fetch failed for ${tabId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tabId]);

  usePolling(fetchEvents, 10000);

  useEffect(() => {
    setLoading(true);
    setEvents([]);
    setSeriesFilter("all");
    fetchEvents();
  }, [tabId]);

  // Group by series
  const seriesGroups = events.reduce(
    (acc: Record<string, any[]>, event: any) => {
      const key =
        event.seriesKey || event.competition_name || event.league || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {},
  );

  const seriesKeys = Object.keys(seriesGroups);
  const filteredEvents =
    seriesFilter === "all" ? events : seriesGroups[seriesFilter] || [];
  const liveCount = events.filter(
    (e: any) => e.inPlay || e.status === "IN_PLAY",
  ).length;

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader text={`Loading ${title} matches...`} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stroke-light">
        <span className="text-xs text-brand-text font-semibold">
          {events.length} matches
        </span>
        {liveCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-green text-brand-text text-xs font-bold rounded animate-pulse">
            LIVE {liveCount}
          </span>
        )}
      </div>

      {/* Series filter pills */}
      {seriesKeys.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-stroke-light">
          <button
            onClick={() => setSeriesFilter("all")}
            className={clsx(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
              seriesFilter === "all"
                ? "bg-brand-primary text-brand-text"
                : "bg-bg-light-blue text-brand-text hover:bg-brand-primary/10",
            )}
          >
            All Competitions
          </button>
          {seriesKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSeriesFilter(key)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                seriesFilter === key
                  ? "bg-brand-primary text-brand-text"
                  : "bg-bg-light-blue text-brand-text hover:bg-brand-primary/10",
              )}
            >
              {key} ({seriesGroups[key].length})
            </button>
          ))}
        </div>
      )}

      {/* Events */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title={`No ${title} Matches`}
          description={`No upcoming ${title} matches available right now.`}
        />
      ) : (
        <div className="divide-y divide-stroke-light/50">
          {seriesFilter === "all" && seriesKeys.length > 1
            ? seriesKeys.map((seriesKey) => (
                <div key={seriesKey}>
                  <div className="px-4 py-2 bg-bg-light-blue border-b border-stroke-light">
                    <h3 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                      {seriesKey}
                    </h3>
                  </div>
                  {seriesGroups[seriesKey].map((event: any) => (
                    <EventRow
                      key={event.id || event.eventId}
                      event={{
                        ...event,
                        eventId: event.id || event.eventId,
                        eventName: event.name || event.eventName,
                        dateTime: event.startTime || event.matchDate,
                      }}
                    />
                  ))}
                </div>
              ))
            : filteredEvents.map((event: any) => (
                <EventRow
                  key={event.id || event.eventId}
                  event={{
                    ...event,
                    eventId: event.id || event.eventId,
                    eventName: event.name || event.eventName,
                    dateTime: event.startTime || event.matchDate,
                  }}
                />
              ))}
        </div>
      )}
    </div>
  );
};

// ─── Main BettingPage ─────────────────────────────────────────────────────────
const BettingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("inplay");

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page header */}
      <div className="bg-brand-primary px-6 py-5">
        <h1 className="text-xl font-display font-bold text-brand-text tracking-wide flex items-center gap-2">
          <FiActivity className="w-5 h-5" />
          Betting
        </h1>
        <p className="text-sm text-brand-text/60 mt-0.5">
          Sports betting — live &amp; upcoming
        </p>
      </div>

      {/* Tab bar */}
      <div className="bg-bg-card border-b border-stroke-light sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex-shrink-0",
                activeTab === tab.id
                  ? "border-brand-primary text-brand-text bg-brand-primary/5"
                  : "border-transparent text-brand-text hover:text-brand-text hover:bg-bg-light-blue",
              )}
            >
              <span>{tab.icon}</span>
              {tab.id === "inplay" ? (
                <span className="flex items-center gap-1">
                  {tab.label}
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                </span>
              ) : (
                tab.label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden m-4 md:m-6">
        {/* Panel header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke-light bg-bg-light-blue">
          <FiRadio className="w-4 h-4 text-brand-text" />
          <span className="text-xs font-semibold text-brand-text uppercase tracking-wider">
            {activeTabMeta.icon} {activeTabMeta.label}
          </span>
        </div>

        {activeTab === "inplay" ? (
          <InPlayPanel />
        ) : (
          <SportPanel
            key={activeTab}
            tabId={activeTab as Exclude<TabId, "inplay">}
            title={activeTabMeta.label}
          />
        )}
      </div>
    </div>
  );
};

export default BettingPage;
