import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSignOutAlt, FaUser, FaStar, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000";

export default function Header({ onLogout, title }) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/feedback/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      /* silently fail */
    }
  };

  const fetchRecentUnreviewed = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/feedback?sort=unreviewed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const unreviewed = (res.data.data || []).filter(f => !f.isReviewed).slice(0, 5);
      setRecentFeedback(unreviewed);
    } catch (err) {
      /* silently fail */
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (!showDropdown) fetchRecentUnreviewed();
    setShowDropdown(!showDropdown);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <header className="bg-espresso-900/80 backdrop-blur-xl border-b border-espresso-700/30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-cream-50">{title}</h1>
        {admin?.role && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gold-500/10 text-gold-400 border border-gold-500/20">
            {admin.role.replace("_", " ")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-espresso-950/50 border border-espresso-700/50">
          <FaUser className="text-cream-50/40 text-xs" />
          <span className="text-cream-50/60 text-xs font-medium">{admin?.username || "Admin"}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={handleBellClick}
            className="relative p-2 rounded-lg text-cream-50/60 hover:text-gold-400 hover:bg-espresso-800/50 transition-all">
            <FaBell className="text-base" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 shadow-lg shadow-red-500/30">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-espresso-900 border border-espresso-700/50 rounded-xl shadow-2xl shadow-black/40 z-[99999] overflow-hidden">
              <div className="px-4 py-3 border-b border-espresso-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-cream-50">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {recentFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCheckCircle className="text-green-400/40 text-2xl mx-auto mb-2" />
                    <p className="text-cream-400/40 text-xs">All feedback reviewed</p>
                  </div>
                ) : (
                  recentFeedback.map((fb) => (
                    <button key={fb._id} onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        await axios.put(`${API}/api/admin/feedback/${fb._id}/review`, {}, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setUnreadCount(prev => Math.max(0, prev - 1));
                      } catch (e) { /* ignore */ }
                      navigate("/admin/feedback");
                      setShowDropdown(false);
                    }}
                      className="w-full text-left px-4 py-3 hover:bg-espresso-800/50 transition-all border-b border-espresso-800/30 last:border-0">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-espresso-950 text-xs font-bold mt-0.5">
                          {fb.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-cream-50 text-xs font-semibold truncate">{fb.name}</span>
                            <span className="text-cream-500/40 text-[10px] flex-shrink-0">{formatDate(fb.createdAt)}</span>
                          </div>
                          <p className="text-cream-400/70 text-[11px] mt-0.5 line-clamp-2">{fb.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FaStar key={i} size={8} className={i < fb.rating ? 'text-gold-400' : 'text-espresso-600'} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {unreadCount > 0 && (
                <div className="px-4 py-2.5 border-t border-espresso-800 bg-espresso-950/50">
                  <button onClick={() => { navigate("/admin/feedback"); setShowDropdown(false); }}
                    className="w-full text-center text-[11px] text-gold-400 font-semibold hover:text-gold-300 transition-all">
                    View all feedback &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all">
          <FaSignOutAlt size={12} /> Logout
        </button>
      </div>
    </header>
  );
}
