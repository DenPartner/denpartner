import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  sendEmailVerification,
  updatePassword,
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

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [newPassword, setNewPassword] = useState("");

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

  // 🔥 DUPLICATE PHONE CHECK (NEW)
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

  // 🔹 Email Verification
  const handleVerifyEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      toast("Verification email sent ✅");
    } else {
      toast("Email already verified");
    }
  };

  // 🔹 Change Password
  const handleChangePassword = async () => {
    if (!newPassword) {
      toast("Enter new password");
      return;
    }

    try {
      await updatePassword(user, newPassword);
      toast("Password updated ✅");
      setNewPassword("");
    } catch (err) {
      toast("Error updating password");
    }
  };

  // 🔥 HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 SAVE DETAILS
  const handleSave = async () => {
    // Phone validation
    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast("Phone must be exactly 10 digits");
      return;
    }

    // ❗ DUPLICATE CHECK (NEW)
    const exists = await checkPhoneExists(form.phone, user.uid);

    if (exists) {
      toast("Phone number already used by another user");
      return;
    }

    // DOB validation
    if (!form.dob) {
      toast("Please select date of birth");
      return;
    }

    // Gender validation
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

      toast("Details saved successfully ✅");
    } catch (err) {
      console.error(err);
      toast("Error saving details");
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

          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
              placeholder="Enter 10 digit phone"
              className="w-full p-2 border rounded-md mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:opacity-90"
          >
            Save Details
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h2 className="font-semibold">Change Password</h2>

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
    </div>
  );
}import { useEffect, useState } from "react";
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

  // 🔥 DUPLICATE PHONE CHECK (NEW)
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

  // 🔹 Email Verification
  const handleVerifyEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      toast.success("Verification email sent ✅ Please check inbox");
    } else {
      toast("Email already verified");
    }
  };

  // 🔹 Change Password (FIXED 🔥)
  const handleChangePassword = async () => {
    if (!newPassword) {
      toast("Enter new password");
      return;
    }

    try {
      const currentPassword = prompt("Enter your current password");

      if (!currentPassword) {
        toast("Current password required");
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
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating password");
    }
  };

  // 🔥 HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 SAVE DETAILS
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

          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
              placeholder="Enter 10 digit phone"
              className="w-full p-2 border rounded-md mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:opacity-90"
          >
            Save Details
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h2 className="font-semibold">Change Password</h2>

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
    </div>
  );
}