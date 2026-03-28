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
                                    {isMobileNavOpen
                                        ? <FiX className="w-5 h-5" />
                                        : <FiMenu className="w-5 h-5" />
                                    }
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

                            {/* RIGHT: Auth + Language + Time */}
                            <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                                {!isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={() => openModal('login')}
                                            className="flex items-center justify-center bg-transparent border border-stroke-light hover:border-brand-accent hover:text-brand-accent text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-colors font-semibold text-xs sm:text-sm touch-manipulation min-w-[64px]"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={() => openModal('register')}
                                            className="flex items-center justify-center bg-brand-accent hover:opacity-90 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-colors font-bold text-xs sm:text-sm touch-manipulation min-w-[80px]"
                                        >
                                            Registration
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
                                            <style>{`
                                                @keyframes sw-header-blink {
                                                    0%,100% { transform: scale(1)    rotate(0deg);  filter: drop-shadow(0 0 0 transparent); }
                                                    30%     { transform: scale(1.25)  rotate(-8deg); filter: drop-shadow(0 0 6px #FFD700); }
                                                    60%     { transform: scale(1.15)  rotate(8deg);  filter: drop-shadow(0 0 10px #FF8C00); }
                                                }
                                            `}</style>
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
                                <button className="hidden md:flex items-center gap-1 text-brand-text hover:text-brand-accent transition-colors">
                                    <FiGlobe className="w-3.5 h-3.5" />
                                    <span className="font-medium">ENGLISH</span>
                                    <FiChevronDown className="w-3 h-3" />
                                </button>

                                {/* Clock — desktop only */}
                                <div className="hidden md:flex items-center gap-1 text-brand-text">
                                    <FiClock className="w-3.5 h-3.5" />
                                    <span className="font-medium tabular-nums">{currentTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Desktop nav bar ── */}
                <nav
                    className="bg-brand-primary hidden md:block border-t border-white/10"
                    aria-label="Main navigation"
                >
                    <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-6">
                        <div className="flex items-center overflow-x-auto scrollbar-hide">
                            <ul className="flex items-center space-x-0 min-w-max">
                                {navigationItems.slice(0, 8).map((item, index) => {
                                    const isActive =
                                        location.pathname === item.href ||
                                        location.pathname.startsWith(item.href + '/');
                                    return (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className={[
                                                    'group relative flex items-center justify-center',
                                                    'px-4 lg:px-5 xl:px-6 py-3',
                                                    'text-xs lg:text-sm font-semibold whitespace-nowrap uppercase',
                                                    'transition-all touch-manipulation',
                                                        isActive
                                                        /*
                                                          Active: Parimatch uses transparent bg + yellow text + yellow underline
                                                        */
                                                        ? 'bg-transparent text-brand-accent border-b-2 border-brand-accent font-bold'
                                                        : 'text-white hover:text-brand-accent',
                                                ].join(' ')}
                                            >
                                                <span>{item.label}</span>
                                                {!isActive && (
                                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                                                )}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </nav>
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