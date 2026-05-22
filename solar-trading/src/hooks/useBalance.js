import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

/**
 * Real-time subscription to a home document.
 *
 * @param {string} [uid] - The home UID to watch. Defaults to the
 *                         currently signed-in user.
 */
export function useBalance(uid = null) {
  const { currentUser }       = useAuth();
  const targetUid             = uid ?? currentUser?.uid ?? null;
  const [home, setHome]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!targetUid) {
      setHome(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsub = onSnapshot(
      doc(db, 'homes', targetUid),
      (snap) => {
        setHome(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, [targetUid]);

  return {
    home,
    balance:       home?.balance       ?? 0,
    walletBalance: home?.walletBalance ?? 0,
    loading,
    error,
  };
}
