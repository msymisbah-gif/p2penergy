import React, { useEffect, useState } from 'react';
import {
  FaTimes, FaExclamationTriangle, FaCheckCircle, FaSpinner,
  FaUniversity, FaMobileAlt, FaBuilding, FaWallet, FaBolt,
} from 'react-icons/fa';
import { formatLYD, formatKwh } from '../utils/format';

/**
 * FR-07 — Libyan payment simulation methods.
 * The exact 5 options + descriptions are dictated by the thesis.
 */
const PAYMENT_METHODS = [
  {
    id:          'lypay',
    name:        'LYPay',
    description: 'مصرف ليبيا المركزي - تحويل فوري',
    icon:        FaUniversity,
    color:       'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    id:          'onepay',
    name:        'OnePay',
    description: 'دفع فوري عبر الجوال',
    icon:        FaMobileAlt,
    color:       'text-green-400 bg-green-500/10 border-green-500/20',
  },
  {
    id:          'bank',
    name:        'تحويل بنكي',
    description: 'مصرف الجمهورية، الوحدة',
    icon:        FaBuilding,
    color:       'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id:          'mobicash',
    name:        'MobiCash',
    description: 'محفظة رقمية',
    icon:        FaWallet,
    color:       'text-solar-400 bg-solar-500/10 border-solar-500/20',
  },
  {
    id:          'fawri',
    name:        'Fawri',
    description: 'تطبيق دفع',
    icon:        FaBolt,
    color:       'text-red-400 bg-red-500/10 border-red-500/20',
  },
];

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  offer,
  amount,
}) {
  const [selected, setSelected] = useState('lypay');
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected('lypay');
      setProcessing(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !offer) return null;

  const total = Number((amount * offer.pricePerKwh).toFixed(2));

  async function handleConfirm() {
    setError('');
    setProcessing(true);
    try {
      await onConfirm({ methodId: selected });
    } catch (err) {
      setError(err.message || 'فشلت عملية الدفع. حاول مجدداً.');
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={!processing ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl
                      max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">إتمام عملية الشراء</h2>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-gray-500 hover:text-white disabled:opacity-50 p-1"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin p-5 space-y-4">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <FaExclamationTriangle className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              هذا نظام محاكاة — لا يتم تحويل أموال حقيقية.
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">ملخص الطلب</h3>
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{offer.sellerName}</span>
              <span className="text-gray-400">البائع</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium tabular-nums">{formatKwh(amount)}</span>
              <span className="text-gray-400">الكمية</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium tabular-nums">
                {formatLYD(offer.pricePerKwh)} / kWh
              </span>
              <span className="text-gray-400">السعر</span>
            </div>
            <div className="border-t border-dark-700 pt-2.5 flex justify-between items-baseline">
              <span className="text-solar-400 font-bold text-lg tabular-nums">
                {formatLYD(total)}
              </span>
              <span className="text-gray-300 text-sm font-semibold">المبلغ الإجمالي</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">اختر طريقة الدفع</h3>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon     = method.icon;
                const isActive = selected === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
                                ${isActive
                                  ? 'bg-solar-500/10 border-solar-500/40'
                                  : 'bg-dark-900 border-dark-700 hover:border-dark-600'}`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={isActive}
                      onChange={() => setSelected(method.id)}
                      disabled={processing}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${method.color} flex-shrink-0`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{method.name}</p>
                      <p className="text-gray-500 text-xs truncate">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                    ${isActive ? 'border-solar-500' : 'border-dark-600'}`}>
                      {isActive && <div className="w-2.5 h-2.5 bg-solar-500 rounded-full" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-dark-700 bg-dark-900/50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={processing}
            className="btn-secondary flex-1"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>جارٍ المعالجة...</span>
              </>
            ) : (
              <>
                <FaCheckCircle />
                <span>تأكيد الدفع</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
