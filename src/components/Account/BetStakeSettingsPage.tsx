import React, { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiZap } from 'react-icons/fi';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../api/client';
import Loader from '../Common/Loader';

const BetStakeSettingsPage: React.FC = () => {
    // STATE — KEEP IDENTICAL
    const [stakes, setStakes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState('');
    const toast = useToastStore();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // HANDLERS — KEEP IDENTICAL
    const loadStakes = async () => {
        setLoading(true);
        try {
            const res = await userApi.getBetStakes() as any;
            setStakes(res?.data?.data || res?.data || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { loadStakes(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newValue) { toast.error('Enter name and value'); return; }
        try {
            await userApi.addBetStake({ stake_name: newName.trim(), stake_value: parseFloat(newValue) });
            toast.success('Stake added!');
            setNewName(''); setNewValue('');
            loadStakes();
        } catch (e: any) { toast.error(e.message || 'Failed to add stake'); }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        try {
            await userApi.deleteBetStake({ id });
            setStakes(prev => prev.filter((s: any) => s._id !== id));  // KEEP IDENTICAL: optimistic update
        } catch { } finally { setDeleteId(null); }
    };

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">Stake Settings</h1>
                <p className="text-sm text-white/60 mt-0.5">Configure quick stake presets for faster betting</p>
            </div>

            <div className="p-4 md:p-6 max-w-2xl">
                {/* Add form card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-5 md:p-6 mb-5">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                            <FiZap className="w-4 h-4 text-brand-text" />
                        </div>
                        <h2 className="font-display font-semibold text-base text-neutral-gray-800">Add New Preset</h2>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">Label</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Quick 500"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-text uppercase tracking-wider mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    placeholder="Enter value"
                                    min="1"
                                    className="input-field font-mono"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-brand-primary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <FiPlus className="w-4 h-4" />
                            Add Preset
                        </button>
                    </form>
                </div>

                {/* Stakes grid */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-stroke-light bg-bg-light-blue">
                        <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                            Saved Presets ({stakes.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader text="Loading..." />
                        </div>
                    ) : stakes.length === 0 ? (
                        <div className="py-12 text-center px-4">
                            <FiZap className="w-9 h-9 text-neutral-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-brand-text">No Presets Yet</p>
                            <p className="text-xs text-neutral-gray-600 mt-1">Add presets above to speed up your betting.</p>
                        </div>
                    ) : (
                        /* Grid of preset cards */
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {stakes.map((s: any, idx: number) => (
                                <div key={s._id}
                                    className="bg-bg-card border border-stroke-light rounded-xl p-4 flex flex-col relative group hover:border-brand-primary/30 hover:shadow-betting-card transition-all">
                                    {/* Numbered badge */}
                                    <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center mb-2">
                                        {idx + 1}
                                    </span>
                                    {/* Label */}
                                    <p className="text-xs font-semibold text-brand-text uppercase tracking-wide truncate">
                                        {s.stake_name || s.name}
                                    </p>
                                    {/* Amount */}
                                    <p className="font-mono font-bold text-xl text-neutral-gray-800 mt-1">
                                        ₹{(s.stake_value || s.value || 0).toLocaleString()}
                                    </p>
                                    {/* Delete — shows on hover */}
                                    <button
                                        onClick={() => handleDelete(s._id)}
                                        disabled={deleteId === s._id}
                                        className="absolute top-3 right-3 p-1.5 text-neutral-gray-300 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
                                        aria-label="Delete preset"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BetStakeSettingsPage;
