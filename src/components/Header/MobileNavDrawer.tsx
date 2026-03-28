import React, { useEffect, useState } from 'react';
import {
    FiX, FiChevronDown, FiChevronUp,
    FiHome, FiActivity, FiRadio, FiTv,
    FiStar, FiBarChart2, FiAward, FiGift,
    FiHelpCircle, FiInfo, FiHeadphones,
    FiUser, FiGrid,
} from 'react-icons/fi';
import { MdSportsCricket, MdSportsFootball, MdSportsTennis, MdSportsHockey } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';

// ─── Nav data structure matching 1xBet image exactly ─────────────────────────

interface NavItem {
    label: string;
    href:  string;
    icon:  React.ReactNode;
    badge?: string;
    expandable?: boolean;
}

interface NavSection {
    category?: string;  // Gray header row — "CASINO", "GAMES", etc.
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        // No category header — top main items
        items: [
            { label: 'Cricket',  href: '/cricket',  icon: <MdSportsCricket  className="w-4 h-4" /> },
            { label: 'Football', href: '/football', icon: <MdSportsFootball className="w-4 h-4" /> },
            { label: 'Live',     href: '/in-play',  icon: <FiRadio           className="w-4 h-4" /> },
            { label: 'Casino',   href: '/casino',   icon: <FiGrid            className="w-4 h-4" /> },
            { label: 'Tennis',   href: '/tennis',   icon: <MdSportsTennis   className="w-4 h-4" /> },
            { label: 'Soccer',   href: '/soccer',   icon: <MdSportsFootball className="w-4 h-4" /> },
            { label: 'Hockey',   href: '/hockey',   icon: <MdSportsHockey   className="w-4 h-4" /> },
            { label: 'Election', href: '/election', icon: <FiBarChart2       className="w-4 h-4" /> },
        ],
    },
    {
        category: 'CASINO',
        items: [
            { label: 'Casino',       href: '/casino',       icon: <FiGrid     className="w-4 h-4" /> },
            { label: 'Live Casino',  href: '/live-casino',  icon: <FiTv       className="w-4 h-4" />, expandable: true },
        ],
    },
    {
        category: 'GAMES',
        items: [
            { label: 'Slots',        href: '/slots',         icon: <FiActivity className="w-4 h-4" /> },
        ],
    },
    {
        category: 'PROMO',
        items: [
            { label: 'Promos & Offers', href: '/bonus-manager', icon: <FiGift    className="w-4 h-4" />, expandable: true },
        ],
    },
    {
        category: 'EXTRA',
        items: [
            { label: 'Affiliate',    href: '/affiliate/dashboard', icon: <FiUser       className="w-4 h-4" />, expandable: true },
            { label: 'About Us',     href: '/about-us',            icon: <FiInfo       className="w-4 h-4" />, expandable: true },
            { label: 'Contact Us',   href: '/contact-us',          icon: <FiHeadphones className="w-4 h-4" /> },
        ],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface MobileNavDrawerProps {
    isOpen:   boolean;
    onClose:  () => void;
}

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Trap body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const toggleItem = (label: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label); else next.add(label);
            return next;
        });
    };

    const handleNav = (href: string) => {
        navigate(href);
        onClose();
    };

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className={[
                    'fixed inset-0 z-[55] md:hidden',
                    'bg-black/50',
                    'transition-opacity duration-300',
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── Drawer — FULL WIDTH on mobile, as in target image ── */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                aria-hidden={!isOpen}
                className={[
                    'fixed inset-y-0 left-0 z-[60]',
                    /*
                      KEY FIX: w-full makes it full-screen width on mobile.
                      md:w-80 caps it on tablet+ so it's not absurdly wide on desktop.
                      This matches the 1xBet full-width mobile drawer in the target image.
                    */
                    'w-full md:w-80',
                    'flex flex-col',
                    /*
                      bg-bg-card:
                      Light theme → #ffffff white (matches 1xBet white drawer)
                      Dark theme  → #1e3347 dark card
                    */
                    'bg-bg-card',
                    'shadow-elevated',
                    'transform transition-transform duration-300 ease-in-out',
                    'md:hidden',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >

                {/* ── Header: matches 1xBet top bar with time + close ── */}
                <div className="flex items-center justify-between px-4 py-3 bg-brand-primary flex-shrink-0">
                    <span className="text-white font-bold text-sm tracking-widest uppercase">
                        Menu
                    </span>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                        aria-label="Close menu"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* ── App download banner — matches image: gray bg, two green buttons ── */}
                <div className="px-3 py-2.5 bg-stroke-light border-b border-stroke-light flex-shrink-0">
                    <p className="text-[10px] font-bold text-neutral-gray-500 uppercase tracking-widest mb-2">
                        Download the App
                    </p>
                    <div className="flex gap-2">
                        {[
                            { label: 'Android',   icon: '🤖' },
                            { label: 'App Store', icon: '🍎' },
                        ].map(app => (
                            <button
                                key={app.label}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-accent-green text-white text-xs font-bold py-2.5 rounded-md hover:opacity-90 transition-opacity"
                            >
                                <span className="text-sm leading-none">{app.icon}</span>
                                {app.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Scrollable nav list ── */}
                <nav className="flex-1 overflow-y-auto" aria-label="Main navigation">
                    {NAV_SECTIONS.map((section, si) => (
                        <div key={si}>

                            {/* Category header — "CASINO", "GAMES", etc.
                                Matches 1xBet: light gray full-width bar, tiny muted uppercase text.
                                Light: bg-stroke-light + text-neutral-gray-500
                                Dark:  bg-brand-primary-dark + text-white/50
                            */}
                            {section.category && (
                                <div className="px-4 py-1.5 bg-stroke-light dark:bg-brand-primary-dark border-b border-stroke-light">
                                    <span className="text-[10px] font-bold text-neutral-gray-500 dark:text-white/50 uppercase tracking-widest">
                                        {section.category}
                                    </span>
                                </div>
                            )}

                            {/* Items */}
                            {section.items.map((item) => {
                                const isActive =
                                    location.pathname === item.href ||
                                    location.pathname.startsWith(item.href + '/');
                                const isExpanded = expandedItems.has(item.label);

                                return (
                                    <div key={item.label}>
                                        <button
                                            onClick={() => {
                                                if (item.expandable) {
                                                    toggleItem(item.label);
                                                } else {
                                                    handleNav(item.href);
                                                }
                                            }}
                                            className={[
                                                'w-full flex items-center gap-3 px-4 py-3.5',
                                                'border-b border-stroke-light',
                                                'transition-colors duration-150',
                                                'text-left',
                                                isActive
                                                    /*
                                                      Active: subtle left accent + light bg.
                                                      Light: bg-bg-light-blue, brand-text color, green left border
                                                      Dark:  same tokens resolve to dark equivalents
                                                    */
                                                    ? 'bg-bg-light-blue border-l-[3px] border-l-accent-green'
                                                    : 'bg-bg-card hover:bg-bg-light-blue',
                                            ].join(' ')}
                                        >
                                            {/* Icon — brand-primary color in 1xBet image */}
                                            <span className={[
                                                'flex-shrink-0 flex items-center justify-center w-5',
                                                isActive ? 'text-accent-green' : 'text-brand-primary',
                                            ].join(' ')}>
                                                {item.icon}
                                            </span>

                                            {/* Label */}
                                            <span className={[
                                                'flex-1 text-sm font-medium leading-none',
                                                /*
                                                  text-brand-text: dark navy in light mode ✅,
                                                  white in dark mode ✅ — always readable on bg-bg-card
                                                */
                                                isActive ? 'text-brand-text font-semibold' : 'text-brand-text',
                                            ].join(' ')}>
                                                {item.label}
                                            </span>

                                            {/* Badge e.g. "TOP" */}
                                            {item.badge && (
                                                <span className="text-[9px] font-bold bg-accent-green text-white px-1.5 py-0.5 rounded uppercase leading-none">
                                                    {item.badge}
                                                </span>
                                            )}

                                            {/* Expand chevron */}
                                            {item.expandable && (
                                                <span className="text-neutral-gray-500 flex-shrink-0">
                                                    {isExpanded
                                                        ? <FiChevronUp  className="w-4 h-4" />
                                                        : <FiChevronDown className="w-4 h-4" />
                                                    }
                                                </span>
                                            )}
                                        </button>

                                        {/* Expanded sub-items — navigate on click */}
                                        {item.expandable && isExpanded && (
                                            <button
                                                onClick={() => handleNav(item.href)}
                                                className="w-full flex items-center gap-3 px-6 py-3 border-b border-stroke-light bg-bg-secondary hover:bg-bg-light-blue transition-colors text-left"
                                            >
                                                <span className="text-xs text-brand-text">
                                                    View all
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Safe area padding at bottom */}
                    <div className="h-10" />
                </nav>
            </aside>
        </>
    );
};

export default MobileNavDrawer;