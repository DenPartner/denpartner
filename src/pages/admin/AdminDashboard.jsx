import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [clicks, setClicks] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const earnSnap = await getDocs(collection(db, "earnings"));
      const withdrawSnap = await getDocs(collection(db, "withdrawRequests"));
      const clickSnap = await getDocs(collection(db, "clicks"));

      const usersData = usersSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role !== "admin");

      setUsers(usersData);
      setEarnings(earnSnap.docs.map(d => d.data()));
      setWithdraws(withdrawSnap.docs.map(d => d.data()));
      setClicks(clickSnap.docs.map(d => d.data()));

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  const filterByDate = (data) => {
    if (filter === "all") return data;
    const now = new Date();

    return data.filter(item => {
      if (!item.createdAt) return false;
      const date = item.createdAt.toDate();

      if (filter === "today") return date.toDateString() === now.toDateString();

      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }

      if (filter === "month") return date.getMonth() === now.getMonth();
      if (filter === "year") return date.getFullYear() === now.getFullYear();

      return true;
    });
  };

  const filteredUsers = filterByDate(users);
  const filteredEarnings = filterByDate(earnings);
const filteredWithdraws = filterByDate(withdraws);
const filteredClicks = filterByDate(clicks);
  const totalEarnings = earnings.reduce((a, b) => a + (b.amount || 0), 0);

  const toggleBlockUser = async (user) => {
    const ref = doc(db, "users", user.id);

    await updateDoc(ref, { isBlocked: !user.isBlocked });

    setUsers(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
      )
    );
  };

  const handleSave = async () => {
    const ref = doc(db, "users", editUser.id);

    await updateDoc(ref, {
      name: editUser.name,
      email: editUser.email,
    });

    setUsers(prev =>
      prev.map(u => (u.id === editUser.id ? editUser : u))
    );

    setEditUser(null);
  };

  return (
    <div style={page}>

      <h1 style={titleStyle}>Admin Dashboard</h1>

      {/* FILTER */}
      <div style={filterWrap}>
        {["all", "today", "week", "month", "year"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...filterBtn,
              background: filter === f ? "#14532D" : "#fff",
              color: filter === f ? "#fff" : "#6C757D"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div style={cardGrid}>
        <Card title="Users" value={filteredUsers.length} active={activeTab==="users"} onClick={()=>setActiveTab("users")} />
        <Card title="Earnings" value={`₹${totalEarnings}`} active={activeTab==="earnings"} onClick={()=>setActiveTab("earnings")} />
        <Card title="Withdraw" value={withdraws.length} active={activeTab==="withdraw"} onClick={()=>setActiveTab("withdraw")} />
        <Card title="Clicks" value={clicks.length} active={activeTab==="clicks"} onClick={()=>setActiveTab("clicks")} />
        <Card title="Signup" value={filteredUsers.length} active={activeTab==="signup"} onClick={()=>setActiveTab("signup")} />
      </div>

      {/* SEARCH */}
      {activeTab && (
        <input
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          style={searchStyle}
        />
      )}

      {/* RECENT ACTIVITY */}
      {!activeTab && (
        <div style={boxStyle}>
          <h3 style={{ marginBottom: 10, color: "#14532D" }}>Recent Activity</h3>

          {withdraws.slice(-5).reverse().map((w,i)=>(
            <div key={i} style={rowStyle}>
              <span>{w.userId} withdraw</span>
              <span>₹{w.amount} ({w.status})</span>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {activeTab==="users" && (
        <div style={boxStyle}>
          {filteredUsers
            .filter(u => u.userId?.toLowerCase().includes(search.toLowerCase()))
            .map((u,i)=>(
              <div key={i} style={rowStyleWrap}>
                <div>
                  <div style={{fontWeight:600}}>{u.userId}</div>
                  <div style={{fontSize:12, color:"#6C757D"}}>{u.email}</div>
                </div>

                <div style={btnWrap}>
                  <button onClick={()=>setSelectedUser(u)} style={btnView}>View</button>
                  <button onClick={()=>setEditUser({...u})} style={btnEdit}>Edit</button>
                  <button onClick={()=>toggleBlockUser(u)} style={btnBlock}>
                    {u.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      {/* EARNINGS */}
{activeTab==="earnings" && (
  <div style={boxStyle}>
    {filteredEarnings
      .filter(e => e.userId?.toLowerCase().includes(search.toLowerCase()))
      .map((e,i)=>(
        <div key={i} style={rowStyle}>
          <span>{e.userId}</span>
          <span>₹{e.amount}</span>
        </div>
      ))}
  </div>
)}

{/* WITHDRAW */}
{activeTab==="withdraw" && (
  <div style={boxStyle}>
    {filteredWithdraws
      .filter(w => w.userId?.toLowerCase().includes(search.toLowerCase()))
      .map((w,i)=>(
        <div key={i} style={rowStyle}>
          <span>{w.userId}</span>
          <span>₹{w.amount} ({w.status})</span>
        </div>
      ))}
  </div>
)}

{/* CLICKS */}
{activeTab==="clicks" && (
  <div style={boxStyle}>
    {filteredClicks
      .filter(c => c.userId?.toLowerCase().includes(search.toLowerCase()))
      .map((c,i)=>(
        <div key={i} style={rowStyle}>
          <span>{c.userId}</span>
          <span>Click</span>
        </div>
      ))}
  </div>
)}

{/* SIGNUP */}
{activeTab==="signup" && (
  <div style={boxStyle}>
    {filteredUsers
      .filter(u => u.userId?.toLowerCase().includes(search.toLowerCase()))
      .map((u,i)=>(
        <div key={i} style={{
          padding:"12px 0",
          borderBottom:"1px solid #eee",
          display:"flex",
          flexDirection:"column",
          gap:4
        }}>
          <span style={{
            fontWeight:600,
            color:"#14532D"
          }}>
            {u.userId}
          </span>

          <span style={{
            fontSize:12,
            color:"#6C757D",
            wordBreak:"break-all"
          }}>
            {u.email}
          </span>
        </div>
      ))}
  </div>
)}
      {/* 🔥 VIEW POPUP */}
      {selectedUser && (
        <div style={popupOverlay}>
          <div style={popup}>
            <h3>User Details</h3>
            <p><b>ID:</b> {selectedUser.userId}</p>
            <p><b>Email:</b> {selectedUser.email}</p>

            <button onClick={()=>setSelectedUser(null)} style={btnPrimary}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🔥 EDIT POPUP */}
      {editUser && (
        <div style={popupOverlay}>
          <div style={popup}>
            <h3>Edit User</h3>

            <input
              value={editUser.name || ""}
              onChange={(e)=>setEditUser({...editUser, name:e.target.value})}
              style={input}
            />

            <input
              value={editUser.email || ""}
              onChange={(e)=>setEditUser({...editUser, email:e.target.value})}
              style={input}
            />

            <div style={{display:"flex", gap:10}}>
              <button onClick={handleSave} style={btnPrimary}>Save</button>
              <button onClick={()=>setEditUser(null)} style={btnDanger}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* 🔥 FIXED CSS */

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

const filterWrap = {
  display:"flex",
  gap:8,
  overflowX:"auto",
  margin:"15px 0"
};

const filterBtn = {
  padding:"6px 14px",
  borderRadius:20,
  border:"none",
  whiteSpace:"nowrap"
};

const cardGrid = {
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",
  gap:10
};

const boxStyle = {
  background:"#fff",
  padding:15,
  borderRadius:12,
  marginTop:20
};

const rowStyle = {
  display:"flex",
  justifyContent:"space-between",
  padding:"10px 0",
  borderBottom:"1px solid #eee"
};

const rowStyleWrap = {
  display:"flex",
  flexDirection:"column",
  gap:8,
  padding:"10px 0",
  borderBottom:"1px solid #eee"
};

const btnWrap = {
  display:"flex",
  flexWrap:"wrap",
  gap:6
};

const searchStyle = {
  width:"100%",
  padding:10,
  marginTop:15,
  borderRadius:6,
  border:"1px solid #ccc"
};

const input = {
  padding:10,
  border:"1px solid #ccc",
  borderRadius:6,
  width:"100%",
  marginBottom:10
};

const popupOverlay = {
  position:"fixed",
  top:0,
  left:0,
  right:0,
  bottom:0,
  background:"rgba(0,0,0,0.5)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  zIndex:999
};

const popup = {
  background:"#fff",
  padding:20,
  borderRadius:12,
  width:"90%",
  maxWidth:350
};

const btnView = { background:"#14532D", color:"#fff", padding:"5px 10px", borderRadius:6 };
const btnEdit = { background:"#D4AF37", color:"#000", padding:"5px 10px", borderRadius:6 };
const btnBlock = { background:"#fee2e2", color:"red", padding:"5px 10px", borderRadius:6 };
const btnPrimary = { background:"#14532D", color:"#fff", padding:"8px 12px", borderRadius:6 };
const btnDanger = { background:"#fee2e2", color:"red", padding:"8px 12px", borderRadius:6 };

function Card({ title, value, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding:12,
        borderRadius:10,
        cursor:"pointer",
        background: active ? "#D4AF37" : "#fff",
        color: active ? "#000" : "#14532D"
      }}
    >
      <div style={{fontSize:12}}>{title}</div>
      <div style={{fontSize:18, fontWeight:700}}>{value}</div>
    </div>
  );
}