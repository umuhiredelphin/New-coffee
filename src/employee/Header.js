import React, { useState, useEffect } from "react";
import { FaUserTie, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const API = "http://localhost:5000";
const socket = io(API);
const getImageUrl = (path) => (path ? `${API}${path}` : null);

export default function Header({ title }) {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee"));
  const [unreadCount, setUnreadCount] = useState(0);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    if (!employee?.id) return;
    socket.emit("chat:join", employee.id);
    fetchUnread();
    socket.on("chat:message", (msg) => {
      if (msg.employeeId === employee.id && msg.sender === "customer") {
        setUnreadCount((prev) => prev + 1);
      }
    });
    return () => {
      socket.off("chat:message");
      if (employee?.id) socket.emit("chat:leave", employee.id);
    };
    // eslint-disable-next-line
  }, []);

  const fetchUnread = async () => {
    if (!employee?.id) return;
    try {
      const res = await axios.get(`${API}/api/chat/conversations/${employee.id}`);
      const convs = res.data.data || [];
      const count = convs.filter((c) => c.sender === "customer").length;
      setUnreadCount(count);
    } catch { /* ignore */ }
  };

  return (
    <header className="h-16 bg-espresso-900/80 backdrop-blur-md border-b border-espresso-800/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-lg font-playfair font-bold text-cream-50">{title || "Employee Dashboard"}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/employee/messages")}
          className="relative p-2 rounded-lg bg-espresso-800/50 hover:bg-espresso-700/50 transition-all"
        >
          <FaEnvelope className="text-cream-50 text-base" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/employee/settings")}>
          <div className="text-right">
            <p className="text-sm text-cream-50 font-medium">{employee?.username || "Employee"}</p>
            <p className="text-[10px] text-cream-400/50">{employee?.role || "employee"}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center overflow-hidden">
            {getImageUrl(employee?.profileImage) && !imgBroken ? (
              <img src={getImageUrl(employee.profileImage)} alt="" className="w-full h-full object-cover" onError={() => setImgBroken(true)} />
            ) : (
              <span className="text-xs font-bold text-espresso-950">{(employee?.username || "E").charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
