import React, { useEffect, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { affiliateApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import Pagination from '../Common/Pagination';
import { FiFileText, FiInfo } from 'react-icons/fi';
import { Commission } from '../../types/affiliate';

const PERPAGE = 10;

const formatCurrency = (n: number) =>
    `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const TYPE_BADGE: Record<string, string> = {
    deposit: 'bg-brand-primary/10 text-brand-primary',
    loss:    'bg-accent-orange/10 text-accent-orange',
    profit:  'bg-accent-green/10 text-accent-green',
};

const AffiliateSettlements: React.FC = () => {
    const [items, setItems] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const toast = useToastStore();

    const load = useCallback(async (p: number) => {
        setLoading(true);
        try {
            // Settlements are commissions with status 'settled'
            // res IS the parsed API body — interceptor returns response.data directly
            const res: any = await affiliateApi.getCommissionHistory({
                page: p,
                perpage: PERPAGE,
                status: 'settled',
            });
            setItems(res?.commissions || []);
            const rows = res?.totalRows || 0;
            setTotalPages(res?.totalPages || Math.ceil(rows / PERPAGE) || 1);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load settlements');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(page); }, [page, load]);

    return (
        <div className="space-y-4">

            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                <FiInfo className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-neutral-gray-600">
                    Settlements are processed by our team. Your pending commissions are
                    transferred to your withdrawable balance once approved by an admin.
                </p>
            </div>

            {loading ? (
                <Loader text="Loading settlements…" />
            ) : items.length === 0 ? (
                <EmptyState
                    title="No Settlements Yet"
                    description="Settlements are processed by admin — your pending commissions will appear here once approved"
                    icon={<FiFileText className="w-10 h-10" />}
                />
            ) : (
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stroke-light bg-bg-light-blue">
                                    {['Player', 'Type', 'Amount', 'Status', 'Settled Date'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-text uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-light">
                                {items.map(s => (
                                    <tr key={s._id} className="hover:bg-bg-light-blue transition-colors">
                                        <td className="px-4 py-3 font-medium text-brand-text">
                                            {s.player_id?.username || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={clsx(
                                                'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                                                TYPE_BADGE[s.commission_type] || 'bg-bg-light-blue text-brand-text'
                                            )}>
                                                {s.commission_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold text-accent-green">
                                            {formatCurrency(s.commission_amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-green/10 text-accent-green">
                                                Settled
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-gray-700 whitespace-nowrap">
                                            {formatDate(s.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-stroke-light">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AffiliateSettlements;
