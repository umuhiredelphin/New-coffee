import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera, FaCheckCircle, FaArrowLeft, FaSignOutAlt,
  FaUser, FaLock, FaEye, FaEyeSlash, FaCreditCard, FaBox,
  FaMoneyBillWave, FaTimes, FaEdit, FaSave, FaChevronRight,
  FaCoffee, FaEnvelope, FaPhone, FaCalendarAlt
} from "react-icons/fa";
import axios from "axios";
import bgImage from "../assets/coff.jpg";
import CoffeeLoader from "./CoffeeLoader";

const getImageUrl = (path) => (path ? `http://localhost:5000${path}` : null);

const sections = [
  { key: "profile", label: "Edit Profile", icon: FaUser },
  { key: "password", label: "Change Password", icon: FaLock },
  { key: "orders", label: "Order History", icon: FaBox },
  { key: "payments", label: "Payment History", icon: FaCreditCard },
];

function Notification({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white",
    error: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    info: "bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950",
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 transition-all animate-slide-in-right ${colors[type] || colors.info}`}>
      <span className="font-medium text-sm">{message}</span>
      <button className="text-current hover:opacity-80 transition-opacity" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
}

function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const rawUser = JSON.parse(localStorage.getItem("user") || "null");
  const storedUser = rawUser ? { ...rawUser, id: rawUser.id || rawUser._id } : null;

  const [profile, setProfile] = useState(storedUser);
  const [section, setSection] = useState("profile");
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({ username: "", email: "", phone: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState({ upload: false, save: false, password: false });

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, totalPayments: 0, paymentAmount: 0 });

  const fileRef = useRef(null);

  const show = (msg, type = "info") => setNotif({ message: msg, type });

  useEffect(() => {
    if (!profile) { navigate("/login"); return; }
    loadData(profile);
  }, [profile?.email]);

  useEffect(() => {
    if (profile) setForm({ username: profile.username || "", email: profile.email || "", phone: profile.phone || "" });
  }, [profile]);

  const normalize = (obj) => obj ? { ...obj, id: obj.id || obj._id } : obj;

  const loadData = async (user) => {
    let u = normalize(user);
    if (!u.id && u.email) {
      try {
        const r = await axios.get(`http://localhost:5000/api/users/by-email/${encodeURIComponent(u.email)}`);
        if (r.data.success) {
          u = normalize({ ...u, ...r.data.user });
          setProfile(u);
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch { show("Could not retrieve user data", "error"); setLoading(false); return; }
    }
    if (!u.id) { setLoading(false); return; }

    try {
      const [prof, ord, pay] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/profile/${u.id}`),
        axios.get(`http://localhost:5000/api/cart/orders/${encodeURIComponent(u.username)}`),
        axios.get(`http://localhost:5000/api/payments/history/${u.id}`),
      ]);

      if (prof.data.success) {
        const up = normalize({ ...u, ...prof.data.user });
        setProfile(up);
        localStorage.setItem("user", JSON.stringify(up));
      }

      let o = [], p = [];
      if (ord.data.success) o = ord.data.orders;
      if (pay.data.success) p = pay.data.payments;

      setOrders(o);
      setPayments(p);
      setStats({
        totalOrders: o.length,
        totalSpent: o.reduce((s, x) => s + parseFloat(x.total || 0), 0),
        totalPayments: p.length,
        paymentAmount: p.reduce((s, x) => s + parseFloat(x.amount || 0), 0),
      });
    } catch (err) {
      show("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!profile?.id) return;
    try {
      const r = await axios.get(`http://localhost:5000/api/users/profile/${profile.id}`);
      if (r.data.success) {
        const up = { ...profile, ...r.data.user };
        setProfile(up);
        localStorage.setItem("user", JSON.stringify(up));
      }
    } catch { /* ignore */ }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { show("File must be under 5MB", "error"); return; }
    if (!f.type.startsWith("image/")) { show("Only image files allowed", "error"); return; }
    setFile(f);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const uploadImage = async () => {
    if (!file) { show("Select an image first", "error"); return; }
    if (!profile?.id) { show("User ID missing", "error"); return; }
    setBusy(b => ({ ...b, upload: true }));
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      fd.append("userId", profile.id);
      const r = await axios.post("http://localhost:5000/api/users/upload-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (r.data.success) {
        show("Profile image updated!");
        setPreview(null);
        setFile(null);
        refresh();
      } else show(r.data.message || "Upload failed", "error");
    } catch (err) {
      show(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setBusy(b => ({ ...b, upload: false }));
    }
  };

  const saveProfile = async () => {
    if (!profile?.id) { show("User ID missing", "error"); return; }
    setBusy(b => ({ ...b, save: true }));
    try {
      const r = await axios.put(`http://localhost:5000/api/users/update-profile/${profile.id}`, form);
      if (r.data.success) {
        show("Profile updated!");
        setEditMode(false);
        const up = { ...profile, ...form };
        setProfile(up);
        localStorage.setItem("user", JSON.stringify(up));
      } else show(r.data.message || "Update failed", "error");
    } catch (err) {
      show(err.response?.data?.message || "Update failed", "error");
    } finally {
      setBusy(b => ({ ...b, save: false }));
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setForm({ username: profile?.username || "", email: profile?.email || "", phone: profile?.phone || "" });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) { show("Passwords do not match", "error"); return; }
    setBusy(b => ({ ...b, password: true }));
    try {
      const r = await axios.post("http://localhost:5000/api/users/change-password", {
        userId: profile.id, ...pwd,
      });
      if (r.data.success) {
        show("Password changed!");
        setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      show(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setBusy(b => ({ ...b, password: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const fmt = (n) => new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF" }).format(n);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  const btn = "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg transition-all duration-300 hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const btnOut = "inline-flex items-center gap-2 px-4 py-2 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg transition-all duration-300 hover:bg-espresso-700/50 hover:border-gold-400/50 active:scale-95 text-sm";
  const inputCls = "w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all disabled:opacity-60";
  const cardCls = "bg-espresso-800/40 backdrop-blur-xl border border-espresso-700/30 rounded-xl overflow-hidden";

  if (loading) return <CoffeeLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-950/90 via-espresso-950/60 to-espresso-950/90" />
        <div className="relative px-4 sm:px-8 py-4 border-b border-espresso-700/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button className="flex items-center gap-2 text-cream-50/80 hover:text-gold-400 transition-all text-sm" onClick={() => navigate("/")}>
              <FaArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-2">
              <FaCoffee className="text-gold-400 text-lg" />
              <h1 className="text-xl font-playfair text-gold-400 font-bold">My Profile</h1>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm">
              <FaSignOutAlt size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative px-4 sm:px-8 py-5">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FaCoffee, label: "Orders", value: stats.totalOrders },
              { icon: FaMoneyBillWave, label: "Spent", value: fmt(stats.totalSpent) },
              { icon: FaCreditCard, label: "Payments", value: stats.totalPayments },
              { icon: FaBox, label: "Total", value: fmt(stats.paymentAmount) },
            ].map((s, i) => (
              <div key={i} className="bg-espresso-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-espresso-700/20">
                <s.icon className="text-gold-400 mx-auto mb-1 text-lg" />
                <p className="text-lg font-bold text-cream-50">{s.value}</p>
                <p className="text-[10px] text-cream-50/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-8">
        {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="bg-espresso-800/40 backdrop-blur-xl border border-espresso-700/30 rounded-xl p-5 text-center mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400/50 mx-auto mb-2">
                {getImageUrl(profile?.profileImage) ? (
                  <img src={getImageUrl(profile.profileImage)} alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${getImageUrl(profile?.profileImage) ? "hidden" : ""}`}>
                  <FaUser className="text-2xl text-cream-50/40" />
                </div>
              </div>
              <h3 className="text-gold-400 font-playfair text-base font-semibold truncate">{profile?.username || "User"}</h3>
              <p className="text-cream-50/50 text-xs truncate">{profile?.email || ""}</p>
            </div>

            <nav className="bg-espresso-800/40 backdrop-blur-xl border border-espresso-700/30 rounded-xl p-1.5 flex flex-col gap-0.5 mb-4">
              {sections.map(s => (
                <button key={s.key}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${section === s.key ? "bg-gold-500/10 text-gold-400 border-l-2 border-gold-400" : "text-cream-50/70 hover:text-cream-50 hover:bg-espresso-700/30"}`}
                  onClick={() => setSection(s.key)}>
                  <s.icon size={14} />
                  <span>{s.label}</span>
                </button>
              ))}
            </nav>

            <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm border border-espresso-700/30">
              <FaSignOutAlt size={14} /> Log Out
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* EDIT PROFILE */}
            {section === "profile" && (
              <div className={cardCls}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-espresso-700/30">
                  <h2 className="text-lg font-playfair text-gold-400 font-bold">Edit Profile</h2>
                  {!editMode ? (
                    <button className={btn} onClick={() => setEditMode(true)}>
                      <FaEdit size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button className={btnOut} onClick={cancelEdit}>Cancel</button>
                      <button className={btn} onClick={saveProfile} disabled={busy.save}>
                        {busy.save ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin inline-block" /> Saving...</> : <><FaSave size={14} /> Save</>}
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold-400/50 mb-3">
                      {preview ? (
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                      ) : getImageUrl(profile?.profileImage) ? (
                        <img src={getImageUrl(profile.profileImage)} alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${preview || getImageUrl(profile?.profileImage) ? "hidden" : ""}`}>
                        <FaUser className="text-4xl text-cream-50/30" />
                      </div>
                    </div>
                    <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" className="hidden" />
                    <div className="flex gap-2">
                      <button className={btnOut + " text-xs"} onClick={() => fileRef.current?.click()}>
                        <FaCamera size={12} /> Change Photo
                      </button>
                      {preview && (
                        <button className={btn + " text-xs"} onClick={uploadImage} disabled={busy.upload}>
                          {busy.upload ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin inline-block" /> Uploading...</> : <><FaCheckCircle size={12} /> Upload</>}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/70 mb-1.5">
                        <FaUser className="inline mr-1.5 text-gold-400/70" size={11} />Full Name
                      </label>
                      <input type="text" name="username" value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        disabled={!editMode} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/70 mb-1.5">
                        <FaEnvelope className="inline mr-1.5 text-gold-400/70" size={11} />Email
                      </label>
                      <input type="email" name="email" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        disabled={!editMode} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/70 mb-1.5">
                        <FaPhone className="inline mr-1.5 text-gold-400/70" size={11} />Phone
                      </label>
                      <input type="tel" name="phone" value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        disabled={!editMode} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/70 mb-1.5">
                        <FaCalendarAlt className="inline mr-1.5 text-gold-400/70" size={11} />Member Since
                      </label>
                      <input type="text" value={fmtDate(profile?.created_at)} disabled className={inputCls + " cursor-not-allowed"} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHANGE PASSWORD */}
            {section === "password" && (
              <div className={cardCls}>
                <div className="px-5 py-4 border-b border-espresso-700/30">
                  <h2 className="text-lg font-playfair text-gold-400 font-bold">Change Password</h2>
                </div>
                <div className="p-5">
                  <form onSubmit={changePassword} className="space-y-4 max-w-md">
                    {["currentPassword", "newPassword", "confirmPassword"].map((field) => {
                      const label = field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password";
                      return (
                        <div key={field}>
                          <label className="block text-xs font-medium text-cream-50/70 mb-1.5">{label}</label>
                          <div className="relative">
                            <input type={showPwd[field] ? "text" : "password"} name={field}
                              value={pwd[field]}
                              onChange={e => setPwd(p => ({ ...p, [field]: e.target.value }))}
                              className={inputCls + " pr-10"} required />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/50 hover:text-gold-400 transition-colors"
                              onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))}>
                              {showPwd[field] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <button type="submit" className={btn} disabled={busy.password}>
                      {busy.password ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin inline-block" /> Changing...</> : <><FaLock size={14} /> Change Password</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ORDER HISTORY */}
            {section === "orders" && (
              <div className={cardCls}>
                <div className="px-5 py-4 border-b border-espresso-700/30">
                  <h2 className="text-lg font-playfair text-gold-400 font-bold">Order History</h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-espresso-900/30 border border-espresso-700/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-cream-50">{stats.totalOrders}</p>
                      <p className="text-xs text-cream-50/60">Total Orders</p>
                    </div>
                    <div className="bg-espresso-900/30 border border-espresso-700/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-cream-50">{fmt(stats.totalSpent)}</p>
                      <p className="text-xs text-cream-50/60">Total Spent</p>
                    </div>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCoffee className="text-espresso-600 text-3xl mx-auto mb-3" />
                      <p className="text-cream-50/50 text-sm">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.map(o => (
                        <div key={o.id || o._id} className="flex items-center justify-between bg-espresso-900/20 rounded-lg px-4 py-3 border border-espresso-700/20 hover:border-espresso-700/50 transition-all">
                          <div>
                            <h4 className="text-gold-400 text-sm font-semibold">Order #{o.id || o._id}</h4>
                            <p className="text-xs text-cream-50/50 mt-0.5">{fmtDate(o.createdAt)}</p>
                            <span className="text-[10px] text-cream-50/40 capitalize">{o.status}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-cream-50">{fmt(o.total)}</p>
                            <FaChevronRight className="text-espresso-600 ml-auto mt-0.5 text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAYMENT HISTORY */}
            {section === "payments" && (
              <div className={cardCls}>
                <div className="px-5 py-4 border-b border-espresso-700/30">
                  <h2 className="text-lg font-playfair text-gold-400 font-bold">Payment History</h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-espresso-900/30 border border-espresso-700/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-cream-50">{stats.totalPayments}</p>
                      <p className="text-xs text-cream-50/60">Transactions</p>
                    </div>
                    <div className="bg-espresso-900/30 border border-espresso-700/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-cream-50">{fmt(stats.paymentAmount)}</p>
                      <p className="text-xs text-cream-50/60">Total Paid</p>
                    </div>
                  </div>
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCreditCard className="text-espresso-600 text-3xl mx-auto mb-3" />
                      <p className="text-cream-50/50 text-sm">No payment history</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payments.map(p => (
                        <div key={p.id || p._id} className="flex items-center justify-between bg-espresso-900/20 rounded-lg px-4 py-3 border border-espresso-700/20 hover:border-espresso-700/50 transition-all">
                          <div>
                            <h4 className="text-gold-400 text-sm font-semibold">Payment #{p.id || p._id}</h4>
                            <p className="text-xs text-cream-50/50 mt-0.5">{fmtDate(p.createdAt)}</p>
                            <p className="text-[10px] text-cream-50/40">{p.description || `Order #${p.order_id}`}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-cream-50">{fmt(p.amount)}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${p.status === "paid" || p.status === "completed" ? "bg-green-500/20 text-green-400" : p.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
