import React, { useEffect, useState, useCallback } from "react";
import { FaShoppingCart, FaCheck, FaTimes, FaTrash, FaClock, FaSpinner, FaBoxOpen, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import Sidebar from "./Sidebar";

const TABS = ["All", "Pending", "Preparing", "Completed"];
const STATUS_BADGE = {
  pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  preparing: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const AdminCart = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [prepStart, setPrepStart] = useState("");
  const [prepFinish, setPrepFinish] = useState("");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: getAuthHeaders(),
      });
      if (data.success && Array.isArray(data.orders)) setOrders(data.orders);
      else setOrders([]);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
      setOrders([]);
    } finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Completed") return o.status === "completed" || o.status === "finished";
    return o.status === activeTab.toLowerCase();
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    completed: orders.filter((o) => o.status === "completed" || o.status === "finished").length,
  };

  const handleDelete = async (orderId) => {
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/admin/orders/${orderId}`, { headers: getAuthHeaders() });
      if (data.success) { setOrders((prev) => prev.filter((o) => o.id !== orderId)); showToast("Order deleted successfully"); }
    } catch (err) { showToast(err.response?.data?.message || err.message, "error"); }
  };

  const handleCancel = async (orderId) => {
    try {
      const { data } = await axios.patch(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status: "cancelled" }, { headers: getAuthHeaders() });
      if (data.success) { setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))); showToast("Order cancelled"); }
    } catch (err) { showToast(err.response?.data?.message || err.message, "error"); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await axios.patch(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status }, { headers: getAuthHeaders() });
      if (data.success) { setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o))); showToast(`Order marked as ${status}`); }
    } catch (err) { showToast(err.response?.data?.message || err.message, "error"); }
  };

  const openPrepModal = (order) => {
    setModalOrder(order);
    const now = new Date().toISOString().slice(0, 16);
    setPrepStart(order.prepStart ? order.prepStart.slice(0, 16) : now);
    setPrepFinish(order.prepFinish ? order.prepFinish.slice(0, 16) : "");
    setShowModal(true);
  };

  const handleStartPrep = async () => {
    if (!prepStart || !prepFinish) { showToast("Please set both start and finish times", "error"); return; }
    try {
      const { data } = await axios.patch(`http://localhost:5000/api/admin/orders/${modalOrder.id}/status`, { status: "preparing", prepStart, prepFinish }, { headers: getAuthHeaders() });
      if (data.success) { setOrders((prev) => prev.map((o) => o.id === modalOrder.id ? { ...o, status: "preparing", prepStart, prepFinish } : o)); showToast("Preparation started"); setShowModal(false); }
    } catch (err) { showToast(err.response?.data?.message || err.message, "error"); }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-espresso-900/80 backdrop-blur-sm rounded-xl p-4 border border-espresso-800/50 flex items-center gap-4 hover:border-gold-500/30 transition-all duration-300">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-lg`}><Icon /></div>
      <div><p className="text-cream-50/50 text-xs uppercase tracking-wider">{label}</p><p className="text-cream-50 text-2xl font-bold">{value}</p></div>
    </div>
  );

  const OrderCard = ({ order }) => {
    const itemsCount = Array.isArray(order.items) ? order.items.reduce((sum, i) => sum + (i.quantity || 1), 0) : order.items || 0;
    return (
      <div className="bg-espresso-900/60 backdrop-blur-sm rounded-xl border border-espresso-800/50 p-5 hover:border-espresso-700/80 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold-400 text-xs font-mono">#{order.id?.toString().slice(0, 8)}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>{order.status}</span>
            </div>
            <h3 className="text-cream-50 font-semibold text-base">{order.buyerName || "Guest"}</h3>
          </div>
          <div className="text-right">
            <p className="text-gold-400 text-lg font-bold">{(order.total || 0).toLocaleString()} RWF</p>
            <p className="text-cream-50/40 text-xs">{itemsCount} item{itemsCount !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-cream-50/50 text-xs mb-4">
          <div className="flex items-center gap-1.5"><FaClock /><span>{formatTime(order.createdAt)}</span></div>
          {order.prepStart && <span className="text-sky-400/60">Prep: {new Date(order.prepStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>

        {Array.isArray(order.items) && order.items.length > 0 && (
          <div className="mb-4 space-y-1">
            {order.items.slice(0, 4).map((item, idx) => (
              <div key={item.id || idx} className="flex items-center justify-between text-sm text-cream-50/70">
                <span className="truncate max-w-[180px]">{item.name || item.foodName}</span>
                <span className="text-cream-50/50">x{item.quantity || 1}</span>
              </div>
            ))}
            {order.items.length > 4 && <p className="text-cream-50/30 text-xs">+{order.items.length - 4} more items</p>}
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-espresso-800/50">
          {order.status === "pending" && (
            <>
              <button onClick={() => openPrepModal(order)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gold-500/20 text-gold-400 rounded-lg text-xs font-semibold hover:bg-gold-500/30 transition-all duration-200"><FaClock /> Prepare</button>
              <button onClick={() => handleStatusChange(order.id, "completed")} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-all duration-200"><FaCheck /> Complete</button>
              <button onClick={() => handleCancel(order.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-all duration-200"><FaTimes /></button>
            </>
          )}
          {order.status === "preparing" && (
            <>
              <button onClick={() => handleStatusChange(order.id, "completed")} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-all duration-200"><FaCheck /> Mark Completed</button>
              <button onClick={() => handleCancel(order.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-all duration-200"><FaTimes /> Cancel</button>
            </>
          )}
          {order.status === "completed" && <span className="text-emerald-400/60 text-xs flex items-center gap-1.5"><FaCheck /> Completed</span>}
          {order.status === "cancelled" && (
            <button onClick={() => handleDelete(order.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-all duration-200"><FaTrash /> Delete</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar />
      <div className="flex-1 ml-60 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <FaShoppingCart className="text-espresso-950" />
            </div>
            <div><h1 className="text-2xl font-bold text-cream-50">Orders</h1><p className="text-cream-50/40 text-sm">Manage all customer orders</p></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Orders" value={stats.total} icon={FaClipboardList} color="bg-gold-500/20 text-gold-400" />
            <StatCard label="Pending" value={stats.pending} icon={FaClock} color="bg-amber-500/20 text-amber-400" />
            <StatCard label="In Progress" value={stats.preparing} icon={FaSpinner} color="bg-sky-500/20 text-sky-400" />
            <StatCard label="Completed" value={stats.completed} icon={FaCheck} color="bg-emerald-500/20 text-emerald-400" />
          </div>

          <div className="flex items-center gap-1 mb-6 bg-espresso-900/50 rounded-xl p-1 border border-espresso-800/50 w-fit">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab ? "bg-gold-500/20 text-gold-400 shadow-sm" : "text-cream-50/50 hover:text-cream-50 hover:bg-espresso-800/50"
                }`}>
                {tab}{tab !== "All" && <span className="ml-1.5 text-xs opacity-60">({stats[tab.toLowerCase()]})</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FaSpinner className="text-gold-400 text-4xl animate-spin mb-4" />
              <p className="text-cream-50/50 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-espresso-900/80 border border-espresso-800/50 flex items-center justify-center mb-4">
                <FaBoxOpen className="text-cream-50/30 text-3xl" />
              </div>
              <p className="text-cream-50/60 text-lg font-medium mb-1">No orders found</p>
              <p className="text-cream-50/30 text-sm">{activeTab === "All" ? "No orders have been placed yet" : `No ${activeTab.toLowerCase()} orders`}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-3 transition-all duration-300 ${
          toast.type === "success" ? "bg-emerald-900/90 border-emerald-700/50 text-emerald-300" : "bg-red-900/90 border-red-700/50 text-red-300"
        }`}>
          {toast.type === "success" ? <FaCheck className="text-emerald-400" /> : <FaTimes className="text-red-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {showModal && modalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-espresso-900 border border-espresso-800/80 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-cream-50 text-lg font-bold">Start Preparation</h3><p className="text-cream-50/40 text-sm">Order #{modalOrder.id?.toString().slice(0, 8)}</p></div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-espresso-800/50 flex items-center justify-center text-cream-50/50 hover:text-cream-50 hover:bg-espresso-800 transition-all"><FaTimes /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-cream-50/70 text-sm font-medium mb-1.5">Start Time</label>
                <input type="datetime-local" value={prepStart} onChange={(e) => setPrepStart(e.target.value)}
                  className="w-full px-4 py-2.5 bg-espresso-950/80 border border-espresso-700/60 rounded-xl text-cream-50 text-sm focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-cream-50/70 text-sm font-medium mb-1.5">Expected Finish</label>
                <input type="datetime-local" value={prepFinish} onChange={(e) => setPrepFinish(e.target.value)}
                  className="w-full px-4 py-2.5 bg-espresso-950/80 border border-espresso-700/60 rounded-xl text-cream-50 text-sm focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-espresso-800/50">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-espresso-800/50 text-cream-50/60 text-sm font-medium hover:bg-espresso-800 hover:text-cream-50 transition-all">Cancel</button>
              <button onClick={handleStartPrep} disabled={!prepStart || !prepFinish}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gold-500/20 text-gold-400 text-sm font-semibold hover:bg-gold-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Start Preparing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCart;