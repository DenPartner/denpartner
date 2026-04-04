import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import toast from "react-hot-toast";
import {
  doc,
  getDoc,
  setDoc, // ✅ updated
  serverTimestamp,
} from "firebase/firestore";

export default function Redirect() {
  const { code } = useParams();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // ✅ SAFETY CHECK
        if (!code || code.split("-").length < 3) {
          toast("Invalid link");
          return;
        }

        // 🔥 SPLIT campaignId + userId + clickId
        const [campaignId, userId, clickId] = code.split("-");

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

        const separator = data.url.includes("?") ? "&" : "?";

        // ✅ PASS userId + clickId
        const subidValue = `${userId}-${clickId}`;

        const finalUrl = `${data.url}${separator}${trackingParam}=${subidValue}`;

        // 🔥 TRACK CLICK (NO DUPLICATES NOW)
        await setDoc(
          doc(db, "clicks", clickId),
          {
            userId: userId,
            campaignId: campaignId,
            clickId: clickId,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

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