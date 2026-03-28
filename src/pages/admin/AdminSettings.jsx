import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    orderCommission: 20,
    clickCommission: 30,
    installCommission: 25,
    minWithdraw: 10,
    withdrawEnabled: true,
    signupEnabled: true,
    campaignEnabled: true,
    platformName: "",
    supportEmail: "",
  });

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const ref = doc(db, "settings", "platform");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setSettings(snap.data());
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    // 🔥 VALIDATION
    if (settings.minWithdraw < 10 || settings.minWithdraw > 40000) {
      toast("Min withdraw must be between ₹10 and ₹40,000");
      return;
    }

    try {
      await setDoc(doc(db, "settings", "platform"), settings);
      toast("✅ Settings saved");
    } catch (err) {
      console.error(err);
      toast("Error saving settings");
    }
  };

  const handlePasswordChange = async () => {
    if (!password) {
      toast("Enter new password");
      return;
    }

    try {
      await updatePassword(auth.currentUser, password);
       toast("✅ Password updated");
      setPassword("");
    } catch (err) {
      console.error(err);
       toast("Error updating password");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">

      <h1 className="text-3xl font-bold text-primary mb-6">
        ⚙️ Admin Settings
      </h1>

      {/* 💰 COMMISSION */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          💰 Commission Settings
        </h2>

        <div className="mb-3">
          <label className="font-medium">Order Commission (%)</label>
          <p className="text-xs text-textSub mb-1">
            Percentage you keep from each order (remaining goes to user)
          </p>
          <input
            type="number"
            value={settings.orderCommission}
            onChange={(e) =>
              handleChange("orderCommission", Number(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="font-medium">Click Commission (%)</label>
          <p className="text-xs text-textSub mb-1">
            Platform cut for click-based campaigns
          </p>
          <input
            type="number"
            value={settings.clickCommission}
            onChange={(e) =>
              handleChange("clickCommission", Number(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">Install Commission (%)</label>
          <p className="text-xs text-textSub mb-1">
            Platform cut for app install campaigns
          </p>
          <input
            type="number"
            value={settings.installCommission}
            onChange={(e) =>
              handleChange("installCommission", Number(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* 🏢 PLATFORM INFO */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          🏢 Platform Info
        </h2>

        <div className="mb-3">
          <label className="font-medium">Platform Name</label>
          <input
            value={settings.platformName}
            onChange={(e) =>
              handleChange("platformName", e.target.value)
            }
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">Support Email</label>
          <input
            value={settings.supportEmail}
            onChange={(e) =>
              handleChange("supportEmail", e.target.value)
            }
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* 💸 WITHDRAW */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          💸 Withdraw Settings
        </h2>

        <div>
          <label className="font-medium">Minimum Withdraw Amount (₹)</label>
          <p className="text-xs text-textSub mb-1">
            Allowed range: ₹10 to ₹40,000
          </p>
          <input
            type="number"
            value={settings.minWithdraw}
            onChange={(e) =>
              handleChange("minWithdraw", Number(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* 🔘 CONTROLS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          🔘 Feature Controls
        </h2>

        <div className="flex justify-between mb-3">
          <span>Enable Withdraw</span>
          <input
            type="checkbox"
            checked={settings.withdrawEnabled}
            onChange={(e) =>
              handleChange("withdrawEnabled", e.target.checked)
            }
          />
        </div>

        <div className="flex justify-between mb-3">
          <span>Enable Signup</span>
          <input
            type="checkbox"
            checked={settings.signupEnabled}
            onChange={(e) =>
              handleChange("signupEnabled", e.target.checked)
            }
          />
        </div>

        <div className="flex justify-between">
          <span>Enable Campaigns</span>
          <input
            type="checkbox"
            checked={settings.campaignEnabled}
            onChange={(e) =>
              handleChange("campaignEnabled", e.target.checked)
            }
          />
        </div>
      </div>

      {/* 🔐 PASSWORD */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          🔐 Change Admin Password
        </h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <button
          onClick={handlePasswordChange}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>

      {/* SAVE */}
      <button
        onClick={handleSave}
        className="bg-gold text-black px-6 py-3 rounded font-semibold shadow w-full"
      >
        💾 Save All Settings
      </button>

    </div>
  );
}