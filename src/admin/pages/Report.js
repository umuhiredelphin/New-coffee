import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import axios from "axios";
import { FaDollarSign, FaShoppingCart, FaBox, FaCalendarCheck, FaExclamationTriangle, FaChartPie, FaChartBar, FaClipboardList } from "react-icons/fa";
import { getT, getCurrentLang } from "../useLanguage";

const fmt = (n) => new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(n || 0);
const fmtNum = (n) => new Intl.NumberFormat("en-RW").format(n || 0);

export default function Report() {
  const navigate = useNavigate();
  const lang = getCurrentLang();
  const t = getT(lang);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const [data, setData] = useState({ orders: [], users: [], menus: [], bookings: [], stockItems: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) { navigate("/admin/login"); return; }
    fetchData();
  }, [navigate]);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, usersRes, menuRes, bookingsRes, stockRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/orders", { headers: authHeaders() }).catch(() => ({ data: { orders: [] } })),
        axios.get("http://localhost:5000/api/users", { headers: authHeaders() }).catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/menu").catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/bookings").catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/stock/items", { headers: authHeaders() }).catch(() => ({ data: { items: [] } })),
      ]);

      setData({
        orders: ordersRes.data.orders || [],
        users: Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.users || [],
        menus: Array.isArray(menuRes.data) ? menuRes.data : menuRes.data?.menus || [],
        bookings: Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data?.bookings || [],
        stockItems: stockRes.data.items || [],
      });
    } catch (err) {
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const { orders, users, menus, bookings, stockItems } = data;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const paymentMethods = {};
  orders.forEach((o) => {
    const m = o.paymentMethod || "unknown";
    paymentMethods[m] = (paymentMethods[m] || 0) + (o.total || 0);
  });

  const lowStockItems = stockItems.filter((i) => {
    const qty = i.quantity ?? i.stock ?? 0;
    const min = i.minStock ?? i.minimumStock ?? 5;
    return qty <= min;
  });

  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="text-xl text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-cream-50/50 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-cream-50 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[10px] text-cream-50/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  const Bar = ({ label, value, max, color }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-cream-50/60 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-5 bg-espresso-950/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="text-xs text-cream-50/80 w-16 text-right shrink-0">{fmtNum(value)}</span>
    </div>
  );

  const orderStatus = [
    { label: "pending", count: pendingOrders.length, color: "bg-yellow-500" },
    { label: "preparing", count: preparingOrders.length, color: "bg-blue-500" },
    { label: "completed", count: completedOrders.length, color: "bg-green-500" },
    { label: "cancelled", count: cancelledOrders.length, color: "bg-red-500" },
  ];
  const maxStatusCount = Math.max(...orderStatus.map((s) => s.count), 1);

  const pmLabels = { cash: "Cash", card: "Card", mobile: "Mobile Money", momo: "MoMo", unknown: "Other" };
  const pmMax = Math.max(...Object.values(paymentMethods), 1);

  const orderTypeCounts = {};
  orders.forEach((o) => {
    const type = o.orderType || "dine-in";
    orderTypeCounts[type] = (orderTypeCounts[type] || 0) + 1;
  });

  const StatusDot = ({ color }) => <span className={`w-2 h-2 rounded-full ${color} inline-block shrink-0`} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-espresso-950 flex">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 ml-60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-cream-50/50 text-sm">{t.loading || "Loading..."}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-espresso-950 flex">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header onLogout={handleLogout} title={t.reportPanel || "Reports & Analytics"} />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <FaExclamationTriangle /> {error}
              <button onClick={fetchData} className="ml-auto px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30">{t.retry || "Retry"}</button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FaDollarSign} label={t.revenue} value={fmt(totalRevenue)} sub={`${t.today}: ${fmt(todayOrders.reduce((s, o) => s + (o.total || 0), 0))}`} color="bg-gradient-to-br from-gold-400 to-gold-600" />
            <StatCard icon={FaShoppingCart} label={t.totalOrders} value={fmtNum(orders.length)} sub={`${t.today}: ${fmtNum(todayOrders.length)}`} color="bg-gradient-to-br from-blue-400 to-blue-600" />
            <StatCard icon={FaBox} label="Menu Items" value={fmtNum(menus.length)} color="bg-gradient-to-br from-green-400 to-green-600" />
            <StatCard icon={FaCalendarCheck} label="Bookings" value={fmtNum(bookings.length)} color="bg-gradient-to-br from-purple-400 to-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-cream-50 flex items-center gap-2 mb-4">
                <FaChartPie className="text-gold-400" /> {t.orderStatusDist || "Order Status"}
              </h3>
              <div className="space-y-3">
                {orderStatus.map((s) => (
                  <Bar key={s.label} label={s.label} value={s.count} max={maxStatusCount} color={s.color} />
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            {Object.keys(paymentMethods).length > 0 && (
              <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-cream-50 flex items-center gap-2 mb-4">
                  <FaChartBar className="text-gold-400" /> {t.paymentBreakdown}
                </h3>
                <div className="space-y-3">
                  {Object.entries(paymentMethods).map(([method, amount]) => (
                    <Bar key={method} label={pmLabels[method] || method} value={amount} max={pmMax} color="bg-gold-500" />
                  ))}
                </div>
              </div>
            )}

            {/* Top Menu Items */}
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-cream-50 flex items-center gap-2 mb-4">
                <FaClipboardList className="text-gold-400" /> {t.topItems}
              </h3>
              {menus.length === 0 ? (
                <p className="text-cream-50/40 text-sm text-center py-6">{t.noReportData}</p>
              ) : (
                <div className="space-y-2">
                  {menus.slice(0, 8).map((item, i) => {
                    const catColors = { coffee: "bg-amber-500", food: "bg-green-500", dessert: "bg-pink-500", drink: "bg-blue-500" };
                    const catColor = catColors[item.category] || "bg-gray-500";
                    return (
                      <div key={item._id || i} className="flex items-center gap-3 p-2 rounded-lg bg-espresso-950/30">
                        <span className="text-[10px] text-cream-50/30 w-4 text-right">{i + 1}.</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold text-white ${catColor}`}>{item.category || "?"}</span>
                        <span className="flex-1 text-sm text-cream-50 truncate">{item.name}</span>
                        <span className="text-xs text-gold-400 font-semibold">{fmt(item.price)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stock Alerts */}
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-cream-50 flex items-center gap-2 mb-4">
                <FaExclamationTriangle className="text-gold-400" /> {t.stockAlerts}
              </h3>
              {lowStockItems.length === 0 ? (
                <p className="text-cream-50/40 text-sm text-center py-6">{t.noReportData}</p>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.map((item, i) => (
                    <div key={item._id || i} className="flex items-center gap-3 p-2 rounded-lg bg-espresso-950/30">
                      <FaExclamationTriangle className="text-red-400 text-xs shrink-0" />
                      <span className="flex-1 text-sm text-cream-50 truncate">{item.name || item.itemName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(item.quantity ?? item.stock ?? 0) === 0 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {(item.quantity ?? item.stock ?? 0)} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Type Distribution */}
            {Object.keys(orderTypeCounts).length > 0 && (
              <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-cream-50 flex items-center gap-2 mb-4">
                  <FaShoppingCart className="text-gold-400" /> {t.ordersOverTime}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(orderTypeCounts).map(([type, count]) => {
                    const totalCount = orders.length || 1;
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={type} className="text-center p-4 rounded-xl bg-espresso-950/30">
                        <p className="text-2xl font-bold text-cream-50">{fmtNum(count)}</p>
                        <p className="text-[10px] text-cream-50/50 uppercase mt-1">{type.replace("-", " ")}</p>
                        <div className="mt-2 h-1.5 bg-espresso-950/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-gold-400/70 mt-1">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-cream-50 flex items-center gap-2 mb-4">
              <FaClipboardList className="text-gold-400" /> {t.recentOrders} ({fmtNum(orders.length)})
            </h3>
            {orders.length === 0 ? (
              <p className="text-cream-50/40 text-sm text-center py-6">{t.noReportData}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-cream-50/40 border-b border-espresso-800/30">
                      <th className="text-left py-2 pr-4">Customer</th>
                      <th className="text-left py-2 pr-4">Items</th>
                      <th className="text-right py-2 pr-4">Total</th>
                      <th className="text-center py-2 pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((o, i) => (
                      <tr key={o._id || i} className="border-b border-espresso-800/20">
                        <td className="py-2.5 pr-4 text-cream-50">{o.buyerName || o.customerName || "—"}</td>
                        <td className="py-2.5 pr-4 text-cream-50/60 text-xs">{Array.isArray(o.items) ? o.items.length : o.itemCount || 0} item(s)</td>
                        <td className="py-2.5 pr-4 text-right text-gold-400 font-semibold">{fmt(o.total)}</td>
                        <td className="py-2.5 pl-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            o.status === "completed" ? "bg-green-500/10 text-green-400" :
                            o.status === "preparing" ? "bg-blue-500/10 text-blue-400" :
                            o.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                            "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            <StatusDot color={
                              o.status === "completed" ? "bg-green-500" :
                              o.status === "preparing" ? "bg-blue-500" :
                              o.status === "cancelled" ? "bg-red-500" : "bg-yellow-500"
                            } />
                            {o.status || "unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
