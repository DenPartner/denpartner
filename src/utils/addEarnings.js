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
    } = options;

    // 🔥 1. ADD TO EARNINGS COLLECTION
    await addDoc(collection(db, "earnings"), {
      userId,
      uid: userId, // ✅ IMPORTANT FIX (for rules)
      campaignId,
      amount,
      type,
      source,
      status: "completed",
      createdAt: serverTimestamp(),
    });

    // 🔥 2. UPDATE USER WALLET
    await updateDoc(doc(db, "users", userId), {
      walletBalance: increment(amount),
    });

    // 🔥 3. ADD USER NOTIFICATION (VERY IMPORTANT FIX)
    await addDoc(collection(db, "notifications"), {
      userId,
      target: userId, // keeps your existing filter logic working
      title: "New Earnings 💰",
      message: `You earned ₹${amount} from a campaign.`,
      type: "earning",
      seen: false, // ✅ REQUIRED FIX
      createdAt: serverTimestamp(),
    });

    console.log("✅ Earning added:", {
      userId,
      amount,
      type,
      campaignId,
    });

  } catch (err) {
    console.error("❌ Earning error:", err);
  }
};