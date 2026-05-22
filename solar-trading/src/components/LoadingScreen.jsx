import React from 'react';
import { FaSolarPanel } from 'react-icons/fa';

export default function LoadingScreen({ message = 'جارٍ تحميل النظام...' }) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-950 flex items-center justify-center px-4">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-solar-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* Spinning solar icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-solar-500/10 border border-solar-500/30 animate-pulse-glow">
          <FaSolarPanel className="text-5xl text-solar-400 animate-spin-slow" />
        </div>

        <p className="text-gray-300 mt-6 text-base font-semibold">{message}</p>
        <p className="text-gray-600 mt-1 text-xs">جامعة أجدابيا — قسم هندسة الحاسوب</p>
      </div>
    </div>
  );
}
