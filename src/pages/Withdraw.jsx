import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState({
    accountNumber: "",
    ifsc: "",
    name: "",
  });
  const [wallet, setWallet] = useState(0);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setUserData(data);
        setWallet(data.walletBalance || 0);

        if (data.bankDetails) {
          setBank(data.bankDetails);
        }

        const q = query(
          collection(db, "withdrawRequests"),
          where("userId", "==", data.userId)
        );

        const historySnap = await getDocs(q);

        let historyData = historySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        historyData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        setHistory(historyData);
      }
    };

    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp.seconds * 1000);

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  const checkAccountExists = async (
    accountNumber,
    currentUserId
  ) => {
    const q = query(
      collection(db, "users"),
      where("bankDetails.accountNumber", "==", accountNumber)
    );

    const snap = await getDocs(q);

    let exists = false;

    snap.forEach((doc) => {
      if (doc.id !== currentUserId) {
        exists = true;
      }
    });

    return exists;
  };

  // ✅ UPDATED BANK VALIDATION
  const saveBank = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!/^[a-zA-Z\s]+$/.test(bank.name)) {
      toast("Name should contain only letters");
      return;
    }

    if (!/^[0-9]+$/.test(bank.accountNumber)) {
      toast("Account number should be digits only");
      return;
    }

    if (!/^[A-Za-z0-9]+$/.test(bank.ifsc)) {
      toast("IFSC should be letters & numbers only");
      return;
    }

    if (!bank.accountNumber || !bank.ifsc || !bank.name) {
      toast("Please fill all bank details");
      return;
    }

    const exists = await checkAccountExists(
      bank.accountNumber,
      user.uid
    );

    if (exists) {
      toast("This bank account is already used by another user");
      return;
    }

    await setDoc(
      doc(db, "users", user.uid),
      { bankDetails: bank },
      { merge: true }
    );

    toast("Bank details saved ✅");
  };

  const handleWithdraw = async () => {
    const user = auth.currentUser;

    if (!user || !userData) return;
    if (isSubmitting) return;

    // ✅ VERIFY CHECK
    if (!user.emailVerified) {
      toast("Please verify your email first");
      navigate("/my-account");
      return;
    }

    const amt = Number(amount);

    // ✅ VALIDATIONS BEFORE DB
    if (!amt || amt < 10) {
      toast("Minimum withdrawal is ₹10");
      return;
    }

    if (amt > wallet) {
      toast("Insufficient balance");
      return;
    }

    if (!bank.accountNumber || !bank.ifsc || !bank.name) {
      toast("Please add bank details");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ DAILY LIMIT STRICT (MAX 3)
      const latestQuery = query(
        collection(db, "withdrawRequests"),
        where("userId", "==", userData.userId)
      );

      const latestSnap = await getDocs(latestQuery);

      const today = new Date().toDateString();

      const todayCount = latestSnap.docs.filter((docSnap) => {
        const data = docSnap.data();
        if (!data.createdAt) return false;

        const reqDate = new Date(
          data.createdAt.seconds * 1000
        ).toDateString();

        return reqDate === today;
      }).length;

      if (todayCount >= 3) {
        toast("Max 3 withdrawals allowed per day");
        setIsSubmitting(false);
        return;
      }

      // ✅ CREATE REQUEST ONLY AFTER ALL CHECKS PASS
      await addDoc(collection(db, "withdrawRequests"), {
        userId: userData.userId,
        uid: user.uid,
        amount: amt,
        bank,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Withdraw Requested 💸",
        message: `Your withdraw request of ₹${amt} is submitted.`,
        type: "withdraw",
        createdAt: serverTimestamp(),
      });

      const newBalance = wallet - amt;

      await setDoc(
        doc(db, "users", user.uid),
        { walletBalance: newBalance },
        { merge: true }
      );

      setWallet(newBalance);
      setAmount("");

      toast("Withdraw request submitted ✅");

      // refresh history
      const historyQuery = query(
        collection(db, "withdrawRequests"),
        where("userId", "==", userData.userId)
      );

      const historySnap = await getDocs(historyQuery);

      let historyData = historySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      historyData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });

      setHistory(historyData);
    } catch (err) {
      console.error(err);
      toast("Withdraw failed ❌");
    }

    setIsSubmitting(false);
  };

  const getStatusColor = (status) => {
    if (status === "pending")
      return "bg-yellow-100 text-yellow-700";
    if (status === "processing")
      return "bg-blue-100 text-blue-700";
    if (status === "paid")
      return "bg-green-100 text-green-700";
    if (status === "rejected")
      return "bg-red-100 text-red-700";

    return "bg-gray-100";
  };

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6 text-primary">
          Withdraw Money
        </h1>

        <div className="bg-white p-4 rounded-xl shadow mb-4 border-l-4 border-primary">
          <p className="text-sm text-textSub">
            Available Balance
          </p>
          <h2 className="text-2xl font-bold text-primary">
            ₹{wallet}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <h3 className="font-semibold mb-3 text-primary">
            Bank Details
          </h3>

          <input
            placeholder="Account Holder Name"
            value={bank.name}
            onChange={(e) =>
              setBank({
                ...bank,
                name: e.target.value,
              })
            }
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            placeholder="Account Number"
            value={bank.accountNumber}
            onChange={(e) =>
              setBank({
                ...bank,
                accountNumber: e.target.value,
              })
            }
            className="w-full mb-2 p-2 border rounded"
          />

          <input
            placeholder="IFSC Code"
            value={bank.ifsc}
            onChange={(e) =>
              setBank({
                ...bank,
                ifsc: e.target.value,
              })
            }
            className="w-full mb-2 p-2 border rounded"
          />

          <button
            onClick={saveBank}
            className="w-full bg-gold py-2 rounded font-semibold"
          >
            Save Bank Details
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <input
            value={amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full mb-3 p-2 border rounded"
          />

          <button
            onClick={handleWithdraw}
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : "Request Withdraw"}
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3 text-primary">
            Withdraw History
          </h3>

          {history.map((item) => (
            <div key={item.id} className="border-b py-3">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">
                  ₹{item.amount}
                </span>

                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {formatDate(item.createdAt)}
              </p>

              {item.adminComment && (
                <p className="text-red-600 text-xs mt-1">
                  Reason: {item.adminComment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}