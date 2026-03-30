import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useBettingStore } from '../../store/bettingStore';

const SPORT_ICONS: Record<string, string> = {
    Cricket: '🏏', Football: '⚽', Soccer: '⚽', Tennis: '🎾',
    Hockey: '🏒', Basketball: '🏀', Baseball: '⚾', Rugby: '🏉',
    'Horse Racing': '🐎', 'Greyhound Racing': '🐕', Kabaddi: '🤼',
    Election: '🗳️', Volleyball: '🏐', 'Table Tennis': '🏓',
    Badminton: '🏸', Boxing: '🥊', MMA: '🥋', Golf: '⛳',
};

// QUICK LINKS
const QUICK_LINKS = [
    { id: 'all-live', label: 'All Live', icon: '🔥', path: '/betting' },
    { id: 'favorites', label: 'Favorites', icon: '⭐', path: '/betting' },
    { id: 'top-parlays', label: 'Top Parlays', icon: '💸', path: '/betting' },
    { id: 'promotions', label: 'Promotions', icon: '🎁', path: '/promo' },
];

// POPULAR MOCK DATA
const POPULAR_CRICKET = [
    { id: 'ipl', countryFlag: '🇮🇳', country: 'India', league: 'Premier League' },
    { id: 'ipl-long', countryFlag: '🇮🇳', country: 'India', league: 'Premier League. Long-term bets' },
    { id: 'psl', countryFlag: '🇵🇰', country: 'Pakistan', league: 'Super League' },
];

// FALLBACK SPORTS DATA
const DEFAULT_SPORTS = [
    { sportId: 'cricket', name: 'Cricket', path: '/cricket' },
    { sportId: '1', name: 'Football', path: '/football' },
    { sportId: '1-soccer', name: 'Soccer', path: '/soccer' },
    { sportId: '2', name: 'Tennis', path: '/tennis' },
    { sportId: '7522', name: 'Hockey', path: '/hockey' },
    { sportId: '2378961', name: 'Election', path: '/election' },
];

// We keep these props so App.tsx doesn't break, but we don't use them 
// since the new design has no collapse/expand logic.
interface LeftSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = () => {
    const navigate = useNavigate();
    // In PariMatch, the sidebar sports list uses the backend sports data
    const storeSports = useBettingStore((s) => s.sports);
    const displaySports = storeSports.length > 0 ? storeSports : DEFAULT_SPORTS;

    return (
        <aside
            className={[
                'hidden lg:flex flex-col',
                'sticky top-[49px] h-[calc(100vh-49px)]',
                'w-[280px]',
                'bg-bg-card border-r border-stroke-light',
                'text-brand-text',
                'z-sidebar overflow-y-auto custom-scrollbar flex-shrink-0'
            ].join(' ')}
        >
            <div className="flex flex-col py-1">
                {/* QUICK LINKS */}
                <div className="flex flex-col">
                    {QUICK_LINKS.map(link => (
                        <button
                            key={link.id}
                            onClick={() => navigate(link.path)}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-light-blue transition-colors text-left border-b border-black/40"
                        >
                            <span className="text-2xl leading-none">{link.icon}</span>
                            <span className="text-sm font-semibold text-[#e1e1e1]">{link.label}</span>
                        </button>
                    ))}
                </div>

                {/* SPORTS LIST */}
                <div className="flex flex-col">
                    {displaySports.map((sport: any) => (
                        <button
                            key={sport.sportId}
                            onClick={() => navigate(sport.path || `/betting/sport/${sport.sportId}`)}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-light-blue transition-colors text-left border-b border-black/40"
                        >
                            <span className="text-2xl leading-none">{SPORT_ICONS[sport.name] ?? '🏆'}</span>
                            <span className="text-sm font-semibold text-[#e1e1e1] flex-1">{sport.name}</span>
                        </button>
                    ))}
                </div>

                {/* POPULAR CATEGORY */}
                <div className="px-5 pt-5 pb-3">
                    <span className="text-xs font-semibold text-neutral-gray-500 uppercase tracking-widest">
                        CRICKET · POPULAR
                    </span>
                </div>
                
                {/* Popular items wrapped in a grey rectangular container */}
                <div className="flex flex-col mx-3 mb-6 bg-[#252525] rounded-none overflow-hidden">
                    {POPULAR_CRICKET.map((item, index) => (
                        <button
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-3 hover:bg-[#303030] transition-colors text-left group ${
                                index !== POPULAR_CRICKET.length - 1 ? 'border-b border-black/40' : ''
                            }`}
                        >
                            <span className="text-xl leading-none pt-0.5">{item.countryFlag}</span>
                            <div className="flex-1 min-w-0">
                                <span className="block text-xs text-neutral-gray-500 font-medium mb-0.5">{item.country}</span>
                                <span className="block text-sm font-semibold truncate text-[#e1e1e1]">{item.league}</span>
                            </div>
                            <FiChevronRight className="w-5 h-5 text-neutral-gray-500" />
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;