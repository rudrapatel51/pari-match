import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import {
    FiLogOut, FiUser, FiShield, FiSettings,
    FiUsers, FiGift, FiTag, FiHelpCircle,
} from 'react-icons/fi';
import {
    MdAccountBalanceWallet, MdHistory, MdOutlineAccountBalance,
} from 'react-icons/md';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { RiVipCrownLine } from 'react-icons/ri';
import { TbChartBar } from 'react-icons/tb';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    onClick?: () => void;
}

interface MenuSection {
    id: string;
    label: string;
    icon: React.ReactNode;
    items: MenuItem[];
}

interface AccountSidebarProps {
    activeMenuItem?: string;
    onItemClick?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format a number as ₹ with 2 decimal places */
const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Component ───────────────────────────────────────────────────────────────

const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeMenuItem = '', onItemClick }) => {
    const { user, logout } = useAuth();
    const { mainBalance, bonusBalance, isLoading: balanceLoading, totalBalance } = useBalance();
    const navigate = useNavigate();

    // ── Menu structure ────────────────────────────────────────────────────────
    const sections: MenuSection[] = [
        {
            id: 'wallet',
            label: 'My Wallet & Bets',
            icon: <MdAccountBalanceWallet className="w-3.5 h-3.5" />,
            items: [
                { id: 'deposit', label: 'Deposit', icon: <MdAccountBalanceWallet className="w-4 h-4" />, path: '/deposit' },
                { id: 'withdraw', label: 'Withdraw funds', icon: <BiMoneyWithdraw className="w-4 h-4" />, path: '/withdraw' },
                { id: 'bet-history', label: 'Bet history', icon: <MdHistory className="w-4 h-4" />, path: '/bet-history' },
                { id: 'transaction-history', label: 'Transaction history', icon: <TbChartBar className="w-4 h-4" />, path: '/wallet' },
                { id: 'payment-accounts', label: 'Payment accounts', icon: <MdOutlineAccountBalance className="w-4 h-4" />, path: '/payment-accounts' },
            ],
        },
        {
            id: 'profile',
            label: 'Profile Settings',
            icon: <FiUser className="w-3.5 h-3.5" />,
            items: [
                { id: 'personal-profile', label: 'Personal profile', icon: <FiUser className="w-4 h-4" />, path: '/profile' },
                { id: 'kyc', label: 'KYC Verification', icon: <FiShield className="w-4 h-4" />, path: '/kyc' },
                { id: 'bet-stake-setting', label: 'Bet stake settings', icon: <FiSettings className="w-4 h-4" />, path: '/bet-stake-setting' },
            ],
        },
        {
            id: 'extras',
            label: 'Extras & Rewards',
            icon: <FiGift className="w-3.5 h-3.5" />,
            items: [
                { id: 'bonus-manager', label: 'Bonus Manager', icon: <FiGift className="w-4 h-4" />, path: '/bonus-manager' },
                { id: 'affiliate', label: 'Affiliate dashboard', icon: <FiUsers className="w-4 h-4" />, path: '/affiliate/dashboard' },
                { id: 'my-vip', label: 'VIP & Rewards', icon: <RiVipCrownLine className="w-4 h-4" />, path: '/my-vip' },
                { id: 'spin-win', label: 'Spin & Win', icon: <FiGift className="w-4 h-4" />, path: '/spin-win' },
                { id: 'daily-rewards', label: 'Daily Rewards', icon: <FiTag className="w-4 h-4" />, path: '/daily-rewards' },
                { id: 'support', label: 'Customer Support', icon: <FiHelpCircle className="w-4 h-4" />, path: '/contact-us' },
            ],
        },
    ];

    const handleMenuClick = (item: MenuItem) => {
        if (item.onClick) {
            item.onClick();
        } else if (item.path) {
            navigate(item.path);
        }
        
        if (onItemClick) {
            onItemClick();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        /*
         * Full-height flex column.
         * The parent <aside> in AccountLayout is overflow-hidden + h-[calc(100vh-5rem)].
         * This component fills that height and manages its own internal scroll.
         */
        <div className="flex flex-col h-full bg-bg-card">

            {/* ── Gradient Profile Header ──────────────────────────────────── */}
            <div className="relative flex-shrink-0 overflow-hidden bg-brand-primary border-b border-stroke-light">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white" />
                    <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white" />
                </div>

                <div className="relative z-10 px-5 pt-5 pb-4 space-y-3">
                    {/* Avatar + username row */}
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-md">
                                <FiUser className="w-6 h-6 text-white" />
                            </div>
                            {/* Edit pencil badge */}
                            <button
                                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-bg-card flex items-center justify-center shadow border border-brand-primary/20 hover:bg-brand-primary-light hover:border-white transition-colors duration-200 group"
                                aria-label="Edit profile picture"
                            >
                                <svg className="w-2.5 h-2.5 text-brand-primary group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm leading-tight truncate">
                                {user?.username || user?.name || 'My Account'}
                            </p>
                            {user?.user_id && (
                                <p className="text-white/70 text-xs mt-0.5 truncate">
                                    ID: {user.user_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Balance cards */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-colors duration-200 cursor-pointer group">
                            <span className="text-white/80 text-xs font-medium">Total Balance (INR)</span>
                            <span className="text-white text-xs font-bold tabular-nums group-hover:scale-105 transition-transform duration-150 origin-right">
                                {balanceLoading ? '—' : fmt(totalBalance)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-colors duration-200 cursor-pointer group">
                            <span className="text-white/80 text-xs font-medium">Main Balance (INR)</span>
                            <span className="text-white text-xs font-bold tabular-nums group-hover:scale-105 transition-transform duration-150 origin-right">
                                {balanceLoading ? '—' : fmt(mainBalance)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-colors duration-200 cursor-pointer group">
                            <span className="text-white/80 text-xs font-medium">Bonus Wallet</span>
                            <span className="text-white text-xs font-bold tabular-nums group-hover:scale-105 transition-transform duration-150 origin-right">
                                {balanceLoading ? '—' : fmt(bonusBalance)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Scrollable Menu Area ─────────────────────────────────────── */}
            <nav
                className="flex-1 overflow-y-auto custom-scrollbar"
                aria-label="Account navigation"
            >
                {sections.map((section, sIdx) => (
                    <div
                        key={section.id}
                        className={sIdx < sections.length - 1 ? 'border-b border-stroke-light' : ''}
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                            <span className="text-neutral-gray-600">
                                {section.icon}
                            </span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-gray-700 select-none">
                                {section.label}
                            </span>
                        </div>

                        {/* Menu items */}
                        <ul className="pb-1.5">
                            {section.items.map((item) => {
                                const isActive = activeMenuItem === item.id;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleMenuClick(item)}
                                            className={[
                                                'relative w-full flex items-center gap-3 px-4 py-2.5 text-left',
                                                'transition-colors duration-150 group',
                                                isActive
                                                    ? 'bg-sidebar-active text-neutral-gray-900'
                                                    : 'text-brand-text hover:bg-bg-light-blue',
                                            ].join(' ')}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            {/* Left accent bar */}
                                            <span
                                                className={[
                                                    'absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full transition-all duration-200',
                                                    isActive ? 'bg-brand-accent opacity-100' : 'opacity-0',
                                                ].join(' ')}
                                                aria-hidden="true"
                                            />

                                            {/* Icon */}
                                            <span className={[
                                                'shrink-0 transition-colors duration-150',
                                                isActive
                                                    ? 'text-brand-accent'
                                                    : 'text-neutral-gray-700',
                                            ].join(' ')}>
                                                {item.icon}
                                            </span>

                                            {/* Label */}
                                            <span className={[
                                                'flex-1 text-sm leading-snug',
                                                isActive ? 'font-semibold' : 'font-medium',
                                            ].join(' ')}>
                                                {item.label}
                                            </span>

                                            {/* Active dot */}
                                            {isActive && (
                                                <span
                                                    className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* ── Logout — pinned to bottom ────────────────────────────────── */}
            <div className="flex-shrink-0 p-3 border-t border-stroke-light bg-bg-white shadow-[0_-2px_8px_0_rgba(0,0,0,0.06)]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-red hover:bg-accent-red-dark text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group"
                    aria-label="Log out of your account"
                >
                    <FiLogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default AccountSidebar;
