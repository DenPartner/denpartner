import { useState, useEffect } from "react";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminCampaigns() {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [earnType, setEarnType] = useState("order");

  const [campaigns, setCampaigns] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
const [editData, setEditData] = useState({});

  const [filterCategory, setFilterCategory] = useState("All");
  const [sort, setSort] = useState("");

  const fetchCampaigns = async () => {
    const snap = await getDocs(collection(db, "campaigns"));

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    data.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt.seconds * 1000) - new Date(a.createdAt.seconds * 1000);
    });

    setCampaigns(data);

    const uniqueCategories = [
      ...new Set(data.map(c => c.category).filter(Boolean))
    ];

    setCategories(uniqueCategories);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAdd = async () => {
  if (!title || !price) {
    toast("Fill required fields");
    return;
  }

  try {
    if (editId) {
      // 🔥 UPDATE
      await updateDoc(doc(db, "campaigns", editId), {
        title,
        price: Number(price),
        offer,
        description,
        image,
        url,
        category,
        commissionType,
        commissionValue: Number(commissionValue),
        earnType,
        updatedAt: new Date()
      });

      toast("Campaign updated ✏️");
    } else {
      // 🔥 ADD
      await addDoc(collection(db, "campaigns"), {
        title,
        price: Number(price),
        offer,
        description,
        image,
        url,
        category,
        commissionType,
        commissionValue: Number(commissionValue),
        earnType,
        status: "active",
        createdAt: new Date(),
      });

      toast("Campaign added ✅");
    }

    // 🔥 RESET FORM
    setTitle("");
    setPrice("");
    setOffer("");
    setDescription("");
    setImage("");
    setUrl("");
    setCategory("");
    setCommissionValue("");
    setEditId(null);

    fetchCampaigns();

  } catch (err) {
    console.error(err);
    toast("Something went wrong");
  }
};

  const toggleStatus = async (c) => {
    const ref = doc(db, "campaigns", c.id);

    await updateDoc(ref, {
      status: c.status === "active" ? "paused" : "active",
    });

    fetchCampaigns();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete campaign?")) return;

    await deleteDoc(doc(db, "campaigns", id));
    fetchCampaigns();
  };

  let filtered = campaigns;

  if (filterCategory !== "All") {
    filtered = filtered.filter(c => c.category === filterCategory);
  }

  if (sort === "low") {
    filtered = filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div style={page}>

      <h2 style={titleStyle}>Add Campaign</h2>

      <div style={cardStyle}>

        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={input}/>
        <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} style={input}/>
        <input placeholder="Offer" value={offer} onChange={e=>setOffer(e.target.value)} style={input}/>
        <input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} style={input}/>
        <input placeholder="Image URL" value={image} onChange={e=>setImage(e.target.value)} style={input}/>
        <input placeholder="Product URL" value={url} onChange={e=>setUrl(e.target.value)} style={input}/>

        <div style={rowWrap}>

          <select value={category} onChange={(e)=>setCategory(e.target.value)} style={{...input, flex:1}}>
            <option value="">Select Category</option>
            {categories.map((c,i)=>(<option key={i}>{c}</option>))}
          </select>

          <input placeholder="New category" value={newCategory} onChange={(e)=>setNewCategory(e.target.value)} style={{...input, flex:1}}/>

          <button onClick={()=>{
            if(!newCategory) return;
            setCategories(prev=>[...new Set([...prev,newCategory])]);
            setCategory(newCategory);
            setNewCategory("");
          }} style={btnGold}>Add</button>

        </div>

        <select value={commissionType} onChange={(e)=>setCommissionType(e.target.value)} style={input}>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed ₹</option>
        </select>

        <input placeholder="Commission Value" value={commissionValue} onChange={(e)=>setCommissionValue(e.target.value)} style={input}/>

        <select value={earnType} onChange={(e)=>setEarnType(e.target.value)} style={input}>
          <option value="order">Per Order</option>
          <option value="click">Per Click</option>
          <option value="install">Per Install</option>
        </select>

        <button onClick={handleAdd} style={btnPrimary}>
  {editId ? "Update Campaign" : "Add Campaign"}
</button>
      </div>

      <div style={{  marginTop:20, display:"flex",  gap:10,  flexWrap:"wrap"}}>
        <select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)} style={input}>
          <option value="All">All Categories</option>
          {categories.map((c,i)=>(<option key={i}>{c}</option>))}
        </select>

        <select value={sort} onChange={(e)=>setSort(e.target.value)} style={input}>
          <option value="">Sort</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
        </select>
      </div>

      <h3 style={{ marginTop: 30 }}>All Campaigns</h3>

      {filtered.map((c) => {

        let date = "";
        if (c.createdAt) {
          const d = new Date(c.createdAt.seconds * 1000);
          date = d.toLocaleString();
        }

        return (
          <div key={c.id} style={listCard}>

           <div style={leftWrap}>
 {c.image && (
  <img src={c.image} alt="" style={{
       width: 50,
      height: 50,
      objectFit: "cover",
      borderRadius: 6,
      alignSelf: "flex-start"
    }}
  />
)}

  <div style={{flex:1, display:"flex", flexDirection:"column", gap:4}}>
    <h4 style={{fontWeight:600}}>{c.title}</h4>

{/* ✅ PRICE WITH OFFER */}
{c.offer ? (
  <>
    <p style={{ textDecoration: "line-through", color: "#999" }}>
      ₹{c.price}
    </p>
    <p style={{ color: "green", fontWeight: 600 }}>
      ₹{Math.round(c.price - (c.price * c.offer / 100))}
    </p>
    <p style={{ color: "#ff6600", fontSize: 13 }}>
      {c.offer}% OFF
    </p>
  </>
) : (
  <p>₹{c.price}</p>
)}

{/* ✅ DESCRIPTION */}
{c.description && (
  <p style={subText}>{c.description}</p>
)}

<p style={subText}>{c.category}</p>
    <p style={subText}>{c.commissionValue} {c.commissionType} / {c.earnType}</p>
    <p style={subText}>
  {c.updatedAt ? "Updated: " : "Added: "}
  {c.updatedAt
    ? new Date(c.updatedAt.seconds * 1000).toLocaleString()
    : date}
</p>

    {/* ✅ FULL WIDTH BOTTOM ROW */}
    <div style={bottomRow}>
      <span style={status(c.status)}>
        {c.status}
      </span>

      <div style={btnWrap}>

  <button
    onClick={()=>{
  setEditId(c.id);

  // 🔥 fill form
  setTitle(c.title || "");
  setPrice(c.price || "");
  setOffer(c.offer || "");
  setDescription(c.description || "");
  setImage(c.image || "");
  setUrl(c.url || "");
  setCategory(c.category || "");
  setCommissionType(c.commissionType || "percentage");
  setCommissionValue(c.commissionValue || "");
  setEarnType(c.earnType || "order");

  // 🔥 scroll to form
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
    style={btnGold}
  >
    Edit
  </button>

   <button onClick={()=>toggleStatus(c)} style={btnGold}>
    {c.status === "active" ? "Pause" : "Unpause"}
  </button>

  <button onClick={()=>handleDelete(c.id)} style={btnDanger}>
    Delete
  </button>

</div>
    </div>

  </div>
</div>

          </div>
        );
      })}

    </div>
  );
}

/* ✅ ADDED STYLES (FIX) */

const page = {
  width: "100%",
  padding: "12px",
  background: "#F8F9FA",
  minHeight: "100vh",
  boxSizing: "border-box"
};

const titleStyle = { fontSize: 22, fontWeight: 600 };

const cardStyle = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const input = {
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 6,
  flex: 1,
  minWidth: 120
};

const rowWrap = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center"
};

const btnPrimary = {
  background: "#0b5",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  width: "100%"
};
const bottomRow = {
  display: "flex",
  justifyContent: "space-between",  // 🔥 LEFT + RIGHT
  alignItems: "center",
  width: "100%",                    // 🔥 FULL WIDTH
  marginTop: 6,
  gap: 10
};

const btnGold = {
  background: "#f4c430",
  padding: "6px 12px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500
};

const btnDanger = {
  background: "#ff4d4f",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500
};

const listCard = {
  background: "#fff",
  padding: 16,
  borderRadius: 12,
  marginTop: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",   // ✅ vertical align fix
  flexWrap: "wrap",       // ✅ mobile safe
  gap: 10
};

const leftWrap = {
  display: "flex",
  flexDirection: "column",   // 🔥 KEY CHANGE
  gap: 8,
  flex: 1,
  minWidth: 0
};

const img = {
  width: 55,
  height: 55,
  objectFit: "cover",
  borderRadius: 8,
  flexShrink: 0
};
const subText = {
  color: "#666",
  fontSize: 13
};

const btnWrap = {
  display: "flex",
  gap: 8,
  alignItems: "center",   // ✅ same line alignment
  justifyContent: "flex-end"
};

const status = (s) => ({
  padding: "4px 8px",
  borderRadius: 6,
  background: s === "active" ? "#d4edda" : "#f8d7da"
});