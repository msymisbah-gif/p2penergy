import React from 'react';
import { FaHistory } from 'react-icons/fa';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
          <FaHistory className="text-solar-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">سجل المعاملات</h1>
          <p className="text-gray-500 text-sm">جميع عمليات البيع والشراء</p>
        </div>
      </div>
      <div className="card flex items-center justify-center h-64">
        <p className="text-gray-600">سيتم بناء هذه الصفحة في الجلسة القادمة</p>
      </div>
    </div>
  );
}
