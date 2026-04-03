import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";

export default function MyActivity() {
  const [activities, setActivities] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

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

    const fetchActivity = async () => {
      try {

        // 🔥 CAMPAIGNS MAP
        const campaignSnap = await getDocs(collection(db, "campaigns"));
        const campaigns = {};
        campaignSnap.docs.forEach(doc => {
          campaigns[doc.id] = { id: doc.id, ...doc.data() };
        });

        // 🔥 USER CLICKS
        const clickSnap = await getDocs(collection(db, "clicks"));
        const userClicks = clickSnap.docs
          .map(doc => doc.data())
          .filter(c => c.userId === userId);

        // 🔥 USER EARNINGS
        const earnSnap = await getDocs(
          query(collection(db, "earnings"), where("userId", "==", userId))
        );
        const earnings = earnSnap.docs.map(doc => doc.data());

        const activityMap = {};

        // 🔥 PROCESS CLICKS
        userClicks.forEach(c => {
          if (!c.campaignId) return;

          if (!activityMap[c.campaignId]) {
            activityMap[c.campaignId] = {
              clicks: 0,
              orders: 0,
              installs: 0,
              earnings: 0,
            };
          }

          activityMap[c.campaignId].clicks += 1;
        });

        // 🔥 PROCESS EARNINGS
        earnings.forEach(e => {
          let campaignId = e.campaignId;

          // fallback using clickId
          if (!campaignId && e.clickId) {
            const click = userClicks.find(c => c.clickId === e.clickId);
            if (click) campaignId = click.campaignId;
          }

          if (!campaignId) return;

          if (!activityMap[campaignId]) {
            activityMap[campaignId] = {
              clicks: 0,
              orders: 0,
              installs: 0,
              earnings: 0,
            };
          }

          activityMap[campaignId].earnings += e.amount || 0;

          const earnType = e.type || campaigns[campaignId]?.earnType || "order";

          if (earnType === "order") {
            activityMap[campaignId].orders += 1;
          }

          if (earnType === "install") {
            activityMap[campaignId].installs += 1;
          }
        });

        // 🔥 FINAL FORMAT
        const finalData = Object.keys(activityMap).map(id => ({
          id,
          product: campaigns[id]?.title || "Unknown",
          earnType: campaigns[id]?.earnType || "order",
          ...activityMap[id],
          date: new Date().toLocaleDateString(),
        }));

        setActivities(finalData);

      } catch (err) {
        console.error("Activity error:", err);
      }
    };

    fetchActivity();
  }, [userId]);

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto p-4 md:p-6">

        <h1 className="text-xl md:text-2xl font-bold mb-6">
          My Activity
        </h1>

        {activities.length === 0 && (
          <p className="text-center text-textSub">
            No activity yet
          </p>
        )}

        <div className="space-y-4">

          {activities.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow p-4">

              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-semibold text-lg">{item.product}</p>
                  <p className="text-xs text-textSub">ID: {item.id}</p>
                </div>

                <p className="font-bold text-primary text-lg">
                  ₹{Math.round(item.earnings)}
                </p>
              </div>

              <div className="grid grid-cols-3 text-sm mt-3">

                <div>
                  <p className="text-textSub">Clicks</p>
                  <p className="font-semibold">{item.clicks}</p>
                </div>

                {item.earnType === "order" && (
                  <div>
                    <p className="text-textSub">Orders</p>
                    <p className="font-semibold">{item.orders}</p>
                  </div>
                )}

                {item.earnType === "install" && (
                  <div>
                    <p className="text-textSub">Installs</p>
                    <p className="font-semibold">{item.installs}</p>
                  </div>
                )}

                {item.earnType === "click" && (
                  <div>
                    <p className="text-textSub">Type</p>
                    <p className="font-semibold">Per Click</p>
                  </div>
                )}

                <div>
                  <p className="text-textSub">Date</p>
                  <p className="font-semibold">{item.date}</p>
                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}