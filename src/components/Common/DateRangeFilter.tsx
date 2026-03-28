import React from 'react';
import { FiCalendar, FiSearch } from 'react-icons/fi';

interface DateRangeFilterProps {
    fromDate: string;
    toDate: string;
    onFromChange: (date: string) => void;
    onToChange: (date: string) => void;
    onApply: () => void;
    className?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    fromDate, toDate, onFromChange, onToChange, onApply, className,
}) => {
    return (
        <div className={`flex flex-wrap items-end gap-3 ${className ?? ''}`}>

            {/* From date */}
            <div className="flex flex-col gap-1 min-w-0">
                <label className="text-xs font-semibold text-brand-text/60 uppercase tracking-wide">
                    From
                </label>
                <div className="relative flex items-center">
                    <FiCalendar className="absolute left-2.5 w-3.5 h-3.5 text-brand-text/40 pointer-events-none" />
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => onFromChange(e.target.value)}
                        className="
                            pl-8 pr-3 py-2 text-sm rounded-lg
                            bg-bg-card border border-stroke-primary
                            text-brand-text
                            focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary
                            transition-colors duration-150
                            [color-scheme:dark]
                        "
                    />
                </div>
            </div>

            {/* To date */}
            <div className="flex flex-col gap-1 min-w-0">
                <label className="text-xs font-semibold text-brand-text/60 uppercase tracking-wide">
                    To
                </label>
                <div className="relative flex items-center">
                    <FiCalendar className="absolute left-2.5 w-3.5 h-3.5 text-brand-text/40 pointer-events-none" />
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => onToChange(e.target.value)}
                        className="
                            pl-8 pr-3 py-2 text-sm rounded-lg
                            bg-bg-card border border-stroke-primary
                            text-brand-text
                            focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary
                            transition-colors duration-150
                            [color-scheme:dark]
                        "
                    />
                </div>
            </div>

            {/* Apply button */}
            <button
                onClick={onApply}
                className="
                    flex items-center gap-1.5
                    px-4 py-2 rounded-lg text-sm font-semibold
                    bg-brand-primary text-white
                    hover:bg-brand-primary-light
                    active:bg-brand-primary-dark
                    transition-colors duration-150
                    whitespace-nowrap
                "
            >
                <FiSearch className="w-3.5 h-3.5" />
                Apply
            </button>
        </div>
    );
};

export default DateRangeFilter;