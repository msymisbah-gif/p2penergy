import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSolarPanel, FaBolt, FaWallet, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';

function StatCard({ icon: Icon, label, value, unit, color = 'solar' }) {
  const colorMap = {
    solar:  'text-solar-400  bg-solar-500/10  border-solar-500/20',
    green:  'text-green-400  bg-green-500/10  border-green-500/20',
    blue:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
    red:    'text-red-400    bg-red-500/10    border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="text-lg" />
      </div>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        {value}
        {unit && <span className="text-sm text-gray-500 font-normal mr-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { homeData } = useAuth();

  if (!homeData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">لا توجد بيانات للمنزل. تواصل مع المسؤول.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          مرحباً، <span className="text-gradient">{homeData.name}</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          لوحة تحكم نظام تداول الطاقة الشمسية • جامعة أجدابيا
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={FaBolt}
          label="رصيد kWh"
          value={(homeData.balance ?? 0).toFixed(1)}
          unit="كيلوواط"
          color="solar"
        />
        <StatCard
          icon={FaWallet}
          label="المحفظة"
          value={(homeData.walletBalance ?? 0).toFixed(2)}
          unit="د.ل"
          color="green"
        />
        <StatCard
          icon={FaSolarPanel}
          label="إجمالي الإنتاج"
          value={(homeData.totalProduced ?? 0).toFixed(1)}
          unit="kWh"
          color="solar"
        />
        <StatCard
          icon={FaArrowUp}
          label="إجمالي المباع"
          value={(homeData.totalSold ?? 0).toFixed(1)}
          unit="kWh"
          color="blue"
        />
        <StatCard
          icon={FaArrowDown}
          label="إجمالي المشترى"
          value={(homeData.totalPurchased ?? 0).toFixed(1)}
          unit="kWh"
          color="purple"
        />
      </div>

      {/* Activity placeholder */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FaChartLine className="text-solar-400" />
          <h2 className="text-lg font-semibold text-white">نشاط الشبكة</h2>
        </div>
        <div className="flex items-center justify-center h-48 border border-dashed border-dark-700 rounded-xl">
          <p className="text-gray-600 text-sm">الرسوم البيانية ستُضاف في الجلسة القادمة</p>
        </div>
      </div>
    </div>
  );
}
