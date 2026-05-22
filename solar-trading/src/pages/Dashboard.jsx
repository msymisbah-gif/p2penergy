import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsCard          from '../components/StatsCard';
import EnergyChart        from '../components/EnergyChart';
import RecentTransactions from '../components/RecentTransactions';
import {
  FaBolt, FaSolarPanel, FaArrowUp, FaArrowDown,
  FaSun, FaMoon, FaWallet,
} from 'react-icons/fa';

function useGreeting() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  if (h >= 5 && h < 12)  return { text: 'صباح الخير',  Icon: FaSun,  cls: 'text-solar-400' };
  if (h >= 12 && h < 17) return { text: 'مساء النور',  Icon: FaSun,  cls: 'text-amber-400' };
  if (h >= 17 && h < 21) return { text: 'مساء الخير',  Icon: FaSun,  cls: 'text-orange-400' };
  return                        { text: 'مساء النور',  Icon: FaMoon, cls: 'text-blue-400' };
}

export default function Dashboard() {
  const { homeData } = useAuth();
  const greeting = useGreeting();

  if (!homeData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-400 mb-2">لم يتم العثور على بيانات المنزل.</p>
        <p className="text-gray-600 text-xs">تواصل مع مسؤول النظام لإنشاء حسابك.</p>
      </div>
    );
  }

  const balance        = homeData.balance        ?? 0;
  const walletBalance  = homeData.walletBalance  ?? 0;
  const totalProduced  = homeData.totalProduced  ?? 0;
  const totalSold      = homeData.totalSold      ?? 0;
  const totalPurchased = homeData.totalPurchased ?? 0;
  const netExport      = totalSold - totalPurchased;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-dark-700 bg-gradient-to-l from-dark-800 via-dark-850 to-dark-900 p-6">
        <div className="absolute -left-16 -top-16 w-56 h-56 rounded-full bg-solar-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <greeting.Icon className={`${greeting.cls} text-lg animate-pulse-glow`} />
              <span className={`text-sm font-semibold ${greeting.cls}`}>{greeting.text}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              أهلاً بك في <span className="text-gradient">{homeData.name}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              لوحة تحكم تداول الطاقة الشمسية • جامعة أجدابيا
            </p>
          </div>

          <div className="flex items-center gap-3 bg-dark-900/60 backdrop-blur-xl border border-solar-500/20 rounded-2xl px-5 py-3">
            <FaWallet className="text-solar-400 text-xl" />
            <div>
              <p className="text-xs text-gray-500">رصيد المحفظة</p>
              <p className="text-lg font-bold text-white tabular-nums">
                {walletBalance.toFixed(2)}
                <span className="text-xs text-gray-500 mr-1 font-normal">د.ل</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FaBolt}
          label="الرصيد الحالي"
          value={balance.toFixed(1)}
          unit="kWh"
          color="solar"
          subtitle="رصيد الطاقة المتاح للبيع"
        />
        <StatsCard
          icon={FaSolarPanel}
          label="إجمالي الإنتاج"
          value={totalProduced.toFixed(1)}
          unit="kWh"
          color="green"
          trend="up"
          subtitle="منذ انضمامك للشبكة"
        />
        <StatsCard
          icon={FaArrowUp}
          label="إجمالي المبيعات"
          value={totalSold.toFixed(1)}
          unit="kWh"
          color="blue"
          trend={netExport >= 0 ? 'up' : 'neutral'}
          trendValue={netExport >= 0 ? `+${netExport.toFixed(0)}` : null}
          subtitle="الطاقة المباعة للجيران"
        />
        <StatsCard
          icon={FaArrowDown}
          label="إجمالي المشتريات"
          value={totalPurchased.toFixed(1)}
          unit="kWh"
          color="purple"
          trend={netExport < 0 ? 'down' : 'neutral'}
          subtitle="الطاقة المشتراة من الجيران"
        />
      </div>

      {/* Chart — full width */}
      <EnergyChart />

      {/* Transactions */}
      <RecentTransactions />
    </div>
  );
}
