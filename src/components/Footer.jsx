import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {

  const navigate = useNavigate();

  // 🔽 MOBILE TOGGLE STATES
  const [openQuick, setOpenQuick] = useState(false);
  const [openResources, setOpenResources] = useState(false);
  const [openSupport, setOpenSupport] = useState(false);

  const handleHowClick = () => {
    navigate("/");

    setTimeout(() => {
      const section = document.getElementById("how");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <footer className="bg-primary text-white pt-16 mt-20">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-6 md:gap-10">

          {/* QUICK LINKS */}
          <div>
            <div
              onClick={() => setOpenQuick(!openQuick)}
              className="flex justify-between items-center cursor-pointer md:cursor-default"
            >
              <h3 className="font-semibold text-lg border-b border-white/20 pb-2 w-full">
                Quick Links
              </h3>
              <span className="md:hidden ml-2">
                {openQuick ? "▲" : "▼"}
              </span>
            </div>

            <ul className={`space-y-2 text-sm text-white/80 mt-3 ${openQuick ? "block" : "hidden"} md:block`}>
              
              <li>
                <Link to="/" className="hover:text-gold">Home</Link>
              </li>

              <li>
                <span onClick={handleHowClick} className="hover:text-gold cursor-pointer">
                  How it Works
                </span>
              </li>

              <li>
                <Link to="/about" className="hover:text-gold">About Us</Link>
              </li>

            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <div
              onClick={() => setOpenResources(!openResources)}
              className="flex justify-between items-center cursor-pointer md:cursor-default"
            >
              <h3 className="font-semibold text-lg border-b border-white/20 pb-2 w-full">
                Resources
              </h3>
              <span className="md:hidden ml-2">
                {openResources ? "▲" : "▼"}
              </span>
            </div>

            <ul className={`space-y-2 text-sm text-white/80 mt-3 ${openResources ? "block" : "hidden"} md:block`}>

              <li>
                <Link to="/faqs" className="hover:text-gold">FAQs</Link>
              </li>

              <li>
                <Link to="/tips" className="hover:text-gold">Affiliate Tips</Link>
              </li>

              <li>
                <Link to="/payments" className="hover:text-gold">Payment Info</Link>
              </li>

            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <div
              onClick={() => setOpenSupport(!openSupport)}
              className="flex justify-between items-center cursor-pointer md:cursor-default"
            >
              <h3 className="font-semibold text-lg border-b border-white/20 pb-2 w-full">
                Support
              </h3>
              <span className="md:hidden ml-2">
                {openSupport ? "▲" : "▼"}
              </span>
            </div>

            <ul className={`space-y-2 text-sm text-white/80 mt-3 ${openSupport ? "block" : "hidden"} md:block`}>

              <li>
                <Link to="/contact" className="hover:text-gold">Contact Us</Link>
              </li>

              <li>
                <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold">Terms & Conditions</Link>
              </li>

            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-white/20 pb-2">
              Follow Us
            </h3>
           <div className="flex gap-4 mt-3">
  <a
    href="https://www.instagram.com/startwithme1597?igsh=OWJmdzBpdWRtNjNq"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white hover:scale-110 transition"
  >
    <FaInstagram size={20} />
  </a>
</div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-12 border-t border-white/20 pt-6 text-center text-sm text-white/60">
          © 2026 DenPartner. All rights reserved.
        </div>

      </div>

    </footer>
  );
}