import React, { useEffect, useState } from "react";

interface Tournament {
  id: string;
  title: string;
  description: string;
  prizePool: string;
  image: string;
  endDate: Date;
  isActive: boolean;
}

interface TournamentCardProps {
  tournament: Tournament;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = tournament.endDate.getTime();
      const total = end - now;

      if (total > 0) {
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / (1000 * 60)) % 60);
        setTimeRemaining({ days, hours, minutes });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [tournament.endDate]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-brand-primary cursor-pointer group flex flex-col h-full">
      {/* Tournament Banner Image — rounded inner card look */}
      <div className="relative m-2 rounded-xl overflow-hidden aspect-[16/9] shrink-0">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Prize Pool Badge (Bottom Left) */}
        <div
          className="absolute bottom-0 left-0 z-10"
          style={{ clipPath: "polygon(0 0, 85% 0, 100% 100%, 0% 100%)" }}
        >
          <div className="bg-accent-green text-brand-text text-sm font-bold pl-3 pr-6 py-1.5 shadow-lg">
            {tournament.prizePool}
          </div>
        </div>

        {/* Active Badge (Top Right) */}
        {tournament.isActive && (
          <div
            className="absolute top-0 right-0 z-10"
            style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
          >
            <div className="bg-purple-600 text-brand-text text-xs font-bold pl-6 pr-3 py-1 shadow-lg">
              ACTIVE
            </div>
          </div>
        )}
      </div>

      {/* Tournament Details */}
      <div className="px-4 pt-3 pb-0 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-brand-white font-bold text-base sm:text-lg mb-1 uppercase line-clamp-1">
          {tournament.title}
        </h3>

        {/* Description */}
        <p className="text-neutral-gray-300 text-xs sm:text-sm mb-4 line-clamp-2">
          {tournament.description}
        </p>

        {/* Countdown Timer */}
        <div className="mb-4 flex flex-row items-center justify-between">
          <p className="text-brand-white font-bold text-[11px] sm:text-xs uppercase tracking-wide">
            TOURNAMENT ENDS IN
          </p>
          <div className="flex items-start space-x-1 sm:space-x-2">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="flex space-x-[2px]">
                <div className="bg-brand-primary-dark rounded-[3px] w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-brand-text font-bold text-sm sm:text-base shadow-sm">
                  {String(timeRemaining.days).padStart(2, "0")[0]}
                </div>
                <div className="bg-brand-primary-dark rounded-[3px] w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-brand-text font-bold text-sm sm:text-base shadow-sm">
                  {String(timeRemaining.days).padStart(2, "0")[1]}
                </div>
              </div>
              <div className="text-brand-white text-[10px] font-bold uppercase mt-1">
                D
              </div>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="flex space-x-[2px]">
                <div className="bg-brand-primary-dark rounded-[3px] w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-brand-text font-bold text-sm sm:text-base shadow-sm">
                  {String(timeRemaining.hours).padStart(2, "0")[0]}
                </div>
                <div className="bg-brand-primary-dark rounded-[3px] w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-brand-text font-bold text-sm sm:text-base shadow-sm">
                  {String(timeRemaining.hours).padStart(2, "0")[1]}
                </div>
              </div>
              <div className="text-brand-white text-[10px] font-bold uppercase mt-1">
                H
              </div>
            </div>

            {/* Colon separator — only between H and M */}
            <div className="text-brand-white font-bold text-sm pb-4 flex items-center">
              :
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="flex space-x-[2px]">
                <div className="bg-brand-primary-dark rounded-[3px] w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-brand-text font-bold text-sm sm:text-base shadow-sm">
                  {String(timeRemaining.minutes).padStart(2, "0")[0]}
                </div>
                <div className="bg-brand-primary-dark rounded-[3px] w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-brand-text font-bold text-sm sm:text-base shadow-sm">
                  {String(timeRemaining.minutes).padStart(2, "0")[1]}
                </div>
              </div>
              <div className="text-brand-white text-[10px] font-bold uppercase mt-1">
                M
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button — flush to bottom with top border divider */}
        <div className="mt-auto p-2">
          <button className="w-full bg-brand-white text-brand-primary font-bold text-sm py-3 px-4 transition-colors duration-200 hover:bg-brand-primary-dark rounded-lg pb-4 hover:text-brand-white">
            HOW TO TAKE PART
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
