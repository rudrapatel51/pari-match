import React, { useEffect, useState } from 'react';
import { bannerApi } from '../../api/client';
import HeroBanner from './HeroBanner';

interface Banner {
    _id?: string;
    image?: string;
    image_url?: string;
    title?: string;
    link?: string;
}

const PromoBannerSection: React.FC = () => {
    const [mainBanners, setMainBanners] = useState<Banner[]>([]);
    const [topRightBanners, setTopRightBanners] = useState<Banner[]>([]);
    const [bottomRightBanners, setBottomRightBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            bannerApi.getBannersByType('middone'),
            bannerApi.getBannersByType('middtwo'),
            bannerApi.getBannersByType('middthree'),
        ]).then(([r1, r2, r3]) => {
            const parse = (r: PromiseSettledResult<any>): Banner[] => {
                if (r.status !== 'fulfilled') return [];
                const d = r.value;
                const arr = d?.data?.banners || d?.data || [];
                return Array.isArray(arr) ? arr : [arr].filter(Boolean);
            };
            setMainBanners(parse(r1));
            setTopRightBanners(parse(r2));
            setBottomRightBanners(parse(r3));
        }).finally(() => setLoading(false));
    }, []);

    // Don't render anything if all slots are empty after loading
    if (!loading && mainBanners.length === 0 && topRightBanners.length === 0 && bottomRightBanners.length === 0) {
        return null;
    }

    const slotClass = 'h-full';

    return (
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 h-full">
                {/* Left — large carousel (middone) */}
                <div className="lg:col-span-7 rounded-xl overflow-hidden h-full">
                    {loading ? (
                        <div className="w-full h-full bg-brand-primary-dark animate-pulse rounded-xl" />
                    ) : (
                        <HeroBanner staticBanners={mainBanners} className={slotClass} />
                    )}
                </div>

                {/* Right — two stacked carousels (middtwo + middthree) */}
                <div className="lg:col-span-5 flex flex-col gap-3 md:gap-4 h-full">
                    <div className="flex-1 rounded-xl overflow-hidden">
                        {loading ? (
                            <div className="w-full h-full bg-brand-primary-dark animate-pulse rounded-xl" />
                        ) : (
                            <HeroBanner staticBanners={topRightBanners} className={slotClass} />
                        )}
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden">
                        {loading ? (
                            <div className="w-full h-full bg-brand-primary-dark animate-pulse rounded-xl" />
                        ) : (
                            <HeroBanner staticBanners={bottomRightBanners} className={slotClass} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoBannerSection;
