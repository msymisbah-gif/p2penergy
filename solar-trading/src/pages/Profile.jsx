import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  doc, updateDoc, setDoc, increment, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  FaUser, FaEnvelope, FaCalendarAlt, FaCheckCircle,
  FaSolarPanel, FaCog, FaSignOutAlt, FaSpinner, FaBolt,
  FaSun, FaChartLine, FaFlask, FaPhone, FaTachometerAlt,
  FaEdit, FaSave, FaTimes, FaWallet, FaPlus, FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { simulateDay, SOLAR_CONSTANTS } from '../services/productionService';
import { updateHomeProfile, topUpWallet } from '../services/homeService';
import { isValidLibyanMobile } from '../utils/meter';
import { formatLYD, formatKwh, formatDate, getAvatarColor, getInitial } from '../utils/format';

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

  // Edit-profile state
  // Edit-profile state
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', meterRef: '' });

  // Wallet top-up state
  const QUICK_AMOUNTS = [50, 100, 200, 500];
  const [selectedAmt, setSelectedAmt]   = useState(null);
  const [customAmt, setCustomAmt]       = useState('');
  const [topping, setTopping]           = useState(false);

  if (!homeData) return null;

  function startEditing() {
    setForm({
      name:     homeData.name     ?? '',
      mobile:   homeData.mobile   ?? '',
      meterRef: homeData.meterRef ?? '',
    });
    setEditing(true);
  }

  async function handleSaveProfile() {
    if (!form.name.trim()) return showToast('اسم المنزل مطلوب.', true);
    if (form.mobile && !isValidLibyanMobile(form.mobile))
      return showToast('رقم الهاتف غير صالح. استخدم صيغة مثل 0912345678.', true);
    if (!form.meterRef.trim()) return showToast('الرقم المرجعي للعداد مطلوب.', true);

    setSavingEdit(true);
    try {
      await updateHomeProfile(currentUser.uid, {
        name:     form.name,
        mobile:   form.mobile,
        meterRef: form.meterRef,
      });
      setEditing(false);
      showToast('تم تحديث بيانات الملف الشخصي بنجاح.');
    } catch (err) {
      showToast(err.message || 'فشل التحديث. حاول مجدداً.', true);
    } finally {
      setSavingEdit(false);
    }
  }

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

  async function handleTopUp() {
    const amt = selectedAmt ?? parseFloat(customAmt);
    if (!amt || amt <= 0 || amt > 1000)
      return showToast('أدخل مبلغاً بين 1 و 1000 د.ل.', true);
    setTopping(true);
    try {
      await topUpWallet(currentUser.uid, amt);
      setSelectedAmt(null);
      setCustomAmt('');
      showToast(`تم شحن المحفظة بـ ${formatLYD(amt)} بنجاح!`);
    } catch (err) {
      showToast(err.message || 'فشل الشحن. حاول مجدداً.', true);
    } finally {
      setTopping(false);
    }
  }

  const joinedAt = homeData.joinedAt ? formatDate(homeData.joinedAt) : '—';
  const avatarColor   = getAvatarColor(homeData.name ?? '');
  const avatarInitial = getInitial(homeData.name ?? '');

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg"
          style={{ backgroundColor: avatarColor }}
        >
          {avatarInitial}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{homeData.name}</h1>
          <p className="text-gray-500 text-sm">{currentUser?.email}</p>
          {homeData.isAdmin && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5 mt-1">
              <FaShieldAlt className="text-[10px]" /> مدير النظام
            </span>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-white">معلومات الحساب</h2>
          {!editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-solar-400 hover:text-solar-300
                         border border-solar-500/20 hover:border-solar-500/40 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            >
              <FaEdit className="text-xs" />
              <span>تعديل</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">البيانات الأساسية لمنزلك في الشبكة</p>

        {!editing ? (
          <div className="divide-y divide-dark-700">
            <InfoRow icon={FaUser}          label="اسم المنزل"          value={homeData.name} />
            <InfoRow icon={FaEnvelope}      label="البريد الإلكتروني"   value={currentUser?.email ?? '—'} />
            <InfoRow icon={FaPhone}         label="رقم الهاتف"          value={homeData.mobile || '—'} />
            <InfoRow icon={FaTachometerAlt} label="الرقم المرجعي للعداد" value={homeData.meterRef || '—'} />
            <InfoRow icon={FaCalendarAlt}   label="تاريخ الانضمام"      value={joinedAt} />
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
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 text-right">اسم المنزل</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                disabled={savingEdit}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 text-right">رقم الهاتف</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="0912345678"
                className="input-field"
                dir="ltr"
                disabled={savingEdit}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 text-right">الرقم المرجعي للعداد</label>
              <input
                type="text"
                value={form.meterRef}
                onChange={(e) => setForm({ ...form, meterRef: e.target.value })}
                placeholder="MTR-AJ-04821"
                className="input-field"
                dir="ltr"
                disabled={savingEdit}
              />
            </div>
            {/* Read-only email note */}
            <p className="text-xs text-gray-600 text-right">
              لا يمكن تغيير البريد الإلكتروني ({currentUser?.email}).
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={savingEdit}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {savingEdit
                  ? <><FaSpinner className="animate-spin" /><span>جارٍ الحفظ...</span></>
                  : <><FaSave /><span>حفظ التغييرات</span></>}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={savingEdit}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <FaTimes />
                <span>إلغاء</span>
              </button>
            </div>
          </div>
        )}
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

      {/* Wallet Top-Up */}
      <div className="card border-green-500/20 bg-gradient-to-br from-dark-800 to-green-500/5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <FaWallet className="text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">شحن المحفظة</h2>
            <p className="text-xs text-gray-500 mt-1">
              رصيدك الحالي: <span className="text-amber-400 font-bold">{formatLYD(homeData.walletBalance)}</span>
              {' '}— أضف رصيداً افتراضياً لشراء الطاقة
            </p>
          </div>
        </div>

        {/* Quick-pick amounts */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmt(amt); setCustomAmt(''); }}
              disabled={topping}
              className={`py-2 rounded-xl text-sm font-semibold border transition-all
                ${selectedAmt === amt
                  ? 'bg-green-500/30 border-green-400 text-green-300'
                  : 'bg-dark-900 border-dark-700 text-gray-300 hover:border-green-500/40 hover:text-green-300'}`}
            >
              {amt}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mb-4">
          <input
            type="number"
            value={customAmt}
            onChange={(e) => { setCustomAmt(e.target.value); setSelectedAmt(null); }}
            placeholder="مبلغ مخصص (أقصاه 1000 د.ل)"
            className="input-field pl-16"
            dir="ltr"
            min="1"
            max="1000"
            disabled={topping}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            د.ل
          </span>
        </div>

        <button
          onClick={handleTopUp}
          disabled={topping || (!selectedAmt && !customAmt)}
          className="w-full flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30
                     border border-green-500/40 hover:border-green-400 text-green-300 hover:text-green-200
                     font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 active:scale-95
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {topping
            ? <><FaSpinner className="animate-spin" /><span>جارٍ الشحن...</span></>
            : <><FaPlus /><span>شحن المحفظة</span></>}
        </button>
      </div>

      {/* Admin Panel Link (visible to admin users on mobile) */}
      {homeData.isAdmin && (
        <Link
          to="/admin"
          className="card border-purple-500/20 bg-gradient-to-br from-dark-800 to-purple-500/5
                     flex items-center gap-4 hover:border-purple-400/40 transition-all duration-200 group"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
            <FaShieldAlt className="text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white">لوحة الإدارة</h2>
            <p className="text-xs text-gray-500">عرض جميع المنازل والإحصائيات الكاملة</p>
          </div>
        </Link>
      )}

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
