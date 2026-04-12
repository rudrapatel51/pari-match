import React, { useState } from "react";
import {
  FiGift,
  FiClock,
  FiArrowRight,
  FiStar,
  FiZap,
  FiShield,
} from "react-icons/fi";

interface Promotion {
  id: number;
  title: string;
  description: string;
  bonus: string;
  bonusLabel: string;
  category: "sports" | "casino" | "new-user" | "reload";
  badge?: string;
  badgeColor?: string;
  expiresIn: string;
  termsLink?: string;
  cta: string;
  gradient: string;
  icon: React.ElementType;
  minDeposit?: string;
  maxBonus?: string;
  featured?: boolean;
}

const PROMOTIONS: Promotion[] = [
  {
    id: 1,
    title: "Welcome Bonus",
    description:
      "New to WLSBet? Get a massive welcome bonus on your first deposit. Start your betting journey with extra funds!",
    bonus: "200%",
    bonusLabel: "on 1st Deposit",
    category: "new-user",
    badge: "HOT",
    badgeColor: "bg-accent-red",
    expiresIn: "Ongoing",
    cta: "Claim Now",
    gradient: "from-brand-blue-700 to-brand-blue-500",
    icon: FiStar,
    minDeposit: "₹500",
    maxBonus: "₹10,000",
    featured: true,
  },
  {
    id: 2,
    title: "Cricket Mega Bonus",
    description:
      "Bet on cricket matches and earn extra rewards. Special odds boost on IPL, T20, and Test matches every week.",
    bonus: "50%",
    bonusLabel: "Sports Reload",
    category: "sports",
    badge: "NEW",
    badgeColor: "bg-accent-green",
    expiresIn: "3 days left",
    cta: "Bet Now",
    gradient: "from-accent-green-dark to-accent-green",
    icon: FiZap,
    minDeposit: "₹200",
    maxBonus: "₹5,000",
  },
  {
    id: 3,
    title: "Casino Cashback",
    description:
      "Play your favourite casino games and get weekly cashback on your losses. Never leave empty handed!",
    bonus: "15%",
    bonusLabel: "Weekly Cashback",
    category: "casino",
    expiresIn: "Every Monday",
    cta: "Play Casino",
    gradient: "from-brand-blue-800 to-brand-blue-600",
    icon: FiGift,
    minDeposit: "₹100",
    maxBonus: "₹3,000",
  },
  {
    id: 4,
    title: "Reload Bonus",
    description:
      "Keep playing with our daily reload bonus. Deposit every day and receive a bonus on each reload to boost your balance.",
    bonus: "25%",
    bonusLabel: "Daily Reload",
    category: "reload",
    badge: "DAILY",
    badgeColor: "bg-accent-yellow",
    expiresIn: "Resets Daily",
    cta: "Deposit Now",
    gradient: "from-accent-orange-dark to-accent-orange",
    icon: FiShield,
    minDeposit: "₹300",
    maxBonus: "₹2,000",
  },
  {
    id: 5,
    title: "Live Casino VIP",
    description:
      "Join our exclusive live casino tables and unlock VIP privileges. Enjoy higher limits, personal host, and special tournaments.",
    bonus: "VIP",
    bonusLabel: "Exclusive Access",
    category: "casino",
    badge: "VIP",
    badgeColor: "bg-accent-yellow-dark",
    expiresIn: "Ongoing",
    cta: "Go Live",
    gradient: "from-brand-blue-900 to-brand-blue-700",
    icon: FiStar,
    minDeposit: "₹1,000",
    maxBonus: "Unlimited",
  },
  {
    id: 6,
    title: "Refer & Earn",
    description:
      "Invite your friends to WLSBet and earn a bonus for every friend who joins and makes their first deposit.",
    bonus: "₹500",
    bonusLabel: "Per Referral",
    category: "new-user",
    expiresIn: "Ongoing",
    cta: "Refer Now",
    gradient: "from-accent-green-dark to-brand-blue-700",
    icon: FiGift,
    minDeposit: "No min.",
    maxBonus: "Unlimited",
  },
  {
    id: 7,
    title: "Football Accumulator",
    description:
      "Place accumulator bets on football leagues and get a bonus on your winnings based on the number of selections.",
    bonus: "Up to 100%",
    bonusLabel: "Acca Boost",
    category: "sports",
    badge: "BOOST",
    badgeColor: "bg-accent-green",
    expiresIn: "Every Weekend",
    cta: "Bet Football",
    gradient: "from-accent-green to-brand-blue-600",
    icon: FiZap,
    minDeposit: "₹100",
    maxBonus: "₹5,000",
  },
  {
    id: 8,
    title: "Slots Free Spins",
    description:
      "Deposit and play slots to unlock free spins on our most popular slot games. New free spins added every week!",
    bonus: "50",
    bonusLabel: "Free Spins",
    category: "casino",
    expiresIn: "7 days left",
    cta: "Play Slots",
    gradient: "from-accent-orange to-accent-orange-dark",
    icon: FiGift,
    minDeposit: "₹200",
    maxBonus: "50 Spins",
  },
];

type FilterCategory = "all" | "sports" | "casino" | "new-user" | "reload";

const FILTER_TABS: { label: string; value: FilterCategory }[] = [
  { label: "All Offers", value: "all" },
  { label: "New User", value: "new-user" },
  { label: "Sports", value: "sports" },
  { label: "Casino", value: "casino" },
  { label: "Reload", value: "reload" },
];

const PromotionCard: React.FC<{ promo: Promotion }> = ({ promo }) => {
  const Icon = promo.icon;

  return (
    <div
      className={`card overflow-hidden flex flex-col theme-transition ${
        promo.featured ? "ring-2 ring-brand-primary" : ""
      }`}
    >
      {/* Card banner */}
      <div
        className={`bg-gradient-to-r ${promo.gradient} relative px-4 pt-4 pb-8 flex items-start justify-between`}
      >
        {/* Badge */}
        {promo.badge && (
          <span
            className={`absolute top-3 right-3 ${promo.badgeColor ?? "bg-accent-red"} text-brand-text text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}
          >
            {promo.badge}
          </span>
        )}
        {promo.featured && (
          <span className="absolute top-3 left-3 bg-accent-yellow text-neutral-gray-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Featured
          </span>
        )}

        {/* Bonus amount */}
        <div className="mt-4">
          <p className="text-brand-text/70 text-xs font-medium uppercase tracking-widest mb-0.5">
            {promo.bonusLabel}
          </p>
          <p className="text-brand-text text-4xl font-display font-bold leading-none">
            {promo.bonus}
          </p>
        </div>

        {/* Icon */}
        <div className="bg-white/20 rounded-full p-3 mt-4">
          <Icon className="w-6 h-6 text-brand-text" />
        </div>
      </div>

      {/* Wavy divider simulation */}
      <div
        className={`bg-gradient-to-r ${promo.gradient} h-2`}
        style={{ clipPath: "ellipse(55% 100% at 50% 0%)" }}
      />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-neutral-gray-800 font-semibold text-base leading-tight">
          {promo.title}
        </h3>
        <p className="text-neutral-gray-600 text-sm leading-relaxed flex-1">
          {promo.description}
        </p>

        {/* Details row */}
        <div className="flex items-center justify-between text-xs text-neutral-gray-500 border-t border-stroke-light pt-3">
          <span className="flex items-center gap-1">
            <FiClock className="w-3.5 h-3.5" />
            {promo.expiresIn}
          </span>
          {promo.minDeposit && <span>Min: {promo.minDeposit}</span>}
          {promo.maxBonus && <span>Max: {promo.maxBonus}</span>}
        </div>

        {/* CTA */}
        <button className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
          {promo.cta}
          <FiArrowRight className="w-4 h-4" />
        </button>

        <button className="text-xs text-neutral-gray-500 hover:text-neutral-gray-700 transition-colors text-center mt-0.5">
          View Terms &amp; Conditions
        </button>
      </div>
    </div>
  );
};

const PromotionsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filtered =
    activeFilter === "all"
      ? PROMOTIONS
      : PROMOTIONS.filter((p) => p.category === activeFilter);

  const featuredPromo = PROMOTIONS.find((p) => p.featured);

  return (
    <div className="min-h-screen bg-bg-primary pb-20 md:pb-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-blue-800 via-brand-blue-700 to-accent-green-dark px-4 py-8 md:py-12 text-brand-text text-center">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FiGift className="w-6 h-6 text-accent-yellow" />
            <span className="text-accent-yellow text-sm font-semibold uppercase tracking-widest">
              Exclusive Deals
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3 leading-tight">
            Promotions &amp; Offers
          </h1>
          <p className="text-brand-text/80 text-sm md:text-base max-w-xl mx-auto">
            Boost your winnings with our exclusive bonuses, cashback offers, and
            special promotions updated daily.
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Featured banner */}
        {featuredPromo && (
          <div
            className={`bg-gradient-to-r ${featuredPromo.gradient} rounded-xl p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 shadow-elevated`}
          >
            <div className="flex-1">
              <span className="inline-block bg-accent-yellow text-neutral-gray-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-3">
                🔥 Featured Offer
              </span>
              <h2 className="text-brand-text font-display text-2xl md:text-3xl font-bold mb-2">
                {featuredPromo.title}
              </h2>
              <p className="text-brand-text/80 text-sm max-w-md mb-4">
                {featuredPromo.description}
              </p>
              <div className="flex items-center gap-4 text-brand-text/70 text-xs mb-4">
                <span>Min Deposit: {featuredPromo.minDeposit}</span>
                <span>•</span>
                <span>Max Bonus: {featuredPromo.maxBonus}</span>
              </div>
              <button className="bg-accent-yellow hover:bg-accent-yellow-dark text-neutral-gray-900 font-bold px-6 py-2.5 rounded transition-all duration-200 flex items-center gap-2">
                {featuredPromo.cta}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <p className="text-brand-text/60 text-sm uppercase tracking-widest mb-1">
                {featuredPromo.bonusLabel}
              </p>
              <p className="text-brand-text font-display text-7xl font-bold leading-none">
                {featuredPromo.bonus}
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeFilter === tab.value
                  ? "filter-pill-active"
                  : "filter-pill"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-neutral-gray-600 text-sm mb-4">
          Showing{" "}
          <span className="font-semibold text-neutral-gray-800">
            {filtered.length}
          </span>{" "}
          offer{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Promo Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiGift className="w-12 h-12 text-neutral-gray-400 mb-3" />
            <h3 className="text-neutral-gray-600 font-semibold text-lg mb-1">
              No offers available
            </h3>
            <p className="text-neutral-gray-500 text-sm">
              Check back soon for new promotions.
            </p>
          </div>
        )}

        {/* Terms note */}
        <p className="text-center text-neutral-gray-500 text-xs mt-8">
          All promotions are subject to terms and conditions. Minimum deposit
          and wagering requirements apply. Please gamble responsibly.
        </p>
      </div>
    </div>
  );
};

export default PromotionsPage;
