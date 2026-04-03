import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [wallet, setWallet] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalInstalls, setTotalInstalls] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      try {
        // 🔥 USER DATA
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        let userData = null;

        if (userSnap.exists()) {
          userData = userSnap.data();
          setWallet(userData.walletBalance || 0);
        }

        const userId = userData?.userId;

        // 🔥 CLICKS
        const clickSnap = await getDocs(collection(db, "clicks"));
        const userClicks = clickSnap.docs
          .map(doc => doc.data())
          .filter(c => c.userId === userId);

        setTotalClicks(userClicks.length);

        // 🔥 EARNINGS
        const earnQuery = query(
          collection(db, "earnings"),
          where("userId", "==", userId)
        );

        const earnSnap = await getDocs(earnQuery);

        let todayTotal = 0;
        let orders = 0;
        let installs = 0;

        const today = new Date().toDateString();

        earnSnap.docs.forEach((doc) => {
          const e = doc.data();

          // ✅ TODAY EARNINGS
          if (e.createdAt && e.createdAt.toDate) {
            const d = e.createdAt.toDate().toDateString();
            if (d === today) {
              todayTotal += e.amount || 0;
            }
          }

          // 🔥 FIX: support both type & earnType
          const earnType = e.type || e.earnType || "order";

          if (earnType === "order") orders++;
          if (earnType === "install") installs++;
        });

        setTodayEarnings(todayTotal);
        setTotalOrders(orders);
        setTotalInstalls(installs);

      } catch (err) {
        console.error("Dashboard error:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto p-4 md:p-6">

        {/* 💰 WALLET */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <p className="text-textSub mb-2">Total Earnings</p>

          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            ₹{Math.round(wallet)}
          </h1>

          <button
            onClick={() => navigate("/withdraw")}
            className="mt-4 bg-gold text-black px-6 py-2 rounded-md font-semibold shadow hover:opacity-90"
          >
            Withdraw
          </button>
        </div>

        {/* 📊 STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-textSub">Today Earnings</p>
            <h2 className="text-xl font-bold text-primary">
              ₹{Math.round(todayEarnings)}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-textSub">Clicks</p>
            <h2 className="text-xl font-bold text-primary">
              {totalClicks}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-textSub">Orders</p>
            <h2 className="text-xl font-bold text-primary">
              {totalOrders}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-textSub">Installs</p>
            <h2 className="text-xl font-bold text-primary">
              {totalInstalls}
            </h2>
          </div>

        </div>

        {/* 🚀 ACTION */}
        <div className="text-center">
          <button
            onClick={() => navigate("/user-campaigns")}
            className="bg-primary text-white px-6 py-3 rounded-md font-semibold shadow hover:opacity-90"
          >
            Start Earning
          </button>
        </div>

      </div>
    </div>
  );
}