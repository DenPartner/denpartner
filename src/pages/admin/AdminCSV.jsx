import { useState } from "react";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDocs,
  query,
  where,
  getDoc
} from "firebase/firestore";
import Papa from "papaparse";

export default function AdminCSV() {

  const [loading, setLoading] = useState(false);

  const normalize = (str) =>
    str?.toLowerCase().replace(/[^a-z0-9]/g, "");

  const findField = (row, keywords) => {
    for (let key in row) {
      const cleanKey = normalize(key);

      for (let word of keywords) {
        if (cleanKey.includes(word)) {
          return row[key];
        }
      }
    }
    return "";
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {

      const settingsRef = doc(db, "settings", "platform");
      const settingsSnap = await getDoc(settingsRef);

      let settings = {
        orderCommission: 20,
        clickCommission: 25,
        installCommission: 15,
      };

      if (settingsSnap.exists()) {
        settings = { ...settings, ...settingsSnap.data() };
      }

      // ✅ FIXED LOWERCASE MAP
      const usersSnap = await getDocs(collection(db, "users"));
      const usersMap = {};
      usersSnap.forEach((d) => {
        usersMap[d.data().userId.toLowerCase()] = d.id;
      });

      const clicksSnap = await getDocs(collection(db, "clicks"));
      const clicksMap = {};
      clicksSnap.forEach((d) => {
        const data = d.data();
        if (data.clickId) clicksMap[data.clickId] = data;
      });

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,

        complete: async (results) => {
          const rows = results.data;

          let success = 0;
          let skipped = 0;
          let totalUserEarning = 0;
          let totalPlatformProfit = 0;

          for (let row of rows) {

            const rawSubId = findField(row, ["sub", "aff", "uid"]);
            const commissionRaw = findField(row, [
              "commission",
              "revenue",
              "amount",
              "earning",
              "sale",
              "payout"
            ]);

            const orderId = findField(row, [
              "orderid",
              "transactionid",
              "txn",
              "saleid"
            ]);

            // ✅ HANDLE EMPTY SUBID
            if (!rawSubId) {
              skipped++;
              continue;
            }

            // ✅ SUPPORT BOTH: DEN01 & DEN01-CLICKID
            let userId = rawSubId;
            let clickId = null;

            if (rawSubId.includes("-")) {
              const parts = rawSubId.split("-");
              userId = parts[0];
              clickId = parts[1];
            }

            const commission =
              parseFloat(
                String(commissionRaw).replace(/[^0-9.]/g, "")
              ) || 0;

            if (!userId || commission <= 0) {
              skipped++;
              continue;
            }

            // 🔥 DUPLICATE CHECK
            let isDuplicate = false;
            const uniqueKey = `${rawSubId}-${commission}-${orderId || ""}`;

            if (orderId) {
              const q = query(
                collection(db, "earnings"),
                where("orderId", "==", orderId)
              );
              const existing = await getDocs(q);

              if (!existing.empty) {
                isDuplicate = true;
              }
            }

            if (!orderId && !isDuplicate) {
              const q = query(
                collection(db, "earnings"),
                where("uniqueKey", "==", uniqueKey)
              );

              const existing = await getDocs(q);

              if (!existing.empty) {
                isDuplicate = true;
              }
            }

            if (isDuplicate) {
              skipped++;
              continue;
            }

            const clickData = clicksMap[clickId];

            let campaignId = null;
            let earnType = "order";

            if (clickData) {
              campaignId = clickData.campaignId;

              const campaignSnap = await getDoc(
                doc(db, "campaigns", campaignId)
              );

              if (campaignSnap.exists()) {
                earnType = campaignSnap.data().earnType || "order";
              }
            }

            let percent = settings.orderCommission;

            if (earnType === "click") {
              percent = settings.clickCommission;
            }

            if (earnType === "install") {
              percent = settings.installCommission;
            }

            const userAmount = commission * ((100 - percent) / 100);
            const platformProfit = commission - userAmount;

            await addDoc(collection(db, "earnings"), {
              userId,
              campaignId: campaignId || null,
              clickId: clickId || null,
              amount: userAmount,
              originalAmount: commission,
              platformProfit,
              earnType,
              orderId,
              uniqueKey,
              status: "pending",
              createdAt: serverTimestamp(),
            });

            await addDoc(collection(db, "notifications"), {
              userId: userId,
              title: "New Earnings 💰",
              message: `You earned ₹${Math.round(userAmount)} from a campaign.`,
              type: "earning",
              createdAt: serverTimestamp(),
            });

            // ✅ FIXED LOWERCASE MATCH
            const userDocId = usersMap[userId.toLowerCase()];

            if (userDocId) {
              await updateDoc(doc(db, "users", userDocId), {
                walletBalance: increment(userAmount),
              });
            }

            totalUserEarning += userAmount;
            totalPlatformProfit += platformProfit;

            success++;
          }

          const totalNetworkEarning =
            totalUserEarning + totalPlatformProfit;

          await addDoc(collection(db, "csvUploads"), {
            fileName: file.name,
            totalRows: rows.length,
            processed: success,
            skipped,
            totalUserEarning,
            totalPlatformProfit,
            totalNetworkEarning,
            status: "completed",
            uploadedAt: serverTimestamp(),
          });

          toast(`✅ Added: ${success} | Skipped: ${skipped}`);

          setLoading(false);
        },
      });

    } catch (err) {
      console.error(err);
      toast("Upload failed ❌");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">
        Upload CSV
      </h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
        className="mb-4"
      />

      {loading && <p>Processing CSV...</p>}

    </div>
  );
}