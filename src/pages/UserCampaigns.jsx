import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";

export default function UserCampaigns() {

  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState("All");
  const [campaigns, setCampaigns] = useState([]);
  const [userId, setUserId] = useState("");
  
  const handleUniversalShare = (message) => {
    
  const encoded = encodeURIComponent(message);

  // ✅ detect mobile devices
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    // ✅ mobile → use native share
    navigator.share({ text: message }).catch(() => {});
  } else {
    // ✅ desktop → directly open WhatsApp (no Windows popup)
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }
};
  const [categories, setCategories] = useState(["All"]);
  const [sort, setSort] = useState("");
  const [offerFilter, setOfferFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserId(snap.data().userId);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const snapshot = await getDocs(collection(db, "campaigns"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const activeCampaigns = data.filter(c => c.status === "active");

      setCampaigns(activeCampaigns);

      const uniqueCategories = [
        "All",
        ...new Set(activeCampaigns.map(c => c.category).filter(Boolean))
      ];

      setCategories(uniqueCategories);
    };

    fetchCampaigns();
  }, []);

  let filteredCampaigns = [...campaigns];

  if (category !== "All") {
    filteredCampaigns = filteredCampaigns.filter(
      (c) => c.category === category
    );
  }

  if (search) {
    filteredCampaigns = filteredCampaigns.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (offerFilter) {
  filteredCampaigns = filteredCampaigns.filter(
    (c) => c.offer && c.offer >= Number(offerFilter)
  );
}

  if (sort === "low") {
  filteredCampaigns.sort((a, b) => {
    const priceA = a.offer
      ? a.price - (a.price * a.offer) / 100
      : a.price;

    const priceB = b.offer
      ? b.price - (b.price * b.offer) / 100
      : b.price;

    return priceA - priceB;
  });
} else if (sort === "high") {
  filteredCampaigns.sort((a, b) => {
    const priceA = a.offer
      ? a.price - (a.price * a.offer) / 100
      : a.price;

    const priceB = b.offer
      ? b.price - (b.price * b.offer) / 100
      : b.price;

    return priceB - priceA;
  });
}

  else if (sort === "latest") {
    filteredCampaigns.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  } else if (sort === "oldest") {
    filteredCampaigns.sort(
      (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
    );
  }

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const generateLink = (item) => {
    if (!userId) return "";
    const clickId = Date.now();
    return `${window.location.origin}/r/${item.id}-${userId}-${clickId}`;
  };

 const handleCopy = (item) => {
  const link = generateLink(item);
  if (!link) return;

  let finalPrice = item.price;

  if (item.offer) {
    finalPrice = Math.round(
      item.price - (item.price * item.offer) / 100
    );
  }

  const message = `🔥 ${item.title}

💰 Price: ₹${finalPrice}
${item.offer ? `🏷 ${item.offer}% OFF` : ""}

👉 Buy Now:
${link}`;

  navigator.clipboard.writeText(message);

  toast("Message copied 🚀 Paste anywhere!");
};

  const handleShare = (item) => {
  const link = generateLink(item);
  if (!link) return;

  let finalPrice = item.price;

  if (item.offer) {
    finalPrice = Math.round(
      item.price - (item.price * item.offer) / 100
    );
  }

  const message = `🔥 *${item.title}*

💰 Price: ₹${finalPrice}
${item.offer ? `🏷 ${item.offer}% OFF` : ""}

👉 Buy Now:
${link}`;

  handleUniversalShare(message); // ✅ FIXED
};

const handleShareAll = () => {
  if (selected.length === 0) {
    toast("Select at least one product");
    return;
  }

  let message = "";

  selected.forEach((id, index) => {
    const item = campaigns.find((c) => c.id === id);
    if (!item) return;

    // ✅ ADD THIS LINE (IMPORTANT)
    const clickId = Date.now() + Math.floor(Math.random() * 100000);
// ✅ SAVE CLICK (IMPORTANT)
addDoc(collection(db, "clicks"), {
  clickId: clickId.toString(),
  userId,
  campaignId: item.id,
  createdAt: serverTimestamp(),
});
    const link = `${window.location.origin}/r/${item.id}-${userId}-${clickId}`;

   let finalPrice = item.price;

if (item.offer) {
  finalPrice = Math.round(
    item.price - (item.price * item.offer) / 100
  );
}

message += `🔥 *${index + 1}. ${item.title}*

💰 Price: ₹${finalPrice}
${item.offer ? `🏷 ${item.offer}% OFF` : ""}

👉 Buy Now:
${link}

`;
  });

 handleUniversalShare(message);
 setSelected([]);
};

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">

        <h2 className="text-2xl font-bold mb-4">Campaigns</h2>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md"
        />

        <div className="flex gap-2 mb-4">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-md flex-1"
          >
            {categories.map((c, i) => (
              <option key={i}>{c}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="p-2 border rounded-md flex-1"
          >
            <option value="">Sort</option>
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="low">Price Low → High</option>
            <option value="high">Price High → Low</option>
          </select>
          <select
  value={offerFilter}
  onChange={(e) => setOfferFilter(e.target.value)}
  className="p-2 border rounded-md flex-1"
>
  <option value="">Offer</option>
  <option value="10">10%+ OFF</option>
  <option value="20">20%+ OFF</option>
  <option value="50">50%+ OFF</option>
</select>

        </div>

        <button
          onClick={handleShareAll}
          className="bg-primary text-white px-5 py-2 rounded-md text-sm mb-4"
        >
          Share Selected
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {filteredCampaigns.map((item) => {

            let earn = 0;
            let finalPrice = item.price;

if (item.offer) {
  finalPrice = Math.round(item.price - (item.price * item.offer) / 100);
}

            if (item.commissionType === "percentage") {
              earn = Math.round((item.price * item.commissionValue) / 100);
            } else if (item.commissionType === "fixed") {
              earn = item.commissionValue;
            }

            return (
              <div key={item.id} className="bg-white rounded-xl shadow p-4 relative">
                {/* 🔥 BADGES */}
<div className="absolute top-3 left-3 flex gap-1 flex-wrap z-10">

  {item.offer >= 20 && (
    <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded">
      🔥 Hot
    </span>
  )}

  {item.offer > 0 && item.offer < 20 && (
    <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded">
      ⚡ Offer
    </span>
  )}

  {item.commissionValue >= 10 && (
    <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded">
      💰 High Earn
    </span>
  )}

</div>

                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="absolute top-3 right-3 z-20"
                />

               <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">

  {item.offer > 0 && (
    <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
      {item.offer}% OFF
    </span>
  )}

  <img
    src={item.image}
    alt={item.title}
    className="max-h-full max-w-full object-contain"
  />
</div>

                <h3 className="font-semibold mt-2 mb-1">{item.title}</h3>
                {item.description && (
  <p className="text-sm text-gray-600 mb-1">
    {item.description}
  </p>
)}

                <div className="mb-1">
  {item.offer ? (
    <>
      <p className="text-gray-400 line-through text-sm">
        ₹{item.price}
      </p>
      <p className="text-green-600 font-bold text-lg">
        ₹{finalPrice}
      </p>
    </>
  ) : (
    <p className="text-lg font-bold">₹{item.price}</p>
  )}
</div>

                <p className="text-green-600 text-sm mb-1 font-semibold">
                  {item.offer ? `${item.offer}% OFF` : ""}
                </p>

                {/* ✅ ONLY CHANGE HERE */}
                <p className="text-primary font-bold mb-3">
                  {item.earnType === "order" && `Earn upto ${item.commissionValue}% (per order)`}
                  {item.earnType === "click" && `Earn upto ₹${earn} (per click)`}
                  {item.earnType === "install" && `Earn upto ₹${earn} (per install)`}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex-1 bg-primary text-white py-2 rounded-md text-sm"
                  >
                    Copy Message
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    className="flex-1 bg-gold text-black py-2 rounded-md text-sm"
                  >
                    Share
                  </button>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}