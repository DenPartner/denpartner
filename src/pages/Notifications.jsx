import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchUser = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserId(snap.data().userId);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      collection(db, "notifications"),
      (snap) => {
        let data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          seen: docSnap.data().seen || false,
        }));

        const denId = userId.toLowerCase();

        data = data.filter((n) => {
          const target = (n.target || n.userId || "")
            .toString()
            .toLowerCase();

          return target === "all" || target === denId;
        });

        data.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );

        // ✅ keep local seen status if already clicked
        setNotifications((prev) => {
          return data.map((item) => {
            const old = prev.find(
              (p) => p.id === item.id
            );

            return old?.seen
              ? { ...item, seen: true }
              : item;
          });
        });
      }
    );

    return () => unsub();
  }, [userId]);

  const markSeen = async (id) => {
    // ✅ FIRST update UI immediately
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, seen: true }
          : item
      )
    );

    // ✅ THEN update DB
    try {
      await updateDoc(doc(db, "notifications", id), {
        seen: true,
      });
    } catch (err) {
      console.error("seen update failed", err);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp?.seconds) return "";

    const date = new Date(timestamp.seconds * 1000);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-6 text-primary">
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <p className="text-center text-textSub">
            No notifications
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markSeen(n.id)}
              className={`p-4 mb-3 rounded shadow border-l-4 cursor-pointer ${
                n.seen
                  ? "bg-white border-primary"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <p className="font-semibold text-primary">
                  {n.title}
                </p>

                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(n.createdAt)}
                </p>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {n.message}
              </p>

              {!n.seen && (
                <span className="text-xs text-red-600 font-bold">
                  New
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}