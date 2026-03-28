import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const ref = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserName(snap.data().name || "User");
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const menuItem =
    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition hover:bg-primary/10";

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="p-5 border-b flex items-center gap-3">
          <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">
              {userName}
            </h2>
            <p className="text-xs text-gray-400">Welcome 👋</p>
          </div>
        </div>

        {/* MENU */}
        <div className="p-4 space-y-2">

          <div
            onClick={() => {
              navigate("/dashboard");
              setIsOpen(false);
            }}
            className={menuItem}
          >
            📊 Dashboard
          </div>

          <div
            onClick={() => {
              navigate("/user-campaigns");
              setIsOpen(false);
            }}
            className={menuItem}
          >
            🔗 Campaigns
          </div>

          <div
            onClick={() => {
              navigate("/my-activity");
              setIsOpen(false);
            }}
            className={menuItem}
          >
            📈 My Activity
          </div>

          <div
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className={menuItem}
          >
            👤 Profile
          </div>

          <div
            onClick={() => {
              navigate("/notifications");
              setIsOpen(false);
            }}
            className={menuItem}
          >
            🔔 Notifications
          </div>

          {/* 🔴 LOGOUT (MOVED HERE) */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-600 font-semibold hover:bg-red-50"
          >
            🚪 Logout
          </div>

        </div>
      </div>
    </>
  );
}