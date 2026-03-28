import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FiAlertTriangle, FiMonitor } from 'react-icons/fi';
import { useUiStore } from '../../store/uiStore';

// Which auth-failure event triggered the modal
type AlertVariant = 'session-expired' | 'device-conflict' | null;

const CONTENT: Record<Exclude<AlertVariant, null>, { title: string; message: string }> = {
    'session-expired': {
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
    },
    'device-conflict': {
        title: 'Logged Out',
        message:
            'Your account has been accessed from another device. You have been logged out for security.',
    },
};

/**
 * SessionExpiredModal
 *
 * Listens for two custom window events fired by the Axios interceptor:
 *   • auth:session-expired  — generic token expiry / invalid token
 *   • auth:device-conflict  — backend returned 401 "already logged in on another device"
 *
 * On either event it:
 *   1. Clears the React Query cache (removes stale authenticated data).
 *   2. Closes any open auth modal (login / register).
 *   3. Renders a non-blocking styled modal (no alert()).
 *   4. On dismiss, navigates the user to "/" so PrivateRoute can redirect them
 *      to a safe public page and the login flow can begin fresh.
 *
 * Auth state is already cleared by authStore's module-level event listener
 * before this component receives the event — so PrivateRoute will immediately
 * block access to protected routes.
 */
const SessionExpiredModal: React.FC = () => {
    const [variant, setVariant] = useState<AlertVariant>(null);
    // Guard against the same event firing multiple times before user dismisses.
    const isHandlingRef = useRef(false);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { closeModal } = useUiStore();

    const handleEvent = useCallback(
        (incoming: AlertVariant) => {
            if (isHandlingRef.current) return; // already showing modal
            isHandlingRef.current = true;

            // 1. Purge all cached query data so no authenticated data leaks through.
            queryClient.clear();

            // 2. Close any open login / register modal to avoid UI conflicts.
            closeModal();

            // 3. Show the appropriate modal message.
            setVariant(incoming);
        },
        [queryClient, closeModal],
    );

    useEffect(() => {
        const onSessionExpired = () => handleEvent('session-expired');
        const onDeviceConflict = () => handleEvent('device-conflict');

        window.addEventListener('auth:session-expired', onSessionExpired);
        window.addEventListener('auth:device-conflict', onDeviceConflict);

        return () => {
            window.removeEventListener('auth:session-expired', onSessionExpired);
            window.removeEventListener('auth:device-conflict', onDeviceConflict);
        };
    }, [handleEvent]);

    const handleDismiss = useCallback(() => {
        setVariant(null);
        isHandlingRef.current = false;

        // Navigate to "/" — PrivateRoute will redirect away from any protected
        // route because isAuthenticated is already false in the Zustand store.
        navigate('/', { replace: true });
    }, [navigate]);

    if (!variant) return null;

    const isDeviceConflict = variant === 'device-conflict';
    const content = CONTENT[variant];

    return (
        // Overlay — z-[10000] sits above all other modals (auth modals are z-50)
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
        >
            <div className="bg-bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                {/* Coloured top bar */}
                <div
                    className={`h-1.5 w-full ${isDeviceConflict ? 'bg-accent-red' : 'bg-accent-yellow'
                        }`}
                />

                <div className="p-6 flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div
                        className={`p-3 rounded-full ${isDeviceConflict
                                ? 'bg-accent-red/10'
                                : 'bg-accent-yellow/10'
                            }`}
                    >
                        {isDeviceConflict ? (
                            <FiMonitor
                                className="w-7 h-7 text-accent-red"
                                aria-hidden="true"
                            />
                        ) : (
                            <FiAlertTriangle
                                className="w-7 h-7 text-accent-yellow"
                                aria-hidden="true"
                            />
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-1.5">
                        <h2
                            id="session-modal-title"
                            className="text-lg font-bold text-brand-text uppercase tracking-wide"
                        >
                            {content.title}
                        </h2>
                        <p className="text-sm text-brand-text leading-relaxed">
                            {content.message}
                        </p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleDismiss}
                        className="mt-2 w-full py-2.5 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                    >
                        OK, Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
