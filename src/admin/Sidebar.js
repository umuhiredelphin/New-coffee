import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCoffee, FaHome, FaUsers, FaBox, FaBook, FaShoppingCart, FaChartLine, FaMoneyBillWave, FaCog, FaSignOutAlt, FaChartBar, FaCommentDots, FaImage, FaWrench, FaChevronRight, FaUserTie, FaQrcode } from "react-icons/fa";
import { getT, getCurrentLang } from "./useLanguage";
import axios from "axios";

const API = "http://localhost:5000";

const allNavItems = [
  { labelKey: "dashboard", icon: FaHome, path: "/admin", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "users", icon: FaUsers, path: "/admin/users", roles: ["super_admin", "admin"] },
  { labelKey: "menu", icon: FaBox, path: "/admin/menu/add", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "tables", icon: FaBook, path: "/admin/tables/add", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "orders", icon: FaShoppingCart, path: "/admin/cart", roles: ["super_admin", "admin", "manager"], children: [
    { labelKey: "orderSettings", icon: FaWrench, path: "/admin/order-settings" }
  ]},
  { labelKey: "stock", icon: FaChartLine, path: "/admin/stock", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "payments", icon: FaMoneyBillWave, path: "/admin/payments", roles: ["super_admin", "admin"] },
  { labelKey: "reservations", icon: FaBook, path: "/admin/table-reservations", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "banners", icon: FaImage, path: "/admin/banners", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "menuQr", icon: FaQrcode, path: "/admin/qr-code", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "employees", icon: FaUserTie, path: "/admin/employees", roles: ["super_admin", "admin"] },
  { labelKey: "feedback", icon: FaCommentDots, path: "/admin/feedback", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "report", icon: FaChartBar, path: "/admin/report", roles: ["super_admin", "admin", "manager"] },
  { labelKey: "settings", icon: FaCog, path: "/admin/manage-account", roles: ["super_admin", "admin", "manager"] },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem("admin"));
  const lang = getCurrentLang();
  const t = getT(lang);
  const [feedbackUnread, setFeedbackUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API}/api/admin/feedback/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbackUnread(res.data.count || 0);
      } catch (err) { /* silently fail */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    return () => clearInterval(interval);
  }, []);

  const userRole = admin?.role || "admin";
  const navItems = allNavItems.filter(item => item.roles?.includes(userRole) ?? true);
  const [ordersHover, setOrdersHover] = useState(false);

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const isOrdersActive = isActive("/admin/cart") || isActive("/admin/order-settings");

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 bg-gradient-to-b from-espresso-950 to-black flex flex-col z-50 shadow-2xl shadow-black/30">
      <div className="p-5 border-b border-espresso-800/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <FaCoffee className="text-espresso-950 text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cream-50 leading-tight">F&F Coffee</h1>
            <p className="text-[10px] text-cream-50/40">{t.adminPanel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            if (item.children) {
              const active = isOrdersActive;
              return (
                <div key={item.path}
                  className="relative"
                  onMouseEnter={() => setOrdersHover(true)}
                  onMouseLeave={() => setOrdersHover(false)}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold shadow-lg shadow-gold-500/20"
                        : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
                    }`}
                  >
                    <item.icon className={`text-base ${active ? "text-espresso-950" : ""}`} />
                    <span className="flex-1 text-left">{t[item.labelKey] || item.labelKey}</span>
                    <FaChevronRight className={`text-[10px] transition-transform ${ordersHover ? "rotate-90" : ""} ${active ? "text-espresso-950" : "text-cream-500/40"}`} />
                  </button>
                  {ordersHover && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.children.map(child => {
                        const childActive = isActive(child.path);
                        return (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              childActive
                                ? "bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold shadow-lg shadow-gold-500/20"
                                : "text-cream-50/50 hover:text-cream-50 hover:bg-espresso-800/50"
                            }`}
                          >
                            <child.icon className={`text-xs ${childActive ? "text-espresso-950" : ""}`} />
                            <span className="flex-1 text-left">{t[child.labelKey] || child.labelKey}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold shadow-lg shadow-gold-500/20"
                    : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
                }`}
              >
                <item.icon className={`text-base ${active ? "text-espresso-950" : ""}`} />
                <span className="flex-1 text-left">{t[item.labelKey] || item.labelKey}</span>
                {item.labelKey === "feedback" && feedbackUnread > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 shadow-lg shadow-red-500/30">
                    {feedbackUnread > 9 ? "9+" : feedbackUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-espresso-800/50">
        <div className="px-3 py-1.5 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-cream-50/30">
            {t.role}: <span className="text-gold-400 font-semibold">{userRole.replace("_", " ")}</span>
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <FaSignOutAlt className="text-base" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}