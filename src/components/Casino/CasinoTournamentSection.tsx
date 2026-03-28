import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import TournamentCard from '../LiveCasino/TournamentCard';

interface Tournament {
    id: string;
    title: string;
    description: string;
    prizePool: string;
    image: string;
    endDate: Date;
    isActive: boolean;
}

const tournaments: Tournament[] = [
    {
        id: '1',
        title: 'Slots Grand Prix',
        description: 'Spin your way to the top! Compete against thousands of players in our biggest slots tournament of the year.',
        prizePool: '₹5,00,000',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
    },
    {
        id: '2',
        title: 'Blackjack Masters',
        description: 'Show off your card skills in this weekly blackjack championship. Best score takes the crown.',
        prizePool: '₹2,50,000',
        image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80',
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isActive: true,
    },
    {
        id: '3',
        title: 'Roulette Royale',
        description: 'Place your bets and beat the wheel in our exclusive roulette tournament with massive prize pools.',
        prizePool: '₹1,00,000',
        image: 'https://images.unsplash.com/photo-1550133730-695473e544be?w=800&q=80',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: false,
    },
    {
        id: '4',
        title: 'Weekend Poker Bash',
        description: 'Every weekend we host the biggest poker bash. Buy in, go all-in and walk away a champion.',
        prizePool: '₹75,000',
        image: 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&q=80',
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isActive: true,
    },
];

const CasinoTournamentSection: React.FC = () => {
    return (
        <div className="mb-8 px-3 sm:px-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-brand-text">
                    🏆 Tournaments & Promos
                </h2>
                <button className="text-xs text-brand-text hover:underline font-semibold">
                    View All
                </button>
            </div>

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 3 },
                }}
                className="pb-10"
            >
                {tournaments.map((tournament) => (
                    <SwiperSlide key={tournament.id} className="h-auto">
                        <TournamentCard tournament={tournament} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default CasinoTournamentSection;
