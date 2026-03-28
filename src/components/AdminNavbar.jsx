import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar({ toggleMenu }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="bg-white px-4 md:px-6 py-3 flex justify-between items-center shadow-sm border-b sticky top-0 z-50">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        {/* ☰ */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-primary text-2xl"
        >
          ☰
        </button>

        {/* LOGO */}
        <div
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/logo.png" alt="DenPartner" className="h-7" />

          <span className="text-base font-bold">
            <span className="text-primary">Den</span>
            <span className="text-gold">Partner</span>
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <button
        onClick={handleLogout}
        className="bg-gold text-black px-3 py-1.5 rounded-md font-semibold shadow"
      >
        Logout
      </button>
    </div>
  );
}