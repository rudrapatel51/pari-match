import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiLogOut,
  FiGift,
  FiPhone,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { BiMoneyWithdraw, BiSolidStar } from "react-icons/bi";
import { MdAccountBalanceWallet, MdHistory } from "react-icons/md";
import { useAuth } from "../../hooks/useAuth";
import { useBalance } from "../../hooks/useBalance";

const fmt = (n: number) =>
  `${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface AccountMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const MyAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mainBalance, bonusBalance, isLoading: balanceLoading } = useBalance();

  const menuItems: AccountMenuItem[] = [
    {
      id: "support",
      label: "Contact Support",
      icon: <FiPhone className="w-5 h-5" />,
      path: "/contact-us",
    },
    {
      id: "offers",
      label: "Special Offers",
      icon: <FiGift className="w-5 h-5" />,
      path: "/promotions",
    },
    {
      id: "data",
      label: "Personal Data",
      icon: <FiUser className="w-5 h-5" />,
      path: "/profile",
    },
    {
      id: "history",
      label: "Payments History",
      icon: <MdHistory className="w-5 h-5" />,
      path: "/bet-history",
    },
    {
      id: "bets",
      label: "My Bets",
      icon: <MdHistory className="w-5 h-5" />,
      path: "/my-bets",
    },
  ];

  const settingsItems: AccountMenuItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings className="w-5 h-5" />,
      path: "/bet-stake-setting",
    },
    {
      id: "help",
      label: "Help and information",
      icon: <FiHelpCircle className="w-5 h-5" />,
      path: "/contact-us",
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-black min-h-screen w-full pt-20 pb-8">
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* User ID Section */}
        <div className="bg-bg-card border border-stroke-light rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-gray-400 uppercase tracking-wide">
              ID
            </span>
            <span className="text-2xl font-bold text-brand-text">
              {user?.user_id || user?.id || "-"}
            </span>
          </div>
        </div>

        {/* Loyalty Hub Section */}
        <button
          onClick={() => handleMenuClick("/my-vip")}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-primary/70 border border-accent-yellow/30 rounded-lg p-4 mb-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BiSolidStar className="w-6 h-6 text-accent-yellow" />
              <span className="text-base font-bold text-white">
                Loyalty Hub
              </span>
            </div>
            <IoIosArrowForward className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Player Balance Section - Compact */}
        <div className="bg-bg-card border border-stroke-light rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MdAccountBalanceWallet className="w-6 h-6 text-accent-yellow" />
              <div>
                <span className="text-sm font-semibold text-neutral-gray-400 uppercase tracking-wide block">
                  Player balance
                </span>
                <span className="text-2xl font-bold text-brand-text">
                  {balanceLoading ? "..." : `${fmt(mainBalance)} INR`}
                </span>
              </div>
            </div>
            <IoIosArrowForward className="w-5 h-5 text-neutral-gray-500" />
          </div>
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => handleMenuClick("/deposit")}
              className="bg-accent-green hover:bg-accent-green/90 text-black font-bold py-2 px-5 rounded text-sm transition-colors whitespace-nowrap"
            >
              + Deposit
            </button>
            <button
              onClick={() => handleMenuClick("/withdraw")}
              className="bg-bg-secondary hover:bg-bg-secondary/80 text-neutral-gray-300 font-bold py-2 px-5 rounded text-sm transition-colors whitespace-nowrap"
            >
              Withdrawal
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-2 mb-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className="w-full bg-bg-card border border-stroke-light rounded-lg px-4 py-3 flex items-center justify-between hover:bg-bg-card/80 hover:border-brand-text transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-accent-yellow text-lg">{item.icon}</span>
                <span className="text-base font-medium text-white">
                  {item.label}
                </span>
              </div>
              <IoIosArrowForward className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray-500" />
            </button>
          ))}
        </div>

        {/* Personalization Section */}
        <div className="pt-6 border-t border-stroke-light">
          <h3 className="text-sm font-bold text-brand-text uppercase tracking-wide mb-3">
            Personalization
          </h3>
          <div className="space-y-2">
            {settingsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className="w-full bg-bg-card border border-stroke-light rounded-lg px-4 py-3 flex items-center justify-between hover:bg-bg-card/80 hover:border-brand-text transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-accent-yellow text-lg">
                    {item.icon}
                  </span>
                  <span className="text-base font-medium text-white">
                    {item.label}
                  </span>
                </div>
                <IoIosArrowForward className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray-500" />
              </button>
            ))}

            {/* Logout as menu item */}
            <button
              onClick={handleLogout}
              className="w-full bg-bg-card border border-stroke-light rounded-lg px-4 py-3 flex items-center justify-between hover:bg-bg-card/80 hover:border-accent-red transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-accent-red text-lg">
                  <FiLogOut className="w-5 h-5" />
                </span>
                <span className="text-base font-medium text-white">
                  Log out
                </span>
              </div>
              <IoIosArrowForward className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
