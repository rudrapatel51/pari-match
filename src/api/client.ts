import axios, { AxiosInstance, AxiosError } from 'axios';
import { Endpoints } from './endpoints';
import { BrandTheme } from '../types/theme';
import type { ApiResponse } from '../types/api';

export type { ApiResponse };

// Create Axios Instance
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        const language = localStorage.getItem('i18nextLng') || 'en';

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers.Language = language;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Message sent by the backend when the same account is active on another device.
const DEVICE_CONFLICT_MESSAGE = 'You are already logged in on another device.';

/**
 * Clears all auth tokens from localStorage and fires the appropriate
 * custom event so the auth store and UI can react.
 *
 * @param isDeviceConflict - true when the backend explicitly tells us the
 *   account is active on another device, false for a normal session expiry.
 */
function handleAuthFailure(isDeviceConflict: boolean): void {
    // Remove BOTH tokens so nothing stale is left behind.
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionToken');

    if (isDeviceConflict) {
        // Dedicated event — UI can show a specific "logged out on another device" message.
        window.dispatchEvent(new CustomEvent('auth:device-conflict'));
        console.warn('[Auth] Force-logged out: account active on another device.');
    } else {
        // Generic session expiry (token invalid / expired / revoked).
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        console.warn('[Auth] Session expired. User logged out.');
    }
}

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Some endpoints return HTTP 200 but embed an auth-failure message in
        // the body (so-called "soft" 401s).  Detect and handle them here.
        const responseData = response.data as any;
        const softFailMessages = [
            'Invalid token, Please try again.',
            'Login is required.',
            DEVICE_CONFLICT_MESSAGE,
        ];

        if (responseData && softFailMessages.includes(responseData.message)) {
            const isDeviceConflict = responseData.message === DEVICE_CONFLICT_MESSAGE;
            handleAuthFailure(isDeviceConflict);

            // Reject so calling code does not treat this as a success.
            return Promise.reject(new Error(responseData.message));
        }

        return response.data;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Check whether the backend told us this is a device-conflict 401
            // (real HTTP 401 with a specific body message).
            const responseMessage = (error.response?.data as any)?.message as string | undefined;
            const isDeviceConflict = responseMessage === DEVICE_CONFLICT_MESSAGE;

            handleAuthFailure(isDeviceConflict);
        }

        // Normalise error message for the calling code.
        const message =
            (error.response?.data as any)?.error?.message ||
            (error.response?.data as any)?.message ||
            error.message ||
            'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

import {
    PasswordLoginRequest,
    SendOtpRequest,
    VerifyLoginOtpRequest,
    RegisterSendOtpRequest,
    RegisterVerifyOtpRequest,
    AuthResponse,
    VerifyTokenRequest,
    ForgotPasswordVerifyOtpRequest,
    ResetPasswordRequest,
    VerifyOtpResponse,
    ChangePasswordRequest,
    CountryCode
} from '../types/auth';

export const authApi = {
    // Login
    login: (data: PasswordLoginRequest) => apiClient.post<any, AuthResponse>(Endpoints.LOGIN, data),
    sendLoginOtp: (data: SendOtpRequest) => apiClient.post(Endpoints.SEND_OTP, data),
    verifyLoginOtp: (data: VerifyLoginOtpRequest) => apiClient.post<any, AuthResponse>(Endpoints.VERIFY_LOGIN_OTP, data),

    // Register
    registerSendOtp: (data: RegisterSendOtpRequest) => apiClient.post(Endpoints.REGISTER_SEND_OTP, data),
    registerVerifyOtp: (data: RegisterVerifyOtpRequest) => apiClient.post<any, AuthResponse>(Endpoints.REGISTER_VERIFY_OTP, data),

    // Forgot Password
    sendForgotPasswordOtp: (data: SendOtpRequest) => apiClient.post(Endpoints.FORGOT_PASSWORD_SEND_OTP, { ...data, type: 'forgot_password' }),
    verifyForgotPasswordOtp: (data: ForgotPasswordVerifyOtpRequest) => apiClient.post<VerifyOtpResponse>(Endpoints.FORGOT_PASSWORD_VERIFY_OTP, data),
    resetPassword: (data: ResetPasswordRequest) => apiClient.post(Endpoints.FORGOT_PASSWORD_RESET, data),

    // Session
    logout: () => apiClient.post(Endpoints.LOGOUT, { t: Date.now() }),
    verifyToken: (data: VerifyTokenRequest) => apiClient.post<any, AuthResponse>(Endpoints.VERIFY_TOKEN, data),

    // Change Password (for logged-in users)
    changePassword: (data: ChangePasswordRequest) => apiClient.post(Endpoints.CHANGE_PASSWORD, data),

    // Get Country Codes
    getCountryCodes: () => apiClient.get<any, ApiResponse<CountryCode[]>>(Endpoints.GET_COUNTRY_CODES),
};

export const userApi = {
    getProfile: () => apiClient.get<any, ApiResponse>(Endpoints.GET_PROFILE),
    updateProfile: (data: FormData | Record<string, any>) =>
        apiClient.post<any, ApiResponse>(Endpoints.UPDATE_PROFILE, data),
    balance: () => apiClient.get<any, ApiResponse>(Endpoints.GET_BALANCE),
    // Betting
    placeBet: (data: any) => apiClient.post(Endpoints.PLACE_BET, data),
    getUnsettledBets: () => apiClient.post(Endpoints.UNSETTLED_BETS),
    getBetHistory: (data: any) => apiClient.post(Endpoints.MY_BETS, data),
    getProfitLoss: (data: any) => apiClient.post(Endpoints.PROFIT_LOSS, data),
    getUserMatchBet: (data: { event_id: string }) => apiClient.post(Endpoints.USER_MATCH_BET, data),
    getComparativeAnalysis: (data: { event_id: string; market_id: string }) => apiClient.post(Endpoints.COMPARATIVE_ANALYSIS, data),
    // Bet Stake Settings
    getBetStakes: () => apiClient.get(Endpoints.BET_STAKE_GET),
    addBetStake: (data: { stake_name: string; stake_value: number }) => apiClient.post(Endpoints.BET_STAKE_ADD, data),
    deleteBetStake: (data: { id: string }) => apiClient.post(Endpoints.BET_STAKE_DELETE, data),
    // Notifications
    getNotifications: (data?: any) => apiClient.post(Endpoints.NOTIFICATIONS, data || {}),
    markNotificationClicked: (data: { id: string }) => apiClient.post(Endpoints.NOTIFICATION_MARK_CLICK, data),
    changeNotificationStatus: (data: { id: string; status: number }) => apiClient.post(Endpoints.NOTIFICATION_CHANGE_STATUS, data),
    // Transactions
    getTransactionHistory: (data: any) => apiClient.post(Endpoints.TRANSACTION_HISTORY, data),
    getDepositHistory: (data?: any) => apiClient.get(Endpoints.DEPOSIT_HISTORY, { params: data }),
    getWithdrawHistory: (data?: any) => apiClient.get(Endpoints.WITHDRAW_HISTORY, { params: data }),
    // Wallet
    depositRequest: (data: FormData | any) => apiClient.post(Endpoints.DEPOSIT_REQUEST, data),
    withdrawRequest: (data: any) => apiClient.post(Endpoints.WITHDRAW_REQUEST, data),
    getPaymentMethods: () => apiClient.get(Endpoints.PAYMENT_METHODS),
    getBankList: () => apiClient.get(Endpoints.BANK_LIST),
    getWithdrawBankDetails: () => apiClient.get(Endpoints.WITHDRAW_BANK_DETAILS),
    getUserBankList: () => apiClient.get(Endpoints.USER_BANK_LIST),
    saveBankAccount: (data: any) => apiClient.post(Endpoints.BANK_SAVE, data),
    deleteBankAccount: (data: { id: string }) => apiClient.post(Endpoints.BANK_DELETE, data),

    // Gamification
    dailyCheckIn: () => apiClient.post(Endpoints.DAILY_CHECKIN),
    getDailyCheckInStatus: () => apiClient.get(Endpoints.DAILY_CHECKIN_COUNT),
    getSpinList: () => apiClient.get(Endpoints.SPIN_LIST),
    playSpin: (data: { assignment_id: string }) => apiClient.post(Endpoints.SPIN_PLAY, data),
    getMySpins: () => apiClient.get(Endpoints.SPIN_MY_SPINS),
    getSpinHistory: () => apiClient.get(Endpoints.SPIN_HISTORY),
    getVipStatus: () => apiClient.get(Endpoints.VIP_STATUS),
    getVipProgress: () => apiClient.get(Endpoints.VIP_PROGRESS),
    getVipCategories: () => apiClient.get(Endpoints.VIP_CATEGORIES),
    getVipList: () => apiClient.get(Endpoints.VIP_LIST),
    getVipHistory: (data?: any) => apiClient.get(Endpoints.VIP_HISTORY, { params: data }),
    getPromocodes: () => apiClient.get(Endpoints.PROMOCODES),
    // KYC — response body: { data: { is_kyc_verified, kyc_details, kyc_files, kyc_date, kyc_comment, kyc_reject_reason }, message, status }
    getKyc: () => apiClient.post<any, ApiResponse<{
        is_kyc_verified: number;
        kyc_details: { document_type: string; document_number: string; submitted_at: string; document_type_display: string } | null;
        kyc_files: { document: string; document_name: string }[];
        kyc_date: string | null;
        kyc_comment: string;
        kyc_reject_reason: string;
    }>>(Endpoints.GET_KYC),
};

export const sportsApi = {
    getInPlay: () => apiClient.get(Endpoints.BET_EVENT_LIST),
    getMatchDetails: (event_id: string) => apiClient.post(Endpoints.CRICKET_MATCH_DETAILS, { event_id }),
    getEventDetails: (event_id: string) => apiClient.post(Endpoints.BET_EVENT_DETAILS, { event_id }),
    getEventDetailsDream: (event_id: string) => apiClient.post(Endpoints.GET_EVENT_DETAILS_DREAM, { event_id }),
    getLiveScore: (event_id: string) => apiClient.post(Endpoints.GET_LIVE_SCORE, { event_id }),
    getUpcomingCricket: () => apiClient.get(Endpoints.UPCOMING_CRICKET),
};

export const casinoApi = {
    getGames: (params?: any) => apiClient.post(Endpoints.CASINO_GAMES, params || {}),
    getCategories: () => apiClient.get(Endpoints.CASINO_CATEGORY),
    launchGame: (data: { game_id: string }) => apiClient.post(Endpoints.CASINO_LAUNCH, data),
    getDreamGameUrl: (data: any) => apiClient.post(Endpoints.DREAM_CASINO_URL, data),
    getAuraUrl: (data: { game_id: string }) => apiClient.post(Endpoints.AURA_CASINO_URL, data),
    getCasinoBets: (params?: any) => apiClient.get(Endpoints.CASINO_BETS, { params }),
    getGameHistory: (data: any) => apiClient.post(Endpoints.GAME_HISTORY, data),
    getFavGames: () => apiClient.get(Endpoints.CASINO_FAV_GAMES),
    addFavGame: (data: { game_id: string }) => apiClient.post(Endpoints.CASINO_FAV_ADD, data),
    removeFavGame: (data: { game_id: string }) => apiClient.post(Endpoints.CASINO_FAV_REMOVE, data),
    getFranchiseCategories: () => apiClient.get(Endpoints.FRANCHISE_CATEGORIES),
    getFranchiseCategoriesWithGames: (data: any) => apiClient.post(Endpoints.FRANCHISE_CATEGORIES, data),
    getFranchiseProviders: () => apiClient.post(Endpoints.FRANCHISE_PROVIDERS),
};

export const bannerApi = {
    getAllBanners: () => apiClient.get(Endpoints.BANNERS),
    getBannersByType: (type: string) => apiClient.get(Endpoints.BANNERS_BY_TYPE(type)),
};

export const contentApi = {
    getBlogs: (params?: any) => apiClient.get(Endpoints.BLOG_LIST, { params }),
    getBlogDetail: (slug: string) => apiClient.get(Endpoints.BLOG_DETAIL(slug)),
    getNews: (params?: any) => apiClient.get(Endpoints.NEWS_LIST, { params }),
    getNewsDetail: (slug: string) => apiClient.get(Endpoints.NEWS_DETAIL(slug)),
    getCmsPage: (link: string) => apiClient.get(Endpoints.CMS_PAGE, { params: { link } }),
    contactUs: (data: any) => apiClient.post(Endpoints.CONTACT_US, data),
    getAppLinks: () => apiClient.get(Endpoints.APP_LINKS),
    getTheme: (device?: 'desktop' | 'mobile') => {
        const params: Record<string, string> = {};
        if (device) params.device = device;
        return apiClient.get<any, ApiResponse<BrandTheme>>(Endpoints.THEME_GET, { params });
    },
};

export const bonusApi = {
    getMyBonuses: () => apiClient.get(Endpoints.BONUS_MY_BONUS),
    applyPromoCode: (data: { promoCode: string; depositAmount?: number }) =>
        apiClient.post(Endpoints.BONUS_APPLY_PROMO, data),
};

export const affiliateApi = {
    // Status & application
    apply: () => apiClient.post(Endpoints.AFFILIATE_APPLY, {}),
    getApplicationStatus: () => apiClient.get(Endpoints.AFFILIATE_STATUS),
    /** @deprecated use getApplicationStatus */
    getStatus: () => apiClient.get(Endpoints.AFFILIATE_STATUS),

    // Dashboard & stats
    getDashboard: () => apiClient.get(Endpoints.AFFILIATE_DASHBOARD),
    getStats: () => apiClient.get(Endpoints.AFFILIATE_STATS),
    getReferralCode: () => apiClient.get(Endpoints.AFFILIATE_REFERRAL_CODE),

    // Lists (paginated)
    getReferrals: (data?: { page: number; perpage: number; search?: string }) =>
        apiClient.post(Endpoints.AFFILIATE_REFERRALS, data || {}),
    getPlayers: (data?: { page: number; perpage: number }) =>
        apiClient.post(Endpoints.AFFILIATE_PLAYERS, data || {}),
    getCommissionHistory: (data?: {
        page: number;
        perpage: number;
        status?: 'pending' | 'settled' | 'cancelled';
        commission_type?: 'deposit' | 'loss' | 'profit';
        start_date?: string;
        end_date?: string;
    }) => apiClient.post(Endpoints.AFFILIATE_COMMISSIONS, data || {}),
    getEarningsBreakdown: (data?: { start_date?: string; end_date?: string }) =>
        apiClient.post(Endpoints.AFFILIATE_EARNINGS_BREAKDOWN, data || {}),

    // Player detail
    getPlayerDetail: (playerId: string) => apiClient.get(Endpoints.AFFILIATE_PLAYER_DETAIL(playerId)),
};

export default apiClient;
