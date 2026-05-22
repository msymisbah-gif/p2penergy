import React, { useState } from 'react';
import {
  FaArrowUp, FaBolt, FaTag, FaArrowRight, FaArrowLeft,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaList,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useOffers } from '../hooks/useOffers';
import { createSellOffer, cancelOffer } from '../services/tradeService';
import { formatLYD, formatKwh, formatRelativeTime } from '../utils/format';

const DEFAULT_PRICE = 0.45;

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'الكمية' },
    { n: 2, label: 'السعر والمراجعة' },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                            ${step >= s.n
                              ? 'bg-solar-500 text-dark-900'
                              : 'bg-dark-700 text-gray-500'}`}>
              {s.n}
            </div>
            <span className={`text-sm font-medium ${step >= s.n ? 'text-white' : 'text-gray-500'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-dark-700" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function MyOffersList({ uid, onCancel }) {
  const { offers, loading } = useOffers({ onlySellerUid: uid });
  const [cancellingId, setCancellingId] = useState(null);

  async function handleCancel(offerId) {
    setCancellingId(offerId);
    try {
      await cancelOffer({ offerId, sellerUid: uid });
      onCancel?.('تم إلغاء العرض بنجاح');
    } catch (err) {
      onCancel?.(err.message, true);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
          <FaList className="text-solar-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">عروضي المفتوحة</h2>
          <p className="text-xs text-gray-500">
            <span className="tabular-nums">{offers.length}</span> عرض نشط
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500 py-6 text-sm">جارٍ التحميل...</p>
      )}

      {!loading && offers.length === 0 && (
        <p className="text-center text-gray-600 py-6 text-sm">لا توجد عروض مفتوحة حالياً.</p>
      )}

      {!loading && offers.length > 0 && (
        <div className="divide-y divide-dark-700/60">
          {offers.map((o) => (
            <div key={o.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FaArrowUp className="text-blue-400 text-sm" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold tabular-nums">
                    {formatKwh(o.amount)} <span className="text-gray-500 text-xs font-normal">بسعر</span>{' '}
                    <span className="text-solar-400">{formatLYD(o.pricePerKwh)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(o.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => handleCancel(o.id)}
                disabled={cancellingId === o.id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20
                           rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                           flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
              >
                {cancellingId === o.id
                  ? <FaSpinner className="animate-spin" />
                  : <FaTimesCircle />}
                <span>إلغاء</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellEnergy() {
  const { currentUser, homeData } = useAuth();
  const balance = homeData?.balance ?? 0;

  const [step, setStep]         = useState(1);
  const [amount, setAmount]     = useState('');
  const [price, setPrice]       = useState(DEFAULT_PRICE);
  const [submitting, setSubmit] = useState(false);
  const [toast, setToast]       = useState(null);

  const amountNum = Number(amount) || 0;
  const priceNum  = Number(price)  || 0;
  const total     = Number((amountNum * priceNum).toFixed(2));
  const isAmountValid = amountNum > 0 && amountNum <= balance;
  const isPriceValid  = priceNum > 0;

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  function reset() {
    setStep(1);
    setAmount('');
    setPrice(DEFAULT_PRICE);
  }

  async function handleSubmit() {
    if (!isAmountValid || !isPriceValid) return;
    setSubmit(true);
    try {
      await createSellOffer({
        sellerUid:   currentUser.uid,
        amount:      amountNum,
        pricePerKwh: priceNum,
      });
      showToast(`تم إنشاء عرضك بنجاح: ${formatKwh(amountNum)} بسعر ${formatLYD(priceNum)}/kWh`);
      reset();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <FaArrowUp className="text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">بيع الطاقة</h1>
          <p className="text-gray-500 text-sm">اعرض فائض الطاقة الشمسية للبيع للجيران</p>
        </div>
        <div className="bg-dark-800 border border-solar-500/20 rounded-xl px-4 py-2">
          <p className="text-xs text-gray-500">الرصيد المتاح</p>
          <p className="text-solar-400 font-bold tabular-nums">{formatKwh(balance)}</p>
        </div>
      </div>

      {/* Step Form */}
      <div className="card">
        <StepIndicator step={step} />

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 text-right">
                الكمية المراد بيعها (kWh)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="input-field pr-11 text-lg tabular-nums"
                  dir="ltr"
                />
                <FaBolt className="absolute right-4 top-1/2 -translate-y-1/2 text-solar-400" />
              </div>
              {amountNum > balance && (
                <p className="text-red-400 text-xs mt-2 text-right">
                  الكمية تتجاوز رصيدك المتاح ({formatKwh(balance)}).
                </p>
              )}
              {/* Quick presets */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {[10, 25, 50, balance].filter((v) => v > 0 && v <= balance).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v.toFixed(1))}
                    className="bg-dark-900 hover:bg-dark-700 border border-dark-700 hover:border-solar-500/30
                               text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-all tabular-nums"
                  >
                    {v === balance ? `الكل (${formatKwh(v)})` : formatKwh(v)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={!isAmountValid}
                onClick={() => setStep(2)}
                className="btn-primary flex items-center gap-2"
              >
                <span>التالي</span>
                <FaArrowLeft />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 text-right">
                السعر لكل كيلوواط ساعة (د.ل)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.45"
                  className="input-field pr-11 text-lg tabular-nums"
                  dir="ltr"
                />
                <FaTag className="absolute right-4 top-1/2 -translate-y-1/2 text-solar-400" />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[0.35, 0.45, 0.55, 0.65].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPrice(v)}
                    className="bg-dark-900 hover:bg-dark-700 border border-dark-700 hover:border-solar-500/30
                               text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-all tabular-nums"
                  >
                    {formatLYD(v)}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-dark-900 border border-solar-500/20 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">مراجعة العرض</h3>
              <div className="flex justify-between text-sm">
                <span className="text-white tabular-nums">{formatKwh(amountNum)}</span>
                <span className="text-gray-400">الكمية</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white tabular-nums">{formatLYD(priceNum)} / kWh</span>
                <span className="text-gray-400">السعر</span>
              </div>
              <div className="border-t border-dark-700 pt-2 flex justify-between items-baseline">
                <span className="text-solar-400 font-bold text-lg tabular-nums">{formatLYD(total)}</span>
                <span className="text-gray-300 text-sm font-semibold">الإجمالي المتوقع</span>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="btn-secondary flex items-center gap-2"
              >
                <FaArrowRight />
                <span>السابق</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !isAmountValid || !isPriceValid}
                className="btn-primary flex items-center gap-2"
              >
                {submitting
                  ? <><FaSpinner className="animate-spin" /><span>جارٍ الإنشاء...</span></>
                  : <><FaCheckCircle /><span>إنشاء العرض</span></>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* My Open Offers */}
      <MyOffersList uid={currentUser.uid} onCancel={showToast} />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl
                        border backdrop-blur-xl text-sm font-medium
                        ${toast.isError
                          ? 'bg-red-500/20 border-red-500/40 text-red-200'
                          : 'bg-green-500/20 border-green-500/40 text-green-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
