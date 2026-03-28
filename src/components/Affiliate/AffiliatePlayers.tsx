import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { affiliateApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import Pagination from '../Common/Pagination';
import { FiUsers } from 'react-icons/fi';
import { ActivePlayer } from '../../types/affiliate';

const PERPAGE = 10;

const formatCurrency = (n?: number) =>
  n != null
    ? `₹${Number(n).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '₹0.00';

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const AffiliatePlayers: React.FC = () => {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToastStore();
  const navigate = useNavigate();

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res: any = await affiliateApi.getPlayers({
          page: p,
          perpage: PERPAGE,
        });

        setPlayers(res?.players || []);

        const rows = res?.totalRows || 0;
        setTotalPages(Math.ceil(rows / PERPAGE) || 1);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load players');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  return (
    <div className="space-y-4">
      {loading ? (
        <Loader text="Loading players…" />
      ) : players.length === 0 ? (
        <EmptyState
          title="No Active Players Yet"
          description="Active players are referred users who have placed at least one bet"
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
                    'Deposit Count',
                    'Total Deposit',
                    'Total Withdrawal',
                    'Commission',
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
                {players.map((p, i) => (
                  <tr
                    key={p._id}
                    className="hover:bg-bg-light-blue transition-colors cursor-pointer"
                    onClick={() => navigate(`/affiliate/player/${p._id}`)}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-neutral-gray-700">
                      {(page - 1) * PERPAGE + i + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-brand-text">
                      {p.name || '—'}
                    </td>

                    <td className="px-4 py-3 text-brand-text">
                      {p.username}
                    </td>

                    <td className="px-4 py-3 text-center font-mono">
                      {p.depositCount ?? 0}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(p.totalDeposits)}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(p.totalWithdrawals)}
                    </td>

                    <td className="px-4 py-3 font-mono text-accent-green font-semibold">
                      {formatCurrency(p.commission_earned)}
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-gray-700 whitespace-nowrap">
                      {formatDate(p.createdAt)}
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

export default AffiliatePlayers;