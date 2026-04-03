import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  sendEmailVerification,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [newPassword, setNewPassword] = useState("");

  // ✅ NEW STATES (ONLY ADDITION)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const [form, setForm] = useState({
    phone: "",
    dob: "",
    gender: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          setForm({
            phone: data.phone || "",
            dob: data.dob || "",
            gender: data.gender || "",
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const checkPhoneExists = async (phone, currentUserId) => {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snap = await getDocs(q);

    let exists = false;

    snap.forEach((doc) => {
      if (doc.id !== currentUserId) {
        exists = true;
      }
    });

    return exists;
  };

  const handleVerifyEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      toast.success("Verification email sent ✅ Please check inbox");
    } else {
      toast("Email already verified");
    }
  };

  // 🔥 UPDATED (NO PROMPT)
  const handleChangePassword = async () => {
    if (!newPassword) {
      toast("Enter new password");
      return;
    }

    setShowPasswordModal(true);
  };

  // 🔥 NEW CONFIRM FUNCTION
  const confirmPasswordChange = async () => {
    try {
      if (!currentPassword) {
        toast("Enter current password");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      toast.success("Password updated successfully ✅");

      setNewPassword("");
      setCurrentPassword("");
      setShowPasswordModal(false);

    } catch (err) {
      console.error(err);
      toast.error("Incorrect current password ❌");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast("Phone must be exactly 10 digits");
      return;
    }

    const exists = await checkPhoneExists(form.phone, user.uid);

    if (exists) {
      toast("Phone number already used by another user");
      return;
    }

    if (!form.dob) {
      toast("Please select date of birth");
      return;
    }

    if (!form.gender) {
      toast("Please select gender");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
      });

      toast.success("Details saved successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error saving details");
    }
  };

  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto p-4 md:p-6">

        <h1 className="text-xl md:text-2xl font-bold mb-6">
          My Account
        </h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-2">
          <p><b>Name:</b> {userData.name}</p>
          <p><b>Email:</b> {userData.email}</p>
          <p><b>User ID:</b> {userData.userId}</p>

          <p>
            <b>Status:</b>{" "}
            {user?.emailVerified ? (
              <span className="text-green-600">Verified ✅</span>
            ) : (
              <span className="text-red-500">Not Verified ❌</span>
            )}
          </p>

          {!user?.emailVerified && (
            <button
              onClick={handleVerifyEmail}
              className="mt-2 bg-primary text-white px-4 py-1 rounded-md"
            >
              Verify Email
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">Personal Details</h2>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            maxLength={10}
            className="w-full p-2 border rounded-md"
          />

          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <button
            onClick={handleSave}
            className="w-full bg-primary text-white py-2 rounded-md"
          >
            Save Details
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
          />

          <button
            onClick={handleChangePassword}
            className="w-full bg-primary text-white py-2 rounded-md"
          >
            Update Password
          </button>
        </div>

      </div>

      {/* 🔥 PROFESSIONAL MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">

            <h2 className="text-lg font-semibold mb-2">
              🔒 Confirm Password
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Enter your current password to continue
            </p>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmPasswordChange}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}