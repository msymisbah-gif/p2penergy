import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FaSolarPanel, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';

const ARABIC_ERRORS = {
  'auth/invalid-email':           'البريد الإلكتروني غير صالح.',
  'auth/user-disabled':           'تم تعطيل هذا الحساب. تواصل مع الإدارة.',
  'auth/user-not-found':          'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/wrong-password':          'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/invalid-credential':      'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/too-many-requests':       'تم تجاوز عدد المحاولات. حاول مجدداً لاحقاً.',
  'auth/network-request-failed':  'خطأ في الاتصال بالشبكة. تحقق من اتصالك.',
  'default':                      'حدث خطأ غير متوقع. حاول مجدداً.',
};

function getArabicError(code) {
  return ARABIC_ERRORS[code] || ARABIC_ERRORS['default'];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getArabicError(err.code));
    } finally {
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
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-solar-500/10 border border-solar-500/30 mb-5 glow-solar animate-pulse-glow">
            <FaSolarPanel className="text-4xl text-solar-400" />
          </div>
          <h1 className="text-2xl font-bold text-white leading-relaxed mb-1">
            نظام محاكاة لتداول
          </h1>
          <h1 className="text-2xl font-bold text-gradient leading-relaxed mb-2">
            فائض الطاقة الشمسية
          </h1>
          <p className="text-gray-500 text-sm">
            جامعة أجدابيا — قسم هندسة الحاسوب
          </p>
        </div>

        {/* Login Card */}
        <div className="card border-dark-700">
          <h2 className="text-lg font-semibold text-gray-300 mb-6 text-center">
            تسجيل الدخول إلى لوحة التحكم
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">
                البريد الإلكتروني
              </label>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  dir="ltr"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              </div>
            </div>

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
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            للوصول التجريبي: استخدم بيانات الحسابات التجريبية
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          © {new Date().getFullYear()} — مشروع تخرج • جامعة أجدابيا
        </p>
      </div>
    </div>
  );
}
