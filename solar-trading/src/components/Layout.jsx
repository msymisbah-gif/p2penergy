import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaSolarPanel, FaTachometerAlt, FaArrowUp, FaArrowDown,
  FaHistory, FaUser, FaSignOutAlt, FaBolt, FaWallet,
} from 'react-icons/fa';
import { formatLYD, formatKwh } from '../utils/format';

const NAV_ITEMS = [
  { to: '/dashboard', icon: FaTachometerAlt, label: 'الرئيسية',   short: 'الرئيسية'  },
  { to: '/sell',      icon: FaArrowUp,       label: 'بيع الطاقة',  short: 'بيع'       },
  { to: '/buy',       icon: FaArrowDown,     label: 'شراء الطاقة', short: 'شراء'      },
  { to: '/history',   icon: FaHistory,       label: 'سجل المعاملات', short: 'السجل'   },
  { to: '/profile',   icon: FaUser,          label: 'الملف الشخصي', short: 'الملف'    },
];

export default function Layout() {
  const { homeData, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-dark-950 overflow-hidden">
      {/* ============== Desktop Sidebar (≥ lg) ============== */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-800 border-l border-dark-700 flex-shrink-0">
        <div className="p-5 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-solar-500/20 border border-solar-500/30 flex items-center justify-center">
              <FaSolarPanel className="text-solar-400 text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">نظام تداول الطاقة</p>
              <p className="text-sm font-bold text-solar-400 truncate">الشمسية P2P</p>
            </div>
          </div>
        </div>

        {homeData && (
          <div className="mx-4 mt-4 p-4 bg-dark-900 rounded-xl border border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <FaUser className="text-solar-400 text-xs flex-shrink-0" />
              <span className="text-white font-semibold text-sm truncate">{homeData.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-800 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-solar-400 mb-1">
                  <FaBolt className="text-xs" />
                  <span className="text-xs text-gray-400">رصيد</span>
                </div>
                <p className="text-sm font-bold text-white tabular-nums">{formatKwh(homeData.balance)}</p>
              </div>
              <div className="bg-dark-800 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                  <FaWallet className="text-xs" />
                  <span className="text-xs text-gray-400">المحفظة</span>
                </div>
                <p className="text-sm font-bold text-white tabular-nums">{formatLYD(homeData.walletBalance)}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon className="text-base flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <button
            onClick={handleSignOut}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <FaSignOutAlt className="text-base flex-shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ============== Mobile Top Bar (< lg) ============== */}
      <header className="lg:hidden flex items-center justify-between gap-2 px-3 py-2.5 bg-dark-800 border-b border-dark-700 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <div className="w-8 h-8 rounded-lg bg-solar-500/20 border border-solar-500/30 flex items-center justify-center flex-shrink-0">
            <FaSolarPanel className="text-solar-400 text-sm" />
          </div>
          <span className="text-xs font-bold text-white truncate">{homeData?.name ?? 'تداول الطاقة'}</span>
        </div>

        {homeData && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 bg-dark-900 border border-solar-500/20 rounded-lg px-2 py-1">
              <FaBolt className="text-solar-400 text-[10px]" />
              <span className="text-[11px] font-bold text-white tabular-nums">
                {(homeData.balance ?? 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-dark-900 border border-green-500/20 rounded-lg px-2 py-1">
              <FaWallet className="text-green-400 text-[10px]" />
              <span className="text-[11px] font-bold text-white tabular-nums">
                {(homeData.walletBalance ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ============== Page Content ============== */}
      <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-0">
        <div className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* ============== Mobile Bottom Nav (< lg) ============== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                      bg-dark-800/95 backdrop-blur-xl border-t border-dark-700
                      pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 px-1 py-1.5">
          {NAV_ITEMS.map(({ to, icon: Icon, short }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1.5 mx-0.5 rounded-lg transition-all
                 ${isActive
                    ? 'text-solar-400 bg-solar-500/10'
                    : 'text-gray-500 active:text-solar-400 active:bg-dark-700/50'}`
              }
            >
              <Icon className="text-lg" />
              <span className="text-[10px] font-medium leading-none">{short}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
