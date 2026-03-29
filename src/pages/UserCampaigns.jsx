import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function UserCampaigns() {

  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState("All");
  const [campaigns, setCampaigns] = useState([]);
  const [userId, setUserId] = useState("");

  const [categories, setCategories] = useState(["All"]);
  const [sort, setSort] = useState("");
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

  // ✅ UPDATED SORT LOGIC (price + latest)
  if (sort === "low") {
    filteredCampaigns.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filteredCampaigns.sort((a, b) => b.price - a.price);
  } else if (sort === "latest") {
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
    navigator.clipboard.writeText(link);
    toast("Link copied 🔗");
  };

  const handleShare = (item) => {
    const link = generateLink(item);
    if (!link) return;

    const message = `🔥 ${item.title}
💰 Price: ₹${item.price}
🎁 ${item.offer}

Buy Now:
${link}`;

    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: message,
        url: link,
      });
    } else {
      navigator.clipboard.writeText(message);
      toast("Link copied!");
    }
  };

  const handleShareAll = () => {
    if (selected.length === 0) {
      toast("Select at least one product");
      return;
    }

    const messages = campaigns
      .filter((c) => selected.includes(c.id))
      .map((item) => {
        const link = generateLink(item);
        return `🔥 *${item.title}*
💰 ₹${item.price}
🎁 ${item.offer || "Deal"}

👉 ${link}`;
      })
      .join("\n\n------------------\n\n");

    navigator.clipboard.writeText(messages);
    toast("All copied!");
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

        {/* ✅ ALL FILTERS IN ONE LINE */}
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

            if (item.commissionType === "percentage") {
              earn = Math.round((item.price * item.commissionValue) / 100);
            } else if (item.commissionType === "fixed") {
              earn = item.commissionValue;
            }

            return (
              <div key={item.id} className="bg-white rounded-xl shadow p-4 relative">

                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="absolute top-3 right-3"
                />

                <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h3 className="font-semibold mt-2 mb-1">{item.title}</h3>

                <p className="text-lg font-bold">₹{item.price}</p>

                <p className="text-green-600 text-sm mb-1 font-semibold">
                  {item.offer ? `Offer ${item.offer}%` : ""}
                </p>

                <p className="text-primary font-bold mb-3">
                  Earn upto ₹{earn}{" "}
                  {item.earnType === "order" && "(per order)"}
                  {item.earnType === "click" && "(per click)"}
                  {item.earnType === "install" && "(per install)"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex-1 bg-primary text-white py-2 rounded-md text-sm"
                  >
                    Copy
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