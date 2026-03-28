import React from 'react';
import { FiClock, FiXCircle, FiSlash } from 'react-icons/fi';

interface AffiliateStatusProps {
    status: 'pending' | 'rejected' | 'blocked' | 'deleted';
}

const CONFIG = {
    pending: {
        Icon: FiClock,
        iconBg: 'bg-accent-yellow/10',
        iconColor: 'text-accent-yellow',
        title: 'Application Under Review',
        description: 'Your affiliate application is being reviewed. We will notify you once approved.',
        badge: 'Pending Approval',
        badgeClass: 'bg-accent-yellow/10 text-accent-yellow',
    },
    rejected: {
        Icon: FiXCircle,
        iconBg: 'bg-accent-red/10',
        iconColor: 'text-accent-red',
        title: 'Application Rejected',
        description: 'Your affiliate application was not approved. Please contact support for more information.',
        badge: 'Rejected',
        badgeClass: 'bg-accent-red/10 text-accent-red',
    },
    blocked: {
        Icon: FiSlash,
        iconBg: 'bg-bg-light-blue',
        iconColor: 'text-neutral-gray-700',
        title: 'Account Suspended',
        description: 'Your affiliate account has been suspended. Please contact support.',
        badge: 'Suspended',
        badgeClass: 'bg-bg-light-blue text-neutral-gray-600',
    },
    deleted: {
        Icon: FiXCircle,
        iconBg: 'bg-bg-light-blue',
        iconColor: 'text-neutral-gray-700',
        title: 'Account Closed',
        description: 'Your affiliate account has been closed. Please contact support.',
        badge: 'Closed',
        badgeClass: 'bg-bg-light-blue text-neutral-gray-600',
    },
} as const;

const AffiliateStatus: React.FC<AffiliateStatusProps> = ({ status }) => {
    const cfg = CONFIG[status] ?? CONFIG.blocked;
    const { Icon } = cfg;

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="bg-bg-card border border-stroke-light rounded-2xl shadow-elevated p-8 max-w-sm w-full text-center">

                {/* Icon */}
                <div className={`w-20 h-20 rounded-full ${cfg.iconBg} flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-10 h-10 ${cfg.iconColor}`} />
                </div>

                {/* Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${cfg.badgeClass}`}>
                    {cfg.badge}
                </span>

                {/* Title */}
                <h2 className="text-xl font-display font-bold text-brand-text mb-3">
                    {cfg.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-neutral-gray-700 leading-relaxed">
                    {cfg.description}
                </p>
            </div>
        </div>
    );
};

export default AffiliateStatus;
