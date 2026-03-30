import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBell, FiUser, FiGrid, FiGift } from 'react-icons/fi';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';

type NavAction = 'navigate' | 'profile' | 'notification';

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    action: NavAction;
}

const GUEST_NAV_ITEMS: NavItem[] = [
    { icon: FiGrid, label: 'Casino', path: '/casino', action: 'navigate' },
    { icon: FiGift, label: 'Promos', path: '/promo', action: 'navigate' },
    { icon: FiHome, label: 'Home', path: '/', action: 'navigate' },
    { icon: FiBell, label: 'Alerts', path: '/notification', action: 'navigate' },
    { icon: FiUser, label: 'Account', path: '/profile', action: 'profile' },
];

const AUTH_NAV_ITEMS: NavItem[] = [
    { icon: FiGrid, label: 'Casino', path: '/casino', action: 'navigate' },
    { icon: FiGift, label: 'Promos', path: '/promo', action: 'navigate' },
    { icon: FiHome, label: 'Home', path: '/', action: 'navigate' },
    { icon: FiBell, label: 'Alerts', path: '/notification', action: 'notification' },
    { icon: FiUser, label: 'Account', path: '/profile', action: 'profile' },
];

const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { openModal } = useUiStore();
    const unreadCount = useNotificationStore((s) => s.unreadCount);

    const NAV_ITEMS = isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

    const handleNavClick = ({ path, action }: NavItem) => {
        switch (action) {
            case 'profile':
                if (!isAuthenticated) {
                    openModal('login');
                    return;
                }
                navigate(path);
                window.dispatchEvent(new Event('openAccountDrawer'));
                break;

            case 'notification':
                navigate('/notification');
                break;

            case 'navigate':
            default:
                navigate(path);
                break;
        }
    };

    return (
        <>
            {/* Spacer to push body content above the fixed navigation */}
            <div className="h-14 lg:hidden w-full shrink-0 select-none pointer-events-none" aria-hidden="true" />
            <nav
                className="fixed bottom-0 left-0 right-0 z-40 bg-brand-primary border-t border-stroke-light lg:hidden shadow-elevated safe-area-bottom"
                aria-label="Mobile navigation"
            >
                <div className="flex items-center justify-around py-2" style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}>
                    {NAV_ITEMS.map((item) => {
                        const { icon: Icon, label, path, action } = item;
                        const isNotification = action === 'notification';

                        const isActive =
                            location.pathname === path ||
                            (path !== '/' && location.pathname.startsWith(path));

                        return (
                            <button
                                key={path + action}
                                onClick={() => handleNavClick(item)}
                                className={clsx(
                                    'flex flex-col items-center justify-center flex-1 min-w-0 gap-1 py-1 px-1 rounded-lg touch-manipulation transition-colors duration-150',
                                    isActive
                                        ? 'text-brand-accent'
                                        : 'text-neutral-gray-500 active:text-brand-accent'
                                )}
                                aria-label={label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {/* Icon wrapper — relative so badge can be positioned */}
                                <div className="relative flex-shrink-0">
                                    <Icon
                                        className={clsx(
                                            'w-5 h-5',
                                            isActive ? 'text-brand-accent' : 'text-neutral-gray-500'
                                        )}
                                    />
                                    {/* Unread badge — only on the notification item */}
                                    {isNotification && unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-accent-red text-white text-[9px] font-bold px-0.5 leading-none pointer-events-none">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default MobileBottomNav;
