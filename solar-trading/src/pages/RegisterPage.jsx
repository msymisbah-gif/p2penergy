import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSolarPanel, FaEnvelope, FaLock, FaSpinner, FaHome, FaPhone, FaArrowRight,
  FaCreditCard,
} from 'react-icons/fa';
import { registerHome } from '../services/homeService';
import { isValidLibyanMobile } from '../utils/meter';
import { PAYMENT_METHODS } from '../utils/paymentMethods';
import LocationPicker from '../components/LocationPicker';

const ARABIC_ERRORS = {
  'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل.',
  'auth/invalid-email':        'البريد الإلكتروني غير صالح.',
  'auth/weak-password':        'كلمة المرور ضعيفة جداً. استخدم 6 أحرف على الأقل.',
  'auth/network-request-failed': 'خطأ في الاتصال بالشبكة. تحقق من اتصالك.',
  'default':                   'حدث خطأ غير متوقع. حاول مجدداً.',
};

function getArabicError(code) {
  return ARABIC_ERRORS[code] || ARABIC_ERRORS['default'];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [mobile, setMobile]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('sadad');
  const [city, setCity]                 = useState('ajdabiya');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet]             = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // ── Validation ──────────────────────────────────────────────
    if (!name.trim())              return setError('يرجى إدخال اسم المنزل.');
    if (!email.trim())             return setError('يرجى إدخال البريد الإلكتروني.');
    if (!isValidLibyanMobile(mobile))
      return setError('رقم الهاتف غير صالح. استخدم صيغة مثل 0912345678.');
    if (password.length < 6)       return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
    if (password !== confirm)      return setError('كلمتا المرور غير متطابقتين.');

    setLoading(true);
    try {
      const { meterRef } = await registerHome({
        name, email, mobile, password, paymentMethod,
        city, neighborhood, street,
      });
      // Account created + signed in; AuthContext picks up the new user.
      navigate('/dashboard', { replace: true, state: { welcome: true, meterRef } });
    } catch (err) {
      setError(getArabicError(err.code));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-solar-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-solar-500/10 border border-solar-500/30 mb-4 animate-pulse-glow">
            <FaSolarPanel className="text-3xl text-solar-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">إنشاء حساب منزل جديد</h1>
          <p className="text-gray-500 text-sm">انضم إلى شبكة تداول الطاقة الشمسية</p>
        </div>

        {/* Card */}
        <div className="card border-dark-700">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Home name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">اسم المنزل</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="منزل الشمس — أجدابيا"
                  className="input-field pr-11"
                  disabled={loading}
                />
                <FaHome className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@home.ly"
                  className="input-field pr-11"
                  dir="ltr"
                  disabled={loading}
                  autoComplete="email"
                />
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="0912345678"
                  className="input-field pr-11"
                  dir="ltr"
                  disabled={loading}
                  autoComplete="tel"
                />
                <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  dir="ltr"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  dir="ltr"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              </div>
            </div>

            {/* Location */}
            <div className="pt-2 border-t border-dark-700">
              <p className="text-sm font-semibold text-solar-400 mb-3 text-right">📍 موقع المنزل</p>
              <LocationPicker
                city={city}
                neighborhood={neighborhood}
                street={street}
                onCityChange={setCity}
                onNeighborhoodChange={setNeighborhood}
                onStreetChange={setStreet}
                disabled={loading}
              />
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 text-right flex items-center gap-1.5 justify-end">
                <span>طريقة الدفع المفضلة</span>
                <FaCreditCard className="text-solar-400 text-xs" />
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right
                      ${paymentMethod === m.id
                        ? `${m.bgColor} border-current ${m.color}`
                        : 'bg-dark-900 border-dark-700 text-gray-400 hover:border-dark-600'}`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1 text-right">
                      <p className={`text-sm font-bold ${paymentMethod === m.id ? m.color : 'text-white'}`}>
                        {m.nameAr}
                      </p>
                      <p className="text-xs text-gray-500">{m.description}</p>
                    </div>
                    {paymentMethod === m.id && (
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${m.color} border-current`}>
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-600 text-right leading-relaxed">
              سيتم إنشاء رقم مرجعي لعداد الكهرباء تلقائياً، ويمكنك تعديله لاحقاً من صفحة الملف الشخصي.
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm text-right">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><FaSpinner className="animate-spin" /><span>جارٍ إنشاء الحساب...</span></>
                : <span>إنشاء الحساب</span>}
            </button>
          </form>

          {/* Link to login */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-sm">
            <Link to="/login" className="text-solar-400 hover:text-solar-300 font-medium flex items-center gap-1">
              <span>تسجيل الدخول</span>
              <FaArrowRight className="text-xs" />
            </Link>
            <span className="text-gray-600">لديك حساب بالفعل؟</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          © {new Date().getFullYear()} — مشروع تخرج • جامعة أجدابيا
        </p>
      </div>
    </div>
  );
}
