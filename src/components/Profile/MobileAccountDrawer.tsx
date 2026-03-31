import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import AccountSidebar from './AccountSidebar';

interface MobileAccountDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    activeMenuItem?: string;
}

/**
 * Mobile slide-in drawer for AccountSidebar.
 * Slides from the LEFT, covers full viewport height,
 * and traps scroll while open.
 */
const MobileAccountDrawer: React.FC<MobileAccountDrawerProps> = ({
    isOpen,
    onClose,
    activeMenuItem,
}) => {
    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            <div
                className={[
                    'fixed inset-0 z-[60] md:hidden',
                    'bg-neutral-gray-900/60 backdrop-blur-[2px]',
                    'transition-opacity duration-300',
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── Drawer panel ─────────────────────────────────────────────── */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Account menu"
                aria-hidden={!isOpen}
                className={[
                    'fixed inset-y-0 left-0 z-[70]',
                    'w-72 max-w-[90vw]',
                    'flex flex-col',
                    'bg-bg-card shadow-elevated',
                    'transform transition-transform duration-300 ease-in-out',
                    'md:hidden',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                {/* Drawer header bar */}
                <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-brand-primary border-b border-stroke-light">
                    <h2 className="text-white font-bold text-base tracking-wide">My Account</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors duration-150"
                        aria-label="Close account menu"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar content — fills remaining height */}
                <div className="flex-1 overflow-hidden">
                    <AccountSidebar activeMenuItem={activeMenuItem} onItemClick={onClose} />
                </div>
            </aside>
        </>
    );
};

export default MobileAccountDrawer;
