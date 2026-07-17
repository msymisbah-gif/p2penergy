/**
 * Home Service — account registration and profile editing.
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { generateMeterRef, normalizeMobile } from '../utils/meter';

// New homes start with a small wallet so they can buy immediately,
// and zero energy (they generate it via the production simulation).
const STARTING_WALLET = 100; // LYD

/**
 * Register a brand-new home: creates the Firebase Auth user (which
 * signs them in) and writes the /homes/{uid} document with the full
 * schema plus mobile + auto-generated meter reference.
 */
export async function registerHome({ name, email, mobile, password, paymentMethod = 'sadad' }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;

  const meterRef = generateMeterRef();

  await setDoc(doc(db, 'homes', uid), {
    name:           name.trim(),
    ownerEmail:     email.trim(),
    mobile:         normalizeMobile(mobile),
    meterRef,
    paymentMethod,
    balance:        0,
    walletBalance:  STARTING_WALLET,
    totalProduced:  0,
    totalConsumed:  0,
    totalSold:      0,
    totalPurchased: 0,
    joinedAt:       serverTimestamp(),
    isActive:       true,
  });

  return { uid, meterRef };
}

/**
 * Add LYD credit to the user's wallet (virtual top-up for demo purposes).
 */
export async function topUpWallet(uid, amount, paymentMethod = 'sadad') {
  if (!amount || amount <= 0) throw new Error('المبلغ يجب أن يكون أكبر من صفر.');
  await updateDoc(doc(db, 'homes', uid), {
    walletBalance:     increment(amount),
    lastTopUpAmount:   amount,
    lastTopUpMethod:   paymentMethod,
    lastTopUpAt:       serverTimestamp(),
    updatedAt:         serverTimestamp(),
  });
}

/**
 * Update editable profile fields (home name, mobile, meter reference).
 * Only fields actually provided are written.
 */
export async function updateHomeProfile(uid, { name, mobile, meterRef }) {
  const updates = {};
  if (name     !== undefined) updates.name     = name.trim();
  if (mobile   !== undefined) updates.mobile   = normalizeMobile(mobile);
  if (meterRef !== undefined) updates.meterRef = meterRef.trim();

  if (Object.keys(updates).length === 0) return;
  updates.updatedAt = serverTimestamp();

  await updateDoc(doc(db, 'homes', uid), updates);
}
