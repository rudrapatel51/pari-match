import React, { useEffect, useState, useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import { affiliateApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import Pagination from '../Common/Pagination';
import { FiUsers, FiSearch } from 'react-icons/fi';
import { Referral } from '../../types/affiliate';

const PERPAGE = 10;

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const formatCurrency = (amount?: number) =>
  amount != null
    ? `₹${Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
      })}`
    : '₹0.00';

const AffiliateReferrals: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const toast = useToastStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res: any = await affiliateApi.getReferrals({
          page: p,
          perpage: PERPAGE,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        });

        setReferrals(res?.referrals || []);
        setTotalPages(res?.totalPages || 1);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load referrals');
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, toast]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const handlePageChange = (p: number) => setPage(p);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray-600 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or name…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-stroke-primary rounded-xl bg-bg-card text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {loading ? (
        <Loader text="Loading referrals…" />
      ) : referrals.length === 0 ? (
        <EmptyState
          title="No Referrals Yet"
          description="Share your referral link to get started"
          icon={<FiUsers className="w-10 h-10" />}
        />
      ) : (
        <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke-light bg-bg-light-blue">
                  {[
                    '#',
                    'Name',
                    'Username',
                    'Deposits',
                    'Total Deposit',
                    'Withdrawals',
                    'Commission',
                    'Status',
                    'Joined',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-brand-text uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stroke-light">
                {referrals.map((r, i) => (
                  <tr
                    key={r._id}
                    className="hover:bg-bg-light-blue transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-neutral-gray-700">
                      {(page - 1) * PERPAGE + i + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-brand-text">
                      {r.name || '—'}
                    </td>

                    <td className="px-4 py-3 text-brand-text">
                      {r.username}
                    </td>

                    <td className="px-4 py-3 text-center font-mono">
                      {r.depositCount ?? 0}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(r.totalDeposits)}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(r.totalWithdrawals)}
                    </td>

                    <td className="px-4 py-3 font-mono text-accent-green font-semibold">
                      {formatCurrency(r.commission_earned)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          r.status === 1
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-bg-light-blue text-neutral-gray-700'
                        )}
                      >
                        {r.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-gray-700 whitespace-nowrap">
                      {formatDate(r.createdAt)}
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
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AffiliateReferrals;