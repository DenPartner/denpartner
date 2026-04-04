import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Campaigns() {

  const navigate = useNavigate();

  const campaigns = [
    { title: "Saree Sale", desc: "Promote trending sarees.", type: "order" },
    { title: "Mobile Deals", desc: "Share mobile offers.", type: "order" },
    { title: "Fashion", desc: "Promote fashion products.", type: "click" },
    { title: "Home&Kitchen", desc: "Share Home&Kitchen items", type: "order" },
    { title: "App Install Offer", desc: "Earn from installs.", type: "install" },
    { title: "Electronics Deals", desc: "Promote gadgets.", type: "order" },
  ];

  const [index, setIndex] = useState(0);

  // ✅ AUTO CHANGE (simple)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % campaigns.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const current = campaigns[index];

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center">

      <div className="max-w-4xl mx-auto px-4 w-full text-center">

        <h1 className="text-3xl font-bold mb-4">
          Available Campaigns
        </h1>

        <p className="text-textSub mb-10">
          Share products. Earn money. No investment needed.
        </p>

        {/* ✅ CENTER CARD */}
        <div className="bg-white rounded-xl p-6 shadow-md max-w-md mx-auto">

          <h3 className="font-semibold text-lg mb-2">
            {current.title}
          </h3>

          <p className="text-sm text-textSub mb-3">
            {current.desc}
          </p>

          <p className="text-green-600 font-semibold mb-4">
            Earn {current.type === "order" && "per order"}
            {current.type === "click" && "per click"}
            {current.type === "install" && "per install"}
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gold px-4 py-2 rounded-md font-semibold"
          >
            Get Link
          </button>

        </div>

        {/* CTA */}
        <div className="mt-10">
          <p className="text-lg font-semibold mb-3">
            Start earning today 🚀
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold"
          >
            Create Free Account
          </button>
        </div>

      </div>

    </div>
  );
}