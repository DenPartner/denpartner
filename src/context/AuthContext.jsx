import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ✅ IMMEDIATE USER SET (FIX NAVBAR ISSUE)
        let userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };

        try {
         let snap = await getDoc(doc(db, "users", firebaseUser.uid));

if (!snap.exists()) {
  snap = await getDoc(doc(db, "admins", firebaseUser.uid));
}

if (snap.exists()) {
  userData = {
    uid: firebaseUser.uid,
    ...snap.data(),
  };
}
        } catch (err) {
          console.error("User fetch error:", err);
        }

        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);