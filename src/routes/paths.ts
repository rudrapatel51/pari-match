export const Paths = {
    HOME: '/',
    SLOTS: '/slots',
    LOGIN: '/login',
    REGISTER: '/signup',

    // Dashboard / User
    PROFILE: '/profile',
    CHANGE_PASSWORD: '/change-password',
    NOTIFICATIONS: '/notification',
    WALLET: '/wallet',
    DEPOSIT: '/deposit',
    WITHDRAW: '/withdraw',
    BET_HISTORY: '/bet-history',
    UNSETTLED_BETS: '/unsettled-bets',
    PROFIT_LOSS: '/profit-loss',
    BET_STAKE_SETTING: '/bet-stake-setting',
    CASINO_BET_HISTORY: '/casino-bet-history',
    TRANSACTION_HISTORY: '/transaction-history',
    PAYMENT_ACCOUNTS: '/payment-accounts',
    BONUS_MANAGER: '/bonus-manager',

    // Sports
    IN_PLAY: '/in-play',
    CRICKET: '/cricket',
    SOCCER: '/soccer',
    TENNIS: '/tennis',
    HOCKEY: '/hockey',
    ELECTION: '/election',
    HORSE_RACING: '/horse-racing',
    MATCH_DETAILS: '/match-details/:event_id',
    FAVOURITES: '/favourites',

    // Casino
    CASINO: '/casino',
    CASINO_GAME: '/casino/play/:id',
    DREAM_CASINO: '/dream-casino',
    AURA_CASINO: '/aura-casino',

    // Gamification
    SPIN_WIN: '/spin-win',
    DAILY_REWARDS: '/daily-rewards',
    MY_VIP: '/my-vip',

    // Private Bet
    PRIVATE_BET: '/private-bet',
    CREATE_CONTEST: '/private-bet/create-contest',
    JOIN_GROUP: '/join-group/:id',

    // Affiliate
    AFFILIATE_DASHBOARD: '/affiliate/dashboard',
    AFFILIATE_REFERRALS: '/affiliate/referrals',
    AFFILIATE_EARNINGS: '/affiliate/earnings',
    AFFILIATE_PLAYERS: '/affiliate/players',
    AFFILIATE_SETTLEMENTS: '/affiliate/settlements',

    // Promotions
    PROMOTIONS: '/promo',

    // Content
    BLOGS: '/blogs',
    BLOG_DETAIL: '/blog/:slug',
    NEWS: '/news',
    NEWS_DETAIL: '/news/:slug',
    CMS_PAGE: '/page/:link',
    CONTACT_US: '/contact-us',

    // Static
    TERMS: '/terms-conditions',
    ABOUT: '/about-us',
} as const;
