import { useEffect, useState } from "react";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

export default function AdminWithdraws() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortType, setSortType] = useState("latest");

  // ✅ NEW STATES (ONLY ADDITION)
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);

  const fetchRequests = async () => {
    try {
      const snap = await getDocs(collection(db, "withdrawRequests"));

      const data = snap.docs.map((docu) => ({
        id: docu.id,
        ...docu.data(),
      }));

      setRequests(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 🔄 PROCESSING
  const handleProcessing = async (req) => {
    try {
      console.log("👉 Processing user:", req.userId);

      const ref = doc(db, "withdrawRequests", req.id);

      await updateDoc(ref, {
        status: "processing",
      });

      const userRef = doc(db, "users", req.uid);

      if (!req.uid) {
        console.log("❌ USER UID NOT FOUND");
        toast.error("User not found");
        return;
      }

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("❌ USER DOC NOT FOUND");
        return;
      }

      const currentBalance = userSnap.data().walletBalance || 0;

      await updateDoc(userRef, {
        walletBalance: currentBalance - req.amount,
      });

      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        target: req.userId,
        title: "Withdraw Processing ⏳",
        message: `Your withdraw request of ₹${req.amount} is being processed.`,
        type: "withdraw",
        seen: false,
        createdAt: serverTimestamp(),
      });

      fetchRequests();
    } catch (err) {
      console.error("🔥 ERROR:", err);
      toast.error(err.message);
    }
  };

  // ✅ PAID
  const handlePaid = async (req) => {
    try {
      const reqRef = doc(db, "withdrawRequests", req.id);

      await updateDoc(reqRef, {
        status: "paid",
      });

      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        target: req.userId,
        title: "Withdraw Successful ✅",
        message: `₹${req.amount} has been successfully transferred to your bank.`,
        type: "withdraw",
        seen: false,
        createdAt: serverTimestamp(),
      });

      toast("✅ Marked as Paid");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // ❌ OPEN MODAL (REPLACED PROMPT)
  const openRejectModal = (req) => {
    setSelectedReq(req);
    setRejectModal(true);
  };

  // ❌ CONFIRM REJECT
  const confirmReject = async () => {
    if (!rejectReason) {
      toast.error("Please enter reason");
      return;
    }

    const req = selectedReq;

    try {
      const ref = doc(db, "withdrawRequests", req.id);

      await updateDoc(ref, {
        status: "rejected",
        adminComment: rejectReason,
      });

      if (req.status === "processing") {
        const userRef = doc(db, "users", req.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const currentBalance = userSnap.data().walletBalance || 0;

          await updateDoc(userRef, {
            walletBalance: currentBalance + req.amount,
          });
        }
      }

      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        target: req.userId,
        title: "Withdraw Rejected ❌",
        message: `Your withdraw request was rejected. Reason: ${rejectReason}`,
        type: "withdraw",
        seen: false,
        createdAt: serverTimestamp(),
      });

      toast("❌ Rejected");

      setRejectModal(false);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const d = new Date(timestamp.seconds * 1000);

    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  let filteredRequests = requests.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  filteredRequests = filteredRequests.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;

    if (sortType === "latest") {
      return b.createdAt.seconds - a.createdAt.seconds;
    } else {
      return a.createdAt.seconds - b.createdAt.seconds;
    }
  });

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">
        Withdraw Requests
      </h2>

      <div className="flex gap-2 mb-3 flex-wrap">
        {["all", "pending", "processing", "paid", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p>No requests</p>
      ) : (
        <div className="space-y-4">

          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="mb-3">
                <p><b>User:</b> {req.userId}</p>
                <p><b>Amount:</b> ₹{req.amount}</p>
                <p><b>Status:</b> {req.status}</p>

                <p className="text-sm text-gray-500">
                  {formatDate(req.createdAt)}
                </p>
              </div>

              {req.bank && (
                <div className="mb-3 text-sm bg-gray-50 p-3 rounded">
                  <p><b>Name:</b> {req.bank.name}</p>
                  <p><b>Account:</b> {req.bank.accountNumber}</p>
                  <p><b>IFSC:</b> {req.bank.ifsc}</p>
                </div>
              )}

              {req.adminComment && (
                <p className="text-red-600 text-sm mb-2">
                  Reason: {req.adminComment}
                </p>
              )}

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProcessing(req)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Processing
                  </button>

                  <button
                    onClick={() => openRejectModal(req)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {req.status === "processing" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePaid(req)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Mark as Paid
                  </button>

                  <button
                    onClick={() => openRejectModal(req)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

            </div>
          ))}

        </div>
      )}

      {/* ✅ NEW MODAL */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-xl">

            <h3 className="text-lg font-semibold mb-3">
              Reject Withdrawal ❌
            </h3>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full border p-2 rounded mb-4"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmReject}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}