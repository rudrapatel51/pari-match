import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useToastStore, ToastType } from '../../store/toastStore';

const icons: Record<ToastType, React.ReactNode> = {
    success: <FiCheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />,
    error: <FiXCircle className="w-5 h-5 text-accent-red flex-shrink-0" />,
    warning: <FiAlertCircle className="w-5 h-5 text-accent-yellow flex-shrink-0" />,
    info: <FiInfo className="w-5 h-5 text-brand-text flex-shrink-0" />,
};

const bgColors: Record<ToastType, string> = {
    success: 'bg-bg-card border-l-4 border-accent-green',
    error: 'bg-bg-card border-l-4 border-accent-red',
    warning: 'bg-bg-card border-l-4 border-accent-yellow',
    info: 'bg-bg-card border-l-4 border-brand-primary',
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${bgColors[toast.type]} rounded shadow-elevated p-3 flex items-start gap-3 pointer-events-auto animate-fade-in`}
                    role="alert"
                >
                    {icons[toast.type]}
                    <p className="flex-1 text-sm text-neutral-gray-800 font-medium">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-neutral-gray-600 hover:text-neutral-gray-600 flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
