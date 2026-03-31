import React, { useEffect } from 'react';
import AccountSidebar from './AccountSidebar';

interface DesktopAccountDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    activeMenuItem?: string;
}

/**
 * Desktop slide-in drawer for AccountSidebar.
 * Matches the design and width of LeftSidebar.
 * Slides from the LEFT, no backdrop overlay.
 */
const DesktopAccountDrawer: React.FC<DesktopAccountDrawerProps> = ({
    isOpen,
    onClose,
    activeMenuItem,
}) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* ── Drawer panel — matches LeftSidebar design ─────────────────── */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Account settings"
                aria-hidden={!isOpen}
                className={[
                    'fixed inset-y-0 left-0 z-[70]',
                    'w-[320px]',
                    'flex flex-col',
                    'bg-bg-card border-r border-stroke-light',
                    'text-brand-text',
                    'overflow-y-auto custom-scrollbar flex-shrink-0',
                    'transform transition-transform duration-300 ease-in-out',
                    'hidden md:flex',
                    'top-[49px]',
                    'h-[calc(100vh-49px)]',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                {/* Sidebar content */}
                <AccountSidebar activeMenuItem={activeMenuItem} onItemClick={onClose} />
            </aside>
        </>
    );
};

export default DesktopAccountDrawer;
