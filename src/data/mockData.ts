// ============================================================
// NAVIGATION ITEMS - USED BY HEADER COMPONENT
// ============================================================
// This file contains only the navigationItems export which is used
// by Header.tsx. All other mock data has been removed as the app
// uses real APIs exclusively.
// ============================================================

export const navigationItems = [
  { label: "CRICKET", href: "/cricket", icon: "🏏" },
  { label: "FOOTBALL", href: "/football", icon: "⚽" },
  { label: "LIVE", href: "/betting", icon: "🔴" },
  { label: "CASINO", href: "/casino", icon: "🎰" },
  { label: "TENNIS", href: "/tennis", icon: "🎾" },
  { label: "SOCCER", href: "/soccer", icon: "⚽" },
  { label: "HOCKEY", href: "/hockey", icon: "🏑" },
  { label: "ELECTION", href: "/election", icon: "🗳️" },
  { label: "HORSE RACING", href: "/horse-racing", icon: "🐎" },
];

// ============================================================
// DEPRECATED - ALL FOLLOWING EXPORTS ARE NO LONGER USED
// The application now uses REAL APIs for all data
// ============================================================
// Removed exports (no longer needed):
// - mockMatches, topCompetitions, liveCompetitions
// - sportsCategories, gameCategories, accumulatorBets
// - slotsData, liveCasinoGames, tournaments
// - All mock sports events (Tennis, Football, Hockey, Election)
// - mockEventDetail, mockEventMarkets
// - mockSportsBySportId
//
// All this data is now fetched from real API endpoints.
// See src/api/client.ts for available API methods
