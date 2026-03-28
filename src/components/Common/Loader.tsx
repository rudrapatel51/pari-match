import React from 'react';

interface LoaderProps {
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, size = 'md', text }) => {
    const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            {/* Track: neutral-gray-600 stays visible in both modes (~30% light, ~64% dark).
                Active arc: brand-text is always readable (light in dark mode, dark-blue in light). */}
            <div className={`${sizeMap[size]} border-4 border-neutral-gray-600 border-t-brand-text rounded-full animate-spin`} />
            {text && <p className="text-sm text-brand-text font-medium">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            // bg-bg-card/90 adapts: near-white in light mode, near-black in dark mode
            <div className="fixed inset-0 bg-bg-card/90 backdrop-blur-sm flex items-center justify-center z-[9998]">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default Loader;
