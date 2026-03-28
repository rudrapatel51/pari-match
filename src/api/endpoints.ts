export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SLUG = "app";
export const BASE_API = `${API_BASE_URL}${SLUG}`;

export const Endpoints = {
    // Auth
    LOGIN: `${BASE_API}/login`,
    SEND_OTP: `${BASE_API}/send-otp`,
    VERIFY_LOGIN_OTP: `${BASE_API}/verify-otp`,
    REGISTER_SEND_OTP: `${BASE_API}/send-signup-otp`,
    REGISTER_VERIFY_OTP: `${BASE_API}/verify-signup-otp`,

    REGISTER: `${BASE_API}/register`,
    REGISTER_VERIFY_OTP_LEGACY: `${BASE_API}/register/verify-otp`,
    REGISTER_SEND_OTP_LEGACY: `${BASE_API}/register/send-otp`,
    LOGOUT: `${BASE_API}/logout`,
    VERIFY_TOKEN: `${BASE_API}/verify-token`,
    FORGOT_PASSWORD_SEND_OTP: `${BASE_API}/send-otp`,
    FORGOT_PASSWORD_VERIFY_OTP: `${BASE_API}/verify-otp`,
    FORGOT_PASSWORD_RESET: `${BASE_API}/forgot_password`,
    CHANGE_PASSWORD: `${BASE_API}/update_password`,

    // User
    GET_PROFILE: `${BASE_API}/user/get_profile`,
    UPDATE_PROFILE: `${BASE_API}/user/update_profile`,
    UPDATE_KYC: `${BASE_API}/user/update_kyc`,
    GET_KYC: `${BASE_API}/user/get_kyc`,
    KYC_DOCUMENT_TYPES: `${BASE_API}/user/kyc_document_types`,
    GET_BALANCE: `${BASE_API}/balance`,
    USER_MIN_MAX: `${BASE_API}/user/get-min-max`,
    EVENT_NOTIFICATIONS: `${BASE_API}/get-notification-event`,

    // Wallet
    ADD_COINS: `${BASE_API}/user/add_coins`,
    WITHDRAW_REQUEST: `${BASE_API}/withdraw-request`,
    DEPOSIT_REQUEST: `${BASE_API}/deposit/request`,
    TRANSACTION_HISTORY: `${BASE_API}/user/coin_history`,
    BANK_LIST: `${BASE_API}/bank/list`,
    BANK_SAVE: `${BASE_API}/bank/store`,
    BANK_DELETE: `${BASE_API}/bank/delete`,

    // Betting (legacy endpoints)
    PLACE_BET: `${API_BASE_URL}api/betting/bets/place`,
    MY_BETS: `${BASE_API}/user/place-bet-history`,
    UNSETTLED_BETS: `${BASE_API}/user/get-unsettled-bets`,
    PROFIT_LOSS: `${BASE_API}/user/profit-loss`,
    BET_EVENT_DETAILS: `${BASE_API}/get_event_details`,
    BET_EVENT_LIST: `${BASE_API}/event_list`,
    USER_MATCH_BET: `${BASE_API}/betting/get-user-match-bet`,
    COMPARATIVE_ANALYSIS: `${BASE_API}/betting/comparative-analysis`,
    BET_STAKE_GET: `${BASE_API}/user/get_stake`,
    BET_STAKE_ADD: `${BASE_API}/user/add_stake`,
    BET_STAKE_DELETE: `${BASE_API}/user/delete_stake`,

    // --- Betting Layout Routes (VITE_BETTING_API_URL base) ---
    BETTING_SPORTS: `sports`,
    BETTING_LIVE_EVENTS: `events/live`,
    BETTING_EVENTS_BY_SPORT: (sportId: string | number) => `sports/${sportId}/events`,
    BETTING_EVENT_BY_ID: (eventId: string) => `events/${eventId}`,
    BETTING_EVENT_MARKETS: (eventId: string) => `events/${eventId}/markets`,
    BETTING_BETS_ACTIVE: `bets/active`,
    BETTING_BETS_HISTORY: `bets/history`,
    BETTING_PLACE_BET: `bets/place`,

    CRICKET_MATCH_DETAILS: `${BASE_API}/cricket/match_details`,
    GET_EVENT_DETAILS_DREAM: `${BASE_API}/get_event_details_dream`,
    GET_LIVE_SCORE: `${BASE_API}/cricket/get_live_score`,
    UPCOMING_CRICKET: `${BASE_API}/get-upcomming-cricket-event`,

    // Casino
    CASINO_GAMES: `${BASE_API}/games/list`,
    CASINO_CATEGORY: `${BASE_API}/games/category`,
    CASINO_LAUNCH: `${BASE_API}/games/view`,
    CASINO_SUBSCRIBE: `${BASE_API}/games/subscribe`,
    DIGITAIN_URL: `${BASE_API}/get_digitain_link`,
    DREAM_CASINO_GAMES: `${BASE_API}/dream_casino/get-game-list`,
    DREAM_CASINO_URL: `${BASE_API}/dream_casino/get-game-link`,
    AURA_CASINO_URL: `${BASE_API}/aura_casino/get_url`,
    CASINO_BETS: `${BASE_API}/casino_bets/getByUser`,
    CASINO_FAV_GAMES: `${BASE_API}/user/get-favourite-casino_game`,
    CASINO_FAV_ADD: `${BASE_API}/user/set-favourite-casino_game`,
    CASINO_FAV_REMOVE: `${BASE_API}/user/remove-favourite-casino_game`,
    FRANCHISE_CATEGORIES: `${BASE_API}/franchise/categories-with-games`,
    FRANCHISE_PROVIDERS: `${BASE_API}/franchise/providers-with-games`,
    GAME_HISTORY: `${BASE_API}/user/game_history`,

    // Wallet / Payments
    DEPOSIT_HISTORY: `${BASE_API}/deposit/history`,
    WITHDRAW_HISTORY: `${BASE_API}/withdraw-requests`,
    WITHDRAW_BANK_DETAILS: `${BASE_API}/withdraw-bank-details`,
    USER_BANK_LIST: `${BASE_API}/user/bank/list`,
    PAYMENT_METHODS: `${BASE_API}/payment-methods`,
    BANK_UPDATE: `${BASE_API}/user/bank/update`,

    // Notifications
    NOTIFICATION_MARK_CLICK: `${BASE_API}/notification/mark-clicked`,
    NOTIFICATION_CHANGE_STATUS: `${BASE_API}/notification/change-status`,

    // Banners
    BANNERS_BY_TYPE: (type: string) => `${BASE_API}/banners/type/${type}`,

    // Common
    BANNERS: `${BASE_API}/banners`,
    NOTIFICATIONS: `${BASE_API}/notification/get`,
    GET_COUNTRY_CODES: `${BASE_API}/get-country-code`,

    // Gamification
    DAILY_CHECKIN: `${BASE_API}/user/daily-check-in`,
    DAILY_CHECKIN_COUNT: `${BASE_API}/user/get-daily-check-in`,
    SPIN_LIST: `${BASE_API}/spin_Wheel/list`,
    SPIN_PLAY: `${BASE_API}/spins/play`,
    SPIN_MY_SPINS: `${BASE_API}/spins/my-spins`,
    SPIN_HISTORY: `${BASE_API}/spins/history`,
    VIP_STATUS: `${BASE_API}/vip/status`,
    VIP_PROGRESS: `${BASE_API}/vip/progress`,
    VIP_CATEGORIES: `${BASE_API}/vip/categories`,
    VIP_LIST: `${BASE_API}/vip_user/list`,
    VIP_HISTORY: `${BASE_API}/vip/history`,
    PROMOCODES: `${BASE_API}/promocodes`,

    // Bonus
    BONUS_MY_BONUS: `${BASE_API}/bonus/my-bonus`,
    BONUS_APPLY_PROMO: `${BASE_API}/bonus/apply-promo`,

    // Affiliate
    AFFILIATE_APPLY: `${BASE_API}/affiliate/apply`,
    AFFILIATE_STATUS: `${BASE_API}/affiliate/application-status`,
    AFFILIATE_DASHBOARD: `${BASE_API}/affiliate/dashboard`,
    AFFILIATE_REFERRAL_CODE: `${BASE_API}/affiliate/referral-code`,
    AFFILIATE_STATS: `${BASE_API}/affiliate/stats`,
    AFFILIATE_REFERRALS: `${BASE_API}/affiliate/referrals`,
    AFFILIATE_PLAYERS: `${BASE_API}/affiliate/players`,
    AFFILIATE_EARNINGS: `${BASE_API}/affiliate/earnings`,
    AFFILIATE_SETTLEMENTS: `${BASE_API}/affiliate/settlements`,
    AFFILIATE_COMMISSIONS: `${BASE_API}/affiliate/commissions`,
    AFFILIATE_EARNINGS_BREAKDOWN: `${BASE_API}/affiliate/earnings`,
    AFFILIATE_PLAYER_DETAIL: (playerId: string) => `${BASE_API}/affiliate/player/${playerId}`,

    // Content / CMS
    BLOG_LIST: `${BASE_API}/blogs`,
    BLOG_DETAIL: (slug: string) => `${BASE_API}/blog/${slug}`,
    NEWS_LIST: `${BASE_API}/news`,
    NEWS_DETAIL: (slug: string) => `${BASE_API}/news/${slug}`,
    CMS_PAGE: `${BASE_API}/page`,
    CONTACT_US: `${BASE_API}/contact-us`,
    APP_LINKS: `${BASE_API}/get_app_links`,
    THEME_GET: `${BASE_API}/theme`,
    THEME_UPDATE: `${BASE_API}/theme`,

    // Auth extras
    BECOME_AGENT: `${BASE_API}/become_an_agent`,
    FORGOT_USERNAME: `${BASE_API}/forgot_username`,
} as const;

// Sport ID mapping for /demoapi/betting/sports/{id}/events
// These IDs come from the /demoapi/betting/sports response (Betfair-style IDs).
export const BETTING_SPORT_IDS: Record<string, string> = {
    cricket:        '4',
    football:       '1',
    soccer:         '1',
    tennis:         '2',
    hockey:         '7522',
    'horse-racing': '7',
    election:       '2378961',
};
