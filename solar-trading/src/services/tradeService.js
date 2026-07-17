/**
 * Trade Service — Atomic Energy Trading Engine
 *
 * Implements the 8-step atomic trade process required by the thesis.
 * All balance/ledger mutations are committed via a single Firestore
 * writeBatch so the trade is all-or-nothing.
 */

import {
  collection, doc, getDoc, getDocs, addDoc, writeBatch,
  query, where, orderBy, limit, or,
  serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from '../firebase';

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                  */
/* ------------------------------------------------------------------ */

function generatePaymentReference() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PAY-${ts}-${rnd}`;
}

/* ------------------------------------------------------------------ */
/*  Core: executeEnergyTrade (8-step atomic process)                  */
/* ------------------------------------------------------------------ */

/**
 * Executes an atomic energy trade between a seller (via an open offer)
 * and a buyer. Steps 1-8 follow the thesis specification exactly.
 *
 * @param {Object} params
 * @param {string} params.offerId   The open offer being purchased.
 * @param {string} params.buyerUid  UID of the purchasing home.
 * @param {number} params.amount    kWh to purchase (≤ offer.amount).
 * @returns {Promise<{ transactionId: string, paymentReference: string, total: number }>}
 */
export async function executeEnergyTrade({ offerId, buyerUid, amount }) {
  /* ---------- STEP 1: Validate inputs ------------------------------ */
  if (!offerId)               throw new Error('معرّف العرض مطلوب.');
  if (!buyerUid)              throw new Error('معرّف المشتري مطلوب.');
  if (!amount || amount <= 0) throw new Error('الكمية يجب أن تكون أكبر من صفر.');

  const offerRef  = doc(db, 'offers', offerId);
  const offerSnap = await getDoc(offerRef);
  if (!offerSnap.exists())             throw new Error('العرض غير موجود.');
  const offer = offerSnap.data();

  if (offer.status !== 'open')                                    throw new Error('العرض لم يعد متاحاً.');
  if (!(offer.pricePerKwh > 0))                                   throw new Error('سعر العرض غير صالح.');
  if (offer.sellerUid === buyerUid)                               throw new Error('لا يمكنك شراء عرضك الخاص.');
  if (amount > (offer.amount ?? 0))                               throw new Error('الكمية المطلوبة تتجاوز المتاح في العرض.');

  /* ---------- STEP 2: Fetch seller and buyer data ------------------ */
  const sellerRef = doc(db, 'homes', offer.sellerUid);
  const buyerRef  = doc(db, 'homes', buyerUid);

  const [sellerSnap, buyerSnap] = await Promise.all([
    getDoc(sellerRef),
    getDoc(buyerRef),
  ]);
  if (!sellerSnap.exists()) throw new Error('بيانات البائع غير موجودة.');
  if (!buyerSnap.exists())  throw new Error('بيانات المشتري غير موجودة.');

  const seller = sellerSnap.data();
  const buyer  = buyerSnap.data();

  /* ---------- STEP 3: Verify seller has sufficient kWh balance ---- */
  if ((seller.balance ?? 0) < amount) {
    throw new Error('رصيد البائع من الطاقة غير كافٍ لإتمام الصفقة.');
  }

  const total = Number((amount * offer.pricePerKwh).toFixed(2));

  if ((buyer.walletBalance ?? 0) < total) {
    throw new Error('رصيد محفظتك غير كافٍ لإتمام الشراء.');
  }

  /* ---------- STEP 4: Initialize writeBatch ----------------------- */
  const batch = writeBatch(db);

  /* ---------- STEP 5: Deduct kWh from seller, add to buyer -------- */
  batch.update(sellerRef, {
    balance:       increment(-amount),
    totalSold:     increment(amount),
    walletBalance: increment(total),
  });
  batch.update(buyerRef, {
    balance:        increment(amount),
    totalPurchased: increment(amount),
    walletBalance:  increment(-total),
  });

  /* ---------- STEP 6: Update offer status to "completed" ---------- */
  // If the buyer takes the full remaining amount, mark the offer
  // completed; otherwise leave it 'open' with the reduced amount so
  // other buyers can still pick up the rest.
  const remaining = Number(((offer.amount ?? 0) - amount).toFixed(3));
  if (remaining <= 0) {
    batch.update(offerRef, {
      status:      'completed',
      amount:      0,
      buyerUid,
      buyerName:   buyer.name,
      completedAt: serverTimestamp(),
    });
  } else {
    batch.update(offerRef, { amount: remaining });
  }

  /* ---------- STEP 7: Create immutable transaction document ------- */
  const paymentReference = generatePaymentReference();
  const txRef            = doc(collection(db, 'transactions'));

  batch.set(txRef, {
    paymentReference,
    offerId,
    sellerUid:    offer.sellerUid,
    sellerName:   seller.name,
    buyerUid,
    buyerName:    buyer.name,
    kwh:          amount,
    pricePerKwh:  offer.pricePerKwh,
    total,
    currency:     'LYD',
    status:       'completed',
    timestamp:    serverTimestamp(),
  });

  /* ---------- STEP 8: Commit the batch ---------------------------- */
  await batch.commit();

  return {
    transactionId: txRef.id,
    paymentReference,
    total,
  };
}

/* ------------------------------------------------------------------ */
/*  Offer management                                                  */
/* ------------------------------------------------------------------ */

/**
 * Create a sell offer. Verifies the seller has the kWh balance to
 * back the offer at creation time.
 */
export async function createSellOffer({ sellerUid, amount, pricePerKwh }) {
  if (!sellerUid)                        throw new Error('معرّف البائع مطلوب.');
  if (!amount || amount <= 0)            throw new Error('الكمية يجب أن تكون أكبر من صفر.');
  if (!pricePerKwh || pricePerKwh <= 0)  throw new Error('السعر يجب أن يكون أكبر من صفر.');

  const sellerRef  = doc(db, 'homes', sellerUid);
  const sellerSnap = await getDoc(sellerRef);
  if (!sellerSnap.exists())                          throw new Error('بيانات البائع غير موجودة.');

  const seller = sellerSnap.data();
  if ((seller.balance ?? 0) < amount) {
    throw new Error('رصيد الطاقة لديك غير كافٍ لإنشاء هذا العرض.');
  }

  const offerRef = await addDoc(collection(db, 'offers'), {
    sellerUid,
    sellerName:         seller.name,
    sellerCity:         seller.city         ?? 'ajdabiya',
    sellerNeighborhood: seller.neighborhood ?? '',
    sellerStreet:       seller.street       ?? '',
    amount,
    pricePerKwh,
    status:     'open',
    createdAt:  serverTimestamp(),
  });

  return offerRef.id;
}

/**
 * Cancel an open offer. Only the seller can cancel their own offer.
 */
export async function cancelOffer({ offerId, sellerUid }) {
  if (!offerId)   throw new Error('معرّف العرض مطلوب.');
  if (!sellerUid) throw new Error('معرّف البائع مطلوب.');

  const offerRef  = doc(db, 'offers', offerId);
  const offerSnap = await getDoc(offerRef);
  if (!offerSnap.exists())                       throw new Error('العرض غير موجود.');

  const offer = offerSnap.data();
  if (offer.sellerUid !== sellerUid)             throw new Error('غير مصرّح بإلغاء هذا العرض.');
  if (offer.status !== 'open')                   throw new Error('لا يمكن إلغاء عرض غير مفتوح.');

  const batch = writeBatch(db);
  batch.update(offerRef, {
    status:      'cancelled',
    cancelledAt: serverTimestamp(),
  });
  await batch.commit();
}

/**
 * One-shot fetch of all open offers, optionally excluding a specific
 * seller (typically the current user).
 */
export async function getOpenOffers({ excludeUid = null } = {}) {
  const q = query(
    collection(db, 'offers'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((o) => !excludeUid || o.sellerUid !== excludeUid);
}

/**
 * One-shot fetch of a home's transaction history (as buyer or seller).
 */
export async function getHomeTransactions(uid, count = 50) {
  if (!uid) throw new Error('معرّف المنزل مطلوب.');

  const q = query(
    collection(db, 'transactions'),
    or(
      where('sellerUid', '==', uid),
      where('buyerUid',  '==', uid),
    ),
    orderBy('timestamp', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
