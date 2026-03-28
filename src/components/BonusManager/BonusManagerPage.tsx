import React, { useEffect, useState } from 'react';
import { FiGift, FiLock, FiTag } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { userApi, bonusApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveWager {
    currentAmount: number;
    targetAmount: number;
}

interface WalletData {
    mainBalance: number;
    bonusBalance: number;
    lockedBalance: number;
    activeWagers?: ActiveWager[];
}

interface BonusItem {
    _id: string;
    bonusAmount: number;
    wagerProgress: number;
    wagerTarget: number;
    status: string;
    bonusId?: {
        bonusName?: string;
        bonusDetails?: {
            bonusType?: string;
            promoCode?: string;
        };
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const BONUS_TYPE_STYLES: Record<string, { label: string; cls: string }> = {
    bonus: { label: 'Bonus', cls: 'bg-accent-green/10 text-accent-green' },
    wager: { label: 'Wager', cls: 'bg-brand-primary/10 text-brand-primary' },
    cashback: {
        label: 'Cashback',
        cls: 'bg-accent-yellow/10 text-brand-text',
    },
};

function getBonusTypeBadge(type?: string) {
    return type && BONUS_TYPE_STYLES[type]
        ? BONUS_TYPE_STYLES[type]
        : { label: type || 'Bonus', cls: 'bg-bg-light-blue text-neutral-gray-600' };
}

// ─── Component ────────────────────────────────────────────────────────────────

const BonusManagerPage: React.FC = () => {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [bonuses, setBonuses] = useState<BonusItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const toast = useToastStore();

    // ── Data fetch ────────────────────────────────────────────────────────────

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletRes, bonusRes] = await Promise.all([
                userApi.balance().catch(() => null),
                bonusApi.getMyBonuses().catch(() => null),
            ]);

            const walletData =
                (walletRes as any)?.data?.data ?? (walletRes as any)?.data ?? null;
            const bonusData =
                (bonusRes as any)?.data?.data ?? (bonusRes as any)?.data ?? [];

            setWallet(walletData);
            setBonuses(Array.isArray(bonusData) ? bonusData : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── Promo code apply ──────────────────────────────────────────────────────

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        try {
            const res = (await bonusApi.applyPromoCode({
                promoCode: promoCode.trim(),
                depositAmount: 1000,
            })) as any;
            toast.success(res?.message || 'Promo code applied successfully!');
            setPromoCode('');
            await fetchData();
        } catch (e: any) {
            toast.error(e.message || 'Failed to apply promo code.');
        } finally {
            setPromoLoading(false);
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────

    if (loading) return <Loader text="Loading bonus manager..." />;

    // ── Wallet cards config ───────────────────────────────────────────────────

    const walletCards = [
        {
            label: 'Main Balance',
            value: wallet?.mainBalance ?? 0,
            icon: <MdAccountBalanceWallet className="w-5 h-5" />,
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/10',
        },
        {
            label: 'Bonus Balance',
            value: wallet?.bonusBalance ?? 0,
            icon: <FiGift className="w-5 h-5" />,
            color: 'text-accent-green',
            bg: 'bg-accent-green/10',
        },
        {
            label: 'Locked Balance',
            value: wallet?.lockedBalance ?? 0,
            icon: <FiLock className="w-5 h-5" />,
            color: 'text-neutral-gray-700',
            bg: 'bg-bg-light-blue',
        },
    ];

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-bg-primary">

            {/* Page header */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                    Bonus Manager
                </h1>
                <p className="text-sm text-white/60 mt-0.5">
                    Manage your bonuses, promo codes and wallet
                </p>
            </div>

            <div className="p-4 md:p-6 space-y-5 max-w-8xl">

                {/* ── Wallet Overview ─────────────────────────────────────── */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5">
                    <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4">
                        Wallet Overview
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                        {walletCards.map((card) => (
                            <div
                                key={card.label}
                                className="flex flex-col items-center p-3 rounded-xl bg-bg-primary gap-2"
                            >
                                <div className={`p-2 rounded-full ${card.bg} ${card.color}`}>
                                    {card.icon}
                                </div>
                                <span
                                    className={`text-sm font-bold tabular-nums text-center ${card.color}`}
                                >
                                    {fmt(card.value)}
                                </span>
                                <span className="text-[10px] text-neutral-gray-600 text-center leading-tight">
                                    {card.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Active wager progress bars */}
                    {wallet?.activeWagers && wallet.activeWagers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-stroke-light space-y-3">
                            <p className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                                Active Wager Requirements
                            </p>
                            {wallet.activeWagers.map((w, i) => {
                                const pct = Math.min(
                                    100,
                                    Math.round((w.currentAmount / w.targetAmount) * 100)
                                );
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs text-neutral-gray-600 mb-1.5">
                                            <span className="font-medium">
                                                {fmt(w.currentAmount)} wagered
                                            </span>
                                            <span className="text-neutral-gray-600">
                                                Target: {fmt(w.targetAmount)}
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-stroke-light rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-brand-text mt-1 text-right">
                                            {pct}% complete
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Redeem Promo Code ───────────────────────────────────── */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiTag className="w-4 h-4 text-brand-primary" />
                        <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                            Redeem Promo Code
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                            placeholder="Enter promo code..."
                            className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-stroke-light bg-bg-primary text-neutral-gray-800 placeholder:text-neutral-gray-600 focus:outline-none focus:border-brand-primary transition-colors font-mono tracking-widest"
                        />
                        <button
                            onClick={handleApplyPromo}
                            disabled={promoLoading || !promoCode.trim()}
                            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
                        >
                            {promoLoading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>

                </div>

                {/* ── Active Bonuses ──────────────────────────────────────── */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-stroke-light bg-bg-light-blue">
                        <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                            Active Bonuses
                        </h2>
                    </div>

                    {bonuses.length === 0 ? (
                        <div className="p-10 text-center text-neutral-gray-600 text-sm">
                            <FiGift className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No active bonuses at the moment.</p>
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {bonuses.map((bonus) => {
                                const bonusType = bonus.bonusId?.bonusDetails?.bonusType;
                                const badge = getBonusTypeBadge(bonusType);
                                const pct =
                                    bonus.wagerTarget > 0
                                        ? Math.min(
                                            100,
                                            Math.round(
                                                (bonus.wagerProgress / bonus.wagerTarget) * 100
                                            )
                                        )
                                        : 0;

                                return (
                                    <div
                                        key={bonus._id}
                                        className="border border-stroke-light rounded-xl p-4 bg-bg-primary space-y-3"
                                    >
                                        {/* Title + type badge */}
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-bold text-neutral-gray-800 leading-tight">
                                                {bonus.bonusId?.bonusName || 'Bonus'}
                                            </p>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${badge.cls}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>

                                        {/* Amount */}
                                        <p className="text-xl font-bold text-accent-green tabular-nums">
                                            {fmt(bonus.bonusAmount)}
                                        </p>

                                        {/* Wager progress */}
                                        {bonus.wagerTarget > 0 && (
                                            <div>
                                                <div className="flex justify-between text-xs text-neutral-gray-700 mb-1">
                                                    <span>Wager Progress</span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <div className="h-2 bg-stroke-light rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-brand-primary to-accent-green rounded-full"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-neutral-gray-600 mt-1">
                                                    {fmt(bonus.wagerProgress)} /{' '}
                                                    {fmt(bonus.wagerTarget)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Status + promo code */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span
                                                className={`font-semibold px-2 py-0.5 rounded-full ${bonus.status === 'Active'
                                                    ? 'text-accent-green bg-accent-green/10'
                                                    : 'text-neutral-gray-700 bg-bg-light-blue'
                                                    }`}
                                            >
                                                {bonus.status}
                                            </span>
                                            {bonus.bonusId?.bonusDetails?.promoCode && (
                                                <span className="font-mono text-neutral-gray-600 bg-bg-light-blue px-2 py-0.5 rounded tracking-wider">
                                                    {bonus.bonusId.bonusDetails.promoCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BonusManagerPage;
