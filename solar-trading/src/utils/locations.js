/**
 * Libyan cities and their popular neighborhoods.
 * Ajdabiya is the primary city (project is centred there) and has
 * the most detailed neighbourhood coverage. Other major cities are
 * included to allow inter-city trading in the simulation.
 */

export const LIBYAN_CITIES = [
  {
    id:         'ajdabiya',
    nameAr:     'أجدابيا',
    isPrimary:  true,
    neighborhoods: [
      'حي النصر',
      'حي الوحدة',
      'حي المنشية',
      'حي الجامعة',
      'حي السلام',
      'حي الجديدة',
      'حي القدس',
      'حي الفتح',
      'حي الشهداء',
      'حي المخيم',
      'حي الظهرة',
      'حي الشعبية',
      'حي المطار',
      'حي الحرية',
    ],
  },
  {
    id:      'benghazi',
    nameAr:  'بنغازي',
    neighborhoods: [
      'وسط البلاد',
      'الفويهات',
      'الكيش',
      'الهواري',
      'قاريونس',
      'بوهديمة',
      'السلماني',
      'بنينا',
      'راس عبيدة',
      'سيدي حسين',
    ],
  },
  {
    id:      'tripoli',
    nameAr:  'طرابلس',
    neighborhoods: [
      'وسط المدينة',
      'المدينة القديمة',
      'حي الأندلس',
      'أبو سليم',
      'سوق الجمعة',
      'تاجوراء',
      'جنزور',
      'قرقارش',
      'سيدي المصري',
      'زناتة',
    ],
  },
  {
    id:      'tobruk',
    nameAr:  'طبرق',
    neighborhoods: [
      'وسط طبرق',
      'حي الوحدة',
      'حي النصر',
      'الحمامة',
      'المطار',
    ],
  },
  {
    id:      'derna',
    nameAr:  'درنة',
    neighborhoods: [
      'وسط درنة',
      'ساحل درنة',
      'المغار',
      'الوهيشي',
      'الشيحة',
    ],
  },
  {
    id:      'alkufra',
    nameAr:  'الكفرة',
    neighborhoods: [
      'الجوف',
      'التاج',
      'بزيمة',
      'الزرق',
    ],
  },
  {
    id:      'misrata',
    nameAr:  'مصراتة',
    neighborhoods: [
      'وسط مصراتة',
      'قصر أحمد',
      'الغيران',
      'زاوية المحجوب',
      'الرمل',
    ],
  },
  {
    id:      'sirte',
    nameAr:  'سرت',
    neighborhoods: [
      'وسط سرت',
      'حي الزعفران',
      'حي القرضابية',
      'أبو هادي',
    ],
  },
  {
    id:      'sabha',
    nameAr:  'سبها',
    neighborhoods: [
      'المهدية',
      'حجارة',
      'الجديد',
      'القردة',
    ],
  },
  {
    id:      'zawiya',
    nameAr:  'الزاوية',
    neighborhoods: [
      'وسط الزاوية',
      'حي الحرشة',
      'صرمان',
      'صبراتة',
    ],
  },
];

export function getCity(id) {
  return LIBYAN_CITIES.find((c) => c.id === id) ?? LIBYAN_CITIES[0];
}

export function getCityNeighborhoods(cityId) {
  return getCity(cityId).neighborhoods;
}

/** Returns "أجدابيا — حي النصر" or "أجدابيا" if no neighborhood */
export function formatLocation(cityId, neighborhood) {
  const city = getCity(cityId);
  if (!neighborhood) return city.nameAr;
  return `${city.nameAr} — ${neighborhood}`;
}
