import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function AdminSupport() {

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "support"), (snap) => {
      let data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setMessages(data);
    });

    return () => unsub();
  }, []);

  const markSeen = async (id) => {
    try {
      await updateDoc(doc(db, "support", id), {
        seen: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl">

      <h2 className="text-2xl font-bold mb-6">
        Support Messages
      </h2>

      {messages.length === 0 ? (
        <p className="text-sm text-gray-500">No messages</p>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            onClick={() => markSeen(m.id)}
            className={`border p-3 mb-2 rounded cursor-pointer ${
              m.seen ? "bg-white" : "bg-red-100"
            }`}
          >
            <p className="text-sm text-gray-500">
              {m.email} ({m.userId || "No ID"})
            </p>

            <p className="text-xs text-gray-400 mb-1">
              {m.createdAt?.toDate
                ? m.createdAt.toDate().toLocaleString()
                : ""}
            </p>

            <p className="font-medium">
              {m.message}
            </p>

            {!m.seen && (
              <span className="text-xs text-red-600 font-bold">
                New
              </span>
            )}
          </div>
        ))
      )}

    </div>
  );
}