/**
 * Payment methods available in the simulation.
 * Mirrors the common payment channels used in Libya today.
 */

export const PAYMENT_METHODS = [
  {
    id:          'sadad',
    nameAr:      'سداد',
    description: 'خدمة الدفع الإلكتروني الوطنية',
    icon:        '💳',
    color:       'text-blue-400',
    bgColor:     'bg-blue-500/10 border-blue-500/30',
  },
  {
    id:          'libyana',
    nameAr:      'محفظة ليبيانا',
    description: 'المحفظة الإلكترونية من ليبيانا',
    icon:        '📱',
    color:       'text-green-400',
    bgColor:     'bg-green-500/10 border-green-500/30',
  },
  {
    id:          'almadar',
    nameAr:      'محفظة المدار',
    description: 'المحفظة الإلكترونية من المدار الجديد',
    icon:        '📲',
    color:       'text-orange-400',
    bgColor:     'bg-orange-500/10 border-orange-500/30',
  },
  {
    id:          'bank',
    nameAr:      'تحويل بنكي',
    description: 'تحويل مباشر من الحساب البنكي',
    icon:        '🏦',
    color:       'text-purple-400',
    bgColor:     'bg-purple-500/10 border-purple-500/30',
  },
  {
    id:          'card',
    nameAr:      'بطاقة ائتمان',
    description: 'Visa / Mastercard',
    icon:        '💳',
    color:       'text-amber-400',
    bgColor:     'bg-amber-500/10 border-amber-500/30',
  },
];

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) ?? PAYMENT_METHODS[0];
}
