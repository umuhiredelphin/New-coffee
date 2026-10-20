import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCoffee, FaBook, FaSignOutAlt, FaUserTie, FaCog, FaEnvelope } from "react-icons/fa";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 bg-gradient-to-b from-espresso-950 to-black flex flex-col z-50 shadow-2xl shadow-black/30">
      <div className="p-5 border-b border-espresso-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <FaCoffee className="text-espresso-950 text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cream-50 leading-tight">F&F Coffee</h1>
            <p className="text-[10px] text-cream-50/40">Employee Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-0.5">
          <button
            onClick={() => navigate("/employee/dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive("/employee/dashboard")
                ? "bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold shadow-lg shadow-gold-500/20"
                : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
            }`}
          >
            <FaBook className="text-base" />
            <span>Manage Tables</span>
          </button>
          <button
            onClick={() => navigate("/employee/messages")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive("/employee/messages")
                ? "bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold shadow-lg shadow-gold-500/20"
                : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
            }`}
          >
            <FaEnvelope className="text-base" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => navigate("/employee/settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive("/employee/settings")
                ? "bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold shadow-lg shadow-gold-500/20"
                : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
            }`}
          >
            <FaCog className="text-base" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      <div className="p-3 border-t border-espresso-800/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <FaSignOutAlt className="text-base" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}