import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";

export default function Help() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      const q = query(
        collection(db, "support"),
        where("uid", "==", user.uid)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map(d => d.data());
      setHistory(data);
    };

    fetchMessages();
  }, [user]);

  const handleSubmit = async () => {
    if (!message) {
       toast("Please enter your message");
      return;
    }

    // ✅ FIXED: direct user doc fetch
    const userDoc = await getDoc(doc(db, "users", user.uid));
    let userId = "";

    if (userDoc.exists()) {
      userId = userDoc.data().userId;
    }

    await addDoc(collection(db, "support"), {
      uid: user.uid,
      userId,
      email: user.email,
      message,
      createdAt: new Date(),
      seen: false,
    });

     toast("Submitted ✅");

    setMessage("");

    setHistory(prev => [
      ...prev,
      { message, createdAt: new Date() }
    ]);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">

      <div className="max-w-md mx-auto p-4 md:p-6">

        <h1 className="text-xl md:text-2xl font-bold mb-6">
          Help & Support
        </h1>

        <div className="bg-white rounded-xl shadow p-5">
         <div className="bg-gray-50 border rounded-md p-3 mb-4 text-sm text-gray-600">
  <p className="mb-1">
    📩 Our support team will respond to your issue within <b>24 hours</b>.
  </p>
  <p>
    📧 Support Email: <span className="font-semibold text-black">support@denpartner.com</span>
  </p>
</div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            className="w-full p-3 border rounded-md outline-none h-28"
          />

          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-primary text-white py-2 rounded-md font-semibold"
          >
            Submit Request
          </button>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Your Messages</h3>

            {history.map((h, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded mb-2 text-sm">
                <p>{h.message}</p>

                <p className="text-xs text-gray-400 mt-1">
                  {h.createdAt?.toDate
                    ? h.createdAt.toDate().toLocaleString()
                    : new Date(h.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}