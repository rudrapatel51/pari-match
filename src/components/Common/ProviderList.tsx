import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { casinoApi } from '../../api/client';

export interface ProviderItem {
    provider_id: string;
    provider_name: string;
    provider_image?: string;
    game_count?: number;
    games?: any[];
}

const ProviderList: React.FC = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState<ProviderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        casinoApi.getFranchiseProviders()
            .then((res: any) => {
                const data = res?.data?.data || res?.data || [];
                const providerList = Array.isArray(data?.providers) ? data.providers : (Array.isArray(data) ? data : []);
                if (providerList.length > 0) {
                    setProviders(providerList.slice(0, 18));
                }
            })
            .catch((err) => console.error('[ProviderList] fetch failed:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-bg-white px-2 sm:px-2 lg:px-6 py-2 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-md font-bold text-neutral-gray-800 uppercase tracking-wide">Providers</h2>
                    </div>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-[84px]">
                            <div className="w-24 h-24 rounded-full bg-stroke-light dark:bg-neutral-gray-800 animate-pulse" />
                            <div className="w-16 h-3 bg-stroke-light dark:bg-neutral-gray-800 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (providers.length === 0) return null;

    const handleProviderClick = (providerName: string) => {
        navigate(`/casino?provider=${encodeURIComponent(providerName)}`);
    };

    return (
        <div className="bg-bg-white px-2 sm:px-2 lg:px-6 py-2 pb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-brand-text uppercase tracking-wide">Providers</h2>
                </div>
                <button onClick={() => navigate('/casino')} className="text-brand-text text-xs font-semibold hover:underline flex items-center gap-0.5">
                    All Providers →
                </button>
            </div>
            <div className="py-2">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 pb-4 snap-x">
                {providers.map((p) => {
                    // Try provider image, fallback to first game's thumbnail, fallback to placeholder
                    const fallbackThumb = Array.isArray(p.games) && p.games.length > 0 ? p.games[0].url_thumb : null;
                    const imgSrc = p.provider_image || fallbackThumb || `https://via.placeholder.com/150/09467B/ffffff?text=${p.provider_name.substring(0, 2).toUpperCase()}`;

                    return (
                        <div
                            key={p.provider_id}
                            className="flex flex-col items-center gap-2 shrink-0 w-[84px] cursor-pointer snap-start group"
                            onClick={() => handleProviderClick(p.provider_name)}
                        >
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-brand-primary transition-all duration-200 shadow-sm group-hover:shadow-md bg-bg-card flex items-center justify-center p-0.5 relative">
                                <img
                                    src={imgSrc}
                                    alt={p.provider_name}
                                    className="w-full h-full object-cover rounded-full"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/09467B/ffffff?text=${p.provider_name.substring(0, 2).toUpperCase()}`;
                                    }}
                                />
                            </div>
                            <span className="text-brand-text font-medium text-xs text-center truncate w-full group-hover:text-brand-primary transition-colors">
                                {p.provider_name}
                            </span>
                        </div>
                    );
                })}
            </div>
            </div>
        </div>
    );
};

export default ProviderList;
