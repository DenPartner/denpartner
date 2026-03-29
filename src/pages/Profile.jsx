import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    userId: "",
    wallet: 0,
  });

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user); // ✅ store user

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

  // ✅ VERIFY FUNCTION ADDED
  const handleVerify = async () => {
    if (!user) return;

    try {
      await sendEmailVerification(user);

      toast.success(
        "Verification mail sent 📩\nPlease check inbox or spam folder"
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to send verification mail");
    }
  };

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

          <div className="flex-1">
            <p className="font-bold text-lg">{userData.name}</p>
            <p className="text-sm text-textSub">{userData.email}</p>
            <p className="text-sm text-textSub">
              User ID: {userData.userId}
            </p>

            {/* ✅ VERIFY BUTTON / STATUS */}
            {!user?.emailVerified ? (
              <button
                onClick={handleVerify}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs"
              >
                Verify Email
              </button>
            ) : (
              <span className="mt-2 inline-block text-green-600 text-xs font-semibold">
                ✅ Verified
              </span>
            )}
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
          onClick={() => navigate("/my-activity")}
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