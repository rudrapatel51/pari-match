import React, { useEffect, useState, useCallback } from 'react';
import { userApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import { FiCheckCircle, FiLock, FiStar } from 'react-icons/fi';

// Fallback reward schedule (shown when API doesn't return per-day amounts).
// Kept in one place so it's easy to update when the backend adds a rewards API.
const FALLBACK_REWARDS = [
    10, 15, 20, 25, 30, 50, 100,          // week 1
    10, 15, 20, 25, 30, 50, 100, 150,     // week 2
    10, 15, 20, 25, 30, 50, 100, 150, 200, // week 3
    10, 15, 20, 50, 100, 500,              // week 4 + bonus
];

interface CheckInStatus {
    streak: number;
    claimed_today: boolean;
    last_claim_date?: string | null;
    daily_rewards?: number[];   // if backend ever returns per-day amounts
}

const DailyRewardsPage: React.FC = () => {
    const [status, setStatus] = useState<CheckInStatus>({ streak: 0, claimed_today: false });
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const toast = useToastStore();

    const fetchStatus = useCallback(async () => {
        try {
            const res = await userApi.getDailyCheckInStatus() as any;
            const d = res?.data?.data || res?.data || {};
            const streak = d.streak ?? d.check_in_count ?? 0;

            // Detect whether today was already claimed using last_claim_date
            let claimed_today = d.claimed_today ?? false;
            if (!claimed_today && d.last_claim_date) {
                const today = new Date().toISOString().split('T')[0];
                const lastDate = new Date(d.last_claim_date).toISOString().split('T')[0];
                claimed_today = lastDate === today;
            }

            setStatus({
                streak,
                claimed_today,
                last_claim_date: d.last_claim_date ?? null,
                daily_rewards: Array.isArray(d.daily_rewards) && d.daily_rewards.length
                    ? d.daily_rewards
                    : undefined,
            });
        } catch {
            // silently keep defaults
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const handleCheckIn = async () => {
        setClaiming(true);
        try {
            await userApi.dailyCheckIn();
            toast.success(`Day ${status.streak + 1} reward claimed!`);
            // Re-fetch so claimed_today and streak are always server-authoritative
            await fetchStatus();
        } catch (err: any) {
            toast.error(err?.message || 'Already claimed today or check-in unavailable');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) return <Loader text="Loading daily rewards..." />;

    const rewards = status.daily_rewards ?? FALLBACK_REWARDS;

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header strip */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">Daily Rewards</h1>
                <p className="text-sm text-white/60 mt-0.5">Check in every day to earn bonus coins</p>
            </div>

            <div className="p-4 md:p-6 max-w-2xl space-y-5">

                {/* Streak summary card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                        <FiStar className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-brand-text uppercase tracking-wider">Current Streak</p>
                        <p className="text-2xl font-bold text-brand-text mt-0.5">
                            {status.streak} day{status.streak !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Reward calendar card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-stroke-light bg-bg-light-blue">
                        <h2 className="text-xs font-semibold text-brand-text uppercase tracking-wider">Reward Calendar</h2>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {rewards.map((reward, i) => {
                                const day = i + 1;
                                const claimed = day <= status.streak;
                                const isToday = day === status.streak + 1 && !status.claimed_today;
                                const isTodayClaimed = day === status.streak && status.claimed_today;
                                const future = !claimed && !isToday;

                                return (
                                    <div
                                        key={day}
                                        className={`rounded-xl p-2 text-center border transition-all ${isTodayClaimed
                                                ? 'bg-accent-green/10 border-accent-green'
                                                : claimed
                                                    ? 'bg-accent-green/10 border-accent-green/50'
                                                    : isToday
                                                        ? 'bg-brand-primary/10 border-brand-primary ring-1 ring-brand-primary/30'
                                                        : 'bg-bg-light-blue border-stroke-light opacity-60'
                                            }`}
                                    >
                                        <p className="text-[10px] text-neutral-gray-600 mb-0.5">Day {day}</p>
                                        <p className={`text-xs font-bold ${claimed || isTodayClaimed
                                                ? 'text-accent-green'
                                                : isToday
                                                    ? 'text-brand-text'
                                                    : 'text-neutral-gray-600'
                                            }`}>
                                            &#8377;{reward}
                                        </p>
                                        <div className="mt-1 flex justify-center">
                                            {claimed || isTodayClaimed
                                                ? <FiCheckCircle className="w-3 h-3 text-accent-green" />
                                                : future
                                                    ? <FiLock className="w-3 h-3 text-neutral-gray-300" />
                                                    : null
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* CTA card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5 text-center">
                    {status.claimed_today ? (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent-green/10 border border-accent-green rounded-xl text-accent-green font-semibold text-sm">
                            <FiCheckCircle className="w-5 h-5" />
                            Today's reward claimed! Come back tomorrow.
                        </div>
                    ) : (
                        <button
                            onClick={handleCheckIn}
                            disabled={claiming}
                            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl text-base disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                            {claiming
                                ? 'Claiming…'
                                : `Claim Day ${status.streak + 1} — ₹${rewards[status.streak] ?? '?'}`
                            }
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DailyRewardsPage;
