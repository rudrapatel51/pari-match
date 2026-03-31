import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AccountSidebar from './AccountSidebar';
import MobileAccountDrawer from './MobileAccountDrawer';

/** Maps the current pathname to the corresponding AccountSidebar item id */
function getActiveMenuItem(pathname: string): string {
    if (pathname === '/profile') return 'personal-profile';
    if (pathname === '/kyc') return 'kyc';
    if (pathname === '/change-password') return 'change-password';
    if (pathname === '/notification') return 'notification';
    if (pathname === '/bet-stake-setting') return 'bet-stake-setting';
    if (pathname === '/deposit') return 'deposit';
    if (pathname === '/withdraw') return 'withdraw';
    if (pathname === '/bet-history') return 'bet-history';
    if (pathname === '/wallet') return 'transaction-history';
    if (pathname === '/unsettled-bets') return 'unsettled-bets';
    if (pathname === '/profit-loss') return 'profit-loss';
    if (pathname === '/casino-bet-history') return 'casino-bet-history';
    if (pathname === '/payment-accounts') return 'payment-accounts';
    if (pathname === '/my-vip') return 'my-vip';
    if (pathname === '/spin-win') return 'spin-win';
    if (pathname === '/daily-rewards') return 'daily-rewards';
    if (pathname === '/contact-us') return 'support';
    if (pathname === '/bonus-manager') return 'bonus-manager';
    if (pathname.startsWith('/affiliate')) return 'affiliate';
    return '';
}

/**
 * AccountLayout
 *
 * Scroll architecture:
 * ─────────────────────────────────────────────────────────────────
 *  App.tsx outer div: min-h-screen, flex-col, no overflow set
 *    └─ flex wrapper: flex-1, flex-row, pt-20 (header offset)
 *         └─ <main>: flex-1, overflow-VISIBLE on account pages
 *              └─ AccountLayout (this component)
 *                   ├─ <aside>: sticky top-20, h-[calc(100vh-5rem)]
 *                   │    └─ AccountSidebar (scrolls internally)
 *                   └─ <div>: flex-1, page content (scrolls with viewport)
 *
 * Because <main> is overflow-visible, the VIEWPORT is the scroll container.
 * sticky top-20 on the aside pins it 5rem from the top of the viewport
 * (matching the fixed header height), and it stays there while the right
 * content scrolls freely. When the page is tall enough, both sections
 * scroll naturally with the document so the footer is fully reachable.
 * ─────────────────────────────────────────────────────────────────
 */
const AccountLayout: React.FC = () => {
    const { pathname } = useLocation();
    const activeMenuItem = useMemo(() => getActiveMenuItem(pathname), [pathname]);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Listen for custom event to open mobile drawer (triggered from MobileBottomNav)
    useEffect(() => {
        const handleOpenDrawer = () => setIsMobileDrawerOpen(true);
        window.addEventListener('openAccountDrawer', handleOpenDrawer);
        return () => window.removeEventListener('openAccountDrawer', handleOpenDrawer);
    }, []);

    // Close the drawer automatically when the route changes
    useEffect(() => {
        setIsMobileDrawerOpen(false);
    }, [pathname]);

    return (
        <div className="flex items-start w-full bg-bg-primary">

            {/* ── Desktop Sidebar ──────────────────────────────────────────────
             *  sticky top-20  → pins 5rem below viewport top (= fixed header height)
             *  h-[calc(100vh-5rem)] → exactly fills the visible area below the header
             *  overflow-hidden → AccountSidebar manages its own internal scroll
             *  self-start → prevents the aside from stretching to match content height
             *              (which would break sticky)
             * ──────────────────────────────────────────────────────────────── */}
            <aside
                className={[
                    'hidden md:flex md:flex-col',
                    'w-72 lg:w-80 xl:w-320px flex-shrink-0 self-start',
                    'sticky top-[49px]',
                    'h-[calc(100vh-49px)]',
                    'border-r border-stroke-light',
                    'bg-bg-card',
                    'overflow-hidden',
                ].join(' ')}
            >
                <AccountSidebar activeMenuItem={activeMenuItem} />
            </aside>

            {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
            <MobileAccountDrawer
                isOpen={isMobileDrawerOpen}
                onClose={() => setIsMobileDrawerOpen(false)}
                activeMenuItem={activeMenuItem}
            />

            {/* ── Page Content ──────────────────────────────────────────────
             *  flex-1 + min-w-0 fills remaining width.
             *  min-h-[calc(100vh-5rem)] ensures the content column is at least
             *  viewport-tall so the sticky sidebar always has a tall enough
             *  sibling to stick against.
             * ──────────────────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                <Outlet />
            </div>
        </div>
    );
};

export default AccountLayout;
