import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const [supportCount, setSupportCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "support"), (snap) => {
      const unread = snap.docs.filter(d => !d.data().seen).length;
      setSupportCount(unread);
    });

    return () => unsub();
  }, []);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Campaigns", path: "/admin/campaigns" },
    { name: "CSV Upload", path: "/admin/csv" },
    { name: "CSV History", path: "/admin/csv-history" },
    { name: "Withdraws", path: "/admin/withdraws" },
    { name: "Notifications", path: "/admin/notifications" },
    { name: "Support", path: "/admin/support" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      <AdminNavbar toggleMenu={() => setOpen(!open)} />

      <div className="flex flex-1 relative">

        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
        )}

        <div
          className={`fixed md:static top-0 left-0 h-full w-64 bg-primary text-white p-6 z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

          <nav className="flex flex-col gap-3">
            {menu.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-md transition font-medium
                    ${
                      active
                        ? "bg-gold text-black"
                        : "hover:bg-white/10 hover:text-gold"
                    }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{item.name}</span>

                    {item.name === "Support" && supportCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {supportCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 w-full p-3 md:p-6 overflow-x-hidden">
          <Outlet />
        </div>

      </div>
    </div>
  );
}