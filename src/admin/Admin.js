import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { FaUsers, FaShoppingCart, FaBox, FaBook, FaPlus, FaChartLine, FaCheck, FaTimes, FaCoffee } from "react-icons/fa";
import bgImage from "../assets/coff.jpg";
import axios from "axios";

export default function Admin({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, orders: 0, menus: 0, tables: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) { navigate("/admin/login"); return; }
    fetchData();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [ordersRes, usersRes, menuRes, tablesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/orders", { headers: getAuthHeaders() }).catch(() => ({ data: { orders: [] } })),
        axios.get("http://localhost:5000/api/users", { headers: getAuthHeaders() }).catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/menu").catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/tables").catch(() => ({ data: [] })),
      ]);

      setStats({
        users: Array.isArray(usersRes.data) ? usersRes.data.length : usersRes.data?.users?.length || 0,
        orders: ordersRes.data.orders?.length || 0,
        menus: Array.isArray(menuRes.data) ? menuRes.data.length : menuRes.data?.menus?.length || 0,
        tables: Array.isArray(tablesRes.data) ? tablesRes.data.length : tablesRes.data?.tables?.length || 0,
      });
      setOrders(ordersRes.data.orders?.slice(0, 5) || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("cart");
    if (onLogout) onLogout();
    navigate("/");
  };

  const fmt = (n) => new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(n || 0);
  const initials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  const statCards = [
    { icon: FaUsers, value: stats.users, label: "Total Users", color: "blue", progress: 75 },
    { icon: FaShoppingCart, value: stats.orders, label: "Total Orders", color: "green", progress: 60 },
    { icon: FaBox, value: stats.menus, label: "Menu Items", color: "amber", progress: 45 },
    { icon: FaBook, value: stats.tables, label: "Tables", color: "purple", progress: 30 },
  ];

  const colorMap = {
    blue: { bg: "from-blue-500 to-blue-600", light: "bg-blue-500/10 text-blue-400" },
    green: { bg: "from-green-500 to-green-600", light: "bg-green-500/10 text-green-400" },
    amber: { bg: "from-amber-500 to-amber-600", light: "bg-amber-500/10 text-amber-400" },
    purple: { bg: "from-purple-500 to-purple-600", light: "bg-purple-500/10 text-purple-400" },
  };

  return (
    <div className="flex min-h-screen bg-espresso-950 font-poppins">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header onLogout={handleLogout} title="Admin Dashboard" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-espresso-950/90 to-espresso-950/60" />
            <div className="relative px-6 py-8 sm:px-10">
              <FaCoffee className="text-gold-400 text-2xl mb-2" />
              <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50">Welcome to F&F Coffee!</h1>
              <p className="text-cream-300/60 text-sm mt-1">Manage your coffee shop with ease</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <div key={i} className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5 hover:shadow-lg hover:shadow-gold-500/5 transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${colorMap[s.color].bg} flex items-center justify-center shadow-lg`}>
                    <s.icon className="text-white text-lg" />
                  </div>
                  <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">+{i * 3 + 5}%</span>
                </div>
                <p className="text-2xl font-bold text-cream-50">{s.value}</p>
                <p className="text-xs text-cream-50/50 mt-0.5 flex items-center gap-1.5">
                  <s.icon className="text-gold-400/70" size={12} /> {s.label}
                </p>
                <div className="mt-3 h-1 bg-espresso-800/50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${colorMap[s.color].bg}`} style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-base font-bold text-cream-50 mb-3 flex items-center gap-2">
              <FaPlus className="text-gold-400" size={14} /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Manage Users", icon: FaUsers, path: "/admin/users", color: "blue" },
                { label: "Add Menu", icon: FaPlus, path: "/admin/menu/add", color: "amber" },
                { label: "Add Table", icon: FaBook, path: "/admin/tables/add", color: "purple" },
                { label: "Stock", icon: FaChartLine, path: "/admin/stock", color: "green" },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className="flex flex-col items-center gap-2 p-4 bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl hover:-translate-y-1 transition-all group">
                  <div className={`w-11 h-11 rounded-xl ${colorMap[a.color].light} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <a.icon className="text-lg" />
                  </div>
                  <span className="text-xs font-semibold text-cream-50/80 group-hover:text-cream-50">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-espresso-950 flex items-center gap-2">
                <FaShoppingCart /> Recent Orders
              </h2>
              <button onClick={() => navigate("/admin/cart")} className="text-espresso-950/70 hover:text-espresso-950 text-xs font-semibold transition-all">
                View All &rarr;
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-espresso-800/30">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-cream-50/50 uppercase tracking-wider">Order</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-cream-50/50 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-cream-50/50 uppercase tracking-wider">Items</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-cream-50/50 uppercase tracking-wider">Total</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-cream-50/50 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-espresso-800/20 hover:bg-espresso-800/20 transition-colors">
                        <td className="px-5 py-3 text-cream-50 font-bold">#{o.id?.toString().slice(-6)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-espresso-950 text-xs font-bold">{initials(o.buyerName)}</div>
                            <span className="text-cream-50/80">{o.buyerName}</span>
                          </div>
                        </td>
                        <td className="text-cream-50/60">{o.totalItems || o.items?.length || 0} items</td>
                        <td className="text-gold-400 font-bold">{fmt(o.total)}</td>
                        <td>
                          {o.status === "completed" || o.status === "finished" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400"><FaCheck size={8} /> Completed</span>
                          ) : o.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400"><FaTimes size={8} /> Pending</span>
                          ) : o.status === "preparing" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400">Preparing</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <FaShoppingCart className="text-espresso-600 text-3xl mx-auto mb-2" />
                <p className="text-cream-50/40 text-sm">No orders yet</p>
              </div>
            )}
          </div>

          <div className="text-center text-cream-50/30 text-xs py-4">
            &copy; {new Date().getFullYear()} F&F Coffee Shop Admin. All rights reserved.
          </div>
        </main>
      </div>
    </div>
  );
}