import React from 'react';
import { Event } from '../../types/domain';
import { useNavigate } from 'react-router-dom';

interface EventRowProps {
    event: Event;
}

export const EventRow: React.FC<EventRowProps> = ({ event }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // ID format might need parsing if it comes as "evn_123" or just "123"
        // Adjust based on actual data
        const id = String(event.eventId || event.id).replace('evn_', '');
        navigate(`/match-details/${id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-between bg-bg-card p-3 border-b border-stroke-light hover:bg-bg-light-blue cursor-pointer transition-colors"
        >
            <div className="flex flex-col">
                <span className="font-semibold text-neutral-gray-800">{event.name || event.eventName}</span>
                <span className="text-xs text-brand-text">{event.dateTime}</span>
            </div>

            <div className="flex items-center gap-2">
                {/* Placeholder for In-Play or result icons */}
                {event.matchType && (
                    <span className="text-xs bg-stroke-light px-2 py-1 rounded text-neutral-gray-600">{event.matchType}</span>
                )}
                <div className="text-brand-primary">
                    &gt;
                </div>
            </div>
        </div>
    );
};
