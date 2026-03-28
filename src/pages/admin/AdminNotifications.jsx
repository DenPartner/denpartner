import { useState, useEffect } from "react";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [history, setHistory] = useState([]);

  const handleSend = async () => {
    if (!title || !message) {
      toast("Fill all fields");
      return;
    }

    try {
      let users = [];

      if (target.trim().toUpperCase() === "ALL") {
        users = ["ALL"];
      } else {
        users = target
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
      }

      for (let uid of users) {
        await addDoc(collection(db, "notifications"), {
          title,
          message,
          target: uid, // 🔥 IMPORTANT
          seen: false, // ✅ REQUIRED FIX
          createdAt: serverTimestamp(),
        });
      }

      toast("✅ Notification sent");

      setTitle("");
      setMessage("");
      setTarget("ALL");
    } catch (err) {
      console.error(err);
      toast("Failed to send notification");
    }
  };

  // 🔥 HISTORY
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "notifications"),
      (snap) => {
        let data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );

        setHistory(data);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-2xl font-bold mb-6">
        Send Notification
      </h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border p-2 mb-2"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        className="w-full border p-2 mb-2"
      />

      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="ALL / DEN01 / email"
        className="w-full border p-2 mb-3"
      />

      <button
        onClick={handleSend}
        className="bg-primary text-white px-4 py-2 rounded w-full"
      >
        Send
      </button>

      {/* 🔥 HISTORY */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">
          History
        </h3>

        {history.length === 0 ? (
          <p className="text-sm text-gray-500">
            No history
          </p>
        ) : (
          history.map((n) => (
            <div
              key={n.id}
              className="border p-2 mb-2 rounded"
            >
              <p>
                <b>{n.title}</b>
              </p>

              <p className="text-sm">
                {n.message}
              </p>

              <p className="text-xs text-gray-400">
                {n.target}
              </p>

              <p className="text-xs text-gray-400">
                {n.seen ? "Seen" : "Unread"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}