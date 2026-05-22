import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, updateDoc, setDoc, increment, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  FaUser, FaEnvelope, FaCalendarAlt, FaCheckCircle,
  FaSolarPanel, FaCog, FaSignOutAlt, FaSpinner, FaBolt,
  FaSun, FaChartLine, FaFlask,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { simulateDay, SOLAR_CONSTANTS } from '../services/productionService';
import { formatLYD, formatKwh, formatDate } from '../utils/format';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0">
      <span className="text-white font-medium text-sm">{value}</span>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-sm">{label}</span>
        <Icon className="text-solar-400 text-xs" />
      </div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-dark-700 last:border-0">
      <span className="text-white font-bold tabular-nums text-sm">{value}</span>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
  );
}

export default function Profile() {
  const { currentUser, homeData, signOut } = useAuth();
  const navigate = useNavigate();
  const [simulating, setSimulating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState(null);

  if (!homeData) return null;

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4500);
  }

  /**
   * "محاكاة إنتاج اليوم" — runs the solar production model, writes
   * a dailyStats document, and atomically updates the home balance.
   */
  async function handleSimulateProduction() {
    setSimulating(true);
    try {
      const today  = new Date();
      const { production, consumption, surplus } = simulateDay(today);

      const dateId = today.toISOString().slice(0, 10); // YYYY-MM-DD

      // 1) Write daily stats (one doc per day, overwrites on re-run)
      const statsRef = doc(db, 'homes', currentUser.uid, 'dailyStats', dateId);
      await setDoc(statsRef, {
        date:        Timestamp.fromDate(today),
        production,
        consumption,
        surplus,
        simulatedAt: serverTimestamp(),
      });

      // 2) Update home aggregates
      const homeRef = doc(db, 'homes', currentUser.uid);
      await updateDoc(homeRef, {
        balance:        increment(surplus),
        totalProduced:  increment(production),
        totalConsumed:  increment(consumption),
        lastSimulation: serverTimestamp(),
      });

      showToast(
        `تمت المحاكاة بنجاح! إنتاج: ${formatKwh(production)} • استهلاك: ${formatKwh(consumption)} • فائض: ${formatKwh(surplus)}`,
      );
    } catch (err) {
      showToast(err.message || 'فشلت المحاكاة. حاول مجدداً.', true);
    } finally {
      setSimulating(false);
    }
  }

  /**
   * FR-16 — Secure logout via Firebase Auth.
   */
  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      showToast(err.message || 'فشل تسجيل الخروج.', true);
      setSigningOut(false);
    }
  }

  const joinedAt = homeData.joinedAt ? formatDate(homeData.joinedAt) : '—';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
          <FaUser className="text-solar-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">الملف الشخصي</h1>
          <p className="text-gray-500 text-sm">بيانات المنزل ومحاكاة الإنتاج</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-1">معلومات الحساب</h2>
        <p className="text-xs text-gray-500 mb-4">البيانات الأساسية لمنزلك في الشبكة</p>
        <div className="divide-y divide-dark-700">
          <InfoRow icon={FaUser}        label="اسم المنزل"        value={homeData.name} />
          <InfoRow icon={FaEnvelope}    label="البريد الإلكتروني" value={currentUser?.email ?? '—'} />
          <InfoRow icon={FaCalendarAlt} label="تاريخ الانضمام"   value={joinedAt} />
          <InfoRow
            icon={FaCheckCircle}
            label="حالة الحساب"
            value={
              <span className={homeData.isActive ? 'text-green-400' : 'text-red-400'}>
                {homeData.isActive ? 'نشط ✓' : 'غير نشط'}
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-1">إحصائيات المنزل</h2>
        <p className="text-xs text-gray-500 mb-4">ملخص نشاطك في الشبكة</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { Icon: FaBolt,        label: 'الرصيد الحالي', value: formatKwh(homeData.balance),        color: 'text-solar-400' },
            { Icon: FaSolarPanel,  label: 'إجمالي الإنتاج', value: formatKwh(homeData.totalProduced), color: 'text-green-400' },
            { Icon: FaChartLine,   label: 'إجمالي الاستهلاك', value: formatKwh(homeData.totalConsumed), color: 'text-red-400' },
            { Icon: FaSolarPanel,  label: 'إجمالي المباع',   value: formatKwh(homeData.totalSold),     color: 'text-blue-400' },
            { Icon: FaSolarPanel,  label: 'إجمالي المشترى',  value: formatKwh(homeData.totalPurchased), color: 'text-purple-400' },
            { Icon: FaSun,         label: 'رصيد المحفظة',    value: formatLYD(homeData.walletBalance), color: 'text-amber-400' },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="bg-dark-900 border border-dark-700 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`text-xs ${color}`} />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className="text-white font-bold text-sm tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Specs */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <FaCog className="text-solar-400" />
          <h2 className="text-lg font-semibold text-white">المواصفات التقنية</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">نظام الطاقة الشمسية المركّب على السطح</p>
        <div>
          <SpecRow label="القدرة الذروية (P_peak)" value={`${SOLAR_CONSTANTS.P_PEAK.toFixed(1)} kWp`} />
          <SpecRow label="كفاءة النظام (η)"        value={`${(SOLAR_CONSTANTS.ETA * 100).toFixed(0)}%`} />
          <SpecRow label="الإشعاع المرجعي (I_STC)" value={`${SOLAR_CONSTANTS.I_STC.toFixed(1)} kW/m²`} />
          <SpecRow label="الموقع الجغرافي" value="أجدابيا، ليبيا" />
        </div>
      </div>

      {/* Simulate Production */}
      <div className="card border-solar-500/30 bg-gradient-to-br from-dark-800 to-solar-500/5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center flex-shrink-0">
            <FaFlask className="text-solar-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">محاكاة الإنتاج</h2>
            <p className="text-xs text-gray-500 mt-1">
              تشغيل النموذج الرياضي لحساب إنتاج اليوم وإضافة الفائض إلى رصيدك.
            </p>
          </div>
        </div>
        <button
          onClick={handleSimulateProduction}
          disabled={simulating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {simulating
            ? <><FaSpinner className="animate-spin" /><span>جارٍ المحاكاة...</span></>
            : <><FaSun /><span>محاكاة إنتاج اليوم</span></>}
        </button>
      </div>

      {/* FR-16 Secure Logout */}
      <div className="card border-red-500/20">
        <h2 className="text-lg font-semibold text-white mb-1">تسجيل الخروج</h2>
        <p className="text-xs text-gray-500 mb-4">إنهاء الجلسة الحالية بأمان عبر Firebase Auth.</p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30
                     text-red-400 hover:text-red-300 font-semibold py-2.5 px-5 rounded-xl
                     transition-all duration-200 active:scale-95 flex items-center justify-center gap-2
                     disabled:opacity-50"
        >
          {signingOut
            ? <><FaSpinner className="animate-spin" /><span>جارٍ الخروج...</span></>
            : <><FaSignOutAlt /><span>تسجيل الخروج</span></>}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl
                         border backdrop-blur-xl text-sm font-medium max-w-md text-center
                         ${toast.isError
                           ? 'bg-red-500/20 border-red-500/40 text-red-200'
                           : 'bg-green-500/20 border-green-500/40 text-green-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
