import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiX, FiChevronDown } from "react-icons/fi";
import { casinoApi } from "../../api/client";
import CasinoGameCard from "../LiveCasino/CasinoGameCard";
import type { CasinoGame } from "../../types/casino";
import HeroBanner from "../Common/HeroBanner";
import Loader from "../Common/Loader";
import EmptyState from "../Common/EmptyState";
import CasinoTournamentSection from "./CasinoTournamentSection";

interface RawGame {
  game_id: string;
  game_code?: string;
  game_name: string;
  url_thumb?: string;
  provider_name?: string;
  category_id?: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

const CasinoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [allGames, setAllGames] = useState<RawGame[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeProvider, setActiveProvider] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [providerOpen, setProviderOpen] = useState(false);

  useEffect(() => {
    casinoApi
      .getFranchiseCategoriesWithGames({ include_games: true })
      .then((res: any) => {
        const cats = res?.data?.categories || [];
        if (!Array.isArray(cats)) return;

        const catList: Category[] = cats.map((c: any) => ({
          id: c.category_id || c._id,
          name: c.category_name || c.name,
        }));
        setCategories(catList);

        const flat: RawGame[] = cats.flatMap((c: any) =>
          (c.games || []).map((g: any) => ({
            ...g,
            category_id: c.category_id || c._id,
            category_name: c.category_name || c.name,
          })),
        );
        setAllGames(flat);

        const uniqueProviders = Array.from(
          new Set(flat.map((g) => g.provider_name).filter(Boolean)),
        ) as string[];
        setProviders(uniqueProviders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Pre-select category from URL param
  useEffect(() => {
    const param = searchParams.get("category");
    if (param && categories.some((c) => c.id === param)) {
      setActiveCategory(param);
    }
  }, [searchParams, categories]);

  // Pre-select provider from URL param
  useEffect(() => {
    const param = searchParams.get("provider");
    if (param) {
      // Even if the exact case differs slightly, set it.
      // Better yet, wait for providers to load or just set the string directly.
      setActiveProvider(param);
    }
  }, [searchParams]);

  // Close provider dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        providerDropdownRef.current &&
        !providerDropdownRef.current.contains(e.target as Node)
      ) {
        setProviderOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredGames = useMemo(() => {
    return allGames.filter((g) => {
      const matchCat =
        activeCategory === "all" || g.category_id === activeCategory;
      const matchProv =
        activeProvider === "all" || g.provider_name === activeProvider;
      const matchSearch =
        !search ||
        (g.game_name || "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchProv && matchSearch;
    });
  }, [allGames, activeCategory, activeProvider, search]);

  const handleGameClick = (game: CasinoGame) => {
    if (game.id === "01") {
      navigate("/aura-casino-game");
    } else {
      localStorage.setItem("gameId", game.id);
      navigate("/dream-casino-game");
    }
  };

  const toCardGame = (g: RawGame): CasinoGame => ({
    id: g.game_id || g.game_code || "",
    title: g.game_name,
    image: g.url_thumb || "",
    provider: g.provider_name,
  });

  const hasFilters =
    activeCategory !== "all" || activeProvider !== "all" || search;

  const activeCatName =
    activeCategory === "all"
      ? "All Games"
      : categories.find((c) => c.id === activeCategory)?.name || "All Games";

  return (
    <div className="w-full max-w-[1920px] mx-auto min-h-screen bg-bg-primary">
      {/* Banner */}
      <div className="bg-bg-white">
        <HeroBanner type="hero" />
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-40 bg-bg-card border-b border-stroke-light shadow-sm">
        {/* Category tabs */}
        <div className="bg-bg-card p-2">
          <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-neutral-gray-300 scrollbar-track-transparent">
            {[{ id: "all", name: "All Games" }, ...categories].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-brand-accent text-black shadow-md"
                    : "bg-bg-card text-neutral-gray-600 hover:bg-bg-light-blue border border-stroke-light"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Provider row */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-8 pr-7 py-2 bg-bg-light-blue text-brand-text placeholder-neutral-gray-400 rounded-lg text-xs border border-stroke-light focus:outline-none focus:border-brand-primary transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-gray-400 hover:text-brand-primary dark:hover:text-brand-text"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Provider dropdown */}
          {providers.length > 0 && (
            <div className="relative flex-shrink-0" ref={providerDropdownRef}>
              <button
                onClick={() => setProviderOpen((o) => !o)}
                className={`filter-pill flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-stroke-light ${activeProvider !== "all" ? "filter-pill-active" : ""}`}
              >
                <span className="max-w-[80px] truncate">
                  {activeProvider === "all" ? "Provider" : activeProvider}
                </span>
                <FiChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${providerOpen ? "rotate-180" : ""}`}
                />
              </button>

              {providerOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-bg-card border border-stroke-light rounded-lg shadow-elevated z-30 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setActiveProvider("all");
                      setProviderOpen(false);
                    }}
                    className={`filter-pill w-full text-left px-3 py-2.5 text-xs ${activeProvider === "all" ? "filter-pill-active" : ""}`}
                  >
                    All Providers
                  </button>
                  {providers.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setActiveProvider(p);
                        setProviderOpen(false);
                      }}
                      className={`filter-pill w-full text-left px-3 py-2.5 text-xs border-t border-stroke-light/50 ${activeProvider === p ? "filter-pill-active" : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader text="Loading casino games..." />
        </div>
      ) : (
        <div className="bg-bg-white px-3 sm:px-4 py-3">
          {/* Filter summary bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-gray-700">
                {activeCatName}
              </span>
              {activeProvider !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-light-blue text-brand-text text-xs rounded-full font-medium">
                  {activeProvider}
                  <button onClick={() => setActiveProvider("all")}>
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-light-blue text-brand-text text-xs rounded-full font-medium">
                  "{search}"
                  <button onClick={() => setSearch("")}>
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-gray-500">
                {filteredGames.length} games
              </span>
              {hasFilters && (
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveProvider("all");
                    setSearch("");
                  }}
                  className="text-xs text-brand-accent hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Game grid */}
          {filteredGames.length === 0 ? (
            <EmptyState
              title="No Games Found"
              description="Try adjusting your filters or search term."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredGames.map((g) => (
                <CasinoGameCard
                  key={g.game_id || g.game_code}
                  game={toCardGame(g)}
                  onPlay={handleGameClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tournament / Promo Section */}
      <CasinoTournamentSection />
    </div>
  );
};

export default CasinoPage;
