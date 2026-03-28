import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    userId: "",
    wallet: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            setUserData({
              name: data.name || "User",
              email: data.email,
              userId: data.userId,
              wallet: data.walletBalance || 0,
            });
          }
        } catch (err) {
          console.error("Profile fetch error:", err);
        }
      } else {
        navigate("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">

      <div className="max-w-4xl mx-auto p-4 md:p-6">

        {/* 👤 USER INFO */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-4">

          <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-white text-xl">
            👤
          </div>

          <div>
            <p className="font-bold text-lg">{userData.name}</p>
            <p className="text-sm text-textSub">{userData.email}</p>
            <p className="text-sm text-textSub">
              User ID: {userData.userId}
            </p>
          </div>

        </div>

        {/* 💰 WALLET */}
        <div className="bg-white rounded-xl shadow mb-6 overflow-hidden">

          <div className="bg-primary text-white px-4 py-2 font-semibold">
            Wallet
          </div>

          <div className="flex justify-between items-center p-4">
            <p className="text-2xl font-bold text-primary">
              ₹{userData.wallet}
            </p>

            <button
              onClick={() => navigate("/withdraw")}
              className="bg-gold px-4 py-2 rounded-md font-semibold"
            >
              Withdraw
            </button>
          </div>

        </div>

        {/* 📊 MY ACTIVITY */}
        <div
          onClick={() => navigate("/my-activity")} // 🔥 changed route (menu consistency)
          className="bg-white rounded-xl shadow p-4 mb-4 cursor-pointer flex justify-between items-center"
        >
          <span>📊 My Activity</span>
          <span>›</span>
        </div>

        {/* MENU LIST */}
        <div className="bg-white rounded-xl shadow divide-y">

          <MenuItem text="💸 Withdraw Money" onClick={() => navigate("/withdraw")} />
          <MenuItem text="👤 My Account" onClick={() => navigate("/my-account")} />
          <MenuItem text="📞 Help / Support" onClick={() => navigate("/help")} />
          <MenuItem text="ℹ️ About Us" onClick={() => navigate("/user-about")} />
          <MenuItem text="📜 Terms & Privacy" onClick={() => navigate("/user-privacy")} />

          {/* 🔴 LOGOUT */}
          <div
            onClick={() => auth.signOut()}
            className="p-4 cursor-pointer text-red-500 font-semibold"
          >
            🔴 Logout
          </div>

        </div>

      </div>
    </div>
  );
}

/* 🔹 Reusable menu item */
function MenuItem({ text, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
    >
      <span>{text}</span>
      <span>›</span>
    </div>
  );
}