import React, { useEffect, useMemo, useState } from 'react';
import {
  collection, query, where, orderBy, onSnapshot, or,
} from 'firebase/firestore';
import {
  FaHistory, FaArrowUp, FaArrowDown, FaInbox, FaReceipt, FaCopy,
} from 'react-icons/fa';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatLYD, formatKwh, formatDateTime } from '../utils/format';

const TABS = [
  { id: 'all',  label: 'الكل',      icon: FaHistory },
  { id: 'sell', label: 'مبيعات',   icon: FaArrowUp },
  { id: 'buy',  label: 'مشتريات',  icon: FaArrowDown },
];

function PaymentRefBadge({ reference }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      title="نسخ"
      className="inline-flex items-center gap-1.5 bg-dark-900 hover:bg-dark-700
                 border border-dark-700 hover:border-solar-500/30
                 rounded-md px-2 py-1 text-[10px] font-mono text-gray-400
                 hover:text-solar-400 transition-all tabular-nums"
      dir="ltr"
    >
      <FaCopy className="text-[9px]" />
      <span>{copied ? 'تم النسخ ✓' : reference}</span>
    </button>
  );
}

function TransactionRow({ tx, isPurchase }) {
  const ringCls = isPurchase
    ? 'bg-green-500/10 border-green-500/20 text-green-400'
    : 'bg-red-500/10   border-red-500/20   text-red-400';
  const amountCls   = isPurchase ? 'text-green-400' : 'text-red-400';
  const Icon        = isPurchase ? FaArrowDown : FaArrowUp;
  const emoji       = isPurchase ? '📥' : '📤';
  const counterparty = isPurchase ? tx.sellerName : tx.buyerName;
  const labelAction  = isPurchase ? 'شراء من' : 'بيع إلى';
  const sign         = isPurchase ? '+' : '−';

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between
                    p-4 rounded-xl border border-dark-700 bg-dark-900/40
                    hover:bg-dark-900/60 hover:border-solar-500/20 transition-all">
      {/* Right: identity */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${ringCls} flex-shrink-0`}>
          <Icon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base leading-none">{emoji}</span>
            <p className="text-white font-semibold text-sm">
              {labelAction} <span className="text-gray-300">{counterparty || '—'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xs text-gray-500">{formatDateTime(tx.timestamp)}</p>
            {tx.paymentReference && <PaymentRefBadge reference={tx.paymentReference} />}
          </div>
        </div>
      </div>

      {/* Left: amounts */}
      <div className="flex items-baseline justify-between gap-6 lg:justify-end lg:gap-8 flex-shrink-0
                      bg-dark-900/40 rounded-lg p-2 lg:bg-transparent lg:p-0">
        <div className="text-right">
          <p className="text-[10px] text-gray-500">الكمية</p>
          <p className={`text-sm font-bold tabular-nums ${amountCls}`}>
            {sign}{formatKwh(tx.kwh)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500">الإجمالي</p>
          <p className="text-sm font-bold text-white tabular-nums">{formatLYD(tx.total)}</p>
        </div>
      </div>
    </div>
  );
}

export default function TransactionHistory() {
  const { currentUser } = useAuth();
  const [txs, setTxs]   = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab]   = useState('all');

  useEffect(() => {
    if (!currentUser) return undefined;

    const q = query(
      collection(db, 'transactions'),
      or(
        where('sellerUid', '==', currentUser.uid),
        where('buyerUid',  '==', currentUser.uid),
      ),
      orderBy('timestamp', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTxs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(null);
      },
      (err) => {
        setError(err.message);
        setTxs([]);
      },
    );

    return unsub;
  }, [currentUser]);

  const filtered = useMemo(() => {
    if (!txs) return null;
    return txs.filter((tx) => {
      if (tab === 'all') return true;
      const isPurchase = tx.buyerUid === currentUser.uid;
      return tab === 'buy' ? isPurchase : !isPurchase;
    });
  }, [txs, tab, currentUser]);

  // Aggregate counts for the tab badges
  const counts = useMemo(() => {
    if (!txs) return { all: 0, sell: 0, buy: 0 };
    let sell = 0;
    let buy  = 0;
    for (const tx of txs) {
      if (tx.buyerUid === currentUser.uid) buy++;
      else sell++;
    }
    return { all: txs.length, sell, buy };
  }, [txs, currentUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
          <FaReceipt className="text-solar-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">سجل المعاملات</h1>
          <p className="text-gray-500 text-sm">دفتر الأستاذ — جميع عملياتك في الشبكة</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl p-1.5 w-fit max-w-full overflow-x-auto scrollbar-thin">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                        ${tab === id
                          ? 'bg-solar-500 text-dark-900'
                          : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}
          >
            <Icon className="text-xs" />
            <span>{label}</span>
            <span className={`tabular-nums text-[10px] rounded-full px-1.5 py-0.5
                              ${tab === id ? 'bg-dark-900/30 text-dark-900' : 'bg-dark-700 text-gray-500'}`}>
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {txs === null && (
        <div className="card flex items-center justify-center py-10 text-gray-500 text-sm">
          جارٍ تحميل المعاملات...
        </div>
      )}

      {txs !== null && filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <FaInbox className="text-4xl text-gray-700 mb-3" />
          <p className="text-gray-400">لا توجد معاملات في هذه الفئة بعد.</p>
          {error && <p className="text-xs text-red-500/70 mt-2">{error}</p>}
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              isPurchase={tx.buyerUid === currentUser.uid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
