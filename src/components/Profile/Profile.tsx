import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import ChangePasswordForm from './ChangePasswordForm';
import { FiLock, FiCheckCircle, FiAlertCircle, FiSave, FiLoader, FiUser, FiShield } from 'react-icons/fi';
import { kycService } from '../../services/kycService';
import { userApi } from '../../api/client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return iso; }
}

function calcCompletion(
    user: { username?: string; mobile?: string } | null,
    form: ProfileFormData,
    kycVerified: boolean,
): number {
    const checks = [!!user?.username, !!user?.mobile, !!form.email, !!form.name, kycVerified];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── KYC Badge ─────────────────────────────────────────────────────────────────
const KycBadge: React.FC<{ status: number | null; loading: boolean }> = ({ status, loading }) => {
    if (loading) return <span className="text-sm text-neutral-gray-700">Checking…</span>;
    if (status === 1) return <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-green"><FiCheckCircle className="w-4 h-4" />Verified</span>;
    if (status === 2) return <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-yellow"><FiAlertCircle className="w-4 h-4" />Under Review</span>;
    if (status === 0) return <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-red"><FiAlertCircle className="w-4 h-4" />Rejected</span>;
    return <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-gray-600"><FiAlertCircle className="w-4 h-4" />Not Submitted</span>;
};

// ── Read-only field ───────────────────────────────────────────────────────────
const ReadField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <label className="block text-xs font-semibold text-neutral-gray-600 uppercase tracking-wider mb-2">{label}</label>
        <div className="relative">
            <input readOnly value={value} className="w-full px-4 py-2.5 bg-bg-card border border-stroke-primary rounded text-sm text-brand-text cursor-not-allowed pr-9" />
            <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-gray-600" />
        </div>
    </div>
);

// ── Editable field ────────────────────────────────────────────────────────────
const EditField: React.FC<{
    label: string; name: keyof ProfileFormData; value: string; type?: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({ label, name, value, type = 'text', onChange }) => (
    <div>
        <label className="block text-xs font-semibold text-neutral-gray-600 uppercase tracking-wider mb-2">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} className="input-field" />
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const Profile: React.FC = () => {
    const { user, isVerifying } = useAuth();
    const { updateUser } = useAuthStore();
    const toast = useToastStore();

    const [kycStatus, setKycStatus] = useState<number | null>(null);
    const [kycLoading, setKycLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ProfileFormData>({ name: user?.name || '', email: '', phone: user?.mobile || '' });

    useEffect(() => {
        if (user) setForm(prev => ({ name: prev.name || user.name || '', phone: prev.phone || user.mobile || '', email: prev.email }));
    }, [user]);

    useEffect(() => {
        kycService.getKycStatus()
            .then(d => setKycStatus(d.is_kyc_verified))
            .catch(() => setKycStatus(null))
            .finally(() => setKycLoading(false));
    }, []);

    const completion = useMemo(() => calcCompletion(user, form, kycStatus === 1), [user, form, kycStatus]);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        if (!form.name.trim()) { toast.warning('Full name is required'); return; }
        setSaving(true);
        try {
            await userApi.updateProfile({ name: form.name.trim(), email: form.email.trim(), mobile: form.phone.trim() });
            updateUser({ name: form.name.trim(), mobile: form.phone.trim() });
            toast.success('Profile updated successfully');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update profile');
        } finally { setSaving(false); }
    };

    if (isVerifying) return (
        <div className="flex items-center justify-center min-h-screen bg-bg-primary">
            <FiLoader className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary gap-3 text-center p-8">
            <FiAlertCircle className="w-10 h-10 text-neutral-gray-600" />
            <p className="text-lg font-bold text-brand-text">You are not logged in.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header strip */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">Personal Profile</h1>
                <p className="text-sm text-neutral-gray-600 mt-0.5">Manage your account details and security settings</p>
            </div>

            <div className="p-4 md:p-6 max-w-8xl space-y-5">

                {/* Profile card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    {/* Header with completion bar */}
                    <div className="px-5 md:px-6 py-4 border-b border-stroke-light bg-bg-light-blue">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <FiUser className="w-4 h-4 text-brand-text" />
                            </div>
                            <h2 className="font-display font-semibold text-base text-neutral-gray-800">Account Details</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-brand-text shrink-0">Profile {completion}%</span>
                            <div className="flex-1 bg-brand-primary/10 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-6 space-y-6">
                        {/* Account section */}
                        <section>
                            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-4">Account</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ReadField label="Account number" value={user.user_id} />
                                <ReadField label="Registration date" value={formatDate(user.createdAt)} />
                                <ReadField label="Username" value={user.username} />
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-gray-600 uppercase tracking-wider mb-2">KYC Status</label>
                                    <div className="px-4 py-2.5 border border-stroke-light rounded bg-bg-light-blue flex items-center justify-between">
                                        <KycBadge status={kycStatus} loading={kycLoading} />
                                        <Link to="/kyc" className="text-xs text-brand-primary hover:underline font-semibold">
                                            {kycStatus === 1 ? 'View' : 'Complete KYC →'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contacts section */}
                        <section>
                            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-4">Contacts</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <EditField label="Full name" name="name" value={form.name} onChange={handleChange} />
                                <EditField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} />
                                <EditField label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                            </div>
                        </section>

                        <div className="flex justify-end pt-2 border-t border-stroke-light">
                            <button
                                onClick={handleSave} disabled={saving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    <div className="px-5 md:px-6 py-4 border-b border-stroke-light bg-bg-light-blue">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <FiShield className="w-4 h-4 text-brand-text" />
                            </div>
                            <h2 className="font-display font-semibold text-base text-neutral-gray-800">Security</h2>
                        </div>
                    </div>
                    <div className="p-5 md:p-6">
                        <ChangePasswordForm />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
