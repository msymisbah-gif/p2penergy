import { useEffect, useMemo, useState } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Real-time subscription to open energy offers.
 *
 * @param {Object} [options]
 * @param {string} [options.excludeUid] - Hide offers from this seller
 *                                        (e.g., the current user).
 * @param {string} [options.onlySellerUid] - Only return offers owned
 *                                           by this seller (used on
 *                                           the seller's own page).
 */
export function useOffers({ excludeUid = null, onlySellerUid = null } = {}) {
  const [allOffers, setAllOffers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'offers'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setAllOffers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, []);

  const offers = useMemo(() => {
    let list = allOffers;
    if (onlySellerUid) list = list.filter((o) => o.sellerUid === onlySellerUid);
    if (excludeUid)    list = list.filter((o) => o.sellerUid !== excludeUid);
    return list;
  }, [allOffers, excludeUid, onlySellerUid]);

  return { offers, loading, error };
}
