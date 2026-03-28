import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeClass = (path) =>
    location.pathname === path ? "text-gold" : "text-textMain";

  return (
   <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t shadow-md z-50 md:hidden">

      <div className="flex justify-around items-center h-full text-xs">

        {/* Dashboard */}
        <div
          onClick={() => navigate("/dashboard")}
          className={`flex flex-col items-center justify-center cursor-pointer ${activeClass("/dashboard")}`}
        >
          <span>🏠</span>
          <span>Home</span>
        </div>

        {/* Campaigns */}
        <div
          onClick={() => navigate("/user-campaigns")}
          className={`flex flex-col items-center justify-center cursor-pointer ${activeClass("/user-campaigns")}`}
        >
          <span>🔗</span>
          <span>Links</span>
        </div>

        {/* Earnings */}
        <div
          onClick={() => navigate("/my-activity")}
          className={`flex flex-col items-center justify-center cursor-pointer ${activeClass("/my-activity")}`}
        >
          <span>💰</span>
          <span>My Activity</span>
        </div>

        {/* Profile */}
        <div
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center justify-center cursor-pointer ${activeClass("/profile")}`}
        >
          <span>👤</span>
          <span>Profile</span>
        </div>

      </div>
    </div>
  );
}