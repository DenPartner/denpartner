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
      uid = null,
      clickId = null,
      orderId = null,
      meta = {},
      commissionPercent = null,   // 🔥 NEW
      originalAmount = null       // 🔥 NEW
    } = options;

    await addDoc(collection(db, "earnings"), {
      userId,
      uid,
      campaignId,
      clickId,
      orderId,
      amount,
      originalAmount,        // 🔥 NEW
      commissionPercent,     // 🔥 NEW
      type,
      source,
      meta,
      status: "completed",
      createdAt: serverTimestamp(),
    });

    if (!uid) {
      console.log("❌ UID missing for earning");
      return;
    }

    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      walletBalance: increment(amount),
    });

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
      campaignId,
      clickId,
      orderId,
      commissionPercent
    });

  } catch (err) {
    console.error("❌ Earning error:", err);
  }
};