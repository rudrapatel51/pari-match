export interface WalletBalance {
    mainBalance: number;
    bonusBalance: number;
    lockedBalance: number;
    withdrawableBalance: number;
    totalAvailable: number;
    totalBalance: number;
    activeWagers: any[];
}

export interface DepositRequest {
    paymentMethodId: string;
    amount: number;
    transactionScreenshot?: File;
}

export interface WithdrawRequestPayload {
    amount: number;
    bankDetailId?: string; // Option A
    paymentType?: 'upi' | 'bank_transfer'; // Option B & C
    upiId?: string;
    name?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    ifscCode?: string;
}

export interface BankDetail {
    _id: string;
    type: '1' | '2' | 'upi' | 'bank_transfer';
    upi?: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
    ifsc?: string;
}

export interface PaymentMethod {
    _id: string;
    type: string;
    name?: string;
    upiName?: string;
    upiId?: string;
    qrCode?: string;
    /** QR code image URL for "Scan to pay" (from backend qrCodeImage) */
    qrCodeImage?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
    screenshot?: string;
    isActive?: boolean;
}

export interface TransactionHistoryItem {
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
    type?: string;
    paymentMethodId?: PaymentMethod; // For deposits
    bankDetailId?: BankDetail; // For withdrawals
    createdAt: string;
    transactionScreenshot?: string;
}

export interface WithdrawBankDetailsResponse {
    upiDetails: BankDetail[];
    bankAccounts: BankDetail[];
}

/** Item from GET /app/user/bank/list — type 1 = UPI, type 2 = bank */
export interface UserBankListItem {
    _id: string;
    type: 1 | 2 | '1' | '2';
    upi_name?: string;
    upi?: string;
    ifsc?: string;
    account_number?: string;
    account_name?: string;
    bank_name?: string;
    createdAt?: string;
    updatedAt?: string;
}
