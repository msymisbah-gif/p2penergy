import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function SellPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <FaArrowUp className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">بيع الطاقة</h1>
          <p className="text-gray-500 text-sm">عرض فائض الطاقة الشمسية للبيع</p>
        </div>
      </div>
      <div className="card flex items-center justify-center h-64">
        <p className="text-gray-600">سيتم بناء هذه الصفحة في الجلسة القادمة</p>
      </div>
    </div>
  );
}
