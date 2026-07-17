import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaBolt, FaLightbulb, FaChevronLeft } from 'react-icons/fa';
import { formatLYD, formatKwh, getAvatarColor, getInitial } from '../utils/format';

/**
 * Sample sell/buy offers shown on the Dashboard as an illustrative
 * preview so new users understand how the market looks.
 */
const SAMPLE_SELL_OFFERS = [
  { seller: 'منزل الشمس',  amount: 8.5, pricePerKwh: 2.50, city: 'أجدابيا' },
  { seller: 'منزل النور',  amount: 5.0, pricePerKwh: 2.20, city: 'بنغازي' },
  { seller: 'منزل الأمل',  amount: 12.0, pricePerKwh: 2.80, city: 'طبرق'  },
];

const SAMPLE_BUY_NEEDS = [
  { buyer: 'منزل الفجر',   amount: 4.0, city: 'درنة'   },
  { buyer: 'منزل السلام',  amount: 6.5, city: 'الكفرة' },
];

function SampleOfferCard({ name, amount, pricePerKwh, city, isBuy = false }) {
  const total = pricePerKwh ? Number((amount * pricePerKwh).toFixed(2)) : null;
  const color = getAvatarColor(name);
  const initial = getInitial(name);

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 hover:border-solar-500/30 transition-all">
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate">{name}</p>
          <p className="text-gray-500 text-[10px]">{city}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
          ${isBuy
            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
            : 'bg-green-500/15 text-green-400 border border-green-500/20'}`}>
          {isBuy ? 'يحتاج' : 'يبيع'}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-solar-400">
          <FaBolt className="text-[10px]" />
          <span className="font-bold tabular-nums">{formatKwh(amount)}</span>
        </div>
        {pricePerKwh && (
          <div className="text-amber-400 tabular-nums">
            <span className="font-bold">{pricePerKwh.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 mr-1">د.ل/kWh</span>
          </div>
        )}
      </div>
      {total !== null && (
        <div className="mt-2 pt-2 border-t border-dark-700 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">الإجمالي</span>
          <span className="text-white font-bold text-sm tabular-nums">{formatLYD(total)}</span>
        </div>
      )}
    </div>
  );
}

export default function MarketExamples() {
  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-solar-500/5 border border-solar-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center flex-shrink-0">
          <FaLightbulb className="text-solar-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm mb-1">كيف يبدو السوق؟</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            أمثلة توضيحية لعروض البيع والشراء بين المنازل. كل منزل يُنتج طاقة شمسية
            ويستطيع بيع فائضه أو شراء ما يحتاج بأسعار عادلة بالدينار الليبي.
          </p>
        </div>
      </div>

      {/* Sell offers section */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <FaArrowUp className="text-green-400 text-xs" />
            </div>
            <h2 className="text-base font-semibold text-white">أمثلة على عروض البيع</h2>
          </div>
          <Link
            to="/buy"
            className="flex items-center gap-1 text-solar-400 hover:text-solar-300 text-xs font-semibold"
          >
            <span>تصفح السوق</span>
            <FaChevronLeft className="text-[10px]" />
          </Link>
        </div>
        <p className="text-xs text-gray-500 mb-4">منازل تعرض فائض طاقتها للبيع</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_SELL_OFFERS.map((offer, i) => (
            <SampleOfferCard
              key={i}
              name={offer.seller}
              amount={offer.amount}
              pricePerKwh={offer.pricePerKwh}
              city={offer.city}
            />
          ))}
        </div>
      </div>

      {/* Buy needs section */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <FaArrowDown className="text-purple-400 text-xs" />
            </div>
            <h2 className="text-base font-semibold text-white">أمثلة على طلبات الشراء</h2>
          </div>
          <Link
            to="/sell"
            className="flex items-center gap-1 text-solar-400 hover:text-solar-300 text-xs font-semibold"
          >
            <span>أنشئ عرضاً</span>
            <FaChevronLeft className="text-[10px]" />
          </Link>
        </div>
        <p className="text-xs text-gray-500 mb-4">منازل تحتاج شراء طاقة إضافية</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_BUY_NEEDS.map((need, i) => (
            <SampleOfferCard
              key={i}
              name={need.buyer}
              amount={need.amount}
              city={need.city}
              isBuy={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
