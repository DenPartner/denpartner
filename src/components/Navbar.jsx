import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIXED SCROLL (works from any page)
  const handleHowClick = () => {
    setOpen(false);

    // If already on home → just scroll
    if (location.pathname === "/") {
      const section = document.getElementById("how");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If not on home → go to home with state
      navigate("/", { state: { scrollTo: "how" } });
    }
  };

  return (
    <div className="w-full bg-[#F8F5F0] shadow-sm border-b">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-3 py-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="DenPartner" className="h-10 object-contain" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Den</span>
            <span className="text-gold">Partner</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMain">

          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>

          <span
            onClick={handleHowClick}
            className="cursor-pointer hover:text-primary transition"
          >
            How It Works
          </span>

          <Link to="/campaigns" className="hover:text-primary transition">
            Campaigns
          </Link>

          <Link to="/login" className="hover:text-primary transition">
            Login
          </Link>

          <Link
            to="/login"
            className="bg-gold text-black px-5 py-2 rounded-md font-semibold shadow hover:opacity-90 transition"
          >
            Get Started
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button onClick={() => setOpen(!open)} className="text-xl">
            ☰
          </button>
        </div>

      </div>

      {/* ✅ MOBILE MENU FIXED */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-4 pt-2 bg-[#F8F5F0] shadow text-sm font-medium text-textMain">

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block"
          >
            Home
          </Link>

          <div
            onClick={handleHowClick}
            className="block cursor-pointer"
          >
            How It Works
          </div>

          <Link
            to="/campaigns"
            onClick={() => setOpen(false)}
            className="block"
          >
            Campaigns
          </Link>

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block"
          >
            Login
          </Link>

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block bg-gold text-black px-5 py-2 rounded-md font-semibold text-center"
          >
            Get Started
          </Link>

        </div>
      )}

    </div>
  );
}