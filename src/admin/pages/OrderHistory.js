import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaHistory, FaShoppingCart, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/admin/orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(res.data.orders || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "completed") return o.status === "completed" || o.status === "finished";
    return o.status === filter;
  });

  const fmt = (n) => new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar />
      <div className="ml-60 flex-1 p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
            <FaHistory className="text-2xl text-espresso-950" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cream-50">Order History</h1>
            <p className="text-cream-50/40 text-sm mt-0.5">View all past orders</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {["all", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === f ? "bg-gold-400 text-espresso-950" : "bg-espresso-800/60 text-cream-50/60 hover:text-cream-50"}`}>
              {f} {f === "all" && `(${orders.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-gold-400 text-3xl" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <FaShoppingCart className="text-5xl text-espresso-700 mx-auto mb-4" />
            <p className="text-cream-50/50 text-lg">No orders found.</p>
          </div>
        ) : (
          <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-espresso-950/80 border-b border-espresso-800/40">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-cream-50/60 uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-cream-50/60 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-cream-50/60 uppercase tracking-wider">Items</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-cream-50/60 uppercase tracking-wider">Total</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-cream-50/60 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-cream-50/60 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-800/30">
                  {filteredOrders.map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-espresso-800/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-cream-50 font-bold">#{o.id?.toString().slice(-6)}</td>
                      <td className="px-5 py-4 text-cream-50/80">{o.buyerName || "Guest"}</td>
                      <td className="px-5 py-4 text-cream-50/60">{o.totalItems || o.items?.length || 0}</td>
                      <td className="px-5 py-4 font-bold text-gold-400">{fmt(o.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          o.status === "completed" || o.status === "finished"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : o.status === "cancelled" ? "bg-red-500/15 text-red-400"
                            : o.status === "preparing" ? "bg-sky-500/15 text-sky-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-5 py-4 text-cream-50/40 text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-espresso-800/30 text-xs text-cream-50/30">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}