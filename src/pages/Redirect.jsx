import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import toast from "react-hot-toast";
import {
  doc,
  getDoc,
  addDoc, // ✅ changed
  collection, // ✅ added
  serverTimestamp,
} from "firebase/firestore";

export default function Redirect() {
  const { code } = useParams();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // ✅ SAFETY CHECK (now expects campaignId-userId)
        if (!code || code.split("-").length < 2) {
          toast("Invalid link");
          return;
        }

        // 🔥 SPLIT campaignId + userId ONLY
        const parts = code.split("-");
        const campaignId = parts[0];
        const userId = parts[1];

        // 🔥 GENERATE UNIQUE CLICK ID (VERY IMPORTANT)
        const clickId =
          Date.now() + Math.random().toString(36).substring(2, 6);

        // 🔥 GET CAMPAIGN DATA
        const docRef = doc(db, "campaigns", campaignId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          toast("Campaign not found");
          return;
        }

        const data = snap.data();

        // 🔥 TRACKING PARAM
        const trackingParam = data.trackingParam || "subid";

        // ✅ SAFE URL BUILD (no duplicate ? & issues)
        const urlObj = new URL(data.url);

        // ✅ PASS userId + clickId
        const subidValue = `${userId}-${clickId}`;
        urlObj.searchParams.set(trackingParam, subidValue);

        const finalUrl = urlObj.toString();

        // 🔥 TRACK CLICK (EVERY CLICK UNIQUE NOW)
        await addDoc(collection(db, "clicks"), {
          userId: userId,
          campaignId: campaignId,
          clickId: clickId,
          createdAt: serverTimestamp(),
        });

        console.log("✅ Click tracked:", { userId, campaignId, clickId });
        console.log("🔗 Redirecting to:", finalUrl);

        // 🔥 REDIRECT
        window.location.href = finalUrl;

      } catch (err) {
        console.error("❌ Redirect error:", err);
        toast("Something went wrong");
      }
    };

    handleRedirect();
  }, [code]);

  return (
    <div className="text-center mt-20 text-lg font-semibold">
      Redirecting...
    </div>
  );
}