// ── Application status ────────────────────────────────────────────────────────
export interface AffiliateApplicationStatus {
    success: boolean;
    is_affiliate: boolean;
    affiliate_status: 'pending' | 'active' | 'rejected' | 'blocked' | 'deleted' | null;
    affiliate_type?: string;
    affiliate_approved_at?: string | null;
    referral_code?: string | null;
    referral_link?: string | null;
    message?: string;
}

// ── Stats (GET /affiliate/stats → res.stats) ──────────────────────────────────
export interface AffiliateStats {
    _id?: string;
    affiliate_id?: string;
    total_referrals: number;
    active_players: number;
    total_commission_earned: number;
    pending_commission: number;
    settled_commission: number;
    last_updated?: string;
}

// ── Dashboard (GET /affiliate/dashboard → res.dashboard) ─────────────────────
export interface AffiliateDashboardStats {
    total_referrals: number;
    active_players: number;
    total_earnings: number;
    pending_commission: number;
    settled_commission: number;
    this_month_earnings: number;
}

export interface AffiliateDashboard {
    stats: AffiliateDashboardStats;
    referral_code: string;
    referral_link: string;
    recent_commissions: Commission[];
}

// ── Commission ────────────────────────────────────────────────────────────────
export interface Commission {
    _id: string;
    affiliate_id?: string;
    player_id: { _id: string; username: string } | null;
    commission_type: 'deposit' | 'loss' | 'profit';
    commission_amount: number;      // API field name (NOT "amount")
    commission_percentage: number;
    trigger_amount: number;
    trigger_event: string;
    status: 'pending' | 'settled' | 'cancelled';
    franchise_id?: string | null;
    settlement_id?: string | null;
    createdAt: string;
}

// ── Referral ──────────────────────────────────────────────────────────────────
export interface Referral {
    _id: string;
    name: string;
    username: string;
    private_mode: number; // 0 or 1
    status: number; // 0 = inactive, 1 = active
    depositCount: number;
    totalDeposits: number;
    totalWithdrawals: number;
    commission_earned: number;
    createdAt: string;
}
// ── Active player ─────────────────────────────────────────────────────────────
export interface ActivePlayer {
    _id: string;
    name: string;
    username: string;
    private_mode: 0 | 1;
    status: 0 | 1;
    depositCount: number;
    totalDeposits: number;
    totalWithdrawals: number;
    commission_earned: number;
    createdAt: string; // ISO date string
}

// ── Player detail (GET /affiliate/player/:id) ─────────────────────────────────
export interface PlayerDetail {
    success?: boolean;
    player: {
        _id: string;
        username: string;
        email: string;
        mobile?: string;
        status: number;
        depositCount: number;
        totalDeposit: number;
        totalWithdrawal: number;
        total_loss: number;
        createdAt: string;
    };
    commission_summary: {
        total_earned_from_player: number;
        pending: number;
        settled: number;
    };
}

// ── Earnings breakdown (POST /affiliate/earnings) ─────────────────────────────
export interface CommissionTypeStats {
    count: number;
    total: number;
    pending: number;
    settled: number;
}

export interface EarningsBreakdown {
    success?: boolean;
    breakdown: {
        deposit: CommissionTypeStats;
        loss: CommissionTypeStats;
        profit: CommissionTypeStats;
    };
    total_earnings: number;
    total_pending: number;
    total_settled: number;
}

// ── Paginated list wrappers ───────────────────────────────────────────────────
export interface PaginatedReferrals {
    success: boolean;
    referrals: Referral[];
    totalRows: number;
    page: number;
    perpage: number;
    totalPages: number;
}

export interface PaginatedCommissions {
    success: boolean;
    commissions: Commission[];
    totalRows: number;
    page: number;
    perpage: number;
}

export interface PaginatedPlayers {
    success: boolean;
    players: ActivePlayer[];
    totalRows: number;
    page: number;
    perpage: number;
}
