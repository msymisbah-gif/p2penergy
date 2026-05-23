import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  FaShieldAlt, FaHome, FaBolt, FaWallet, FaSpinner,
} from 'react-icons/fa';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatLYD, formatKwh, getAvatarColor, getInitial } from '../utils/format';

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`text-sm ${color}`} />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { homeData } = useAuth();
  const navigate = useNavigate();
  const [homes, setHomes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (homeData && !homeData.isAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!homeData) return;

    getDocs(collection(db, 'homes'))
      .then((snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.joinedAt?.toMillis?.() ?? 0) - (b.joinedAt?.toMillis?.() ?? 0));
        setHomes(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [homeData, navigate]);

  if (!homeData?.isAdmin) return null;

  const totalHomes   = homes.length;
  const totalWallet  = homes.reduce((s, h) => s + (h.walletBalance  ?? 0), 0);
  const totalEnergy  = homes.reduce((s, h) => s + (h.totalProduced  ?? 0), 0);
  const totalSold    = homes.reduce((s, h) => s + (h.totalSold      ?? 0), 0);
  const activeHomes  = homes.filter((h) => h.isActive).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <FaShieldAlt className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة الإدارة</h1>
          <p className="text-gray-500 text-sm">نظرة شاملة على جميع المنازل في الشبكة</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
          <FaSpinner className="animate-spin text-xl" />
          <span>جارٍ تحميل البيانات...</span>
        </div>
      ) : error ? (
        <div className="card border-red-500/20 text-red-400 text-sm text-center py-6">{error}</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard icon={FaHome}      label="إجمالي المنازل"  value={totalHomes}              color="text-solar-400" />
            <SummaryCard icon={FaHome}      label="المنازل النشطة"  value={`${activeHomes} / ${totalHomes}`} color="text-green-400" />
            <SummaryCard icon={FaBolt}      label="إجمالي الإنتاج"  value={formatKwh(totalEnergy)}  color="text-blue-400"  />
            <SummaryCard icon={FaWallet}    label="إجمالي المحافظ"  value={formatLYD(totalWallet)}  color="text-amber-400" />
          </div>

          {/* Secondary summary */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-3">ملخص التداول</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="إجمالي الطاقة المباعة"    value={formatKwh(totalSold)}   color="text-green-400" />
              <StatBox label="إجمالي الطاقة المشتراة"   value={formatKwh(homes.reduce((s, h) => s + (h.totalPurchased ?? 0), 0))} color="text-purple-400" />
              <StatBox label="إجمالي الطاقة المستهلكة"  value={formatKwh(homes.reduce((s, h) => s + (h.totalConsumed ?? 0), 0))}  color="text-red-400" />
            </div>
          </div>

          {/* Homes list */}
          <div className="card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">قائمة المنازل</h2>
              <span className="text-xs text-gray-500">{totalHomes} منازل</span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 text-gray-400 text-right bg-dark-900/50">
                    <th className="px-5 py-3 font-medium">المنزل</th>
                    <th className="px-4 py-3 font-medium">رصيد kWh</th>
                    <th className="px-4 py-3 font-medium">المحفظة</th>
                    <th className="px-4 py-3 font-medium">المباع</th>
                    <th className="px-4 py-3 font-medium">المشترى</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {homes.map((h) => (
                    <tr
                      key={h.id}
                      className={`border-b border-dark-700/50 transition-colors
                        ${h.isAdmin ? 'bg-purple-500/5' : 'hover:bg-dark-700/30'}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: getAvatarColor(h.name ?? '') }}
                          >
                            {getInitial(h.name ?? '')}
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-1.5">
                              {h.name}
                              {h.isAdmin && (
                                <FaShieldAlt className="text-purple-400 text-[10px]" title="مدير النظام" />
                              )}
                            </p>
                            <p className="text-gray-500 text-xs" dir="ltr">{h.ownerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-solar-400 tabular-nums font-bold">
                        {formatKwh(h.balance)}
                      </td>
                      <td className="px-4 py-3 text-amber-400 tabular-nums font-bold">
                        {formatLYD(h.walletBalance)}
                      </td>
                      <td className="px-4 py-3 text-green-400 tabular-nums">
                        {formatKwh(h.totalSold)}
                      </td>
                      <td className="px-4 py-3 text-purple-400 tabular-nums">
                        {formatKwh(h.totalPurchased)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                          ${h.isActive
                            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                          {h.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-dark-700">
              {homes.map((h) => (
                <div
                  key={h.id}
                  className={`p-4 ${h.isAdmin ? 'bg-purple-500/5' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(h.name ?? '') }}
                    >
                      {getInitial(h.name ?? '')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                        {h.name}
                        {h.isAdmin && <FaShieldAlt className="text-purple-400 text-[10px]" />}
                      </p>
                      <p className="text-gray-500 text-xs truncate" dir="ltr">{h.ownerEmail}</p>
                    </div>
                    <span className={`mr-auto text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                      ${h.isActive
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-red-500/15 text-red-400'}`}>
                      {h.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <MobileStat label="رصيد الطاقة" value={formatKwh(h.balance)}       color="text-solar-400" />
                    <MobileStat label="المحفظة"     value={formatLYD(h.walletBalance)} color="text-amber-400" />
                    <MobileStat label="المباع"       value={formatKwh(h.totalSold)}     color="text-green-400" />
                    <MobileStat label="المشترى"      value={formatKwh(h.totalPurchased)} color="text-purple-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function MobileStat({ label, value, color }) {
  return (
    <div className="bg-dark-900 rounded-lg p-2 text-center">
      <p className="text-gray-500 text-[11px] mb-0.5">{label}</p>
      <p className={`font-bold tabular-nums text-sm ${color}`}>{value}</p>
    </div>
  );
}
