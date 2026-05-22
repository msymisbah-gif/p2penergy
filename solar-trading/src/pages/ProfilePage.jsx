import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0">
      <span className="text-white font-medium">{value}</span>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-sm">{label}</span>
        <Icon className="text-solar-400 text-sm" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { homeData, currentUser } = useAuth();

  if (!homeData) return null;

  const joinedAt = homeData.joinedAt?.toDate?.()?.toLocaleDateString('ar-LY', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) ?? '—';

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
          <FaUser className="text-solar-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">الملف الشخصي</h1>
          <p className="text-gray-500 text-sm">بيانات المنزل والحساب</p>
        </div>
      </div>

      <div className="card space-y-0">
        <InfoRow icon={FaUser}          label="اسم المنزل"        value={homeData.name} />
        <InfoRow icon={FaEnvelope}      label="البريد الإلكتروني" value={currentUser?.email ?? '—'} />
        <InfoRow icon={FaCalendarAlt}   label="تاريخ الانضمام"   value={joinedAt} />
        <InfoRow
          icon={FaCheckCircle}
          label="حالة الحساب"
          value={homeData.isActive ? 'نشط ✓' : 'غير نشط'}
        />
      </div>
    </div>
  );
}
