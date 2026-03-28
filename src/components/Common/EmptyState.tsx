import React from 'react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No Data Found',
    description = 'There is nothing to display here yet.',
    icon,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && <div className="mb-4 text-neutral-gray-300">{icon}</div>}
            <h3 className="text-lg font-semibold font-display text-neutral-gray-600 mb-2">{title}</h3>
            <p className="text-sm text-neutral-gray-600 mb-6 max-w-xs">{description}</p>
            {action && action}
        </div>
    );
};

export default EmptyState;
