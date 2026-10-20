import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { FaComments, FaUserTie, FaPaperPlane, FaSpinner, FaTrash, FaEdit, FaCheck, FaTimes, FaEllipsisV, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import Sidebar from "./Sidebar";
import Header from "./Header";

const API = "http://localhost:5000";
const socket = io(API);
const getImageUrl = (path) => (path ? `${API}${path}` : null);

export default function EmployeeChat() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee") || "null");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuMsgId, setMenuMsgId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) { navigate("/employee/login"); return; }
    if (employee?.id) {
      socket.emit("chat:join", employee.id);
      fetchConversations();
    }
    return () => {
      if (employee?.id) socket.emit("chat:leave", employee.id);
    };
  }, []);

  useEffect(() => {
    if (employee?.id) {
      socket.on("chat:message", (msg) => {
        if (msg.employeeId === employee.id) {
          if (selectedConv && msg.customerEmail === selectedConv.customerEmail) {
            setMessages((prev) => {
              const idx = prev.findIndex((m) => m._id === msg._id);
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = msg;
                return copy;
              }
              return [...prev, msg];
            });
          }
          fetchConversations();
        }
      });
      socket.on("chat:deleted", (msgId) => {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
      });
    }
    return () => {
      socket.off("chat:message");
      socket.off("chat:deleted");
    };
  }, [selectedConv, employee?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!employee?.id) return;
    try {
      const token = localStorage.getItem("employeeToken");
      const res = await axios.get(`${API}/api/chat/conversations/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchMessages = async (customerEmail) => {
    if (!employee?.id) return;
    try {
      const res = await axios.get(`${API}/api/chat/messages/${employee.id}`, {
        params: { customerEmail },
      });
      setMessages(res.data.data || []);
    } catch { /* ignore */ }
  };

  const openConversation = (conv) => {
    setSelectedConv(conv);
    fetchMessages(conv.customerEmail);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedConv || !employee) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      const token = localStorage.getItem("employeeToken");
      await axios.post(`${API}/api/chat/messages`, {
        employeeId: employee.id,
        employeeName: employee.username,
        customerEmail: selectedConv.customerEmail,
        customerName: selectedConv.customerName,
        sender: "employee",
        message: text,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await axios.put(`${API}/api/chat/messages/${id}`, { message: editText.trim() });
      setEditingId(null);
      setEditText("");
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/chat/messages/${id}`);
    } catch { /* ignore */ }
    setMenuMsgId(null);
  };

  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.message);
    setMenuMsgId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employee");
    navigate("/employee/login");
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const Avatar = ({ src, name, size = 32 }) => {
    const [broken, setBroken] = useState(false);
    const initial = (name || "?").charAt(0).toUpperCase();
    const showImg = src && !broken;
    return (
      <div className="shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
        {showImg && (
          <img src={src} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} />
        )}
        {!showImg && (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "#B8860B", color: "#1A0F0A" }}>
            {initial}
          </div>
        )}
      </div>
    );
  };

  const inputCls = "w-full px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-xl text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 placeholder-cream-50/30";

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header title="Messages" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)]">
            <div className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl overflow-hidden h-full flex flex-col">
              {!selectedConv ? (
                <>
                  <div className="px-5 py-4 border-b border-espresso-800/30">
                    <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2">
                      <FaEnvelope size={14} /> Conversations
                      <span className="ml-auto text-xs font-normal text-cream-50/50">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</span>
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3">
                    {loading ? (
                      <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-gold-400 text-xl" /></div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-20">
                        <FaComments className="text-4xl text-espresso-600 mx-auto mb-3" />
                        <p className="text-cream-50/50 text-sm">No conversations yet</p>
                        <p className="text-cream-50/30 text-xs mt-1">When customers message you, they will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {conversations.map((conv) => (
                          <button
                            key={conv.customerEmail}
                            onClick={() => openConversation(conv)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-espresso-800/50 transition-all text-left"
                          >
                            <Avatar src={getImageUrl(conv.customerProfileImage)} name={conv.customerName || conv.customerEmail} size={40} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-cream-50 truncate">{conv.customerName || conv.customerEmail}</p>
                              <p className="text-xs text-cream-50/50 truncate mt-0.5">{conv.lastMessage}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-cream-50/40">{formatTime(conv.lastMessageAt)}</p>
                              {conv.sender === "customer" && (
                                <span className="inline-block w-2 h-2 rounded-full bg-gold-400 mt-1" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-espresso-800/30 bg-espresso-800/20">
                    <button onClick={() => { setSelectedConv(null); setMessages([]); }} className="text-cream-50/50 hover:text-gold-400 transition-colors"><FaArrowLeft size={14} /></button>
                    <Avatar src={getImageUrl(selectedConv.customerProfileImage)} name={selectedConv.customerName || selectedConv.customerEmail} size={36} />
                    <div>
                      <p className="text-sm font-medium text-cream-50">{selectedConv.customerName || selectedConv.customerEmail}</p>
                      <p className="text-[10px] text-cream-50/40">{selectedConv.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.length === 0 && (
                      <div className="text-center py-10">
                        <FaComments className="text-2xl text-espresso-600 mx-auto mb-2" />
                        <p className="text-cream-50/40 text-sm">No messages yet</p>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div key={msg._id} className={`flex items-end gap-2 ${msg.sender === "employee" ? "flex-row-reverse" : "flex-row"}`}>
                        {msg.sender === "employee" ? (
                          <Avatar src={getImageUrl(employee?.profileImage)} name={employee?.username} size={28} />
                        ) : (
                          <Avatar src={getImageUrl(msg.customerProfileImage)} name={msg.customerName || msg.customerEmail} size={28} />
                        )}
                        <div className="group relative max-w-[75%]">
                          <div className={`px-3 py-2 rounded-2xl text-sm ${
                            msg.sender === "employee"
                              ? "bg-gold-500 text-espresso-950 rounded-br-md"
                              : "bg-espresso-800 text-cream-50 rounded-bl-md"
                          }`}>
                            {editingId === msg._id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text" value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-1 px-2 py-1 bg-espresso-950/60 border border-gold-400/50 rounded text-sm text-cream-50 focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === "Enter") handleEdit(msg._id); if (e.key === "Escape") { setEditingId(null); setEditText(""); } }}
                                />
                                <button onClick={() => handleEdit(msg._id)} className="p-1 rounded hover:bg-espresso-950/30"><FaCheck size={10} /></button>
                                <button onClick={() => { setEditingId(null); setEditText(""); }} className="p-1 rounded hover:bg-espresso-950/30"><FaTimes size={10} /></button>
                              </div>
                            ) : (
                              <p className="break-words">{msg.message}</p>
                            )}
                            <p className={`text-[10px] mt-0.5 ${msg.sender === "employee" ? "text-espresso-950/60" : "text-cream-50/40"}`}>
                              {formatTime(msg.createdAt)}
                              {msg.isEdited && <span className="ml-1 italic opacity-60">(edited)</span>}
                            </p>
                          </div>
                          {msg.sender === "employee" && !editingId && (
                            <div className="absolute right-0 top-0 hidden group-hover:block">
                              <button onClick={() => setMenuMsgId(menuMsgId === msg._id ? null : msg._id)} className="p-1 text-cream-50/40 hover:text-cream-50">
                                <FaEllipsisV size={10} />
                              </button>
                              {menuMsgId === msg._id && (
                                <div className="absolute right-0 top-5 bg-espresso-800 border border-espresso-700/50 rounded-lg shadow-xl py-1 min-w-[100px] z-10">
                                  <button onClick={() => startEdit(msg)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-cream-50 hover:bg-espresso-700/50"><FaEdit size={10} /> Edit</button>
                                  <button onClick={() => handleDelete(msg._id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-espresso-700/50"><FaTrash size={10} /> Unsend</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-espresso-700/30">
                    <input
                      type="text" value={input} onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className={inputCls}
                    />
                    <button type="submit" disabled={sending || !input.trim()}
                      className="w-9 h-9 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 flex items-center justify-center hover:shadow-lg hover:shadow-gold-500/30 transition-all disabled:opacity-50">
                      {sending ? <FaSpinner className="animate-spin" size={12} /> : <FaPaperPlane size={12} />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
