import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import Sidebar from "./Sidebar";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [count, setCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setUserId(snap.data().userId);
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userId) return;

    const unsub = onSnapshot(
      collection(db, "notifications"),
      (snap) => {
        let data = snap.docs.map((d) => d.data());

        const denId = userId.toLowerCase();

        data = data.filter((n) => {
          const target = (n.target || n.userId || "")
            .toString()
            .toLowerCase();

          const isForUser =
            target === "all" || target === denId;

          const isUnread = !n.seen;

          return isForUser && isUnread;
        });

        setCount(data.length);
      }
    );

    return () => unsub();
  }, [userId]);

  return (
    <>
      <div className="w-full bg-[#F8F5F0] shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 md:px-4 py-3">

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsOpen(true)}
              className="text-lg shrink-0"
            >
              ☰
            </button>

            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 cursor-pointer min-w-0"
            >
              <img
                src="/logo.png"
                alt="DenPartner"
                className="h-8 shrink-0"
              />

              <span className="text-sm md:text-lg font-bold truncate">
                <span className="text-primary">Den</span>
                <span className="text-gold">Partner</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">

            <div className="relative">
              <button
                onClick={() => navigate("/notifications")}
                className="text-base md:text-lg"
              >
                🔔
              </button>

              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1 text-xs md:text-sm font-semibold"
            >
              👤 {userId}
            </button>
          </div>
        </div>
      </div>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}