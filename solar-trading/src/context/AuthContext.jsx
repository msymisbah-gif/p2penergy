import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [homeData, setHomeData]       = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let unsubHomeSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (unsubHomeSnapshot) {
        unsubHomeSnapshot();
        unsubHomeSnapshot = null;
      }

      if (user) {
        const homeRef = doc(db, 'homes', user.uid);
        unsubHomeSnapshot = onSnapshot(
          homeRef,
          (snap) => {
            setHomeData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            setLoading(false);
          },
          () => {
            setHomeData(null);
            setLoading(false);
          }
        );
      } else {
        setHomeData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubHomeSnapshot) unsubHomeSnapshot();
    };
  }, []);

  async function signOut() {
    await firebaseSignOut(auth);
  }

  const value = { currentUser, homeData, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
