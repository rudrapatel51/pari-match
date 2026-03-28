import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { clsx } from 'clsx';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className={clsx('flex items-center justify-center gap-1', className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded text-brand-text hover:text-brand-text hover:bg-brand-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <FiChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-neutral-gray-600">...</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={clsx(
                            'min-w-[36px] h-9 px-2 rounded font-medium text-sm transition-colors',
                            page === currentPage
                                ? 'bg-brand-primary text-white'
                                : 'text-neutral-gray-600 hover:text-brand-text hover:bg-brand-primary/10'
                        )}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded text-brand-text hover:text-brand-text hover:bg-brand-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <FiChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;
