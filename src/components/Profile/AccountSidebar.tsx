import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import {
    FiLogOut, FiUser, FiShield, FiSettings,
    FiUsers, FiGift, FiTag, FiHelpCircle, FiGrid,
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
        <div className="flex flex-col h-full bg-bg-card">
            {/* ── Header in Black Box ─────────────────────────────────────── */}
            <div className="flex-shrink-0 mx-3 mt-3 mb-3 px-4 py-4 border border-stroke-light bg-bg-card">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-gray-50 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-brand-text" />
                    </div>
                    <span className="text-brand-text font-semibold text-sm">My Account</span>
                </div>
            </div>

            {/* ── Scrollable Menu Area ─────────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-0">
                {/* Balance Section */}
                <div className="bg-bg-card border border-stroke-light p-4 mb-3">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-neutral-gray-500 mb-1">Balance</p>
                                <p className="text-brand-text text-lg font-bold tabular-nums">
                                    {balanceLoading ? '—' : fmt(totalBalance)}
                                </p>
                            </div>
                            <span className="text-neutral-gray-600">
                                <MdAccountBalanceWallet className="w-5 h-5" />
                            </span>
                        </div>
                        
                        {/* Deposit & Withdrawal Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => navigate('/deposit')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-accent-green hover:bg-accent-green-light text-neutral-gray-900 font-semibold text-xs transition-colors"
                            >
                                <span>➕</span>
                                <span>Deposit</span>
                            </button>
                            <button
                                onClick={() => navigate('/withdraw')}
                                className="flex-1 py-2 px-3 bg-neutral-gray-600 hover:bg-neutral-gray-700 text-neutral-gray-50 font-semibold text-xs transition-colors"
                            >
                                Withdrawal
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-bg-card border border-stroke-light p-4 mb-3 flex items-center gap-3 cursor-pointer hover:bg-bg-light-blue transition-colors">
                    <FiGrid className="w-5 h-5 text-neutral-gray-500" />
                    <span className="text-brand-text font-medium text-sm">Search</span>
                </div>

                {/* Menu Items in Black Boxes */}
                {sections.map((section) => (
                    <div key={section.id} className="mb-3">
                        {section.items.map((item) => {
                            const isActive = activeMenuItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item)}
                                    className={[
                                        'w-full flex items-center px-4 py-3',
                                        'border transition-colors mb-2',
                                        'text-left text-sm font-medium',
                                        isActive
                                            ? 'bg-bg-light-blue text-brand-text border-stroke-light'
                                            : 'bg-bg-card border-stroke-light text-brand-text hover:bg-bg-light-blue',
                                    ].join(' ')}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-neutral-gray-500">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* ── Logout — pinned to bottom ────────────────────────────────── */}
            <div className="flex-shrink-0 p-3 border-t border-stroke-light bg-bg-card">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-red hover:bg-accent-red-dark text-brand-text font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group"
                    aria-label="Log out of your account"
                >
                    <FiLogOut className="w-4 h-4" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default AccountSidebar;
