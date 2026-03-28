export interface User {
    user_id: string; // Changed from _id
    name: string;
    username: string;
    mobile: string;
    refercode?: string;
    status: number;
    last_login_at?: string | null;
    socket_id?: string;
    is_kyc_verified: number; // Changed from boolean
    is_mobile_verified: number;
    language: string;
    kyc_files?: any[];
    createdAt?: string;
    balance?: number;
    usable_coin_balance?: number;
    current_liability?: number;
    exposore?: number;
    color_mode: string;
    bonus_wallet?: number;
    win_wallet?: number;
    mainBalance?: number;
    bonusBalance?: number;
    lockedBalance?: number;
    withdrawableBalance?: number;
    totalAvailable?: number;
    totalBalance?: number;
    totalExposure?: number;
    activeWagers?: any[];
    sports_block?: any[];
    profile_pic?: string;
    change_password?: boolean;
    showterms?: boolean;
}

export interface AuthResponse {
    status: number;
    message: string;
    data: {
        user: User;
        token: string;
        session_token?: string;
        notification?: number;
        ipAddress?: string;
        clientIp?: string;
    };
}

// --- Login Payloads ---
export interface PasswordLoginRequest {
    username: string;
    password: string;
    login_type: "password";
    remember: boolean;
    device_type: "Web";
    device_app_version: "1.0";
    ip_address: string;
}

export interface SendOtpRequest {
    mobile: string;
    type?: "login" | "forgot_password";
}

export interface VerifyLoginOtpRequest {
    mobile: string;
    otp: string;
    type: "login";
    ip_address: string;
}

// --- Register Payloads ---
export interface RegisterSendOtpRequest {
    mobile: string;
    username: string; // User doc says username is sent here
    ip_address: string;
}

export interface RegisterVerifyOtpRequest {
    otp: string;
    name: string;
    username: string;
    mobile: string;
    password: string;
    country_code: string; // +91
    referral_code?: string;
    age_verification: boolean; // true
    ip_address: string;
}

// --- Forgot Password Payloads ---
export interface ForgotPasswordVerifyOtpRequest {
    mobile: string;
    otp: string;
    type: "forgot_password";
}

export interface VerifyOtpResponse {
    reset_token: string;
}

export interface ResetPasswordRequest {
    reset_token: string;
    new_password: string;
    confirm_password: string;
}

// --- Common ---
export interface VerifyTokenRequest {
    token: string;
}

// --- KYC Payloads & Responses ---
export interface KycDocumentType {
    value: string;
    label: string;
}

export interface GetKycResponse {
    status: number;
    message: string;
    data: {
        is_kyc_verified: number; // 0: Rejected, 1: Verified, 2: Under Review, 3: Not Submitted
        kyc_comment?: string;
        kyc_details?: {
            document_type: string;
            document_type_display: string;
            document_number: string;
        };
        kyc_files?: Array<{
            document: string;
            type: string;
        }>;
    };
}

export interface SubmitKycRequest {
    document_type: string;
    document_number: string;
    kyc_files: File;
}

// --- Change Password (for logged-in users) ---
export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

// --- Country Codes ---
export interface CountryCode {
    _id: string;
    number: string; // e.g., "+91"
    country: string; // e.g., "India"
}

