import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPrint,
  FaTrash,
  FaCheck,
  FaPaperPlane,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import Sidebar from "./Sidebar";

const AdminCart = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Unified modal
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [action, setAction] = useState("prepared"); // "prepared" | "finished"
  const [prepStart, setPrepStart] = useState("");
  const [prepFinish, setPrepFinish] = useState("");
  const [sendChecked, setSendChecked] = useState(false);

  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /*  FETCH ORDERS                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
        alert("No orders found.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("Fetch error:", err);
      alert("Failed to load orders: " + msg);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  DELETE ORDER                                                     */
  /* ------------------------------------------------------------------ */
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/admin/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        alert("Order deleted");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert("Error deleting order: " + msg);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  PRINT ORDER                                                      */
  /* ------------------------------------------------------------------ */
  const handlePrintOrder = (order) => {
    const items = order.items || [];
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Order ${order.id}</title>
      <style>
        body{font-family:Arial;margin:20px;}
        h2{text-align:center;}
        table{width:100%;border-collapse:collapse;margin:20px 0;}
        th,td{border:1px solid #ddd;padding:10px;text-align:left;}
        th{background:#77a8a8;color:white;}
        .footer{font-weight:bold;margin-top:15px;}
      </style>
      </head><body>
      <h2>Order #${order.id} – ${order.buyerName || "Guest"}</h2>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>
          ${items
            .map(
              (i) =>
                `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price} ${i.currency || "RWF"}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="footer">
        Total: ${order.total} RWF | Payment: ${order.paymentMethod}
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  /* ------------------------------------------------------------------ */
  /*  OPEN MODAL (only for pending)                                    */
  /* ------------------------------------------------------------------ */
  const openActionModal = (order) => {
    if (order.status !== "pending") return; // safety

    setCurrentOrder(order);
    setAction("prepared");
    const now = new Date().toISOString().slice(0, 16);
    setPrepStart(order.prepStart ? order.prepStart.slice(0, 16) : now);
    setPrepFinish(order.prepFinish ? order.prepFinish.slice(0, 16) : "");
    setSendChecked(false);
    setShowModal(true);
  };

  /* ------------------------------------------------------------------ */
  /*  SAVE ACTION – PREPARED or FINISHED                               */
  /* ------------------------------------------------------------------ */
  const saveAction = async () => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/api/admin/orders/${currentOrder.id}/status`;

    try {
      let payload = {};
      let successMsg = "";

      if (action === "prepared") {
        if (!prepStart || !prepFinish) {
          alert("Both start and finish times are required.");
          return;
        }
        payload = { prepStart, prepFinish, status: "preparing" };
        successMsg = "Preparation started!";
      } else {
        if (!sendChecked) {
          alert("Tick **Send** before finishing.");
          return;
        }
        payload = { status: "finished" };
        successMsg = "Order finished & confirmed!";
      }

      const { data } = await axios.patch(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        alert(successMsg);
        setShowModal(false);
        // Optimistically update UI
        setOrders((prev) =>
          prev.map((o) =>
            o.id === currentOrder.id
              ? { ...o, ...payload, status: payload.status }
              : o
          )
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Unknown error";
      console.error("Save error:", err.response?.data || err);
      alert(`Failed to ${action === "prepared" ? "start preparation" : "finish order"}: ${msg}`);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  STATUS BADGE                                                     */
  /* ------------------------------------------------------------------ */
  const StatusBadge = ({ status }) => {
    const map = {
      pending: { bg: "#fff3cd", color: "#856404", txt: "Pending" },
      preparing: { bg: "#d1ecf1", color: "#0c5460", txt: "Preparing" },
      finished: { bg: "#d4edda", color: "#155724", txt: "Finished" },
    };
    const s = map[status] || map.pending;
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {s.txt}
      </span>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "24px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#2c3e50", fontSize: "28px" }}>
          All Orders
        </h2>

        {loading ? (
          <p style={{ textAlign: "center", fontSize: "18px" }}>Loading…</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6c757d" }}>No orders found.</p>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
              <thead>
                <tr style={{ backgroundColor: "#77a8a8", color: "#fff" }}>
                  {["ID", "Buyer", "Total", "Payment", "Status", "Created", "Items", "Actions"].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#f8f9fa" : "#fff",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e9ecef")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#f8f9fa" : "#fff")
                    }
                  >
                    <td style={tdStyle}>{order.id}</td>
                    <td style={tdStyle}>{order.buyerName || "—"}</td>
                    <td style={tdStyle}>{order.total} RWF</td>
                    <td style={tdStyle}>{order.paymentMethod || "—"}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={order.status || "pending"} />
                    </td>
                    <td style={tdStyle}>{new Date(order.createdAt).toLocaleString()}</td>
                    <td style={{ ...tdStyle, fontSize: "13px" }}>
                      {order.items?.map((it) => (
                        <div key={it.id} style={{ margin: "2px 0" }}>
                          {it.name} × {it.quantity}
                        </div>
                      ))}
                    </td>
                    <td style={{ ...tdStyle, display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button onClick={() => handlePrintOrder(order)} style={iconBtn("#3498db")} title="Print">
                        <FaPrint />
                      </button>

                      {order.status === "pending" && (
                        <button
                          onClick={() => openActionModal(order)}
                          style={iconBtn("#27ae60")}
                          title="Prepare / Finish"
                        >
                          <FaCheck />
                        </button>
                      )}

                      <button onClick={() => handleDeleteOrder(order.id)} style={iconBtn("#e74c3c")} title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== UNIFIED MODAL ==================== */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Order #{currentOrder?.id}</h3>
              <button onClick={() => setShowModal(false)} style={closeBtn}>
                <FaTimes />
              </button>
            </div>

            {/* Action Radio */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                <input
                  type="radio"
                  name="action"
                  value="prepared"
                  checked={action === "prepared"}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaClock /> Prepared
                </span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                <input
                  type="radio"
                  name="action"
                  value="finished"
                  checked={action === "finished"}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaCheck /> Finished (Confirmed)
                </span>
              </label>
            </div>

            {/* Conditional Fields */}
            {action === "prepared" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <label style={labelStyle}>
                  Start Time:
                  <input
                    type="datetime-local"
                    value={prepStart}
                    onChange={(e) => setPrepStart(e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Expected Finish:
                  <input
                    type="datetime-local"
                    value={prepFinish}
                    onChange={(e) => setPrepFinish(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px" }}>
                <input
                  type="checkbox"
                  checked={sendChecked}
                  onChange={(e) => setSendChecked(e.target.checked)}
                  style={{ transform: "scale(1.2)" }}
                />
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaPaperPlane /> Send to Customer
                </span>
              </label>
            )}

            {/* Buttons */}
            <div style={{ marginTop: "24px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={saveAction}
                style={actionBtn("#27ae60")}
                disabled={
                  action === "prepared" ? !prepStart || !prepFinish : !sendChecked
                }
              >
                {action === "prepared" ? "Start Preparing" : "Finish & Confirm"}
              </button>
              <button onClick={() => setShowModal(false)} style={actionBtn("#95a5a6")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  STYLES                                                            */
/* ------------------------------------------------------------------ */
const thStyle = { padding: "14px 12px", textAlign: "center", fontWeight: "600", fontSize: "15px" };
const tdStyle = { padding: "12px", textAlign: "center", fontSize: "14px", verticalAlign: "top" };

const iconBtn = (bg) => ({
  backgroundColor: bg,
  color: "#fff",
  border: "none",
  padding: "8px",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.2s",
  fontSize: "14px",
});

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "20px",
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "500px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const closeBtn = { background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#7f8c8d" };
const labelStyle = { display: "flex", flexDirection: "column", fontWeight: "500", color: "#2c3e50" };
const inputStyle = { marginTop: "6px", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "15px" };
const actionBtn = (bg) => ({
  padding: "10px 18px",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  backgroundColor: bg,
  color: "#fff",
  transition: "0.2s",
});

export default AdminCart;