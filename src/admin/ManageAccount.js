import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCamera, FaBell, FaPalette, FaHistory, FaSignOutAlt, FaArrowLeft, FaSave, FaEdit, FaTimes, FaMoon, FaSun, FaGlobe, FaLanguage, FaCog, FaEnvelope, FaKey, FaCheck, FaUserShield, FaTrash, FaPlus } from "react-icons/fa";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";
import { useLanguage } from "./useLanguage";

const API = "http://localhost:5000/api/admin";

const tabs = [
  { key: "profile", labelKey: "profile", icon: FaUser },
  { key: "password", labelKey: "passwordTab", icon: FaLock },
  { key: "admins", labelKey: "manageAdmins", icon: FaUserShield },
  { key: "notifications", labelKey: "notifications", icon: FaBell },
  { key: "appearance", labelKey: "appearance", icon: FaPalette },
  { key: "activity", labelKey: "activityLog", icon: FaHistory },
];

export default function ManageAccount({ onLogout: parentLogout }) {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const fileRef = useRef(null);
  const storedAdmin = JSON.parse(localStorage.getItem("admin") || "null");

  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(storedAdmin);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pwdStep, setPwdStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  const [allAdmins, setAllAdmins] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ username: "", email: "", password: "" });
  const [selectedRoles, setSelectedRoles] = useState({ super_admin: false, admin: true, manager: false });
  const [creating, setCreating] = useState(false);
  const [fetchingAdmins, setFetchingAdmins] = useState(false);

  const [notifSettings, setNotifSettings] = useState({ emailOrders: true, smsOrders: false, emailPromos: true, orderUpdates: true });
  const [notifLoading, setNotifLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activityLog, setActivityLog] = useState([]);

  const isSuperAdmin = profile?.role === "super_admin";

  const show = (msg, type = "info") => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };
  const addActivity = (action) => setActivityLog((a) => [{ action, time: new Date() }, ...a]);

  useEffect(() => {
    const admin = storedAdmin;
    if (!admin) { navigate("/admin"); return; }
    const load = async () => {
      let a = { ...admin, id: admin.id || admin._id };
      if (a.id) {
        try {
          const r = await axios.get(`${API}/profile/${a.id}`);
          if (r.data.success) {
            a = { ...a, ...r.data.admin, id: r.data.admin.id || r.data.admin._id || a.id };
            setProfile(a);
            localStorage.setItem("admin", JSON.stringify(a));
          }
        } catch { /* ignore */ }
      }
      setForm({ username: a.username || "", email: a.email || "" });
      addActivity("Opened account settings");
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadNotifSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/notif-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const s = res.data.data;
          setNotifSettings({ emailOrders: s.emailOrders, smsOrders: s.smsOrders, emailPromos: s.emailPromos, orderUpdates: s.orderUpdates });
        }
      } catch { /* ignore */ }
    };
    if (storedAdmin) loadNotifSettings();
  }, [storedAdmin]);

  useEffect(() => {
    if (tab === "admins" && isSuperAdmin) fetchAdmins();
  }, [tab]);

  const fetchAdmins = async () => {
    setFetchingAdmins(true);
    try {
      const res = await axios.get(`${API}/admins`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) setAllAdmins(res.data.admins || []);
    } catch { show("Failed to load admins", "error"); }
    finally { setFetchingAdmins(false); }
  };

  const rolePriority = { super_admin: 3, admin: 2, manager: 1 };

  const handleRoleToggle = (role) => {
    setSelectedRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const getSelectedRole = () => {
    const entries = Object.entries(selectedRoles).filter(([, v]) => v);
    if (entries.length === 0) return null;
    entries.sort((a, b) => (rolePriority[b[0]] || 0) - (rolePriority[a[0]] || 0));
    return entries[0][0];
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminForm.username || !newAdminForm.email || !newAdminForm.password) {
      show("All fields are required", "error"); return;
    }
    const finalRole = getSelectedRole();
    if (!finalRole) { show("Select at least one role", "error"); return; }
    setCreating(true);
    try {
      const res = await axios.post(`${API}/register`, {
        username: newAdminForm.username, email: newAdminForm.email, password: newAdminForm.password, role: finalRole,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        show(`${t.adminCreated} (${finalRole.replace("_", " ")})`);
        setNewAdminForm({ username: "", email: "", password: "" });
        setSelectedRoles({ super_admin: false, admin: true, manager: false });
        addActivity(`Created new admin: ${newAdminForm.email} (${finalRole})`);
        fetchAdmins();
      } else show(res.data.message || "Failed", "error");
    } catch (err) { show(err.response?.data?.message || "Failed to create admin", "error"); }
    finally { setCreating(false); }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await axios.delete(`${API}/admins/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      show(t.adminDeleted);
      fetchAdmins();
    } catch { show("Failed to delete admin", "error"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); localStorage.removeItem("admin"); localStorage.removeItem("token");
    if (parentLogout) parentLogout();
    navigate("/");
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { show("File must be under 5MB", "error"); return; }
    setFile(f);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const uploadImage = async () => {
    if (!file || !profile?.id) return;
    const fd = new FormData();
    fd.append("profileImage", file);
    fd.append("userId", profile.id);
    try {
      const r = await axios.post(`${API}/upload-profile`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (r.data.success) {
        show("Profile image updated!"); setPreview(null); setFile(null);
        const rr = await axios.get(`${API}/profile/${profile.id}`);
        if (rr.data.success) { const up = { ...profile, ...rr.data.admin, id: rr.data.admin.id || rr.data.admin._id || profile.id }; setProfile(up); localStorage.setItem("admin", JSON.stringify(up)); addActivity("Updated profile image"); }
      }
    } catch { show("Upload failed", "error"); }
  };

  const saveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const r = await axios.put(`${API}/update-profile/${profile.id}`, form);
      if (r.data.success) {
        show(t.adminUpdated); setEdit(false);
        const up = { ...profile, ...r.data.admin, id: r.data.admin.id || r.data.admin._id || profile.id };
        setProfile(up); localStorage.setItem("admin", JSON.stringify(up)); addActivity("Updated profile");
      } else show(r.data.message || "Update failed", "error");
    } catch { show("Update failed", "error"); }
    finally { setSaving(false); }
  };

  const sendResetCode = async (e) => {
    e.preventDefault();
    setChangingPwd(true);
    try {
      const r = await axios.post(`${API}/forgot`, { email: resetEmail });
      if (r.data.success) { show("Reset code sent to your email!"); setPwdStep("code"); }
      else show(r.data.message || "Failed to send code", "error");
    } catch (err) { show(err.response?.data?.message || "Failed", "error"); }
    finally { setChangingPwd(false); }
  };

  const verifyAndReset = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { show("Passwords do not match", "error"); return; }
    setChangingPwd(true);
    try {
      const r = await axios.post(`${API}/reset`, { email: resetEmail, code: resetCode, newPassword: newPwd });
      if (r.data.success) { show("Password changed successfully!"); setPwdStep("email"); setResetEmail(""); setResetCode(""); setNewPwd(""); setConfirmPwd(""); addActivity("Changed password"); }
    } catch (err) { show(err.response?.data?.message || "Failed", "error"); }
    finally { setChangingPwd(false); }
  };

  const inputCls = "w-full px-3 py-2.5 bg-espresso-950/50 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all disabled:opacity-60";
  const btn = "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg text-sm transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/30 active:scale-95 disabled:opacity-50";
  const btnOut = "inline-flex items-center gap-2 px-4 py-2 bg-espresso-900/50 border border-espresso-700/50 text-cream-50 rounded-lg text-sm transition-all hover:bg-espresso-700/50 hover:border-gold-400/50 active:scale-95";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-espresso-950">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 ml-60 flex flex-col">
          <Header onLogout={handleLogout} title={t.accountSettings} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" /><div className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: "0.15s" }} /><div className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: "0.3s" }} /></div>
              <p className="text-gold-400 text-xs font-semibold animate-pulse tracking-widest">{t.loading}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getImageUrl = (path) => (path ? `http://localhost:5000${path}` : null);

  const getTabLabel = (tabKey) => {
    const tab = tabs.find((t) => t.key === tabKey);
    if (!tab) return tabKey;
    return t[tab.labelKey] || tabKey;
  };

  return (
    <div className="flex min-h-screen bg-espresso-950 font-poppins">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header onLogout={handleLogout} title={t.accountSettings} />
        {notif && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-slide-in-right ${notif.type === "error" ? "bg-gradient-to-r from-red-500 to-red-600 text-white" : "bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950"}`}>
            <span className="font-medium text-sm">{notif.msg}</span>
            <button onClick={() => setNotif(null)} className="text-current hover:opacity-80"><FaTimes /></button>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate("/admin")} className="text-cream-50/50 hover:text-gold-400 transition-colors"><FaArrowLeft size={16} /></button>
              <FaCog className="text-gold-400 text-lg" />
              <h1 className="text-xl font-playfair font-bold text-cream-50">{t.accountSettings}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gold-500/10 text-gold-400 capitalize">{profile?.role?.replace("_", " ") || t.role}</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-48 shrink-0">
                <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-1.5 space-y-0.5">
                  {tabs.filter(tab => tab.key !== "admins" || isSuperAdmin).map((tb) => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === tb.key ? "bg-gold-500/10 text-gold-400 border-l-2 border-gold-400 font-semibold" : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/30"}`}>
                      <tb.icon size={14} /><span>{getTabLabel(tb.key)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-5">
                {/* PROFILE */}
                {tab === "profile" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-espresso-800/30">
                      <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaUser size={14} /> {t.adminProfile}</h2>
                      {!edit ? <button className={btn} onClick={() => setEdit(true)}><FaEdit size={13} /> {t.edit}</button> : (
                        <div className="flex gap-2">
                          <button className={btnOut} onClick={() => { setEdit(false); setForm({ username: profile.username, email: profile.email }); }}>{t.cancel}</button>
                          <button className={btn} onClick={saveProfile} disabled={saving}>{saving ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> {t.saving}</> : <><FaSave size={13} /> {t.save}</>}</button>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-400/40">
                            {preview ? <img src={preview} alt="" className="w-full h-full object-cover" />
                              : getImageUrl(profile?.profileImage) ? <img src={getImageUrl(profile.profileImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }} /> : null}
                            <div className={`w-full h-full flex items-center justify-center ${preview || getImageUrl(profile?.profileImage) ? "hidden" : ""}`}>
                              <FaUser className="text-3xl text-cream-50/30" />
                            </div>
                          </div>
                        </div>
                        <div className="text-center sm:text-left">
                          <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" className="hidden" />
                          <div className="flex gap-2">
                            <button className={btnOut + " text-xs"} onClick={() => fileRef.current?.click()}><FaCamera size={11} /> {t.changePhoto}</button>
                            {preview && <button className={btn + " text-xs"} onClick={uploadImage}><FaCheck size={11} /> {t.upload}</button>}
                          </div>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.username}</label><input type="text" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} disabled={!edit} className={inputCls} /></div>
                        <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.email}</label><input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} disabled={!edit} className={inputCls} /></div>
                        <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.role}</label><input type="text" value={profile?.role?.replace("_", " ") || "Administrator"} disabled className={inputCls + " cursor-not-allowed"} /></div>
                        <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.memberSince}</label><input type="text" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(lang === "rw" ? "en-US" : lang, { year: "numeric", month: "short", day: "numeric" }) : "\u2014"} disabled className={inputCls + " cursor-not-allowed"} /></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PASSWORD */}
                {tab === "password" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="px-5 py-4 border-b border-espresso-800/30">
                      <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaLock size={14} /> {t.changePassword}</h2>
                      <p className="text-cream-50/40 text-xs mt-1">{t.pwdResetInfo}</p>
                    </div>
                    <div className="p-5">
                      {pwdStep === "email" && (
                        <form onSubmit={sendResetCode} className="max-w-md space-y-4">
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1.5"><FaEnvelope size={11} /> {t.adminEmailLabel}</label><input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder={t.adminEmail} className={inputCls} required /></div>
                          <button type="submit" className={btn} disabled={changingPwd}>{changingPwd ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> {t.sending}</> : <><FaKey size={13} /> {t.sendResetCode}</>}</button>
                        </form>
                      )}
                      {pwdStep === "code" && (
                        <form onSubmit={verifyAndReset} className="max-w-md space-y-4">
                          <div className="p-4 bg-gold-500/5 border border-gold-500/20 rounded-xl text-center"><FaEnvelope className="text-gold-400 text-xl mx-auto mb-2" /><p className="text-cream-50/70 text-sm">{t.codeSent} <span className="text-gold-400 font-semibold">{resetEmail}</span></p></div>
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.resetCode}</label><input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder={t.enterCode} maxLength={6} className={inputCls + " text-center tracking-[0.3em] font-bold"} required /></div>
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.newPassword}</label><input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder={t.newPasswordPlaceholder} className={inputCls} required /></div>
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.confirmPassword}</label><input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder={t.confirmPassword} className={inputCls} required /></div>
                          <div className="flex gap-2">
                            <button type="button" className={btnOut} onClick={() => { setPwdStep("email"); setResetCode(""); setNewPwd(""); setConfirmPwd(""); }}><FaArrowLeft size={12} /> {t.backToLogin}</button>
                            <button type="submit" className={btn} disabled={changingPwd}>{changingPwd ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> {t.resetting}</> : <><FaCheck size={13} /> {t.resetPassword}</>}</button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* ADMIN MANAGEMENT */}
                {tab === "admins" && isSuperAdmin && (
                  <>
                    {/* Create Admin */}
                    <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                      <div className="px-5 py-4 border-b border-espresso-800/30">
                        <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaPlus size={14} /> {t.createNewAdmin}</h2>
                      </div>
                      <form onSubmit={handleCreateAdmin} className="p-5 space-y-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.fullName}</label><input type="text" value={newAdminForm.username} onChange={(e) => setNewAdminForm(f => ({ ...f, username: e.target.value }))} placeholder={t.fullName} className={inputCls} required /></div>
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.email}</label><input type="email" value={newAdminForm.email} onChange={(e) => setNewAdminForm(f => ({ ...f, email: e.target.value }))} placeholder={t.email} className={inputCls} required /></div>
                          <div><label className="block text-xs font-medium text-cream-50/60 mb-1.5">{t.password}</label><input type="password" value={newAdminForm.password} onChange={(e) => setNewAdminForm(f => ({ ...f, password: e.target.value }))} placeholder={t.password} className={inputCls} required /></div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-cream-50/60 mb-2">{t.roleCheckboxes}</p>
                          <div className="flex gap-4 flex-wrap">
                            {["super_admin", "admin", "manager"].map((role) => {
                              const isSelected = selectedRoles[role];
                              const isPrimary = isSelected && getSelectedRole() === role;
                              return (
                                <label key={role}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
                                    isPrimary
                                      ? "bg-gold-500/15 border border-gold-400/50 text-gold-400"
                                      : isSelected
                                      ? "bg-espresso-800/50 border border-espresso-700/50 text-cream-50"
                                      : "bg-espresso-950/30 border border-espresso-800/30 text-cream-50/60 hover:border-espresso-700/50"
                                  }`}>
                                  <input type="checkbox" checked={isSelected} onChange={() => handleRoleToggle(role)} className="accent-gold-500 w-4 h-4" />
                                  <span className="text-sm capitalize">{role.replace("_", " ")}</span>
                                  {isPrimary && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400">primary</span>}
                                </label>
                              );
                            })}
                          </div>
                          {getSelectedRole() && (
                            <p className="text-[10px] text-gold-400/70 mt-1.5">
                              Will be assigned as: <strong className="capitalize">{getSelectedRole().replace("_", " ")}</strong>
                              {selectedRoles.super_admin && selectedRoles.admin && " (super_admin takes priority)"}
                            </p>
                          )}
                        </div>
                        <button type="submit" disabled={creating} className={btn}>
                          {creating ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> {t.creating}</> : <><FaUserShield size={13} /> {t.createAdmin}</>}
                        </button>
                      </form>
                    </div>

                    {/* Existing Admins */}
                    <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                      <div className="px-5 py-4 border-b border-espresso-800/30">
                        <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaUserShield size={14} /> {t.existingAdmins}</h2>
                      </div>
                      <div className="p-5">
                        {fetchingAdmins ? (
                          <div className="text-center py-6"><span className="text-cream-50/50 text-sm">{t.loading}</span></div>
                        ) : allAdmins.length === 0 ? (
                          <p className="text-center text-cream-50/40 text-sm py-6">{t.noAdmins}</p>
                        ) : (
                          <div className="space-y-2">
                            {allAdmins.map((admin) => (
                              <div key={admin._id || admin.id} className="flex items-center justify-between p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-espresso-950 text-sm font-bold">
                                    {(admin.username || "A")[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-cream-50">{admin.username} {admin._id === profile?.id || admin.id === profile?.id ? <span className="text-gold-400 text-[10px]">(You)</span> : ""}</p>
                                    <p className="text-xs text-cream-50/50">{admin.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                    admin.role === "super_admin" ? "bg-purple-500/15 text-purple-400" : admin.role === "manager" ? "bg-blue-500/15 text-blue-400" : "bg-gold-500/15 text-gold-400"
                                  }`}>{admin.role?.replace("_", " ")}</span>
                                  {admin._id !== profile?.id && admin.id !== profile?.id && (
                                    <button onClick={() => handleDeleteAdmin(admin._id || admin.id)}
                                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"><FaTrash size={12} /></button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {tab === "admins" && !isSuperAdmin && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-8 text-center">
                    <FaUserShield className="text-4xl text-cream-50/20 mx-auto mb-3" />
                    <p className="text-cream-50/50 text-sm">{t.noPermission}</p>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {tab === "notifications" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="px-5 py-4 border-b border-espresso-800/30"><h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaBell size={14} /> {t.notificationPrefs}</h2></div>
                    <div className="p-5 space-y-4">
                      {[
                        { key: "emailOrders", labelKey: "emailOrderConfirmations", descKey: "emailOrderDesc" },
                        { key: "smsOrders", labelKey: "smsOrderUpdates", descKey: "smsOrderDesc" },
                        { key: "emailPromos", labelKey: "promotionalEmails", descKey: "promoDesc" },
                        { key: "orderUpdates", labelKey: "orderStatusUpdates", descKey: "orderStatusDesc" },
                      ].map((n) => (
                        <label key={n.key} className="flex items-start gap-3 p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20 cursor-pointer hover:border-gold-400/20 transition-all">
                          <input type="checkbox" checked={notifSettings[n.key]} onChange={() => setNotifSettings(s => ({ ...s, [n.key]: !s[n.key] }))} className="mt-0.5 accent-gold-500 w-4 h-4" />
                          <div><p className="text-sm font-medium text-cream-50">{t[n.labelKey]}</p><p className="text-xs text-cream-50/50 mt-0.5">{t[n.descKey]}</p></div>
                        </label>
                      ))}
                    </div>
                    <div className="px-5 pb-5">
                      <button onClick={async () => {
                        setNotifLoading(true);
                        try {
                          const token = localStorage.getItem("token");
                          const res = await axios.put(`${API}/notif-settings`, notifSettings, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.data.success) show("Notification settings saved!");
                          addActivity("Updated notification preferences");
                        } catch { show("Failed to save settings", "error"); }
                        finally { setNotifLoading(false); }
                      }} disabled={notifLoading} className={btn}>
                        {notifLoading ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FaSave size={13} /> Save Settings</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* APPEARANCE */}
                {tab === "appearance" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="px-5 py-4 border-b border-espresso-800/30"><h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaPalette size={14} /> {t.appearance}</h2></div>
                    <div className="p-5 space-y-6">
                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-2 flex items-center gap-2"><FaMoon size={12} /> {t.theme}</label>
                        <div className="flex gap-3">
                          {[{ value: "dark", icon: FaMoon, labelKey: "dark" }, { value: "light", icon: FaSun, labelKey: "light" }, { value: "system", icon: FaGlobe, labelKey: "system" }].map((th) => (
                            <button key={th.value} onClick={() => setTheme(th.value)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all border ${theme === th.value ? "bg-gold-500/10 text-gold-400 border-gold-400/30" : "bg-espresso-950/30 text-cream-50/60 border-espresso-800/30 hover:border-espresso-700/50"}`}>
                              <th.icon size={14} /> {t[th.labelKey]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-2 flex items-center gap-2"><FaLanguage size={12} /> {t.language}</label>
                        <select value={lang} onChange={(e) => setLang(e.target.value)} className={inputCls + " max-w-xs cursor-pointer"}>
                          <option value="en">English</option>
                          <option value="fr">Fran&ccedil;ais</option>
                          <option value="rw">Kinyarwanda</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIVITY LOG */}
                {tab === "activity" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="px-5 py-4 border-b border-espresso-800/30"><h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2"><FaHistory size={14} /> {t.activityLog}</h2></div>
                    <div className="p-5">
                      {activityLog.length === 0 ? <p className="text-center text-cream-50/40 text-sm py-6">{t.noActivity}</p> : (
                        <div className="space-y-2">
                          {activityLog.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-espresso-950/30 rounded-lg border border-espresso-800/20">
                              <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center"><FaHistory className="text-gold-400 text-xs" /></div>
                              <div className="flex-1"><p className="text-sm text-cream-50/80">{a.action}</p><p className="text-[10px] text-cream-50/40">{a.time.toLocaleString()}</p></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LOGOUT */}
                <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div><h3 className="text-sm font-bold text-cream-50">{t.signOut}</h3><p className="text-xs text-cream-50/50 mt-0.5">{t.signOutDesc}</p></div>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"><FaSignOutAlt size={13} /> {t.logout}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}