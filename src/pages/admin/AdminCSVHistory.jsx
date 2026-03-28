import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminCSVHistory() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "csvUploads"));

        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // latest first
        list.sort((a, b) => b.uploadedAt?.seconds - a.uploadedAt?.seconds);

        setData(list);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div style={{ padding: 24, background: "#F8F9FA", minHeight: "100vh" }}>

      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#14532D", marginBottom: 20 }}>
        CSV Upload History
      </h2>

      {data.length === 0 ? (
        <p>No uploads yet</p>
      ) : (
        data.map((item) => {

          const date = item.uploadedAt?.seconds
            ? new Date(item.uploadedAt.seconds * 1000).toLocaleString()
            : "-";

          return (
            <div key={item.id} style={card}>

              {/* HEADER */}
              <div style={{ marginBottom: 10 }}>
                <h3 style={{ fontWeight: 600 }}>{item.fileName}</h3>
                <p style={{ fontSize: 12, color: "#6C757D" }}>{date}</p>
              </div>

              {/* STATS */}
              <div style={grid}>

                <Stat label="Total Rows" value={item.totalRows} />
                <Stat label="Processed" value={item.processed} />
                <Stat label="Skipped" value={item.skipped} />

                <Stat
                  label="Network Earning"
                  value={`₹${Math.round(item.totalNetworkEarning || 0)}`}
                />

                <Stat
                  label="User Shared"
                  value={`₹${Math.round(item.totalUserEarning || 0)}`}
                />

                <Stat
                  label="Platform Profit"
                  value={`₹${Math.round(item.totalPlatformProfit || 0)}`}
                />

              </div>

              {/* STATUS */}
              <div style={{ marginTop: 10 }}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "#d1fae5",
                  color: "green",
                  fontSize: 12
                }}>
                  {item.status || "completed"}
                </span>
              </div>

            </div>
          );
        })
      )}

    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={statBox}>
      <p style={{ fontSize: 12, color: "#6C757D" }}>{label}</p>
      <h4 style={{ fontWeight: 700 }}>{value}</h4>
    </div>
  );
}

/* 🎨 STYLES */

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
};

const statBox = {
  background: "#F8F9FA",
  padding: 10,
  borderRadius: 8,
};