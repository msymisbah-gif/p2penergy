import React from 'react';
import { FaMapMarkerAlt, FaCity, FaRoad } from 'react-icons/fa';
import { LIBYAN_CITIES, getCityNeighborhoods } from '../utils/locations';

/**
 * Reusable city + neighborhood + street picker.
 * Used in RegisterPage and Profile edit mode.
 */
export default function LocationPicker({
  city, neighborhood, street,
  onCityChange, onNeighborhoodChange, onStreetChange,
  disabled = false,
}) {
  const neighborhoods = getCityNeighborhoods(city);

  return (
    <div className="space-y-3">
      {/* City */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5 justify-end">
          <span>المدينة</span>
          <FaCity className="text-solar-400 text-xs" />
        </label>
        <select
          value={city}
          onChange={(e) => {
            onCityChange(e.target.value);
            onNeighborhoodChange(''); // reset neighborhood on city change
          }}
          disabled={disabled}
          className="input-field appearance-none cursor-pointer"
          dir="rtl"
        >
          {LIBYAN_CITIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-dark-900">
              {c.nameAr}{c.isPrimary ? '  (المدينة الرئيسية)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Neighborhood */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5 justify-end">
          <span>الحي / المنطقة</span>
          <FaMapMarkerAlt className="text-solar-400 text-xs" />
        </label>
        <select
          value={neighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          disabled={disabled}
          className="input-field appearance-none cursor-pointer"
          dir="rtl"
        >
          <option value="" className="bg-dark-900">— اختر الحي —</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n} className="bg-dark-900">{n}</option>
          ))}
        </select>
      </div>

      {/* Street (optional) */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5 justify-end">
          <span>الشارع أو معلم قريب (اختياري)</span>
          <FaRoad className="text-solar-400 text-xs" />
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => onStreetChange(e.target.value)}
          placeholder="مثال: شارع الجامعة، قرب مسجد النور"
          disabled={disabled}
          className="input-field"
        />
        <p className="text-[10px] text-gray-600 mt-1 text-right leading-relaxed">
          💡 قريباً — إمكانية تحديد الموقع الدقيق عبر خرائط Google
        </p>
      </div>
    </div>
  );
}
