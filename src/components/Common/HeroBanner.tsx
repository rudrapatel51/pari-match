import React, { useEffect, useState, useCallback } from 'react';
import { bannerApi } from '../../api/client';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Banner {
    _id?: string;
    image?: string;
    image_url?: string;
    title?: string;
    subtitle?: string;
    link?: string;
}

interface HeroBannerProps {
    type?: string;
    staticBanners?: Banner[];
    className?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ type = 'hero', staticBanners, className }) => {
    const [banners, setBanners] = useState<Banner[]>(staticBanners || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(!staticBanners);

    useEffect(() => {
        if (staticBanners) return;
        bannerApi.getBannersByType(type).then((res: any) => {
            const bannersData = res?.data?.banners || res?.data || [];
            if (Array.isArray(bannersData) && bannersData.length > 0) setBanners(bannersData);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [type, staticBanners]);

    const prev = useCallback(() => setCurrentIndex(i => (i - 1 + banners.length) % banners.length), [banners.length]);
    const next = useCallback(() => setCurrentIndex(i => (i + 1) % banners.length), [banners.length]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next, banners.length]);

    const sizeClass = className || 'h-40 sm:h-48 md:h-56 lg:h-64';

    if (loading) {
        return (
            <div className={`${sizeClass} bg-brand-primary-dark animate-pulse  w-full`} />
        );
    }

    if (banners.length === 0) {
        return (
            <div className={`relative ${sizeClass} flex items-center justify-center overflow-hidden bg-gradient-to-r from-brand-secondary to-brand-primary  w-full`}>
            </div>
        );
    }

    const banner = banners[currentIndex];
    const imgSrc = banner.image_url || banner.image || '';

    return (
        <div className={`relative ${sizeClass} overflow-hidden select-none w-full`}>
            {imgSrc ? (
                <img src={imgSrc} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-brand-primary to-brand-secondary" />
            )}
            <div className="absolute inset-0" />
            {banners.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors" aria-label="Previous">
                        <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors" aria-label="Next">
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {banners.map((_, i) => (
                            <button key={i} onClick={() => setCurrentIndex(i)}
                                className={`rounded-full transition-all ${i === currentIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                                aria-label={`Go to slide ${i + 1}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HeroBanner;
