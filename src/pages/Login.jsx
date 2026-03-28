import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";
import { doc, setDoc, collection, getDocs, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [forgot, setForgot] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const generateUserId = async () => {
    const snap = await getDocs(collection(db, "users"));
    const count = snap.size + 1;
    return "DEN" + count.toString().padStart(2, "0");
  };

  const handleAction = async (e) => {
    if (e) e.preventDefault();

    try {
      // 🔐 FORGOT PASSWORD
      if (forgot) {
        if (!email.includes("@")) {
          toast("Enter valid email");
          return;
        }

        await sendPasswordResetEmail(auth, email);
        toast("If email exists, reset link sent ✅");
        setEmail("");
        return;
      }

      // 🆕 SIGNUP
      if (isSignup) {
        if (!accepted) {
          toast("Please accept Terms & Conditions");
          return;
        }

        if (!email.includes("@")) {
          toast("Enter valid email");
          return;
        }

        if (password.length < 6) {
          toast("Password must be at least 6 characters");
          return;
        }

        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userId = await generateUserId();

        // 🔥 SAVE USER
        await setDoc(doc(db, "users", userCred.user.uid), {
          userId: userId,
          name: name,
          email: email,
          walletBalance: 0,
          createdAt: new Date(),
        });

        // 🔔 AUTO WELCOME NOTIFICATION
        await addDoc(collection(db, "notifications"), {
          userId: userCred.user.uid,
          title: "Welcome 🎉",
          message:
            "Welcome to DenPartner! Start sharing links and earn money 💰. Please verify your email in Profile → My Account for better security.",
          type: "system",
          createdAt: serverTimestamp(),
        });

        toast("Signup successful 🎉");

        setName("");
        setEmail("");
        setPassword("");
        setAccepted(false);

        navigate("/dashboard");
      }

      // 🔓 LOGIN
else {
  if (!email.includes("@")) {
    toast("Enter valid email");
    return;
  }

  const userCred = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  let snap = await getDoc(
  doc(db, "users", userCred.user.uid)
);

let isAdmin = false;

if (!snap.exists()) {
  snap = await getDoc(
    doc(db, "admins", userCred.user.uid)
  );

  if (snap.exists()) {
    isAdmin = true;
  }
}

if (!snap.exists()) {
  toast("User data not found");
  return;
}

  // ✅ BLOCK CHECK (NEW)
  if (snap.data().isBlocked) {
    await auth.signOut();
    toast("Your account is blocked. Contact support team.");
    return;
  }

  toast("Login successful ✅");

  setEmail("");
  setPassword("");

setTimeout(() => {
  navigate(isAdmin ? "/admin" : "/dashboard");
}, 500);
}

    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast("Account not found");
      } else if (error.code === "auth/wrong-password") {
        toast("Incorrect password");
      } else if (error.code === "auth/invalid-email") {
        toast("Enter valid email");
      } else {
        toast(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4 pt-20">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">

        <h2 className="text-2xl font-bold text-center mb-6 text-textMain">
          {forgot
            ? "Reset Password 🔑"
            : isSignup
            ? "Create Account 🚀"
            : "Welcome Back 👋"}
        </h2>

        <form onSubmit={handleAction} className="space-y-4">

          {isSignup && !forgot && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border px-4 py-3 rounded-md"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-4 py-3 rounded-md"
          />

          {!forgot && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isSignup ? "Create Password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border px-4 py-3 rounded-md"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-sm text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          )}

          {isSignup && !forgot && (
  <div className="flex items-start gap-2 text-sm">
    <input
      type="checkbox"
      checked={accepted}
      onChange={() => setAccepted(!accepted)}
      className="mt-1"
    />

    <span className="leading-6">
      I agree to the{" "}
      <span
        onClick={() => navigate("/user-privacy")}
        className="text-primary cursor-pointer underline"
      >
        Privacy Policy
      </span>{" "}
      and{" "}
      <span
        onClick={() => navigate("/terms")}
        className="text-primary cursor-pointer underline"
      >
        Terms & Conditions
      </span>
    </span>
  </div>
)}

          <button
            type="submit"
            className="w-full bg-gold py-3 rounded-md font-semibold"
          >
            {forgot
              ? "Send Reset Link"
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        {!forgot && !isSignup && (
          <p
            onClick={() => setForgot(true)}
            className="text-sm text-right mt-2 text-primary cursor-pointer"
          >
            Forgot Password?
          </p>
        )}

        {!forgot && (
          <p className="text-sm text-center mt-5">
            {isSignup
              ? "Already have an account?"
              : "Don’t have an account?"}{" "}
            <span
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary cursor-pointer font-medium"
            >
              {isSignup ? "Login" : "Sign up"}
            </span>
          </p>
        )}

        {forgot && (
          <p
            onClick={() => setForgot(false)}
            className="text-sm text-center mt-5 text-primary cursor-pointer"
          >
            ← Back to Login
          </p>
        )}
      </div>
    </div>
  );
}