import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiMenu, FiX, FiGlobe, FiClock, FiBell } from 'react-icons/fi';
import { navigationItems } from '../../data/mockData';
import { useUiStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import ProfileDropdown from './ProfileDropdown';
import MobileNavDrawer from './MobileNavDrawer';

interface HeaderProps {
    isMobileNavOpen?: boolean;
    onMobileNavToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    isMobileNavOpen = false,
    onMobileNavToggle,
}) => {
    const [currentTime, setCurrentTime] = useState<string>('');
    const { openModal }   = useUiStore();
    const { isAuthenticated } = useAuth();
    const navigate        = useNavigate();
    const location        = useLocation();
    const unreadCount     = useNotificationStore((s) => s.unreadCount);

    useEffect(() => {
        const updateTime = () => {
            const now     = new Date();
            const hours   = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-header bg-brand-primary shadow-betting-card">
                {/* ── Top bar ── */}
                <div className="bg-brand-primary border-b border-stroke-light">
                    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6">
                        <div className="flex items-center h-11 sm:h-12 text-brand-text text-xs">

                            {/* LEFT: Hamburger + Logo */}
                            <div className="flex items-center gap-2 min-w-0">
                                <button
                                    className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-brand-text hover:bg-bg-light-blue transition-colors touch-manipulation"
                                    onClick={onMobileNavToggle}
                                    aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
                                    aria-expanded={isMobileNavOpen}
                                >
                                    {isMobileNavOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                                </button>

                                {/* Desktop empty hamburger menu directly to left of logo */}
                                <button
                                    className="hidden md:flex items-center justify-center w-9 h-9 mr-1 rounded-lg text-brand-text hover:bg-bg-light-blue transition-colors"
                                    onClick={() => console.log('Desktop sidebar menu action pending')}
                                    aria-label="Open desktop menu"
                                >
                                    <FiMenu className="w-5 h-5" />
                                </button>

                                <div
                                    className="flex items-center cursor-pointer shrink-0"
                                    onClick={() => navigate('/')}
                                    role="link"
                                    aria-label="Go to homepage"
                                >
                                    <img
                                        src="https://cdn.whitelabelssolutions.com/yellowred.svg"
                                        className="h-10 w-10 sm:h-11 sm:w-11"
                                        alt="WLSBet logo"
                                    />
                                </div>
                            </div>

                            {/* CENTER: Desktop Nav Links */}
                            <div className="hidden md:flex items-center flex-1 justify-center px-4 overflow-x-auto scrollbar-hide">
                                <ul className="flex items-center">
                                    {[
                                        { label: "Live Events", href: "/betting", icon: "🔴" },
                                        { label: "Live Casino", href: "/casino", icon: "🎰" }
                                    ].map((item, index) => {
                                        const isActive =
                                            location.pathname === item.href ||
                                            location.pathname.startsWith(item.href + '/');
                                        return (
                                            <li key={index}>
                                                <a
                                                    href={item.href}
                                                    className={[
                                                        'group relative flex items-center justify-center gap-2',
                                                        'px-4 lg:px-5 py-3',
                                                        'text-sm font-semibold whitespace-nowrap',
                                                        'transition-all touch-manipulation',
                                                            isActive
                                                            ? 'bg-transparent text-brand-accent font-bold'
                                                            : 'text-white hover:text-brand-accent',
                                                    ].join(' ')}
                                                >
                                                    <span className="text-base">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                    {isActive && (
                                                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-accent" />
                                                    )}
                                                    {!isActive && (
                                                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                                                    )}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* RIGHT: Auth + Language + Time */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                                {!isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={() => openModal('login')}
                                            className="flex items-center justify-center bg-transparent hover:text-brand-accent text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-colors font-semibold text-xs sm:text-sm touch-manipulation"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={() => openModal('register')}
                                            className="flex items-center justify-center bg-brand-accent hover:opacity-90 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-colors font-bold text-xs sm:text-sm touch-manipulation"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Spin & Win blinking icon */}
                                        <button
                                            onClick={() => navigate('/spin-win')}
                                            aria-label="Spin & Win"
                                            title="Spin & Win"
                                            className="relative flex items-center justify-center w-9 h-9 rounded-full text-brand-text hover:bg-bg-light-blue transition-colors"
                                        >
                                            <span
                                                className="text-xl leading-none select-none"
                                                style={{ animation: 'sw-header-blink 1.4s ease-in-out infinite' }}
                                            >
                                                🎰
                                            </span>
                                            {/* Ping dot */}
                                            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-yellow-400">
                                                <span className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-75" />
                                            </span>
                                        </button>

                                        {/* Notification bell */}
                                        <button
                                            onClick={() => navigate('/notification')}
                                            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                                            className="relative flex items-center justify-center w-9 h-9 rounded-full text-brand-text hover:bg-bg-light-blue transition-colors"
                                        >
                                            <FiBell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent-red text-white text-[9px] font-bold px-1 leading-none ring-2 ring-bg-card pointer-events-none">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        <ProfileDropdown />
                                    </>
                                )}

                                {/* Language — desktop only */}
                                <button className="hidden md:flex flex-col items-center justify-center text-brand-text hover:text-brand-accent transition-colors ml-1 w-8">
                                    <div className="flex items-center gap-1">
                                        <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-5 h-auto rounded-[2px]" />
                                    </div>
                                    <span className="font-semibold text-[10px] mt-[1px]">EN</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile drawer — rendered outside header to overlay everything */}
            <MobileNavDrawer
                isOpen={isMobileNavOpen}
                onClose={onMobileNavToggle ?? (() => {})}
            />
        </>
    );
};

export default Header;