import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import { FiTrash2, FiPlus, FiCreditCard, FiX, FiSmartphone, FiShield } from 'react-icons/fi';

type AccountType = 1 | 2; // 1 = UPI, 2 = Bank

const PaymentAccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(() => window.innerWidth >= 1024);
    const [formType, setFormType] = useState<AccountType>(1);
    const [submitting, setSubmitting] = useState(false);
    const [upiForm, setUpiForm] = useState({ upi: '', account_name: '' });
    const [bankForm, setBankForm] = useState({ bank_name: '', account_name: '', account_number: '', ifsc: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const toast = useToastStore();

    const fetchAccounts = () => {
        setLoading(true);
        userApi.getUserBankList().then((res: any) => {
            const list = Array.isArray(res?.data) ? res.data : res?.data?.data || res?.data || [];
            setAccounts(Array.isArray(list) ? list : []);
        }).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchAccounts(); }, []);

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        try {
            await userApi.deleteBankAccount({ id });
            toast.success('Account deleted');
            setAccounts(prev => prev.filter((a: any) => a._id !== id));
        } catch {
            toast.error('Failed to delete account');
        } finally {
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = formType === 1
            ? { type: '1', ...upiForm }
            : { type: '2', ...bankForm };
        setSubmitting(true);
        try {
            await userApi.saveBankAccount(payload);
            toast.success('Account added successfully');
            setShowForm(false);
            setUpiForm({ upi: '', account_name: '' });
            setBankForm({ bank_name: '', account_name: '', account_number: '', ifsc: '' });
            fetchAccounts();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to add account');
        } finally {
            setSubmitting(false);
        }
    };

    const upiAccounts = accounts.filter(a => Number(a.type) === 1);
    const bankAccounts = accounts.filter(a => Number(a.type) === 2);

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">Payment Accounts</h1>
                <p className="text-sm text-white/60 mt-0.5">Manage your saved UPI and bank accounts for withdrawals</p>
            </div>

            <div className="p-4 md:p-6">
                {/* Two-column layout: accounts list (left) + form panel (right) */}
                <div className="flex flex-col lg:flex-row gap-5 items-start">

                    {/* ── LEFT: Accounts list ─────────────────────────────────── */}
                    <div className="w-full lg:flex-1 min-w-0 bg-bg-card px-4 py-4 rounded-xl">

                        {/* Section header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-neutral-gray-800">Saved Accounts</h2>
                                {!loading && (
                                    <p className="text-xs text-brand-text mt-0.5">
                                        {accounts.length} account{accounts.length !== 1 ? 's' : ''} saved
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowForm(v => !v)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${showForm
                                    ? 'bg-bg-light-blue text-neutral-gray-600 hover:bg-brand-primary/10'
                                    : 'bg-brand-primary text-white hover:opacity-90'
                                    }`}
                            >
                                {showForm ? <FiX className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                                {showForm ? 'Cancel' : 'Add Account'}
                            </button>
                        </div>

                        {/* Accounts content */}
                        {loading ? (
                            <div className="bg-bg-card border border-stroke-light rounded-xl p-10 flex justify-center">
                                <Loader text="Loading accounts..." />
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="bg-bg-card border border-stroke-light rounded-xl py-16 text-center px-6">
                                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <FiCreditCard className="w-8 h-8 text-brand-text" />
                                </div>
                                <p className="text-sm font-bold text-brand-text">No Payment Accounts</p>
                                <p className="text-xs text-neutral-gray-600 mt-1 mb-5">
                                    Add a UPI or bank account to enable withdrawals.
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <FiPlus className="w-4 h-4" /> Add Account
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5">

                                {/* UPI Accounts */}
                                {upiAccounts.length > 0 && (
                                    <section>
                                        <p className="text-[11px] font-bold text-brand-text uppercase tracking-widest mb-2.5 px-0.5">
                                            UPI Accounts
                                        </p>
                                        <div className="space-y-3">
                                            {upiAccounts.map(account => (
                                                <div
                                                    key={account._id}
                                                    className="bg-bg-card border border-stroke-light rounded-xl p-4 flex items-center gap-4 hover:border-accent-green/30 transition-colors"
                                                >
                                                    {/* Icon */}
                                                    <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                                                        <FiSmartphone className="w-5 h-5 text-accent-green" />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-bold text-neutral-gray-800 text-sm leading-tight truncate">
                                                                {account.account_name || 'UPI Account'}
                                                            </p>
                                                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-green/10 text-accent-green uppercase tracking-wider">
                                                                UPI
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-mono text-brand-text">
                                                            {account.upi}
                                                        </p>
                                                        <p className="text-xs text-neutral-gray-600 mt-0.5">
                                                            Added {new Date(account.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(account._id)}
                                                        disabled={deleteId === account._id}
                                                        className="p-2.5 text-neutral-gray-600 hover:text-accent-red hover:bg-accent-red/10 rounded-xl transition-colors flex-shrink-0 disabled:opacity-40"
                                                        aria-label="Delete account"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Bank Accounts */}
                                {bankAccounts.length > 0 && (
                                    <section>
                                        <p className="text-[11px] font-bold text-brand-text uppercase tracking-widest mb-2.5 px-0.5">
                                            Bank Accounts
                                        </p>
                                        <div className="space-y-3">
                                            {bankAccounts.map(account => (
                                                <div
                                                    key={account._id}
                                                    className="bg-bg-card border border-stroke-light rounded-xl p-4 flex items-center gap-4 hover:border-brand-primary/30 transition-colors"
                                                >
                                                    {/* Icon */}
                                                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <FiCreditCard className="w-5 h-5 text-brand-text" />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-bold text-neutral-gray-800 text-sm truncate leading-tight">
                                                                {account.bank_name || 'Bank Account'}
                                                            </p>
                                                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-text uppercase tracking-wider">
                                                                Bank
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-brand-text truncate">
                                                            {account.account_name}
                                                        </p>
                                                        <p className="text-xs text-neutral-gray-600 font-mono mt-0.5">
                                                            ••••{String(account.account_number).slice(-4)}
                                                            <span className="mx-1.5 text-neutral-gray-300">|</span>
                                                            {account.ifsc}
                                                        </p>
                                                    </div>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(account._id)}
                                                        disabled={deleteId === account._id}
                                                        className="p-2.5 text-neutral-gray-600 hover:text-accent-red hover:bg-accent-red/10 rounded-xl transition-colors flex-shrink-0 disabled:opacity-40"
                                                        aria-label="Delete account"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Add Account form panel ───────────────────────── */}
                    {showForm && (
                        <div className="w-full lg:w-[400px] flex-shrink-0">
                            <div className="bg-bg-card border border-stroke-light rounded-xl overflow-hidden sticky top-24">

                                {/* Form header */}
                                <div className="bg-brand-primary px-5 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                            <FiPlus className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Add New Account</p>
                                            <p className="text-xs text-white/60">For withdrawal purposes</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-5">
                                    {/* UPI / Bank switcher */}
                                    <div className="flex gap-1 p-1 bg-bg-light-blue rounded-lg mb-5">
                                        <button
                                            type="button"
                                            onClick={() => setFormType(1)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${formType === 1
                                                ? 'bg-bg-white shadow-sm text-brand-text'
                                                : 'text-neutral-gray-700 hover:text-brand-text'
                                                }`}
                                        >
                                            <FiSmartphone className="w-4 h-4" /> UPI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormType(2)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${formType === 2
                                                ? 'bg-bg-white shadow-sm text-brand-text'
                                                : 'text-neutral-gray-700 hover:text-brand-text'
                                                }`}
                                        >
                                            <FiCreditCard className="w-4 h-4" /> Bank Account
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {formType === 1 ? (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                                                        UPI ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={upiForm.upi}
                                                        onChange={e => setUpiForm(p => ({ ...p, upi: e.target.value }))}
                                                        placeholder="e.g. name@paytm"
                                                        required
                                                        className="input-field"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                                                        Account Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={upiForm.account_name}
                                                        onChange={e => setUpiForm(p => ({ ...p, account_name: e.target.value }))}
                                                        placeholder="Your full name"
                                                        required
                                                        className="input-field"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                                                        Bank Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={bankForm.bank_name}
                                                        onChange={e => setBankForm(p => ({ ...p, bank_name: e.target.value }))}
                                                        placeholder="e.g. State Bank of India"
                                                        required
                                                        className="input-field"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                                                        Account Holder Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={bankForm.account_name}
                                                        onChange={e => setBankForm(p => ({ ...p, account_name: e.target.value }))}
                                                        placeholder="Full name as per bank"
                                                        required
                                                        className="input-field"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                                                        Account Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={bankForm.account_number}
                                                        onChange={e => setBankForm(p => ({ ...p, account_number: e.target.value }))}
                                                        placeholder="Enter account number"
                                                        required
                                                        className="input-field font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">
                                                        IFSC Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={bankForm.ifsc}
                                                        onChange={e => setBankForm(p => ({ ...p, ifsc: e.target.value.toUpperCase() }))}
                                                        placeholder="e.g. SBIN0001234"
                                                        required
                                                        className="input-field font-mono"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 bg-brand-primary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {submitting ? 'Saving...' : 'Save Account'}
                                        </button>
                                    </form>

                                    {/* Security note */}
                                    <div className="mt-4 flex items-start gap-2 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                                        <FiShield className="w-4 h-4 text-brand-text flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-neutral-gray-700 leading-relaxed">
                                            Your account details are securely stored and only used for withdrawal processing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentAccountsPage;
