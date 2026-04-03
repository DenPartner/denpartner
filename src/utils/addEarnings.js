import { db } from "../firebase";
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export const addEarning = async (
  userId,
  amount,
  options = {}
) => {
  try {
    const {
      campaignId = null,
      type = "commission",
      source = "manual",
      uid = null   // ✅ REQUIRED
    } = options;

    // 🔥 1. ADD TO EARNINGS COLLECTION
    await addDoc(collection(db, "earnings"), {
      userId,
      uid,
      campaignId,
      amount,
      type,
      source,
      status: "completed",
      createdAt: serverTimestamp(),
    });

    // 🔥 2. UPDATE USER WALLET (FIXED USING UID)
    if (!uid) {
      console.log("❌ UID missing for earning");
      return;
    }

    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      walletBalance: increment(amount),
    });

    // 🔔 NOTIFICATION (UNCHANGED)
    await addDoc(collection(db, "notifications"), {
      userId,
      target: userId,
      title: "New Earnings 💰",
      message: `You earned ₹${amount} from a campaign.`,
      type: "earning",
      seen: false,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Earning added:", {
      userId,
      uid,
      amount,
      type,
      campaignId,
    });

  } catch (err) {
    console.error("❌ Earning error:", err);
  }
};