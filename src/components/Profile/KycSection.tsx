import React, { useState, useEffect } from 'react';

import { FiCheckCircle, FiAlertCircle, FiClock, FiUpload } from 'react-icons/fi';

import { kycService } from '../../services/kycService';
import { useToastStore } from '../../store/toastStore';
import { KycDocumentType, GetKycResponse } from '../../types/auth';

const KycSection: React.FC = () => {
    const toast = useToastStore();
    const [kycStatus, setKycStatus] = useState<GetKycResponse['data'] | null>(null);
    const [documentTypes, setDocumentTypes] = useState<KycDocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [selectedDocType, setSelectedDocType] = useState('');
    const [docNumber, setDocNumber] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => { fetchKycData(); }, []);

    const fetchKycData = async () => {
        try {
            setLoading(true);
            const [types, status] = await Promise.all([
                kycService.getDocumentTypes(),
                kycService.getKycStatus()
            ]);
            setDocumentTypes(types);
            setKycStatus(status);
        } catch (error: any) {
            console.error('[KycSection] fetch failed:', error);
            toast.error(error?.message || 'Failed to load KYC data.');
            setMessage({ type: 'error', text: 'Failed to load KYC data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setMessage({ type: 'error', text: 'Invalid file type. Only JPG, PNG, PDF allowed.' });
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size exceeds 2MB limit.' });
                return;
            }
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!selectedDocType || !docNumber || !selectedFile) {
            setMessage({ type: 'error', text: 'Please fill all required fields.' });
            return;
        }
        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('document_type', selectedDocType);
            formData.append('document_number', docNumber);
            formData.append('kyc_files', selectedFile);
            await kycService.submitKyc(formData);
            setMessage({ type: 'success', text: 'KYC documents submitted successfully!' });
            const status = await kycService.getKycStatus();
            setKycStatus(status);
            setSelectedDocType('');
            setDocNumber('');
            setSelectedFile(null);
        } catch (error: any) {
            console.error('[KycSection] submit failed:', error);
            toast.error(error?.message || 'KYC submission failed');
            setMessage({ type: 'error', text: 'Failed to submit KYC documents. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="bg-bg-card border border-stroke-light shadow-betting-card p-8 text-center text-brand-text text-sm">
            Loading KYC details…
        </div>
    );

    const isVerified = kycStatus?.is_kyc_verified === 1;
    const isUnderReview = kycStatus?.is_kyc_verified === 2;
    const canSubmit = !isVerified && !isUnderReview;

    const StatusBadge = () => {
        if (!kycStatus) return null;
        switch (kycStatus.is_kyc_verified) {
            case 1: return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-accent-green text-brand-text">
                    <FiCheckCircle className="w-4 h-4" /> Verified
                </span>
            );
            case 2: return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-accent-yellow text-brand-text">
                    <FiClock className="w-4 h-4" /> Under Review
                </span>
            );
            case 0: return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-accent-red text-brand-text">
                    <FiAlertCircle className="w-4 h-4" /> Rejected
                </span>
            );
            default: return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-bg-light-blue text-brand-text">
                    <FiAlertCircle className="w-4 h-4" /> Not Submitted
                </span>
            );
        }
    };

    return (
        <div className="bg-bg-card border border-stroke-light shadow-betting-card overflow-hidden">
            {/* Card header */}
            <div className="px-5 md:px-6 py-4 border-b border-stroke-light bg-brand-primary-dark flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display font-semibold text-base text-brand-text">KYC Verification</h2>
                <StatusBadge />
            </div>

            <div className="p-5 md:p-6">
                {/* Alert message */}
                {message && (
                    <div className={`flex items-start gap-3 mb-5 p-4 border-l-4 ${message.type === 'success'
                        ? 'bg-accent-green/5 border-accent-green text-accent-green'
                        : 'bg-accent-red/5 border-accent-red text-accent-red'
                        }`}>
                        {message.type === 'success'
                            ? <FiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            : <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                {/* Rejection reason */}
                {kycStatus?.kyc_comment && kycStatus.is_kyc_verified === 0 && (
                    <div className="flex items-start gap-3 mb-5 p-4 border-l-4 bg-accent-red/5 border-accent-red text-accent-red">
                        <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium"><span className="font-bold">Rejection Reason:</span> {kycStatus.kyc_comment}</p>
                    </div>
                )}

                {canSubmit ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
                                    Document Type <span className="text-accent-red">*</span>
                                </label>
                                <select
                                    value={selectedDocType}
                                    onChange={(e) => setSelectedDocType(e.target.value)}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select Document</option>
                                    {documentTypes.map((doc) => (
                                        <option key={doc.value} value={doc.value}>{doc.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
                                    Document Number <span className="text-accent-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={docNumber}
                                    onChange={(e) => setDocNumber(e.target.value)}
                                    placeholder="Enter ID number"
                                    required
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">
                                Upload Document (Max 2MB) <span className="text-accent-red">*</span>
                            </label>
                            <div className="relative border-2 border-dashed border-stroke-light p-6 text-center hover:bg-bg-light-blue hover:border-brand-primary transition-all cursor-pointer">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <FiUpload className={`w-8 h-8 ${selectedFile ? 'text-accent-green' : 'text-neutral-gray-600'}`} />
                                    <p className="text-sm text-neutral-gray-600 font-medium">
                                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-neutral-gray-600">JPG, PNG, PDF — max 2MB</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto px-6 py-2.5 bg-accent-green text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {submitting ? 'Submitting…' : 'Submit Verification'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">Document Type</label>
                                <div className="px-4 py-2.5 border border-stroke-light bg-bg-light-blue text-sm text-brand-text">
                                    {kycStatus?.kyc_details?.document_type_display || '—'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-text-70 uppercase tracking-wider mb-2">Document Number</label>
                                <div className="px-4 py-2.5 border border-stroke-light bg-bg-light-blue text-sm text-brand-text">
                                    {kycStatus?.kyc_details?.document_number || '—'}
                                </div>
                            </div>
                        </div>
                        {isVerified && (
                            <p className="text-sm text-accent-green">
                                Your account is verified. You can now access all features including withdrawals.
                            </p>
                        )}
                        {isUnderReview && (
                            <p className="text-sm text-accent-yellow">
                                Your documents are under review. This process usually takes 24–48 hours.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KycSection;
