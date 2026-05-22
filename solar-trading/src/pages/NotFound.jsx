import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSolarPanel, FaArrowLeft } from 'react-icons/fa';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-solar-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-solar-500/10 border border-solar-500/30 mb-6">
          <FaSolarPanel className="text-4xl text-solar-400" />
        </div>

        <p className="text-7xl sm:text-8xl font-black text-gradient leading-none mb-3 tabular-nums">404</p>

        <h1 className="text-2xl font-bold text-white mb-3">الصفحة غير موجودة</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها أو حذفها.
        </p>

        <button
          onClick={() => navigate('/dashboard', { replace: true })}
          className="btn-primary inline-flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft />
          <span>العودة إلى لوحة التحكم</span>
        </button>

        <p className="text-xs text-gray-700 mt-10">
          © {new Date().getFullYear()} — نظام تداول الطاقة الشمسية • جامعة أجدابيا
        </p>
      </div>
    </div>
  );
}
