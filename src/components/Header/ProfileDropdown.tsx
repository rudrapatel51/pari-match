import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiLogOut, FiSettings, FiGift } from 'react-icons/fi';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { MdAccountBalanceWallet, MdHistory } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { useNavigate } from 'react-router-dom';

/** Format an INR amount to 2 decimal places */
const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface QuickMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

const ProfileDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const { mainBalance, bonusBalance, isLoading: balanceLoading } = useBalance();
    const navigate = useNavigate();

    // Quick access menu items
    const quickMenuItems: QuickMenuItem[] = [
        { id: 'profile', label: 'My Profile', icon: <FiUser className="w-4 h-4" />, path: '/profile' },
        { id: 'deposit', label: 'Deposit', icon: <MdAccountBalanceWallet className="w-4 h-4" />, path: '/deposit' },
        { id: 'withdraw', label: 'Withdraw', icon: <BiMoneyWithdraw className="w-4 h-4" />, path: '/withdraw' },
        { id: 'bet-history', label: 'Bet History', icon: <MdHistory className="w-4 h-4" />, path: '/bet-history' },
        { id: 'settings', label: 'Settings', icon: <FiSettings className="w-4 h-4" />, path: '/bet-stake-setting' },
        { id: 'rewards', label: 'My Rewards', icon: <FiGift className="w-4 h-4" />, path: '/my-vip' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMenuClick = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Icon Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-primary hover:bg-brand-primary-light transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                aria-label="Account menu"
                aria-expanded={isOpen}
            >
                <FiUser className="w-5 h-5 text-white" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-bg-white rounded-lg shadow-elevated border border-stroke-light overflow-hidden z-header animate-fadeIn">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-brand-primary to-brand-primary-light p-4 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                                <FiUser className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm truncate">{user?.username || 'Guest'}</div>
                                <div className="text-xs opacity-90">ID: {user?.user_id || '-'}</div>
                            </div>
                        </div>

                        {/* Balance Display */}
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm px-3 py-2 rounded text-xs">
                                <span className="opacity-90">Main Balance</span>
                                <span className="font-bold">
                                    {balanceLoading ? '...' : fmt(mainBalance)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm px-3 py-2 rounded text-xs">
                                <span className="opacity-90">Bonus Wallet</span>
                                <span className="font-bold">
                                    {balanceLoading ? '...' : fmt(bonusBalance)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Menu Items */}
                    <div className="py-2">
                        {quickMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleMenuClick(item.path)}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-bg-light-blue transition-colors text-left group"
                            >
                                <span className="text-brand-text group-hover:text-brand-primary dark:group-hover:text-brand-text transition-colors">
                                    {item.icon}
                                </span>
                                <span className="text-sm text-neutral-gray-800 group-hover:text-brand-primary dark:group-hover:text-brand-text transition-colors">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-stroke-light p-3">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 bg-accent-red hover:bg-accent-red/90 text-white py-2.5 rounded transition-colors group"
                        >
                            <FiLogOut className="w-4 h-4" />
                            <span className="font-semibold text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
