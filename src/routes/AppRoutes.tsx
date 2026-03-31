import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Loader from '../components/Common/Loader';
import NotFound from '../components/Common/NotFound';
import MainContent from '../components/MainContent/MainContent';
import Profile from '../components/Profile/Profile';
import MyAccountPage from '../components/Profile/MyAccountPage';
import KycPage from '../components/Profile/KycPage';
import ChangePasswordForm from '../components/Profile/ChangePasswordForm';
import AccountLayout from '../components/Profile/AccountLayout';
import MatchDetails from '../components/MatchDetails/MatchDetails';
import { InPlay } from '../components/InPlay/InPlay';
const CricketPage = lazy(() => import('../components/Cricket/CricketPage'));
const SportEventPage = lazy(() => import('../components/Sport/SportEventPage'));
const CasinoPage = lazy(() => import('../components/Casino/CasinoPage'));
const NotificationPage = lazy(() => import('../components/Notifications/NotificationPage'));
const DepositWithdrawPage = lazy(() => import('../components/Wallet/DepositWithdrawPage'));
const BetHistoryPage = lazy(() => import('../components/BetRecords/BetHistoryPage'));
const UnsettledBetsPage = lazy(() => import('../components/BetRecords/UnsettledBetsPage'));
const ProfitLossPage = lazy(() => import('../components/BetRecords/ProfitLossPage'));
const BetStakeSettingsPage = lazy(() => import('../components/Account/BetStakeSettingsPage'));
const BlogsPage = lazy(() => import('../components/Content/BlogsPage'));
const BlogDetailPage = lazy(() => import('../components/Content/BlogDetailPage'));
const CMSPage = lazy(() => import('../components/Content/CMSPage'));
const NewsPage = lazy(() => import('../components/Content/NewsPage'));
const NewsDetailPage = lazy(() => import('../components/Content/NewsDetailPage'));
const SpinWinPage = lazy(() => import('../components/Gamification/SpinWinPage'));
const DailyRewardsPage = lazy(() => import('../components/Gamification/DailyRewardsPage'));
const VipPage = lazy(() => import('../components/Gamification/VipPage'));
const AffiliateDashboard = lazy(() => import('../components/Affiliate/AffiliateDashboard'));
const AffiliatePlayerDetail = lazy(() => import('../components/Affiliate/AffiliatePlayerDetail'));
const PaymentAccountsPage = lazy(() => import('../components/Account/PaymentAccountsPage'));
const CasinoBetHistoryPage = lazy(() => import('../components/BetRecords/CasinoBetHistoryPage'));
const ContactUsPage = lazy(() => import('../components/Content/ContactUsPage'));
const BonusManagerPage = lazy(() => import('../components/BonusManager/BonusManagerPage'));
const PromotionsPage = lazy(() => import('../components/Promotions/PromotionsPage'));
const DreamCasinoGame = lazy(() => import('../components/LiveCasino/DreamCasinoGame'));
const AuraCasinoGame = lazy(() => import('../components/LiveCasino/AuraCasinoGame'));
const BettingLayout = lazy(() => import('../components/Betting/BettingLayout'));
const BettingHomePage = lazy(() => import('../components/Betting/BettingHomePage'));
const BettingSportPage = lazy(() => import('../components/Betting/BettingSportPage'));
const BettingEventPage = lazy(() => import('../components/Betting/BettingEventPage'));
const BettingMyBetsPage = lazy(() => import('../components/Betting/BettingMyBetsPage'));
const Fallback = () => <Loader fullScreen text="Loading..." />;

const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<Fallback />}>
            <Routes>
                <Route path="/" element={<MainContent />} />
                <Route path="/in-play" element={<InPlay />} />
                <Route path="/betting" element={<BettingLayout />}>
                    <Route index element={<BettingHomePage />} />
                    <Route path="sport/:sportId" element={<BettingSportPage />} />
                    <Route path="event/:eventId" element={<BettingEventPage />} />
                    <Route path="my-bets" element={<BettingMyBetsPage />} />
                </Route>
                <Route path="/match-details/:event_id" element={<MatchDetails />} />
                <Route path="/cricket" element={<CricketPage />} />
                <Route path="/football" element={<SportEventPage sportId="1" sportName="Football" sportIcon="⚽" />} />
                <Route path="/soccer" element={<SportEventPage sportId="1" sportName="Soccer" sportIcon="⚽" />} />
                <Route path="/tennis" element={<SportEventPage sportId="2" sportName="Tennis" sportIcon="🎾" />} />
                <Route path="/hockey" element={<SportEventPage sportId="7522" sportName="Hockey" sportIcon="🏒" />} />
                <Route path="/election" element={<SportEventPage sportId="2378961" sportName="Election Betting" sportIcon="🗳️" />} />
                <Route path="/horse-racing" element={<SportEventPage sportId="7" sportName="Horse Racing" sportIcon="🐎" />} />
                <Route path="/promo" element={<PromotionsPage />} />
                <Route path="/casino" element={<CasinoPage />} />
                <Route path="/dream-casino-game" element={<DreamCasinoGame />} />
                <Route path="/aura-casino-game" element={<AuraCasinoGame />} />
                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
                <Route path="/page/:link" element={<CMSPage />} />
                <Route path="/terms-conditions" element={<CMSPage />} />
                <Route path="/about-us" element={<CMSPage />} />

                {/* Protected My Account Route */}
                <Route element={<PrivateRoute />}>
                    <Route path="/my-account" element={<MyAccountPage />} />
                </Route>

                {/* Protected Account Routes — rendered inside AccountLayout */}
                <Route element={<PrivateRoute />}>
                    <Route element={<AccountLayout />}>
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/kyc" element={<KycPage />} />
                        <Route path="/change-password" element={
                            <div className="p-4 md:p-6">
                                <div className="max-w-md">
                                    <ChangePasswordForm />
                                </div>
                            </div>
                        } />
                        <Route path="/notification" element={<NotificationPage />} />
                        <Route path="/wallet" element={<DepositWithdrawPage />} />
                        <Route path="/deposit" element={<DepositWithdrawPage />} />
                        <Route path="/withdraw" element={<DepositWithdrawPage />} />
                        <Route path="/bet-history" element={<BetHistoryPage />} />
                        <Route path="/unsettled-bets" element={<UnsettledBetsPage />} />
                        <Route path="/profit-loss" element={<ProfitLossPage />} />
                        <Route path="/bet-stake-setting" element={<BetStakeSettingsPage />} />
                        <Route path="/spin-win" element={<SpinWinPage />} />
                        <Route path="/daily-rewards" element={<DailyRewardsPage />} />
                        <Route path="/my-vip" element={<VipPage />} />
                        <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />
                        <Route path="/affiliate/referrals" element={<AffiliateDashboard />} />
                        <Route path="/affiliate/players" element={<AffiliateDashboard />} />
                        <Route path="/affiliate/player/:id" element={<AffiliatePlayerDetail />} />
                        <Route path="/affiliate/commissions" element={<AffiliateDashboard />} />
                        <Route path="/affiliate/earnings" element={<AffiliateDashboard />} />
                        <Route path="/affiliate/settlements" element={<AffiliateDashboard />} />
                        <Route path="/payment-accounts" element={<PaymentAccountsPage />} />
                        <Route path="/casino-bet-history" element={<CasinoBetHistoryPage />} />
                        <Route path="/contact-us" element={<ContactUsPage />} />
                        <Route path="/bonus-manager" element={<BonusManagerPage />} />
                    </Route>
                </Route>

                {/* Catch All */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
