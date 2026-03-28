import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSportsCricket, MdCasino } from 'react-icons/md';
import { FiGift } from 'react-icons/fi';

const MobileSubMenu: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="md:hidden grid grid-cols-3 gap-2 px-2 sm:px-4 py-2 bg-brand-primary border-b border-stroke-light pt-3">
            <button
                onClick={() => navigate('/cricket')}
                className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 rounded-md bg-brand-primary-dark text-white transition-all shadow-sm active:scale-95 touch-manipulation"
            >
                <MdSportsCricket className="text-xl" />
                <span className="text-sm font-bold uppercase tracking-wide">CRICKET</span>
            </button>
            <button
                onClick={() => navigate('/casino')}
                className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 rounded-md bg-brand-primary-dark text-white transition-all shadow-sm active:scale-95 touch-manipulation"
            >
                <MdCasino className="text-xl" />
                <span className="text-sm font-bold uppercase tracking-wide">CASINO</span>
            </button>
            <button
                onClick={() => navigate('/promo')}
                className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 rounded-md bg-brand-primary-dark text-white transition-all shadow-sm active:scale-95 touch-manipulation"
            >
                <FiGift className="text-xl" />
                <span className="text-sm font-bold uppercase tracking-wide">PROMO</span>
            </button>
        </div>
    );
};

export default MobileSubMenu;