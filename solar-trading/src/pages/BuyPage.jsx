import React from 'react';
import { FaArrowDown } from 'react-icons/fa';

export default function BuyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <FaArrowDown className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">شراء الطاقة</h1>
          <p className="text-gray-500 text-sm">استعراض عروض الطاقة المتاحة للشراء</p>
        </div>
      </div>
      <div className="card flex items-center justify-center h-64">
        <p className="text-gray-600">سيتم بناء هذه الصفحة في الجلسة القادمة</p>
      </div>
    </div>
  );
}
