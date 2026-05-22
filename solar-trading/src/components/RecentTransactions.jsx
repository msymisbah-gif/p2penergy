import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, or } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { FaInbox, FaReceipt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatLYD, formatKwh, formatDateTime } from '../utils/format';

function TransactionRow({ tx, isPurchase }) {
  const sign     = isPurchase ? '+' : '−';
  const ringCls  = isPurchase
    ? 'bg-green-500/10 border-green-500/20 text-green-400'
    : 'bg-red-500/10   border-red-500/20   text-red-400';
  const amountCls = isPurchase ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPurchase ? FaArrowDown : FaArrowUp;
  const counterparty = isPurchase ? tx.sellerName : tx.buyerName;
  const labelAction  = isPurchase ? 'شراء من' : 'بيع إلى';
  const emoji        = isPurchase ? '📥' : '📤';

  return (
    <div className="flex items-center justify-between gap-3 py-3 px-3 rounded-xl
                    hover:bg-dark-900/60 transition-colors duration-200 border border-transparent
                    hover:border-dark-700">
      {/* Right side: avatar + meta */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ringCls} flex-shrink-0 text-base`}>
          <TrendIcon className="text-sm" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{emoji}</span>
            <p className="text-white font-medium text-sm truncate">
              {labelAction} <span className="text-gray-300">{counterparty || '—'}</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(tx.timestamp)}</p>
        </div>
      </div>

      {/* Left side: amount */}
      <div className="text-left flex-shrink-0">
        <p className={`text-sm font-bold tabular-nums ${amountCls}`}>
          {sign}{formatKwh(tx.kwh)}
        </p>
        <p className="text-xs text-gray-500 tabular-nums">{formatLYD(tx.total)}</p>
      </div>
    </div>
  );
}

export default function RecentTransactions() {
  const { currentUser } = useAuth();
  const [txs, setTxs]       = useState(null);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!currentUser) return undefined;

    const q = query(
      collection(db, 'transactions'),
      or(
        where('buyerUid',  '==', currentUser.uid),
        where('sellerUid', '==', currentUser.uid),
      ),
      orderBy('timestamp', 'desc'),
      limit(5),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setError(null);
        setTxs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        setError(err.message);
        setTxs([]);
      },
    );

    return unsub;
  }, [currentUser]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
            <FaReceipt className="text-solar-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">آخر المعاملات</h2>
            <p className="text-xs text-gray-500">أحدث 5 عمليات</p>
          </div>
        </div>
      </div>

      {txs === null && (
        <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
          جارٍ تحميل المعاملات...
        </div>
      )}

      {txs !== null && txs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <FaInbox className="text-3xl mb-2 text-gray-700" />
          <p className="text-sm">لا توجد معاملات بعد</p>
          {error && <p className="text-xs text-red-500/70 mt-2">{error}</p>}
        </div>
      )}

      {txs !== null && txs.length > 0 && (
        <div className="divide-y divide-dark-700/60">
          {txs.map((tx) => {
            const isPurchase = tx.buyerUid === currentUser.uid;
            return <TransactionRow key={tx.id} tx={tx} isPurchase={isPurchase} />;
          })}
        </div>
      )}
    </div>
  );
}
