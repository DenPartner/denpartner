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
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [earnType, setEarnType] = useState("order");

  const [campaigns, setCampaigns] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const fetchCampaigns = async () => {
    const snap = await getDocs(collection(db, "campaigns"));

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

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

    await addDoc(collection(db, "campaigns"), {
      title,
      price: Number(price),
      offer,
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

    setTitle("");
    setPrice("");
    setOffer("");
    setImage("");
    setUrl("");
    setCategory("");
    setCommissionValue("");

    fetchCampaigns();
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

  return (
    <div style={page}>

      <h2 style={titleStyle}>Add Campaign</h2>

      {/* FORM */}
      <div style={cardStyle}>

        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={input}/>
        <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} style={input}/>
        <input placeholder="Offer" value={offer} onChange={e=>setOffer(e.target.value)} style={input}/>
        <input placeholder="Image URL" value={image} onChange={e=>setImage(e.target.value)} style={input}/>
        <input placeholder="Product URL" value={url} onChange={e=>setUrl(e.target.value)} style={input}/>

        {/* CATEGORY */}
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

        <button onClick={handleAdd} style={btnPrimary}>Add Campaign</button>
      </div>

      {/* LIST */}
      <h3 style={{ marginTop: 30 }}>All Campaigns</h3>

      {campaigns.map((c) => (
        <div key={c.id} style={listCard}>

          {/* LEFT */}
          <div style={leftWrap}>
            <img src={c.image} alt="" style={img}/>

            <div style={{flex:1}}>
              <h4 style={{fontWeight:600}}>{c.title}</h4>
              <p>₹{c.price}</p>
              <p style={subText}>{c.category}</p>
              <p style={subText}>{c.commissionValue} {c.commissionType} / {c.earnType}</p>

              <span style={status(c.status)}>
                {c.status}
              </span>
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div style={btnWrap}>
            <button onClick={()=>toggleStatus(c)} style={btnGold}>
              {c.status === "active" ? "Pause" : "Unpause"}
            </button>

            <button onClick={()=>handleDelete(c.id)} style={btnDanger}>
              Delete
            </button>
          </div>

        </div>
      ))}

    </div>
  );
}

/* 🎨 FIXED STYLES */

const page = {
  width:"100%",
  padding:"12px",
  background:"#F8F9FA",
  minHeight:"100vh",
  boxSizing:"border-box"
};

const titleStyle = {
  fontSize:22,
  fontWeight:700,
  color:"#14532D"
};

const cardStyle = {
  background:"#fff",
  padding:16,
  borderRadius:12,
  marginTop:15,
  boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
  display:"flex",
  flexDirection:"column",
  gap:10
};

const listCard = {
  background:"#fff",
  padding:12,
  borderRadius:12,
  marginBottom:12,
  display:"flex",
  flexDirection:"column",
  gap:10,
  boxShadow:"0 2px 8px rgba(0,0,0,0.06)"
};

const leftWrap = {
  display:"flex",
  gap:10,
  alignItems:"flex-start"
};

const img = {
  width:70,
  height:70,
  objectFit:"cover",
  borderRadius:10
};

const btnWrap = {
  display:"flex",
  flexWrap:"wrap",
  gap:8
};

const rowWrap = {
  display:"flex",
  flexWrap:"wrap",
  gap:8
};

const input = {
  padding:10,
  border:"1px solid #ccc",
  borderRadius:6,
  width:"100%"
};

const subText = {
  fontSize:12,
  color:"#6C757D"
};

const status = (s) => ({
  padding:"3px 8px",
  borderRadius:6,
  fontSize:12,
  display:"inline-block",
  marginTop:4,
  background: s === "active" ? "#d1fae5" : "#fee2e2",
  color: s === "active" ? "green" : "red"
});

const btnPrimary = {
  background:"#14532D",
  color:"#fff",
  padding:10,
  borderRadius:6,
  border:"none"
};

const btnGold = {
  background:"#D4AF37",
  color:"#000",
  padding:"6px 10px",
  borderRadius:6,
  border:"none"
};

const btnDanger = {
  background:"#fee2e2",
  color:"red",
  padding:"6px 10px",
  borderRadius:6,
  border:"none"
};