import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowDownCircle, FiArrowUpCircle, FiClock, FiUpload,
    FiShield, FiXCircle, FiAlertTriangle, FiArrowRight,
} from 'react-icons/fi';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../api/client';
import Loader from '../Common/Loader';
import Pagination from '../Common/Pagination';
import { PaymentMethod, UserBankListItem } from '../../types/payment';

type Tab = 'deposit' | 'withdraw' | 'history';
type DepositCategoryId = 'recommended' | 'all' | 'e_wallets' | 'bank_transfer' | 'crypto';

// ── KYC gate ──────────────────────────────────────────────────────────────────

type KycState = 'loading' | 'verified' | 'not_submitted' | 'pending' | 'rejected';

interface KycData {
    is_kyc_verified: number;
    kyc_details: { document_type: string; document_type_display: string; submitted_at: string } | null;
    kyc_comment: string;
    kyc_reject_reason: string;
}

const KYC_CONFIG: Record<Exclude<KycState, 'loading' | 'verified'>, {
    Icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    badgeText: string;
    badgeClass: string;
    btnLabel: string;
}> = {
    not_submitted: {
        Icon: FiShield,
        iconBg: 'bg-brand-primary/10',
        iconColor: 'text-brand-primary',
        title: 'KYC Verification Required',
        description: 'To deposit or withdraw funds you must complete identity verification. This helps keep your account safe and ensures regulatory compliance.',
        badgeText: 'Not Verified',
        badgeClass: 'bg-bg-light-blue text-neutral-gray-600',
        btnLabel: 'Complete KYC Now',
    },
    pending: {
        Icon: FiClock,
        iconBg: 'bg-accent-yellow/10',
        iconColor: 'text-accent-yellow',
        title: 'KYC Under Review',
        description: 'Your identity documents have been submitted and are currently being reviewed by our team. This usually takes 24–48 hours.',
        badgeText: 'Pending Approval',
        badgeClass: 'bg-accent-yellow/10 text-accent-yellow',
        btnLabel: 'View KYC Status',
    },
    rejected: {
        Icon: FiXCircle,
        iconBg: 'bg-accent-red/10',
        iconColor: 'text-accent-red',
        title: 'KYC Rejected',
        description: 'Your KYC submission was not approved. Please re-submit with valid and clearly visible documents.',
        badgeText: 'Rejected',
        badgeClass: 'bg-accent-red/10 text-accent-red',
        btnLabel: 'Re-submit KYC',
    },
};

const KycGate: React.FC<{ state: Exclude<KycState, 'loading' | 'verified'>; rejectReason?: string }> = ({
    state, rejectReason,
}) => {
    const navigate = useNavigate();
    const cfg = KYC_CONFIG[state];
    const { Icon } = cfg;

    return (
        <div className="flex items-center justify-center py-10 px-4">
            <div className="bg-bg-card border border-stroke-light rounded-2xl shadow-betting-card p-8 max-w-md w-full text-center">

                {/* Icon */}
                <div className={`w-20 h-20 rounded-full ${cfg.iconBg} flex items-center justify-center mx-auto mb-5`}>
                    <Icon className={`w-10 h-10 ${cfg.iconColor}`} />
                </div>

                {/* Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${cfg.badgeClass}`}>
                    {cfg.badgeText}
                </span>

                {/* Title */}
                <h2 className="text-xl font-display font-bold text-brand-text mb-2">
                    {cfg.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-neutral-gray-700 leading-relaxed mb-5">
                    {cfg.description}
                </p>

                {/* Reject reason */}
                {state === 'rejected' && rejectReason && (
                    <div className="flex items-start gap-2 bg-accent-red/5 border border-accent-red/20 rounded-lg px-3 py-2 mb-5 text-left">
                        <FiAlertTriangle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-accent-red">
                            <span className="font-semibold">Reason: </span>{rejectReason}
                        </p>
                    </div>
                )}

                {/* Steps — only for not_submitted */}
                {state === 'not_submitted' && (
                    <div className="space-y-2 text-left mb-5">
                        {[
                            'Upload a valid government-issued ID (Aadhaar, PAN, Passport)',
                            'Wait for admin verification (24–48 hours)',
                            'Start depositing and withdrawing freely',
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-neutral-gray-600">{step}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <button
                    onClick={() => navigate('/kyc')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    {cfg.btnLabel}
                    <FiArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// ── Constants ─────────────────────────────────────────────────────────────────

const TAB_CONFIG = [
    { id: 'deposit'  as Tab, label: 'Deposit',  icon: FiArrowDownCircle },
    { id: 'withdraw' as Tab, label: 'Withdraw', icon: FiArrowUpCircle   },
    { id: 'history'  as Tab, label: 'History',  icon: FiClock           },
];

const DEPOSIT_CATEGORIES: { id: DepositCategoryId; label: string }[] = [
    { id: 'recommended',   label: 'Recommended'    },
    { id: 'all',           label: 'All methods'    },
    { id: 'e_wallets',     label: 'E‑wallets'      },
    { id: 'bank_transfer', label: 'Bank transfer'  },
    { id: 'crypto',        label: 'Cryptocurrency' },
];

// ── Main component ────────────────────────────────────────────────────────────

const DepositWithdrawPage: React.FC = () => {
    const toast = useToastStore();
    const [tab, setTab] = useState<Tab>('deposit');
    const [loading, setLoading] = useState(false);

    // ── KYC state ─────────────────────────────────────────────────────────────
    const [kycState, setKycState] = useState<KycState>('loading');
    const [kycData,  setKycData]  = useState<KycData | null>(null);

    // Deposit state
    const [depositAmount,  setDepositAmount]  = useState('');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [screenshot,     setScreenshot]     = useState<File | null>(null);
    const [activeCategory, setActiveCategory] = useState<DepositCategoryId>('recommended');

    // Withdraw state
    const [withdrawAmount,         setWithdrawAmount]         = useState('');
    const [savedBanks,             setSavedBanks]             = useState<UserBankListItem[]>([]);
    const [savedUpis,              setSavedUpis]              = useState<UserBankListItem[]>([]);
    const [selectedBankId,         setSelectedBankId]         = useState('');
    const [activeWithdrawCategory, setActiveWithdrawCategory] = useState<'bank' | 'upi'>('bank');

    // History state
    const [historyTab,     setHistoryTab]     = useState<'deposits' | 'withdrawals'>('deposits');
    const [historyData,    setHistoryData]    = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [page,           setPage]           = useState(1);
    const [totalPages,     setTotalPages]     = useState(1);

    // ── Fetch KYC status ──────────────────────────────────────────────────────
    useEffect(() => {
        userApi.getKyc()
            .then((res: any) => {
                // Interceptor returns response.data (the HTTP body).
                // HTTP body: { data: { is_kyc_verified, kyc_details, kyc_reject_reason, ... }, message, status }
                const kyc: KycData = res?.data ?? res;
                setKycData(kyc);

                if (kyc?.is_kyc_verified === 1) {
                    setKycState('verified');
                } else if (kyc?.kyc_reject_reason) {
                    setKycState('rejected');
                } else if (kyc?.kyc_details) {
                    setKycState('pending');
                } else {
                    setKycState('not_submitted');
                }
            })
            .catch(() => setKycState('not_submitted'));
    }, []);

    // ── Fetch payment methods + saved banks ───────────────────────────────────
    useEffect(() => {
        userApi.getPaymentMethods().then((res: any) => {
            const list = Array.isArray(res?.data) ? res.data : [];
            setPaymentMethods(list);
            if (list.length > 0) setSelectedMethod(list[0]._id);
        }).catch(() => {});

        userApi.getUserBankList().then((res: any) => {
            const list: UserBankListItem[] = Array.isArray(res?.data) ? res.data : [];
            setSavedUpis(list.filter(i => i.type === 1 || i.type === '1'));
            setSavedBanks(list.filter(i => i.type === 2 || i.type === '2'));
        }).catch(() => {});
    }, []);

    // ── History fetch ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (tab === 'history') fetchHistory();
    }, [tab, historyTab, page]);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const apiCall = historyTab === 'deposits' ? userApi.getDepositHistory : userApi.getWithdrawHistory;
            const res = await apiCall({ page });
            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.data?.data)
                    ? res.data.data
                    : [];
            setHistoryData(list);
            const pagination = (res?.data as any)?.pagination ?? (res as any)?.pagination;
            setTotalPages(pagination?.totalPages ?? 1);
        } catch {
            setHistoryData([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // ── Form handlers ─────────────────────────────────────────────────────────
    const MIN_DEPOSIT = 100;

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositAmount || Number(depositAmount) <= 0) return toast.error('Enter valid amount');
        if (Number(depositAmount) <= MIN_DEPOSIT)         return toast.error(`Minimum deposit must be more than ₹${MIN_DEPOSIT}`);
        if (!selectedMethod)                              return toast.error('Select payment method');
        const formData = new FormData();
        formData.append('paymentMethodId', selectedMethod);
        formData.append('amount', depositAmount);
        if (screenshot) formData.append('transactionScreenshot', screenshot);
        setLoading(true);
        try {
            await userApi.depositRequest(formData);
            toast.success('Deposit request submitted!');
            setDepositAmount(''); setScreenshot(null);
        } catch (err: any) {
            toast.error(err?.message || 'Deposit failed');
        } finally { setLoading(false); }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawAmount || Number(withdrawAmount) <= 0) return toast.error('Enter valid amount');
        if (!selectedBankId)                                return toast.error('Select a saved account');
        setLoading(true);
        try {
            const res = await userApi.withdrawRequest({ amount: Number(withdrawAmount), bankDetailId: selectedBankId });
            toast.success((res as any)?.data?.message ?? (res as any)?.message ?? 'Withdrawal request submitted');
            setWithdrawAmount(''); setSelectedBankId('');
        } catch (err: any) {
            toast.error(err?.message || 'Withdrawal failed');
        } finally { setLoading(false); }
    };

    const quickAmounts = [500, 1000, 2000, 5000, 10000];

    const categorizedMethods = useMemo(() => {
        if (!paymentMethods?.length) {
            return { recommended: [], all: [], e_wallets: [], bank_transfer: [], crypto: [] } as Record<DepositCategoryId, PaymentMethod[]>;
        }
        const eWallets     = paymentMethods.filter(m => ['ewallet', 'e_wallet', 'e-wallet'].includes(m.type?.toLowerCase?.() || ''));
        const bankTransfer = paymentMethods.filter(m => ['bank_transfer', 'bank'].includes(m.type?.toLowerCase?.() || ''));
        const crypto       = paymentMethods.filter(m => ['crypto', 'cryptocurrency'].includes(m.type?.toLowerCase?.() || ''));
        const recommended  = paymentMethods.slice(0, Math.min(8, paymentMethods.length));
        return {
            recommended: recommended.length ? recommended : paymentMethods,
            all: paymentMethods, e_wallets: eWallets, bank_transfer: bankTransfer, crypto,
        };
    }, [paymentMethods]);

    // Helpers
    const isKycLoading  = kycState === 'loading';
    const isKycVerified = kycState === 'verified';
    const needsKycGate  = (tab === 'deposit' || tab === 'withdraw') && !isKycLoading && !isKycVerified;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Header */}
            <div className="bg-brand-primary px-4 sm:px-6 py-4 sm:py-5">
                <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide">Wallet</h1>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">Manage funds and transactions</p>
            </div>

            <div className="p-3 sm:p-4 md:p-6 mx-auto max-w-7xl">

                {/* Tab bar */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card mb-4 sm:mb-5 flex">
                    {TAB_CONFIG.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={[
                                'flex-1 py-3 px-2 text-sm font-semibold border-b-2 transition-all flex justify-center items-center gap-2 touch-manipulation',
                                tab === t.id
                                    ? 'border-brand-primary text-brand-text bg-bg-light-blue'
                                    : 'border-transparent text-neutral-gray-700 hover:bg-bg-light-blue',
                            ].join(' ')}
                        >
                            <t.icon className="w-4 h-4 shrink-0" />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* KYC loading */}
                {isKycLoading && (tab === 'deposit' || tab === 'withdraw') && (
                    <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5">
                        <Loader text="Checking KYC status…" />
                    </div>
                )}

                {/* KYC gate */}
                {needsKycGate && (
                    <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card">
                        <KycGate
                            state={kycState as Exclude<KycState, 'loading' | 'verified'>}
                            rejectReason={kycData?.kyc_reject_reason || undefined}
                        />
                    </div>
                )}

                {/* ── DEPOSIT TAB ── */}
                {tab === 'deposit' && isKycVerified && (
                    <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5">
                        <div className="flex flex-col md:flex-row gap-5">
                            {/* Category sidebar */}
                            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                                <div className="rounded-xl border border-stroke-light bg-bg-white shadow-sm overflow-hidden">
                                    <div className="px-4 pt-4 pb-2">
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-gray-700">
                                            Payment methods
                                        </p>
                                    </div>
                                    <div className="border-t border-stroke-light divide-y divide-stroke-light">
                                        {DEPOSIT_CATEGORIES.map(cat => {
                                            const count    = (categorizedMethods[cat.id] || []).length;
                                            const isActive = activeCategory === cat.id;
                                            return (
                                                <button
                                                    key={cat.id} type="button"
                                                    onClick={() => setActiveCategory(cat.id)}
                                                    className={[
                                                        'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150',
                                                        isActive
                                                            ? 'bg-bg-light-blue text-brand-text font-semibold'
                                                            : 'bg-bg-white text-brand-text hover:bg-bg-light-blue',
                                                    ].join(' ')}
                                                >
                                                    <span>{cat.label}</span>
                                                    <span className="text-xs font-medium text-neutral-gray-700">{count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </aside>

                            {/* Deposit form */}
                            <form onSubmit={handleDeposit} className="flex-1 space-y-5">
                                <div>
                                    <label className="label-text">Select Payment Method</label>
                                    <select value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)} className="input-field w-full">
                                        <option value="">-- Select payment method --</option>
                                        {(categorizedMethods[activeCategory] || paymentMethods).map(m => {
                                            const label = m.upiName || m.name || `${(m.type || 'Payment').toUpperCase()}${m.upiId ? ` - ${m.upiId}` : m.accountNumber ? ` - ${m.accountNumber}` : ''}`;
                                            return <option key={m._id} value={m._id}>{label.trim() || m._id}</option>;
                                        })}
                                    </select>
                                </div>

                                {/* Pay-to details */}
                                {selectedMethod && (() => {
                                    const method = paymentMethods.find(m => m._id === selectedMethod);
                                    if (!method) return null;
                                    return (
                                        <div className="rounded-xl border border-stroke-light bg-bg-light-blue p-4 space-y-4">
                                            <p className="text-md font-bold tracking-widest uppercase text-neutral-gray-700">Pay to</p>
                                            {method.qrCodeImage && (
                                                <div className="flex flex-col items-center gap-2">
                                                    <img src={method.qrCodeImage} alt="Scan to pay" className="w-56 h-56 sm:w-48 sm:h-48 object-contain bg-bg-white rounded-lg border border-stroke-light p-2" />
                                                    <span className="text-sm font-medium text-brand-text">Scan QR code to pay</span>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                {method.upiId             && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">UPI ID</span><span className="text-sm font-semibold text-brand-text font-mono">{method.upiId}</span></div>}
                                                {method.upiName           && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">UPI Name</span><span className="text-sm font-medium text-neutral-gray-800">{method.upiName}</span></div>}
                                                {method.accountHolderName && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">Account holder</span><span className="text-sm font-medium text-neutral-gray-800">{method.accountHolderName}</span></div>}
                                                {method.accountNumber     && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">Account number</span><span className="text-sm font-medium text-neutral-gray-800 font-mono">{method.accountNumber}</span></div>}
                                                {method.bankName          && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">Bank</span><span className="text-sm font-medium text-neutral-gray-800">{method.bankName}</span></div>}
                                                {method.ifscCode          && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">IFSC</span><span className="text-sm font-medium text-neutral-gray-800 font-mono">{method.ifscCode}</span></div>}
                                                {method.branchName        && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-neutral-gray-700 uppercase">Branch</span><span className="text-sm font-medium text-neutral-gray-800">{method.branchName}</span></div>}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Amount */}
                                <div>
                                    <label className="label-text">Select Amount</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {quickAmounts.map(a => (
                                            <button
                                                type="button" key={a}
                                                onClick={() => setDepositAmount(String(a))}
                                                className={[
                                                    'py-2 rounded-lg text-sm border font-medium transition-colors duration-150',
                                                    depositAmount === String(a)
                                                        ? 'bg-brand-primary text-white border-brand-primary'
                                                        : 'bg-bg-white border-stroke-light text-brand-text hover:bg-bg-light-blue',
                                                ].join(' ')}
                                            >₹{a}</button>
                                        ))}
                                    </div>
                                    <input
                                        type="number" min={MIN_DEPOSIT + 1}
                                        value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                                        placeholder="Enter Amount" className="input-field"
                                    />
                                    <p className="mt-1.5 text-xs text-neutral-gray-700">
                                        Minimum deposit must be more than ₹{MIN_DEPOSIT}.
                                    </p>
                                </div>

                                {/* Screenshot */}
                                <div>
                                    <label className="label-text">Upload Screenshot</label>
                                    <div className="border-2 border-dashed border-stroke-light rounded-xl p-6 text-center hover:bg-bg-light-blue transition-colors cursor-pointer relative bg-bg-white">
                                        <input required type="file" onChange={e => setScreenshot(e.target.files?.[0] || null)} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <FiUpload className="w-6 h-6 mx-auto text-neutral-gray-600 mb-2" />
                                        <p className="text-sm text-neutral-gray-600">{screenshot ? screenshot.name : 'Click to upload proof'}</p>
                                    </div>
                                </div>

                                <button disabled={loading} className="w-full btn-primary py-3 rounded-xl">
                                    {loading ? 'Processing…' : 'Submit Deposit'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── WITHDRAW TAB ── */}
                {tab === 'withdraw' && isKycVerified && (
                    <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5">
                        <div className="flex flex-col md:flex-row gap-5">
                            {/* Saved methods sidebar */}
                            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                                <div className="rounded-xl border border-stroke-light bg-bg-white shadow-sm overflow-hidden">
                                    <div className="px-4 pt-4 pb-2">
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-neutral-gray-700">Saved Methods</p>
                                    </div>
                                    <div className="border-t border-stroke-light divide-y divide-stroke-light">
                                        {[
                                            { id: 'bank', label: 'Bank Accounts', count: savedBanks.length },
                                            { id: 'upi',  label: 'UPI Accounts',  count: savedUpis.length  },
                                        ].map(cat => {
                                            const isActive = activeWithdrawCategory === cat.id;
                                            return (
                                                <button
                                                    key={cat.id} type="button"
                                                    onClick={() => { setActiveWithdrawCategory(cat.id as 'bank' | 'upi'); setSelectedBankId(''); }}
                                                    className={[
                                                        'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150',
                                                        isActive
                                                            ? 'bg-bg-light-blue text-brand-text font-semibold'
                                                            : 'bg-bg-white text-brand-text hover:bg-bg-light-blue',
                                                    ].join(' ')}
                                                >
                                                    <span>{cat.label}</span>
                                                    <span className="text-xs font-medium text-neutral-gray-700">{cat.count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </aside>

                            {/* Withdraw form */}
                            <form onSubmit={handleWithdraw} className="flex-1 space-y-5">
                                <div>
                                    <label className="label-text">Select Account</label>
                                    {activeWithdrawCategory === 'bank' && savedBanks.length === 0 && (
                                        <div className="p-3 text-sm text-accent-red bg-accent-red/5 rounded-lg border border-accent-red/20">
                                            No saved bank accounts. Please add one in Payment Accounts settings.
                                        </div>
                                    )}
                                    {activeWithdrawCategory === 'upi' && savedUpis.length === 0 && (
                                        <div className="p-3 text-sm text-accent-red bg-accent-red/5 rounded-lg border border-accent-red/20">
                                            No saved UPI accounts. Please add one in Payment Accounts settings.
                                        </div>
                                    )}
                                    {((activeWithdrawCategory === 'bank' && savedBanks.length > 0) ||
                                      (activeWithdrawCategory === 'upi'  && savedUpis.length  > 0)) && (
                                        <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} className="input-field">
                                            <option value="">-- Select {activeWithdrawCategory === 'bank' ? 'Bank Account' : 'UPI ID'} --</option>
                                            {activeWithdrawCategory === 'bank' && savedBanks.map(b => (
                                                <option key={b._id} value={b._id}>{(b.bank_name || 'Bank')} - {b.account_number || ''}</option>
                                            ))}
                                            {activeWithdrawCategory === 'upi' && savedUpis.map(u => (
                                                <option key={u._id} value={u._id}>{u.upi || u.upi_name || 'UPI'}{u.account_name ? ` (${u.account_name})` : ''}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="label-text">Amount</label>
                                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Enter Amount" className="input-field" />
                                </div>

                                <button disabled={loading || !selectedBankId} className="w-full btn-primary bg-accent-red hover:opacity-90 py-3 rounded-xl border-accent-red transition-all">
                                    {loading ? 'Processing…' : 'Request Withdraw'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── HISTORY TAB — always accessible ── */}
                {tab === 'history' && (
                    <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                        <div className="flex border-b border-stroke-light">
                            <button onClick={() => { setHistoryTab('deposits');    setPage(1); }} className={`flex-1 py-3 text-sm font-semibold ${historyTab === 'deposits'    ? 'bg-bg-light-blue text-brand-text border-b-2 border-brand-primary' : 'text-neutral-gray-700'}`}>Deposits</button>
                            <button onClick={() => { setHistoryTab('withdrawals'); setPage(1); }} className={`flex-1 py-3 text-sm font-semibold ${historyTab === 'withdrawals' ? 'bg-bg-light-blue text-brand-text border-b-2 border-brand-primary' : 'text-neutral-gray-700'}`}>Withdrawals</button>
                        </div>

                        {historyLoading ? (
                            <div className="p-8"><Loader text="Loading history…" /></div>
                        ) : (
                            <div>
                                {historyData.length === 0 ? (
                                    <div className="p-10 text-center text-neutral-gray-700 text-sm">No records found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-stroke-light bg-bg-light-blue text-xs text-neutral-gray-600 uppercase">
                                                    <th className="px-4 py-3 text-left">Date</th>
                                                    <th className="px-4 py-3 text-left">Method</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stroke-light">
                                                {historyData.map((item: any, i) => {
                                                    const methodLabel = historyTab === 'deposits'
                                                        ? (item.paymentMethodId?.upiName || item.paymentMethodId?.type || 'Deposit')
                                                        : (item.paymentType || 'Withdraw');
                                                    const s = (item.status || '').toLowerCase();
                                                    const isSuccess = s === 'completed' || s === 'approved';
                                                    const isPending = s === 'pending';
                                                    return (
                                                        <tr key={item._id || i} className="hover:bg-bg-light-blue transition-colors">
                                                            <td className="px-4 py-3 text-neutral-gray-700 whitespace-nowrap text-xs">
                                                                {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short' }) : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-brand-text">{methodLabel}</td>
                                                            <td className={`px-4 py-3 text-right font-bold font-mono ${historyTab === 'deposits' ? 'text-accent-green' : 'text-accent-red'}`}>
                                                                {historyTab === 'deposits' ? '+' : '-'}₹{Number(item.amount ?? 0).toLocaleString('en-IN')}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={[
                                                                    'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                                                                    isSuccess ? 'bg-accent-green/10 text-accent-green'
                                                                        : isPending ? 'bg-accent-yellow/10 text-accent-yellow'
                                                                            : 'bg-accent-red/10 text-accent-red',
                                                                ].join(' ')}>
                                                                    {item.status || '—'}
                                                                </span>
                                                                {item.rejectReason && (
                                                                    <p className="text-xs text-neutral-gray-600 mt-1 truncate max-w-[120px]" title={item.rejectReason}>{item.rejectReason}</p>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="p-3 border-t border-stroke-light">
                                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepositWithdrawPage;
