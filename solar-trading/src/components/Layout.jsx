import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaSolarPanel, FaTachometerAlt, FaArrowUp, FaArrowDown,
  FaHistory, FaUser, FaSignOutAlt, FaBars, FaTimes,
  FaBolt, FaWallet,
} from 'react-icons/fa';

const NAV_ITEMS = [
  { to: '/dashboard', icon: FaTachometerAlt, label: 'لوحة التحكم' },
  { to: '/sell',      icon: FaArrowUp,       label: 'بيع الطاقة' },
  { to: '/buy',       icon: FaArrowDown,     label: 'شراء الطاقة' },
  { to: '/history',   icon: FaHistory,       label: 'سجل المعاملات' },
  { to: '/profile',   icon: FaUser,          label: 'الملف الشخصي' },
];

export default function Layout() {
  const { homeData, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-solar-500/20 border border-solar-500/30 flex items-center justify-center flex-shrink-0">
            <FaSolarPanel className="text-solar-400 text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">نظام تداول الطاقة</p>
            <p className="text-sm font-bold text-solar-400 truncate">الشمسية P2P</p>
          </div>
        </div>
      </div>

      {/* Home Info */}
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
                <span className="text-xs text-gray-400">رصيد kWh</span>
              </div>
              <p className="text-sm font-bold text-white">
                {(homeData.balance ?? 0).toFixed(1)}
              </p>
            </div>
            <div className="bg-dark-800 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <FaWallet className="text-xs" />
                <span className="text-xs text-gray-400">المحفظة</span>
              </div>
              <p className="text-sm font-bold text-white">
                {(homeData.walletBalance ?? 0).toFixed(2)}
                <span className="text-xs text-gray-500 mr-0.5">د.ل</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon className="text-base flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-dark-700">
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <FaSignOutAlt className="text-base flex-shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-800 border-l border-dark-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-dark-800 border-l border-dark-700 flex flex-col mr-auto">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white p-2"
            >
              <FaTimes />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <FaSolarPanel className="text-solar-400" />
            <span className="text-sm font-bold text-solar-400">تداول الطاقة</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white p-1"
          >
            <FaBars className="text-xl" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
