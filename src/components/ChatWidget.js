import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaUserTie, FaPaperPlane, FaSpinner, FaMinus, FaHeadset, FaTrash, FaEdit, FaCheck, FaEllipsisV } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";

const API = "http://localhost:5000";
const socket = io(API);
const getImageUrl = (path) => (path ? `${API}${path}` : null);

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuMsgId, setMenuMsgId] = useState(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const customerEmail = user?.email || "guest";
  const customerName = user?.username || "Guest";

  useEffect(() => {
    if (open) fetchEmployees();
  }, [open]);

  useEffect(() => {
    if (selectedEmp) {
      socket.emit("chat:join", selectedEmp._id);
      socket.emit("chat:join", "customer:" + customerEmail);
      fetchMessages();
    }
    return () => {
      if (selectedEmp) {
        socket.emit("chat:leave", selectedEmp._id);
        socket.emit("chat:leave", "customer:" + customerEmail);
      }
    };
  }, [selectedEmp, customerEmail]);

  useEffect(() => {
    socket.on("chat:message", (msg) => {
      if (selectedEmp && msg.employeeId === selectedEmp._id && msg.customerEmail === customerEmail) {
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
    });
    socket.on("chat:deleted", (msgId) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });
    return () => {
      socket.off("chat:message");
      socket.off("chat:deleted");
    };
  }, [selectedEmp, customerEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/employees/available`);
      setEmployees(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    if (!selectedEmp) return;
    try {
      const res = await axios.get(`${API}/api/chat/messages/${selectedEmp._id}`, {
        params: { customerEmail },
      });
      setMessages(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedEmp) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      await axios.post(`${API}/api/chat/messages`, {
        employeeId: selectedEmp._id,
        employeeName: selectedEmp.username,
        customerEmail,
        customerName,
        sender: "customer",
        message: text,
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

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const Avatar = ({ src, name, size = 28 }) => {
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full shadow-2xl shadow-gold-500/40 flex items-center justify-center text-espresso-950 hover:scale-110 transition-transform z-50"
      >
        <FaComments className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <div className="bg-espresso-900 border border-espresso-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600">
          <div className="flex items-center gap-2">
            <FaHeadset className="text-espresso-950" />
            <span className="text-espresso-950 font-bold text-sm">Live Chat</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-espresso-950/20 transition-all">
              <FaMinus size={12} className="text-espresso-950" />
            </button>
            <button onClick={() => { setOpen(false); setStep("employees"); setSelectedEmp(null); setMessages([]); }} className="p-1.5 rounded-lg hover:bg-espresso-950/20 transition-all">
              <FaTimes size={12} className="text-espresso-950" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {step === "employees" && (
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <FaSpinner className="animate-spin text-gold-400 text-xl" />
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-10">
                    <FaUserTie className="text-3xl text-espresso-600 mx-auto mb-2" />
                    <p className="text-cream-50/50 text-sm">No agents available</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-cream-50/60 text-xs px-2 py-2">Select an agent to chat with:</p>
                    {employees.map((emp) => (
                      <button
                        key={emp._id}
                        onClick={() => { setSelectedEmp(emp); setStep("chat"); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-espresso-800/50 transition-all text-left"
                      >
                        <Avatar src={getImageUrl(emp.profileImage)} name={emp.username} size={36} />
                        <div>
                          <p className="text-sm font-medium text-cream-50">{emp.username || "Employee"}</p>
                          <p className="text-[10px] text-cream-50/40">Click to chat</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "chat" && selectedEmp && (
              <div>
                <div className="flex items-center gap-2 px-4 py-2 bg-espresso-800/40 border-b border-espresso-700/30">
                  <button onClick={() => { setStep("employees"); setSelectedEmp(null); setMessages([]); }} className="text-cream-50/50 hover:text-gold-400 text-xs">Back</button>
                  <span className="text-cream-50/30">|</span>
                  <Avatar src={getImageUrl(selectedEmp.profileImage)} name={selectedEmp.username} size={24} />
                  <span className="text-cream-50 text-sm font-medium">{selectedEmp.username || "Employee"}</span>
                </div>
                <div className="h-[300px] overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <FaComments className="text-2xl text-espresso-600 mx-auto mb-2" />
                      <p className="text-cream-50/40 text-sm">Start a conversation</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg._id} className={`flex items-end gap-2 ${msg.sender === "customer" ? "flex-row-reverse" : "flex-row"}`}>
                      {msg.sender === "employee" ? (
                        <Avatar src={getImageUrl(selectedEmp.profileImage)} name={selectedEmp.username} size={28} />
                      ) : (
                        <Avatar src={getImageUrl(user?.profileImage)} name={customerName} size={28} />
                      )}
                      <div className="group relative max-w-[75%]">
                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                          msg.sender === "customer"
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
                          <p className={`text-[10px] mt-0.5 ${msg.sender === "customer" ? "text-espresso-950/60" : "text-cream-50/40"}`}>
                            {formatTime(msg.createdAt)}
                            {msg.isEdited && <span className="ml-1 italic opacity-60">(edited)</span>}
                          </p>
                        </div>
                        {msg.sender === "customer" && !editingId && (
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
                    className="flex-1 px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-xl text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 placeholder-cream-50/30"
                  />
                  <button type="submit" disabled={sending || !input.trim()}
                    className="w-9 h-9 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 flex items-center justify-center hover:shadow-lg hover:shadow-gold-500/30 transition-all disabled:opacity-50">
                    {sending ? <FaSpinner className="animate-spin" size={12} /> : <FaPaperPlane size={12} />}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
