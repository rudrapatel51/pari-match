import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FiPlay, FiTv } from "react-icons/fi";
import bettingClient from "../../api/bettingClient";
import { Endpoints } from "../../api/endpoints";
import { useBettingStore } from "../../store/bettingStore";
import { useToastStore } from "../../store/toastStore";
import type { EventRunner } from "../../types/domain";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]}, ${d.getDate()}`;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function OddsPair({
  runner,
  label,
}: {
  runner: EventRunner | undefined;
  label: string;
}) {
  return (
    <div className="odds-pair-stack min-w-[40px]">
      <span className="odds-pair-box">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <span className="odds-pair-value">
            {runner?.back != null ? Number(runner.back).toFixed(2) : "—"}
          </span>
          <span className="odds-pair-label">{label}</span>
        </div>
      </span>
      <span className="odds-pair-box">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <span className="odds-pair-value">
            {runner?.lay != null ? Number(runner.lay).toFixed(2) : "—"}
          </span>
          <span className="odds-pair-label">{label}</span>
        </div>
      </span>
    </div>
  );
}

export default function BettingSportPage() {
  const { sportId } = useParams<{ sportId: string }>();
  const { sportEvents, setSportEvents } = useBettingStore();

  useEffect(() => {
    if (!sportId) return;
    setSportEvents([]);
    bettingClient
      .get<any>(Endpoints.BETTING_EVENTS_BY_SPORT(sportId))
      .then((res: any) => {
        const list = res?.data || res || [];
        setSportEvents(
          Array.isArray(list) ? list.filter((e: any) => !e.isGameOver) : [],
        );
      })
      .catch(() => {
        useToastStore.getState().error("Failed to load sport events");
      });
  }, [sportId, setSportEvents]);

  const events = sportEvents.filter((e) => !e.isGameOver);

  return (
    <div className="p-3">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-4xl">🏆</span>
          <p className="text-neutral-gray-700 text-sm">
            No events found for this sport
          </p>
        </div>
      ) : (
        <div className="bg-bg-card rounded-lg shadow-betting-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center px-3 py-2 bg-brand-primary text-brand-text text-xs font-display font-semibold">
            <span className="flex-1">SCHEDULE</span>
          </div>

          {events.map((event) => (
            <Link
              key={event.eventId}
              to={`/betting/event/${event.eventId}`}
              className="flex flex-col md:flex-row md:items-center px-3 py-3 border-b border-stroke-light transition-colors gap-3 md:gap-0"
            >
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-gray-600 shrink-0">
                    {formatDate(event.startTime)}
                  </span>
                  <span className="text-sm text-neutral-gray-600 shrink-0">
                    {formatTime(event.startTime)}
                  </span>
                  {event.matchStatus === "LIVE" && (
                    <span className="flex items-center gap-1 text-sm text-accent-red font-bold">
                      <FiPlay size={10} fill="currentColor" />
                      In-Play
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-neutral-gray-800 transition-colors truncate">
                    {event.name}
                  </span>
                  {event.hasBookmaker && (
                    <>
                      <span className="text-xs bg-brand-primary text-brand-text font-bold px-1.5 py-0.5 rounded shrink-0">
                        BM
                      </span>
                      <FiTv
                        size={12}
                        className="text-neutral-gray-600 shrink-0"
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:gap-3 shrink-0 w-full md:w-auto justify-between md:justify-start">
                <OddsPair runner={event.matchOdds?.runners?.[0]} label="1" />
                <OddsPair runner={event.matchOdds?.runners?.[1]} label="X" />
                <OddsPair runner={event.matchOdds?.runners?.[2]} label="2" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
