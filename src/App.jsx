import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { signOut } from "firebase/auth";
import { auth as firebaseAuth } from "./firebase";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import toast from "react-hot-toast"; // ✅ ADDED

import Navbar from "./components/Navbar";
import UserNavbar from "./components/UserNavbar";
import BottomNav from "./components/BottomNav";
// ❌ REMOVE AdminNavbar import (not needed here)

import Home from "./pages/Home";
import Login from "./pages/Login";
import Campaigns from "./pages/Campaigns";
import UserDashboard from "./pages/UserDashboard";

import About from "./pages/About";
import FAQs from "./pages/FAQs";
import AffiliateTips from "./pages/AffiliateTips";
import PaymentInfo from "./pages/PaymentInfo";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import UserCampaigns from "./pages/UserCampaigns";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import MyActivity from "./pages/MyActivity";
import Withdraw from "./pages/Withdraw";
import Help from "./pages/Help";
import UserAbout from "./pages/UserAbout";
import UserPrivacy from "./pages/UserPrivacy";
import MyAccount from "./pages/MyAccount";
import AdminSupport from "./pages/admin/AdminSupport";

import Redirect from "./pages/Redirect";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCSV from "./pages/admin/AdminCSV";
import AdminWithdraws from "./pages/admin/AdminWithdraws";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCSVHistory from "./pages/admin/AdminCSVHistory";

export default function App() {
  const auth = useAuth();
  const user = auth?.user;
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 BLOCK CHECK (NEW)
  useEffect(() => {
    const handleBlock = async () => {
      if (user?.isBlocked) {
        toast("Your account is blocked. Contact support team.");

        await signOut(firebaseAuth);

        navigate("/login");
      }
    };

    handleBlock();
  }, [user, navigate]);

  // 🔥 AUTO REDIRECT ADMIN
useEffect(() => {
  const checkAdmin = async () => {
    if (!user) return;

    try {
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (
        adminSnap.exists() &&
        location.pathname === "/dashboard"
      ) {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Admin check error:", err);
    }
  };

  checkAdmin();
}, [user, location.pathname, navigate]);
  const isUserPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/user-") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/my-activity") ||
    location.pathname.startsWith("/withdraw") ||
    location.pathname.startsWith("/help") ||
    location.pathname.startsWith("/user-about") ||
    location.pathname.startsWith("/user-privacy") ||
    location.pathname.startsWith("/my-account");

  return (
    <div className="w-full min-h-screen overflow-x-hidden">

      {/* ✅ FIXED NAVBAR */}
      {!location.pathname.startsWith("/admin") && (
        isUserPage && user ? (
          <UserNavbar />
        ) : (
          <Navbar />
        )
      )}

      {/* ✅ TOASTER (CORRECT PLACE) */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />

      {/* ROUTES */}
      <div className={`w-full ${isUserPage && user ? "pb-16 md:pb-0" : ""}`}>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/campaigns" element={<Campaigns />} />

          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/user-campaigns" element={<UserCampaigns />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-activity" element={<MyActivity />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/help" element={<Help />} />
          <Route path="/user-about" element={<UserAbout />} />
          <Route path="/user-privacy" element={<UserPrivacy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/my-account" element={<MyAccount />} />

          <Route path="/r/:code" element={<Redirect />} />

          {/* 🔐 ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="campaigns" element={<AdminCampaigns />} />
            <Route path="csv" element={<AdminCSV />} />
            <Route path="withdraws" element={<AdminWithdraws />} />
            <Route path="support" element={<AdminSupport />} /> {/* ✅ FIXED */}
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="csv-history" element={<AdminCSVHistory />} />
          </Route>

          <Route path="/about" element={<About />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/tips" element={<AffiliateTips />} />
          <Route path="/payments" element={<PaymentInfo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

        </Routes>
      </div>

      {/* BOTTOM NAV */}
      {isUserPage && user && <BottomNav />}

    </div>
  );
}