import React, { useMemo, useState } from 'react';
import {
  FaArrowDown, FaBolt, FaShoppingCart, FaSearch,
  FaUser, FaWallet, FaInbox,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useOffers } from '../hooks/useOffers';
import { executeEnergyTrade } from '../services/tradeService';
import PaymentModal from '../components/PaymentModal';
import { formatLYD, formatKwh, formatRelativeTime } from '../utils/format';

function OfferCard({ offer, walletBalance, onBuy }) {
  const [amount, setAmount] = useState(offer.amount);
  const amountNum = Math.min(Math.max(Number(amount) || 0, 0), offer.amount);
  const total     = Number((amountNum * offer.pricePerKwh).toFixed(2));
  const tooLittle = amountNum <= 0;
  const tooPoor   = total > walletBalance;
  const canBuy    = !tooLittle && !tooPoor;

  return (
    <div className="card hover:border-solar-500/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Seller */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FaUser className="text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold truncate">{offer.sellerName || '—'}</p>
          <p className="text-xs text-gray-500">{formatRelativeTime(offer.createdAt)}</p>
        </div>
      </div>

      {/* Energy + Price summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-solar-400 mb-1">
            <FaBolt className="text-xs" />
            <span className="text-xs text-gray-400">متاح</span>
          </div>
          <p className="text-white font-bold tabular-nums">{formatKwh(offer.amount)}</p>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
            <FaWallet className="text-xs" />
            <span className="text-xs text-gray-400">السعر</span>
          </div>
          <p className="text-white font-bold tabular-nums text-sm">
            {formatLYD(offer.pricePerKwh)}
          </p>
        </div>
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <label className="block text-xs text-gray-400 mb-1.5 text-right">الكمية (kWh)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max={offer.amount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field text-center tabular-nums"
          dir="ltr"
        />
      </div>

      {/* Total */}
      <div className="bg-dark-900/60 border border-solar-500/20 rounded-xl p-3 mb-3 flex justify-between items-baseline">
        <span className="text-solar-400 font-bold text-lg tabular-nums">{formatLYD(total)}</span>
        <span className="text-xs text-gray-400">الإجمالي</span>
      </div>

      {/* Errors */}
      {tooPoor && (
        <p className="text-red-400 text-xs mb-2 text-right">
          المبلغ يتجاوز رصيد محفظتك ({formatLYD(walletBalance)}).
        </p>
      )}

      {/* CTA */}
      <button
        onClick={() => onBuy(offer, amountNum)}
        disabled={!canBuy}
        className="btn-primary mt-auto w-full flex items-center justify-center gap-2"
      >
        <FaShoppingCart />
        <span>شراء الآن</span>
      </button>
    </div>
  );
}

export default function BuyEnergy() {
  const { currentUser, homeData } = useAuth();
  const { offers, loading }       = useOffers({ excludeUid: currentUser?.uid });

  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState({ open: false, offer: null, amount: 0 });
  const [toast, setToast]     = useState(null);

  const walletBalance = homeData?.walletBalance ?? 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter((o) =>
      (o.sellerName ?? '').toLowerCase().includes(q),
    );
  }, [offers, search]);

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  }

  function openModal(offer, amount) {
    setModal({ open: true, offer, amount });
  }

  function closeModal() {
    setModal({ open: false, offer: null, amount: 0 });
  }

  async function handleConfirm() {
    const { offer, amount } = modal;
    const result = await executeEnergyTrade({
      offerId:  offer.id,
      buyerUid: currentUser.uid,
      amount,
    });
    closeModal();
    showToast(
      `تمت العملية! رقم العملية: ${result.paymentReference} • ${formatLYD(result.total)}`,
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <FaArrowDown className="text-purple-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">شراء الطاقة</h1>
          <p className="text-gray-500 text-sm">عروض البيع المتاحة من الجيران في الشبكة</p>
        </div>
        <div className="bg-dark-800 border border-green-500/20 rounded-xl px-4 py-2">
          <p className="text-xs text-gray-500">رصيد المحفظة</p>
          <p className="text-green-400 font-bold tabular-nums">{formatLYD(walletBalance)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منزل البائع..."
          className="input-field pr-11"
        />
        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
      </div>

      {/* Offers Grid */}
      {loading && (
        <div className="card flex items-center justify-center py-10 text-gray-500 text-sm">
          جارٍ تحميل العروض...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <FaInbox className="text-4xl text-gray-700 mb-3" />
          <p className="text-gray-400 mb-1">لا توجد عروض متاحة حالياً</p>
          <p className="text-gray-600 text-xs">عُد لاحقاً لمراجعة العروض الجديدة من الجيران.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              walletBalance={walletBalance}
              onBuy={openModal}
            />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirm}
        offer={modal.offer}
        amount={modal.amount}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl
                         border backdrop-blur-xl text-sm font-medium max-w-md text-center
                         ${toast.isError
                           ? 'bg-red-500/20 border-red-500/40 text-red-200'
                           : 'bg-green-500/20 border-green-500/40 text-green-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
