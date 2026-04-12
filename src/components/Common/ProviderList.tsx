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
//COMMENT THIS OUT  REMOVE AFTER YOU HAVE BACKEND
// const MOCK_PROVIDERS: ProviderItem[] = [
//     { provider_id: '1', provider_name: 'Evolution', provider_image: 'https://picsum.photos/seed/evo/150/150' },
//     { provider_id: '2', provider_name: 'Pragmatic', provider_image: 'https://picsum.photos/seed/pragmatic/150/150' },
//     { provider_id: '3', provider_name: 'Ezugi', provider_image: 'https://picsum.photos/seed/ezugi/150/150' },
//     { provider_id: '4', provider_name: 'NetEnt', provider_image: 'https://picsum.photos/seed/netent/150/150' },
//     { provider_id: '5', provider_name: 'Spribe', provider_image: 'https://picsum.photos/seed/spribe/150/150' },
//     { provider_id: '6', provider_name: 'Playtech', provider_image: 'https://picsum.photos/seed/playtech/150/150' },
//     { provider_id: '7', provider_name: 'Red Tiger', provider_image: 'https://picsum.photos/seed/redtiger/150/150' },
// ];

const ProviderList: React.FC = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState<ProviderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
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
                            className="flex flex-col items-center gap-3 shrink-0 w-[84px] cursor-pointer snap-start group mt-2"
                            onClick={() => handleProviderClick(p.provider_name)}
                        >
                            <div className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden border-2 border-provider-border group-hover:border-provider-border-hover transition-all bg-provider-bg flex items-center justify-center relative">
                                <img
                                    src={imgSrc}
                                    alt={p.provider_name}
                                    className="w-full h-full object-cover rounded-full"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/09467B/ffffff?text=${p.provider_name.substring(0, 2).toUpperCase()}`;
                                    }}
                                />
                                {/* Light grey hover overlay */}
                                <div className="absolute inset-0 bg-transparent group-hover:bg-provider-overlay transition-colors pointer-events-none rounded-full" />
                            </div>
                            <span className="text-brand-text font-bold text-xs sm:text-sm text-center truncate w-full">
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
