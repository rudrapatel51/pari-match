import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';

type ActiveTab = 'play' | 'history';

const SpinWinPage: React.FC = () => {
    const toast = useToastStore();

    const [activeTab, setActiveTab] = useState<ActiveTab>('play');
    const [mySpins, setMySpins]     = useState<any[]>([]);
    const [history, setHistory]     = useState<{ assignments: any[]; page: number; pages: number }>({
        assignments: [], page: 1, pages: 1,
    });
    const [loading, setLoading] = useState(false);

    // Game state
    const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
    const [spinning, setSpinning]   = useState(false);
    const [rotation, setRotation]   = useState(0);
    const [spinResult, setSpinResult] = useState<any | null>(null);
    const [hasSpun, setHasSpun]     = useState(false);

    // ── Fetch helpers ─────────────────────────────────────────────────────────

    const fetchMySpins = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await userApi.getMySpins();
            setMySpins(res?.data?.spins || []);
        } catch { /* silent */ } finally { setLoading(false); }
    }, []);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await userApi.getSpinHistory();
            setHistory(res?.data || { assignments: [], page: 1, pages: 1 });
        } catch { toast.error('Failed to load history'); } finally { setLoading(false); }
    }, [toast]);

    useEffect(() => {
        if (activeTab === 'play') fetchMySpins();
        else fetchHistory();
    }, [activeTab, fetchMySpins, fetchHistory]);

    useEffect(() => {
        setSelectedAssignment(mySpins.length > 0 ? mySpins[0] : null);
    }, [mySpins]);

    // ── Spin handler ──────────────────────────────────────────────────────────

    const handleSpin = async () => {
        if (spinning || !selectedAssignment || hasSpun) return;
        setSpinning(true);
        setSpinResult(null);
        try {
            const res: any = await userApi.playSpin({ assignment_id: selectedAssignment._id } as any);
            if (res?.success || res?.data) {
                const data = res.data || res;
                const { block_landed, result, won_amount, block_details, message } = data;
                const blocks       = selectedAssignment.spin_id.blocks;
                const segmentAngle = 360 / blocks.length;
                const targetAnglePositive = (360 - (block_landed * segmentAngle + segmentAngle / 2)) % 360;
                const minSpin        = 360 * 8;
                const currentApparent = rotation % 360;
                let distance         = targetAnglePositive - currentApparent;
                if (distance < 0) distance += 360;
                setRotation(rotation + minSpin + distance);
                setTimeout(() => {
                    setSpinning(false);
                    setHasSpun(true);
                    setSpinResult(data);
                    const amt = block_details?.prize_amount || won_amount;
                    if (result === 'win') toast.success(`You won ₹${amt}!`);
                    else toast.info(message || 'Better luck next time!');
                }, 4500);
            } else {
                setSpinning(false);
                toast.error(res?.message || 'Spin failed');
            }
        } catch (err: any) {
            setSpinning(false);
            toast.error(err?.message || 'Something went wrong');
        }
    };

    const handleReset = () => { setSpinResult(null); setHasSpun(false); fetchMySpins(); };

    // ── SVG wheel ─────────────────────────────────────────────────────────────

    const renderWheel = () => {
        if (!selectedAssignment) return null;
        const { blocks }   = selectedAssignment.spin_id;
        const segmentAngle = 360 / blocks.length;
        return (
            <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                style={{
                    transform:  `rotate(${rotation}deg)`,
                    transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    filter: 'drop-shadow(0 0 24px rgba(0,0,0,0.6))',
                }}
            >
                <defs>
                    {blocks.map((_: any, i: number) => (
                        <linearGradient key={`g${i}`} id={`g${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   style={{ stopColor: blocks[i].block_color || '#1a3a5c', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: blocks[i].block_color || '#0d2035', stopOpacity: 0.85 }} />
                        </linearGradient>
                    ))}
                    {/* Outer gold ring gradient */}
                    <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#FFD700" />
                        <stop offset="50%"  stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                </defs>

                {/* Gold outer ring */}
                <circle cx="200" cy="200" r="198" fill="none" stroke="url(#goldRing)" strokeWidth="6" />
                <circle cx="200" cy="200" r="191" fill="none" stroke="rgba(255,215,0,0.25)" strokeWidth="2" />

                {/* Segments */}
                {blocks.map((block: any, i: number) => {
                    const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
                    const endAngle   = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
                    const largeArc   = segmentAngle > 180 ? 1 : 0;
                    const x1 = 200 + 188 * Math.cos(startAngle);
                    const y1 = 200 + 188 * Math.sin(startAngle);
                    const x2 = 200 + 188 * Math.cos(endAngle);
                    const y2 = 200 + 188 * Math.sin(endAngle);
                    const textAngle  = i * segmentAngle + segmentAngle / 2;
                    const textRadius = 128;
                    const textX = 200 + textRadius * Math.cos((textAngle - 90) * (Math.PI / 180));
                    const textY = 200 + textRadius * Math.sin((textAngle - 90) * (Math.PI / 180));
                    return (
                        <g key={block._id || i}>
                            <path
                                d={`M 200 200 L ${x1} ${y1} A 188 188 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={`url(#g${i})`}
                                stroke="rgba(255,255,255,0.35)"
                                strokeWidth="2"
                            />
                            {/* Prize amount label */}
                            <text
                                x={textX} y={textY}
                                textAnchor="middle" dominantBaseline="middle"
                                fill="#ffffff" fontSize="20" fontWeight="900"
                                transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
                            >
                                ₹{block.prize_amount}
                            </text>
                        </g>
                    );
                })}

                {/* Inner decorative ring */}
                <circle cx="200" cy="200" r="62" fill="rgba(0,0,0,0.55)" stroke="rgba(255,215,0,0.6)" strokeWidth="3" />
                <circle cx="200" cy="200" r="55" fill="rgba(0,0,0,0.3)" stroke="rgba(255,215,0,0.2)" strokeWidth="1" />
            </svg>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Keyframes injected once */}
            <style>{`
                @keyframes sw-glow {
                    0%,100% { filter: drop-shadow(0 0 8px #FFD700); }
                    50%     { filter: drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 40px #FF8C00); }
                }
                @keyframes sw-pulse-ring {
                    0%   { transform: scale(1);   opacity: 0.6; }
                    50%  { transform: scale(1.04); opacity: 0.25; }
                    100% { transform: scale(1);   opacity: 0.6; }
                }
                @keyframes sw-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes sw-float {
                    0%,100% { transform: translateY(0)    rotate(0deg);  opacity: 0.6; }
                    50%     { transform: translateY(-12px) rotate(180deg); opacity: 1; }
                }
                @keyframes sw-spin-btn-glow {
                    0%,100% { box-shadow: 0 0 16px 4px rgba(255,165,0,0.5),  0 0 40px 8px rgba(255,69,0,0.3);  }
                    50%     { box-shadow: 0 0 28px 8px rgba(255,215,0,0.8), 0 0 60px 16px rgba(255,140,0,0.5); }
                }
                .sw-spin-btn-active { animation: sw-spin-btn-glow 1.8s ease-in-out infinite; }
                .sw-pointer-glow    { animation: sw-glow 2s ease-in-out infinite; }
                .sw-pulse-ring      { animation: sw-pulse-ring 3s ease-in-out infinite; }
                .sw-shimmer-text {
                    background: linear-gradient(90deg, #FFD700, #FFF, #FFD700, #FFA500, #FFD700);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: sw-shimmer 3s linear infinite;
                }
            `}</style>

            <div className="bg-bg-primary min-h-screen">

                {/* ── Page header ── */}
                <div className="bg-brand-primary px-6 py-5">
                    <h1 className="text-xl font-display font-bold text-white tracking-wide">Spin &amp; Win</h1>
                    <p className="text-sm text-white/60 mt-0.5">Spin the wheel for a chance to win exciting prizes</p>

                    {/* Tab bar */}
                    <div className="flex gap-3 mt-4">
                        {(['play', 'history'] as ActiveTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                                    activeTab === tab
                                        ? 'bg-white text-brand-primary'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">

                    {/* ── PLAY tab ── */}
                    {activeTab === 'play' && (
                        loading ? (
                            <Loader text="Loading your spin…" />
                        ) : !selectedAssignment ? (
                            <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-10 text-center">
                                <div className="text-5xl mb-4">🎰</div>
                                <h3 className="text-xl font-bold text-brand-text mb-2">No Spins Available</h3>
                                <p className="text-sm text-neutral-gray-600">You don&apos;t have any spins assigned right now.</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-yellow-500/30 shadow-2xl"
                                 style={{ background: 'linear-gradient(135deg, #0d1f35 0%, #0a1628 50%, #0d1f35 100%)' }}>

                                {/* Decorative corner stars */}
                                {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                                    <span key={i} className={`absolute ${pos} text-yellow-400 text-lg pointer-events-none`}
                                          style={{ animation: `sw-float ${2 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                                        ✦
                                    </span>
                                ))}

                                <div className="relative z-10 p-5 md:p-8">

                                    {/* Spin name */}
                                    <h2 className="text-center text-xl font-black text-white mb-6 tracking-wide">
                                        🚀 <span className="sw-shimmer-text">{selectedAssignment.spin_id?.name?.toUpperCase()}</span> 🚀
                                    </h2>

                                    {/* Wheel area */}
                                    <div className="relative mx-auto max-w-[400px] aspect-square mb-6">

                                        {/* Glow halo behind wheel */}
                                        <div className="absolute inset-4 rounded-full"
                                             style={{ background: 'radial-gradient(circle, rgba(255,165,0,0.15) 0%, transparent 70%)' }} />

                                        {/* Outer pulse rings */}
                                        <div className="sw-pulse-ring absolute inset-0 rounded-full border-2 border-yellow-400/30" />
                                        <div className="sw-pulse-ring absolute inset-3 rounded-full border border-yellow-400/15"
                                             style={{ animationDelay: '0.8s' }} />

                                        {/* Pointer */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30">
                                            <div className={`w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-yellow-400 ${spinning ? '' : 'sw-pointer-glow'}`} />
                                        </div>

                                        {/* Wheel SVG */}
                                        <div className="relative w-full aspect-square">
                                            {/* Center spin button — overlays SVG */}
                                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                                <button
                                                    onClick={handleSpin}
                                                    disabled={spinning || hasSpun}
                                                    className={`w-24 h-24 rounded-full font-black text-sm transition-all duration-300 select-none ${
                                                        spinning || hasSpun
                                                            ? 'bg-neutral-gray-800 cursor-not-allowed text-neutral-gray-500 border-2 border-neutral-gray-700'
                                                            : 'sw-spin-btn-active border-2 border-yellow-400/60 cursor-pointer hover:scale-110 active:scale-95'
                                                    }`}
                                                    style={!spinning && !hasSpun ? {
                                                        background: 'linear-gradient(135deg, #FF6B00, #FF3D00, #CC0000)',
                                                        color: '#fff',
                                                    } : {}}
                                                >
                                                    {spinning
                                                        ? <span className="text-yellow-400 text-xl animate-spin inline-block">↻</span>
                                                        : hasSpun
                                                            ? <span className="text-xs text-neutral-gray-400 font-bold">DONE!</span>
                                                            : <span className="flex flex-col items-center leading-tight text-white font-black">
                                                                <span className="text-base">SPIN</span>
                                                                <span className="text-base">NOW</span>
                                                              </span>
                                                    }
                                                </button>
                                            </div>
                                            {renderWheel()}
                                        </div>
                                    </div>

                                    {/* Available spins badge */}
                                    <div className="text-center mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold">
                                            🎯 {mySpins.length} Spin{mySpins.length !== 1 ? 's' : ''} Available
                                        </span>
                                    </div>

                                    {/* Result card */}
                                    {spinResult && (
                                        <div className="animate-bounce mt-4">
                                            <div className={`rounded-2xl border-2 p-5 text-center ${
                                                spinResult.result === 'win'
                                                    ? 'bg-gradient-to-br from-yellow-400/10 to-green-400/10 border-yellow-400/60'
                                                    : 'bg-bg-light-blue border-stroke-primary'
                                            }`}>
                                                <p className="text-lg font-black text-white mb-1">
                                                    {spinResult.result === 'win' ? '🎉 CONGRATULATIONS! 🎉' : '😔 HARD LUCK!'}
                                                </p>
                                                <p className="text-sm text-neutral-gray-500 mb-2">{spinResult.message}</p>
                                                {(spinResult.block_details?.prize_amount > 0 || spinResult.won_amount > 0) && (
                                                    <p className="text-5xl font-black sw-shimmer-text">
                                                        ₹{spinResult.block_details?.prize_amount || spinResult.won_amount}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Play Again */}
                                    {hasSpun && (
                                        <div className="mt-5 flex justify-center">
                                            <button
                                                onClick={handleReset}
                                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)', backgroundSize: '200% auto' }}
                                            >
                                                🔄 PLAY AGAIN
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    {/* ── HISTORY tab ── */}
                    {activeTab === 'history' && (
                        loading ? (
                            <Loader text="Loading history…" />
                        ) : (
                            <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-stroke-light bg-bg-light-blue">
                                    <h2 className="text-xs font-semibold text-brand-text uppercase tracking-wider">Spin History</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-stroke-light bg-bg-light-blue">
                                                {['Date', 'Game', 'Status', 'Prize'].map((h) => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stroke-light">
                                            {history.assignments?.map((item: any) => (
                                                <tr key={item._id} className="hover:bg-bg-light-blue transition-colors">
                                                    <td className="px-4 py-3 text-xs text-neutral-gray-600 whitespace-nowrap">
                                                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-brand-text">{item.spin_id?.name || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === 'played' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-yellow/10 text-accent-yellow'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className={`px-4 py-3 font-mono font-bold ${item.won_amount > 0 ? 'text-accent-green' : 'text-neutral-gray-600'}`}>
                                                        {item.won_amount > 0 ? `+₹${item.won_amount}` : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!history.assignments || history.assignments.length === 0) && (
                                                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-neutral-gray-600">No spin history available.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default SpinWinPage;
