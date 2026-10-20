import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaLock, FaBell, FaPalette, FaHistory, FaSignOutAlt,
  FaArrowLeft, FaEdit, FaSave, FaTimes, FaCamera, FaEye, FaEyeSlash,
  FaMoon, FaSun, FaGlobe, FaLanguage,
  FaCheck, FaTrash, FaTruck, FaMapMarkerAlt,
  FaCreditCard, FaMoneyBillWave, FaCoffee, FaShoppingCart,
  FaStar, FaHeart, FaShieldAlt, FaGift, FaHeadset, FaRobot,
  FaMapPin, FaClock, FaMobile, FaLaptop, FaDownload,
  FaUsers, FaTag, FaTicketAlt, FaShareAlt, FaQuestionCircle,
  FaComments, FaLayerGroup, FaFont,
  FaSyncAlt, FaCrown
} from "react-icons/fa";
import axios from "axios";
import CoffeeLoader from "./CoffeeLoader";
import Navbar from "./Navbar";

const sections = [
  {
    key: "account", label: "Account Settings", icon: FaUser,
    items: ["Profile photo", "Full name", "Email address", "Phone number", "Change password", "Two-factor authentication", "Delete account"]
  },
  {
    key: "delivery", label: "Delivery Settings", icon: FaTruck,
    items: ["Saved delivery addresses", "Default delivery address", "Delivery instructions", "Preferred delivery time", "Favorite pickup branch"]
  },
  {
    key: "payment", label: "Payment Settings", icon: FaCreditCard,
    items: ["Saved cards", "Mobile money payment", "Default payment method", "Billing address", "Payment history"]
  },
  {
    key: "coffee", label: "Coffee Preferences", icon: FaCoffee,
    items: ["Favorite coffee type", "Preferred roast level", "Sugar preference", "Milk preference", "Cup size preference", "Favorite products"]
  },
  {
    key: "notifications", label: "Notification Settings", icon: FaBell,
    items: ["Order updates", "Promotions & discounts", "New coffee arrivals", "Newsletter subscription", "SMS notifications", "Push notifications", "Email notifications"]
  },
  {
    key: "language", label: "Language & Region", icon: FaGlobe,
    items: ["Change language", "Currency selection", "Country/region", "Time zone"]
  },
  {
    key: "appearance", label: "Appearance Settings", icon: FaPalette,
    items: ["Dark mode / Light mode", "Theme colors", "Font size", "Layout style"]
  },
  {
    key: "shopping", label: "Shopping Settings", icon: FaShoppingCart,
    items: ["Wishlist management", "Recently viewed products", "Auto-save cart", "Product recommendations", "Reorder favorite items"]
  },
  {
    key: "security", label: "Security & Privacy", icon: FaShieldAlt,
    items: ["Login activity", "Connected devices", "Privacy controls", "Download personal data", "Manage cookies"]
  },
  {
    key: "rewards", label: "Loyalty & Rewards", icon: FaGift,
    items: ["Reward points", "Membership level", "Coupon management", "Gift cards", "Referral system"]
  },
  {
    key: "support", label: "Support Settings", icon: FaHeadset,
    items: ["Contact support", "Report issue", "FAQ section", "Live chat preferences"]
  },
  {
    key: "smart", label: "Smart Features", icon: FaRobot,
    items: ["Recommend coffee for me", "AI taste suggestions", "Personalized homepage", "Favorite brewing method", "Daily coffee reminders", "Subscription management"]
  },
];

function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const profileRef = useRef(null);

  const [tab, setTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [busy, setBusy] = useState({ save: false, password: false });
  const [expandedSub, setExpandedSub] = useState({});

  const [form, setForm] = useState({ username: "", email: "", phone: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true, promos: false, newArrivals: true, newsletter: false,
    sms: false, push: true, email: true
  });
  const [theme, setTheme] = useState("dark");
  const [themeColor, setThemeColor] = useState("gold");
  const [fontSize, setFontSize] = useState("medium");
  const [layout, setLayout] = useState("standard");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("RWF");
  const [country, setCountry] = useState("RW");
  const [timezone, setTimezone] = useState("Africa/Kigali");

  const [coffeePrefs, setCoffeePrefs] = useState({
    coffeeType: "latte", roastLevel: "medium", sugar: "regular",
    milk: "whole", cupSize: "medium", favoriteProducts: []
  });
  const [deliveryPrefs, setDeliveryPrefs] = useState({
    defaultAddress: "", instructions: "", preferredTime: "anytime", pickupBranch: ""
  });
  const [paymentPrefs, setPaymentPrefs] = useState({
    defaultMethod: "mobile_money", billingAddress: ""
  });
  const [smartPrefs, setSmartPrefs] = useState({
    recommendCoffee: true, aiSuggestions: true, personalizedHome: true,
    brewingMethod: "pour_over", dailyReminder: false, subscription: false
  });
  const [shoppingPrefs, setShoppingPrefs] = useState({
    autoSaveCart: true, recommendations: true, recentlyViewed: true
  });

  const [rewardData, setRewardData] = useState({ // eslint-disable-line no-unused-vars
    points: 1250, level: "Gold", coupons: 3, giftCards: [], referrals: 2
  });
  const [securityData, setSecurityData] = useState({
    loginActivity: [
      { device: "Chrome - Windows", time: "2 hours ago", location: "Kigali, RW" },
      { device: "Safari - iPhone", time: "3 days ago", location: "Kigali, RW" },
    ],
    connectedDevices: [
      { name: "iPhone 15", lastActive: "Today", type: "Mobile" },
      { name: "Windows PC", lastActive: "2 days ago", type: "Desktop" },
    ],
    cookies: true
  });
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [twoFAenabled, setTwoFAenabled] = useState(false);

  const [activityLog, setActivityLog] = useState([]);

  const show = (msg, type = "info") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const addActivity = (action) => {
    setActivityLog((a) => [{ action, time: new Date().toISOString() }, ...a]);
  };

  const getImageUrl = (path) => (path ? `http://localhost:5000${path}` : null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      let u = { ...user, id: user.id || user._id };
      if (u.id) {
        try {
          const r = await axios.get(`http://localhost:5000/api/users/profile/${u.id}`);
          if (r.data.success) {
            const up = { ...u, ...r.data.user, id: r.data.user.id || r.data.user._id || u.id };
            localStorage.setItem("user", JSON.stringify(up));
            u = up;
          }
        } catch { /* ignore */ }
      }
      setForm({ username: u.username || "", email: u.email || "", phone: u.phone || "" });
      addActivity("Opened settings");
      setTimeout(() => setLoading(false), 500);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!file || !user?.id) return;
    setBusy(b => ({ ...b, save: true }));
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      fd.append("userId", user.id);
      const r = await axios.post("http://localhost:5000/api/users/upload-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (r.data.success) {
        show("Profile photo updated!");
        setPreview(null);
        setFile(null);
        addActivity("Updated profile photo");
        refresh();
      }
    } catch { show("Upload failed", "error"); }
    finally { setBusy(b => ({ ...b, save: false })); }
  };

  const refresh = async () => {
    if (!user?.id) return;
    try {
      const r = await axios.get(`http://localhost:5000/api/users/profile/${user.id}`);
      if (r.data.success) {
        const up = { ...user, ...r.data.user };
        localStorage.setItem("user", JSON.stringify(up));
      }
    } catch { /* ignore */ }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    setBusy(b => ({ ...b, save: true }));
    try {
      const r = await axios.put(`http://localhost:5000/api/users/update-profile/${user.id}`, form);
      if (r.data.success) {
        show("Profile updated!");
        setEditMode(false);
        const up = { ...user, ...form };
        localStorage.setItem("user", JSON.stringify(up));
        addActivity("Updated profile");
      } else show(r.data.message || "Update failed", "error");
    } catch { show("Update failed", "error"); }
    finally { setBusy(b => ({ ...b, save: false })); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) { show("Passwords do not match", "error"); return; }
    if (pwd.newPassword.length < 6) { show("Password must be at least 6 characters", "error"); return; }
    setBusy(b => ({ ...b, password: true }));
    try {
      const r = await axios.post("http://localhost:5000/api/users/change-password", {
        userId: user.id, ...pwd,
      });
      if (r.data.success) {
        show("Password changed!");
        setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
        addActivity("Changed password");
      } else show(r.data.message || "Failed", "error");
    } catch (err) { show(err.response?.data?.message || "Failed to change password", "error"); }
    finally { setBusy(b => ({ ...b, password: false })); }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const toggleSub = (key) => {
    setExpandedSub(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const inputCls = "w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all disabled:opacity-60";
  const btn = "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg text-sm transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/30 active:scale-95 disabled:opacity-50";
  const btnOut = "inline-flex items-center gap-2 px-4 py-2 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg text-sm transition-all hover:bg-espresso-700/50 hover:border-gold-400/50 active:scale-95";
  const cardCls = "bg-espresso-800/40 backdrop-blur-xl border border-espresso-700/30 rounded-xl overflow-hidden";
  const badgeCls = "px-2 py-0.5 rounded text-[10px] font-bold uppercase";
  const toggleCls = "relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors";

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  const Toggle = ({ checked, onChange }) => (
    <button type="button" onClick={onChange}
      className={`${toggleCls} ${checked ? "bg-gold-500" : "bg-espresso-700"}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className={cardCls}>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-espresso-700/30">
        <Icon className="text-gold-400" size={16} />
        <h2 className="text-base font-playfair text-gold-400 font-bold">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div className="flex items-center justify-between gap-4 p-3 bg-espresso-950/30 rounded-xl border border-espresso-800/20 hover:border-espresso-700/40 transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-cream-50">{label}</p>
        {desc && <p className="text-xs text-cream-50/50 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const SubSection = ({ title, open, onToggle, children }) => (
    <div className="border border-espresso-800/30 rounded-xl overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-espresso-900/30 hover:bg-espresso-800/30 transition-all text-left">
        <span className="text-sm font-medium text-cream-50">{title}</span>
        <svg className={`w-3.5 h-3.5 text-cream-50/50 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4 space-y-3 border-t border-espresso-800/20">{children}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950">
        <Navbar />
        <CoffeeLoader message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 pt-24">
        {notif && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-slide-in-right ${notif.type === "error" ? "bg-gradient-to-r from-red-500 to-red-600 text-white" : "bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950"}`}>
            <span className="font-medium text-sm">{notif.msg}</span>
            <button onClick={() => setNotif(null)} className="text-current hover:opacity-80"><FaTimes /></button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/home")} className="text-cream-50/50 hover:text-gold-400 transition-colors">
            <FaArrowLeft size={16} />
          </button>
          <FaPalette className="text-gold-400 text-lg" />
          <h1 className="text-xl font-playfair font-bold text-cream-50">Account Settings</h1>
          <span className={badgeCls + " bg-gold-500/10 text-gold-400 ml-auto"}>{rewardData.level}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="bg-espresso-800/40 backdrop-blur-xl border border-espresso-700/30 rounded-xl p-4 text-center mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400/50 mx-auto mb-2">
                {getImageUrl(user?.profileImage) ? (
                  <img src={getImageUrl(user.profileImage)} alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${getImageUrl(user?.profileImage) ? "hidden" : ""}`}>
                  <FaUser className="text-2xl text-cream-50/40" />
                </div>
              </div>
              <h3 className="text-gold-400 font-playfair text-base font-semibold truncate">{user?.username || "User"}</h3>
              <p className="text-cream-50/50 text-xs truncate">{user?.email || ""}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <FaStar className="text-gold-400 text-[10px]" />
                <span className="text-gold-400 text-[10px] font-semibold">{rewardData.points} pts</span>
              </div>
            </div>

            <nav className="bg-espresso-800/40 backdrop-blur-xl border border-espresso-700/30 rounded-xl p-1.5 space-y-0.5 max-h-[60vh] overflow-y-auto">
              {sections.map((s) => (
                <button key={s.key} onClick={() => setTab(s.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === s.key ? "bg-gold-500/10 text-gold-400 border-l-2 border-gold-400 font-semibold" : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/30"}`}>
                  <s.icon size={14} /><span className="truncate">{s.label}</span>
                </button>
              ))}
            </nav>

            <button onClick={logout} className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm border border-espresso-700/30">
              <FaSignOutAlt size={14} /> Log Out
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-5 pb-10">

            {/* ===== ACCOUNT SETTINGS ===== */}
            {tab === "account" && (
              <>
                <SectionCard title="Profile Photo" icon={FaCamera}>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gold-400/40">
                      {preview ? (
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                      ) : getImageUrl(user?.profileImage) ? (
                        <img src={getImageUrl(user.profileImage)} alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${preview || getImageUrl(user?.profileImage) ? "hidden" : ""}`}>
                        <FaUser className="text-3xl text-cream-50/30" />
                      </div>
                    </div>
                    <input type="file" ref={profileRef} onChange={handleFile} accept="image/*" className="hidden" />
                    <div className="flex gap-2">
                      <button className={btnOut + " text-xs"} onClick={() => profileRef.current?.click()}>
                        <FaCamera size={11} /> Change Photo
                      </button>
                      {preview && (
                        <button className={btn + " text-xs"} onClick={uploadImage} disabled={busy.save}>
                          {busy.save ? "Uploading..." : <><FaCheck size={11} /> Upload</>}
                        </button>
                      )}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Personal Information" icon={FaUser}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Full Name</label>
                      <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={!editMode} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Email Address</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!editMode} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Phone Number</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editMode} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Member Since</label>
                      <input type="text" value={fmtDate(user?.created_at || user?.createdAt)} disabled className={inputCls + " cursor-not-allowed"} />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    {!editMode ? (
                      <button className={btn} onClick={() => setEditMode(true)}><FaEdit size={13} /> Edit Profile</button>
                    ) : (
                      <div className="flex gap-2">
                        <button className={btnOut} onClick={() => { setEditMode(false); setForm({ username: user?.username || "", email: user?.email || "", phone: user?.phone || "" }); }}>Cancel</button>
                        <button className={btn} onClick={saveProfile} disabled={busy.save}>
                          {busy.save ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FaSave size={13} /> Save Changes</>}
                        </button>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Security" icon={FaLock}>
                  <SubSection title="Change Password" open={expandedSub.password} onToggle={() => toggleSub("password")}>
                    <form onSubmit={changePassword} className="space-y-3">
                      {["currentPassword", "newPassword", "confirmPassword"].map((field) => {
                        const label = field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password";
                        return (
                          <div key={field}>
                            <label className="block text-xs font-medium text-cream-50/60 mb-1">{label}</label>
                            <div className="relative">
                              <input type={showPwd[field] ? "text" : "password"} name={field}
                                value={pwd[field]}
                                onChange={e => setPwd(p => ({ ...p, [field]: e.target.value }))}
                                className={inputCls + " pr-10"} required />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/50 hover:text-gold-400"
                                onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))}>
                                {showPwd[field] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button type="submit" className={btn} disabled={busy.password}>
                        {busy.password ? <><span className="w-3 h-3 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Changing...</> : <><FaLock size={13} /> Update Password</>}
                      </button>
                    </form>
                  </SubSection>

                  <SettingRow label="Two-Factor Authentication" desc="Add an extra layer of security">
                    <Toggle checked={twoFAenabled} onChange={() => { setTwoFAenabled(!twoFAenabled); show(twoFAenabled ? "2FA disabled" : "2FA enabled"); addActivity("Toggled two-factor authentication"); }} />
                  </SettingRow>

                  <SettingRow label="Delete Account" desc="Permanently delete your account and all data">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                      onClick={() => { if (window.confirm("Are you sure? This cannot be undone.")) { show("Account deletion requested", "error"); addActivity("Requested account deletion"); } }}>
                      <FaTrash size={11} className="mr-1 inline" /> Delete
                    </button>
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* ===== DELIVERY SETTINGS ===== */}
            {tab === "delivery" && (
              <SectionCard title="Delivery Settings" icon={FaTruck}>
                <SubSection title="Saved Delivery Addresses" open={expandedSub.addresses !== false} onToggle={() => toggleSub("addresses")}>
                  <div className="p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20 flex items-start gap-3">
                    <FaMapMarkerAlt className="text-gold-400 mt-0.5" size={14} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cream-50">Home</p>
                      <p className="text-xs text-cream-50/60">KG 123 St, Kigali, Rwanda</p>
                    </div>
                    <span className={badgeCls + " bg-gold-500/10 text-gold-400"}>Default</span>
                  </div>
                  <button className={btnOut + " text-xs w-full justify-center"}><FaMapPin size={11} /> Add New Address</button>
                </SubSection>

                <SettingRow label="Default Delivery Address">
                  <select className={inputCls + " max-w-[160px] text-xs py-1.5"} value={deliveryPrefs.defaultAddress} onChange={e => setDeliveryPrefs(p => ({ ...p, defaultAddress: e.target.value }))}>
                    <option value="">Home - KG 123 St</option>
                    <option value="work">Work - Downtown</option>
                  </select>
                </SettingRow>

                <SettingRow label="Delivery Instructions" desc="Special instructions for delivery">
                  <input type="text" placeholder="Leave at the door..." value={deliveryPrefs.instructions} onChange={e => setDeliveryPrefs(p => ({ ...p, instructions: e.target.value }))} className={inputCls + " max-w-[200px] text-xs py-1.5"} />
                </SettingRow>

                <SettingRow label="Preferred Delivery Time">
                  <select className={inputCls + " max-w-[160px] text-xs py-1.5"} value={deliveryPrefs.preferredTime} onChange={e => setDeliveryPrefs(p => ({ ...p, preferredTime: e.target.value }))}>
                    <option value="anytime">Anytime</option>
                    <option value="morning">Morning (8-12)</option>
                    <option value="afternoon">Afternoon (12-5)</option>
                    <option value="evening">Evening (5-9)</option>
                  </select>
                </SettingRow>

                <SettingRow label="Favorite Pickup Branch">
                  <select className={inputCls + " max-w-[160px] text-xs py-1.5"} value={deliveryPrefs.pickupBranch} onChange={e => setDeliveryPrefs(p => ({ ...p, pickupBranch: e.target.value }))}>
                    <option value="">Downtown Branch</option>
                    <option value="uptown">Uptown Branch</option>
                    <option value="airport">Airport Branch</option>
                  </select>
                </SettingRow>

                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Delivery settings saved!"); addActivity("Updated delivery settings"); }}>
                    <FaCheck size={12} /> Save Delivery Settings
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== PAYMENT SETTINGS ===== */}
            {tab === "payment" && (
              <SectionCard title="Payment Settings" icon={FaCreditCard}>
                <SubSection title="Saved Cards" open={expandedSub.cards !== false} onToggle={() => toggleSub("cards")}>
                  <div className="p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20 flex items-center gap-3">
                    <FaCreditCard className="text-gold-400" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cream-50">Visa •••• 4242</p>
                      <p className="text-xs text-cream-50/60">Expires 12/28</p>
                    </div>
                    <span className={badgeCls + " bg-gold-500/10 text-gold-400"}>Default</span>
                  </div>
                  <button className={btnOut + " text-xs w-full justify-center"}><FaCreditCard size={11} /> Add New Card</button>
                </SubSection>

                <SettingRow label="Mobile Money Payment" desc="Pay with MTN Mobile Money or Airtel Money">
                  <Toggle checked={paymentPrefs.defaultMethod === "mobile_money"} onChange={() => setPaymentPrefs(p => ({ ...p, defaultMethod: "mobile_money" }))} />
                </SettingRow>

                <SettingRow label="Default Payment Method">
                  <select className={inputCls + " max-w-[180px] text-xs py-1.5"} value={paymentPrefs.defaultMethod} onChange={e => setPaymentPrefs(p => ({ ...p, defaultMethod: e.target.value }))}>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash on Delivery</option>
                  </select>
                </SettingRow>

                <SettingRow label="Billing Address">
                  <input type="text" placeholder="Your billing address" value={paymentPrefs.billingAddress} onChange={e => setPaymentPrefs(p => ({ ...p, billingAddress: e.target.value }))} className={inputCls + " max-w-[200px] text-xs py-1.5"} />
                </SettingRow>

                <SettingRow label="Payment History" desc="View all your past transactions">
                  <button className={btnOut + " text-xs"} onClick={() => navigate("/orderhistory")}>
                    <FaMoneyBillWave size={11} /> View History
                  </button>
                </SettingRow>

                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Payment settings saved!"); addActivity("Updated payment settings"); }}>
                    <FaCheck size={12} /> Save Payment Settings
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== COFFEE PREFERENCES ===== */}
            {tab === "coffee" && (
              <SectionCard title="Coffee Preferences" icon={FaCoffee}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Favorite Coffee Type</label>
                    <select className={inputCls} value={coffeePrefs.coffeeType} onChange={e => setCoffeePrefs(p => ({ ...p, coffeeType: e.target.value }))}>
                      <option value="latte">Latte</option>
                      <option value="cappuccino">Cappuccino</option>
                      <option value="espresso">Espresso</option>
                      <option value="americano">Americano</option>
                      <option value="mocha">Mocha</option>
                      <option value="cold_brew">Cold Brew</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Preferred Roast Level</label>
                    <select className={inputCls} value={coffeePrefs.roastLevel} onChange={e => setCoffeePrefs(p => ({ ...p, roastLevel: e.target.value }))}>
                      <option value="light">Light Roast</option>
                      <option value="medium">Medium Roast</option>
                      <option value="dark">Dark Roast</option>
                      <option value="extra_dark">Extra Dark Roast</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Sugar Preference</label>
                    <select className={inputCls} value={coffeePrefs.sugar} onChange={e => setCoffeePrefs(p => ({ ...p, sugar: e.target.value }))}>
                      <option value="none">No Sugar</option>
                      <option value="less">Less Sugar</option>
                      <option value="regular">Regular Sugar</option>
                      <option value="extra">Extra Sugar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Milk Preference</label>
                    <select className={inputCls} value={coffeePrefs.milk} onChange={e => setCoffeePrefs(p => ({ ...p, milk: e.target.value }))}>
                      <option value="whole">Whole Milk</option>
                      <option value="oat">Oat Milk</option>
                      <option value="almond">Almond Milk</option>
                      <option value="soy">Soy Milk</option>
                      <option value="skim">Skim Milk</option>
                      <option value="no_milk">No Milk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Cup Size Preference</label>
                    <select className={inputCls} value={coffeePrefs.cupSize} onChange={e => setCoffeePrefs(p => ({ ...p, cupSize: e.target.value }))}>
                      <option value="small">Small (8oz)</option>
                      <option value="medium">Medium (12oz)</option>
                      <option value="large">Large (16oz)</option>
                      <option value="extra_large">Extra Large (20oz)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Favorite Products</label>
                    <div className={inputCls + " cursor-pointer flex items-center gap-2 text-cream-50/50"} onClick={() => show("Browse products to add favorites")}>
                      <FaHeart size={11} className="text-gold-400" />
                      <span className="text-xs">3 favorites saved</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Coffee preferences saved!"); addActivity("Updated coffee preferences"); }}>
                    <FaCheck size={12} /> Save Preferences
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== NOTIFICATION SETTINGS ===== */}
            {tab === "notifications" && (
              <SectionCard title="Notification Settings" icon={FaBell}>
                <div className="space-y-1">
                  {[
                    { key: "orderUpdates", label: "Order Updates", desc: "Real-time order status changes" },
                    { key: "promos", label: "Promotions & Discounts", desc: "Special offers and deals" },
                    { key: "newArrivals", label: "New Coffee Arrivals", desc: "When new products launch" },
                    { key: "newsletter", label: "Newsletter Subscription", desc: "Weekly coffee tips and news" },
                    { key: "sms", label: "SMS Notifications", desc: "Text message alerts" },
                    { key: "push", label: "Push Notifications", desc: "Browser push alerts" },
                    { key: "email", label: "Email Notifications", desc: "Email updates" },
                  ].map((n) => (
                    <SettingRow key={n.key} label={n.label} desc={n.desc}>
                      <Toggle checked={notifSettings[n.key]} onChange={() => setNotifSettings(s => ({ ...s, [n.key]: !s[n.key] }))} />
                    </SettingRow>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Notification preferences saved!"); addActivity("Updated notification settings"); }}>
                    <FaCheck size={12} /> Save Notification Settings
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== LANGUAGE & REGION ===== */}
            {tab === "language" && (
              <SectionCard title="Language & Region" icon={FaGlobe}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1.5"><FaLanguage size={11} /> Language</label>
                    <select className={inputCls} value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="fr">Fran&ccedil;ais</option>
                      <option value="rw">Kinyarwanda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1.5"><FaMoneyBillWave size={11} /> Currency</label>
                    <select className={inputCls} value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="RWF">RWF - Rwandan Franc</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1.5"><FaGlobe size={11} /> Country/Region</label>
                    <select className={inputCls} value={country} onChange={e => setCountry(e.target.value)}>
                      <option value="RW">Rwanda</option>
                      <option value="UG">Uganda</option>
                      <option value="KE">Kenya</option>
                      <option value="TZ">Tanzania</option>
                      <option value="CD">DR Congo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1.5"><FaClock size={11} /> Time Zone</label>
                    <select className={inputCls} value={timezone} onChange={e => setTimezone(e.target.value)}>
                      <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Language & region settings saved!"); addActivity("Updated language & region"); }}>
                    <FaCheck size={12} /> Save
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== APPEARANCE SETTINGS ===== */}
            {tab === "appearance" && (
              <SectionCard title="Appearance Settings" icon={FaPalette}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-2 flex items-center gap-2"><FaMoon size={12} /> Dark Mode / Light Mode</label>
                    <div className="flex gap-3">
                      {[{ value: "dark", icon: FaMoon, label: "Dark" }, { value: "light", icon: FaSun, label: "Light" }, { value: "system", icon: FaGlobe, label: "System" }].map((th) => (
                        <button key={th.value} onClick={() => setTheme(th.value)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all border ${theme === th.value ? "bg-gold-500/10 text-gold-400 border-gold-400/30" : "bg-espresso-950/30 text-cream-50/60 border-espresso-800/30 hover:border-espresso-700/50"}`}>
                          <th.icon size={14} /> {th.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-2 flex items-center gap-2"><FaPalette size={12} /> Theme Colors</label>
                    <div className="flex gap-2">
                      {["gold", "amber", "emerald", "ruby", "sapphire"].map((c) => (
                        <button key={c} onClick={() => setThemeColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${themeColor === c ? "border-cream-50 scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c === "gold" ? "#d4a853" : c === "amber" ? "#f59e0b" : c === "emerald" ? "#10b981" : c === "ruby" ? "#ef4444" : "#3b82f6" }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-2 flex items-center gap-2"><FaFont size={12} /> Font Size</label>
                    <div className="flex gap-2">
                      {["small", "medium", "large"].map((s) => (
                        <button key={s} onClick={() => setFontSize(s)}
                          className={`px-4 py-2 rounded-lg text-sm capitalize transition-all border ${fontSize === s ? "bg-gold-500/10 text-gold-400 border-gold-400/30" : "bg-espresso-950/30 text-cream-50/60 border-espresso-800/30 hover:border-espresso-700/50"}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-2 flex items-center gap-2"><FaLayerGroup size={12} /> Layout Style</label>
                    <div className="flex gap-2">
                      {["standard", "compact", "comfortable"].map((s) => (
                        <button key={s} onClick={() => setLayout(s)}
                          className={`px-4 py-2 rounded-lg text-sm capitalize transition-all border ${layout === s ? "bg-gold-500/10 text-gold-400 border-gold-400/30" : "bg-espresso-950/30 text-cream-50/60 border-espresso-800/30 hover:border-espresso-700/50"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className={btn} onClick={() => { show("Appearance settings saved!"); addActivity("Updated appearance settings"); }}>
                    <FaCheck size={12} /> Save Appearance
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== SHOPPING SETTINGS ===== */}
            {tab === "shopping" && (
              <SectionCard title="Shopping Settings" icon={FaShoppingCart}>
                <SubSection title="Wishlist Management" open={expandedSub.wishlist !== false} onToggle={() => toggleSub("wishlist")}>
                  <div className="p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20 text-center">
                    <FaHeart className="text-gold-400 text-xl mx-auto mb-2" />
                    <p className="text-sm text-cream-50/70">You have <strong className="text-gold-400">12 items</strong> in your wishlist</p>
                    <button className={btnOut + " text-xs mt-2"} onClick={() => navigate("/menu")}>View Wishlist</button>
                  </div>
                </SubSection>

                <SettingRow label="Recently Viewed Products" desc="Show recently browsed items">
                  <Toggle checked={shoppingPrefs.recentlyViewed} onChange={() => setShoppingPrefs(p => ({ ...p, recentlyViewed: !p.recentlyViewed }))} />
                </SettingRow>

                <SettingRow label="Auto-Save Cart" desc="Save your cart for later">
                  <Toggle checked={shoppingPrefs.autoSaveCart} onChange={() => setShoppingPrefs(p => ({ ...p, autoSaveCart: !p.autoSaveCart }))} />
                </SettingRow>

                <SettingRow label="Product Recommendations" desc="Get personalized product suggestions">
                  <Toggle checked={shoppingPrefs.recommendations} onChange={() => setShoppingPrefs(p => ({ ...p, recommendations: !p.recommendations }))} />
                </SettingRow>

                <SettingRow label="Reorder Favorite Items" desc="Quickly reorder past purchases">
                  <button className={btnOut + " text-xs"} onClick={() => show("One-click reorder enabled!")}>
                    <FaSyncAlt size={11} /> Reorder
                  </button>
                </SettingRow>

                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Shopping preferences saved!"); addActivity("Updated shopping settings"); }}>
                    <FaCheck size={12} /> Save Shopping Settings
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== SECURITY & PRIVACY ===== */}
            {tab === "security" && (
              <SectionCard title="Security & Privacy" icon={FaShieldAlt}>
                <SubSection title="Login Activity" open={expandedSub.login !== false} onToggle={() => toggleSub("login")}>
                  {securityData.loginActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-espresso-950/30 rounded-lg border border-espresso-800/20">
                      <FaLaptop className="text-cream-50/40" size={14} />
                      <div className="flex-1">
                        <p className="text-sm text-cream-50/80">{a.device}</p>
                        <p className="text-xs text-cream-50/50">{a.location} &middot; {a.time}</p>
                      </div>
                    </div>
                  ))}
                </SubSection>

                <SubSection title="Connected Devices" open={expandedSub.devices} onToggle={() => toggleSub("devices")}>
                  {securityData.connectedDevices.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-espresso-950/30 rounded-lg border border-espresso-800/20">
                      {d.type === "Mobile" ? <FaMobile className="text-cream-50/40" size={14} /> : <FaLaptop className="text-cream-50/40" size={14} />}
                      <div className="flex-1">
                        <p className="text-sm text-cream-50/80">{d.name}</p>
                        <p className="text-xs text-cream-50/50">Last active: {d.lastActive}</p>
                      </div>
                    </div>
                  ))}
                </SubSection>

                <SettingRow label="Privacy Controls" desc="Manage what data you share">
                  <Toggle checked={privacyOpen} onChange={() => setPrivacyOpen(!privacyOpen)} />
                </SettingRow>

                <SettingRow label="Download Personal Data" desc="Get a copy of your data">
                  <button className={btnOut + " text-xs"} onClick={() => { show("Data export initiated. Check your email."); addActivity("Requested data download"); }}>
                    <FaDownload size={11} /> Download
                  </button>
                </SettingRow>

                <SettingRow label="Manage Cookies" desc="Cookie preferences">
                  <Toggle checked={securityData.cookies} onChange={() => setSecurityData(p => ({ ...p, cookies: !p.cookies }))} />
                </SettingRow>
              </SectionCard>
            )}

            {/* ===== LOYALTY & REWARDS ===== */}
            {tab === "rewards" && (
              <SectionCard title="Loyalty & Rewards" icon={FaGift}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: FaStar, label: "Reward Points", value: rewardData.points, color: "text-gold-400" },
                    { icon: FaCrown, label: "Membership Level", value: rewardData.level, color: "text-gold-400" },
                    { icon: FaTag, label: "Active Coupons", value: rewardData.coupons, color: "text-green-400" },
                    { icon: FaUsers, label: "Referrals", value: rewardData.referrals, color: "text-blue-400" },
                  ].map((s, i) => (
                    <div key={i} className="bg-espresso-950/30 rounded-xl p-4 text-center border border-espresso-800/20">
                      <s.icon className={`${s.color} text-xl mx-auto mb-1`} />
                      <p className={`text-lg font-bold text-cream-50`}>{s.value}</p>
                      <p className="text-[10px] text-cream-50/60">{s.label}</p>
                    </div>
                  ))}
                </div>

                <SubSection title="Coupon Management" open={expandedSub.coupons !== false} onToggle={() => toggleSub("coupons")}>
                  <div className="p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20 flex items-center gap-3">
                    <FaTicketAlt className="text-gold-400" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cream-50">COFFEE20 - 20% Off</p>
                      <p className="text-xs text-cream-50/50">Expires in 14 days</p>
                    </div>
                    <span className="text-green-400 text-xs font-semibold">Active</span>
                  </div>
                  <div className="p-4 bg-espresso-950/30 rounded-xl border border-espresso-800/20 flex items-center gap-3">
                    <FaTicketAlt className="text-gold-400" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cream-50">FREESHIP - Free Delivery</p>
                      <p className="text-xs text-cream-50/50">Expires in 30 days</p>
                    </div>
                    <span className="text-green-400 text-xs font-semibold">Active</span>
                  </div>
                </SubSection>

                <SettingRow label="Gift Cards" desc="Your gift card balance">
                  <button className={btnOut + " text-xs"} onClick={() => show("Gift card balance: 25,000 RWF")}>
                    <FaGift size={11} /> Redeem
                  </button>
                </SettingRow>

                <SettingRow label="Referral System" desc="Invite friends and earn rewards">
                  <button className={btn + " text-xs"} onClick={() => { show("Referral link copied!"); addActivity("Used referral system"); }}>
                    <FaShareAlt size={11} /> Refer Now
                  </button>
                </SettingRow>
              </SectionCard>
            )}

            {/* ===== SUPPORT SETTINGS ===== */}
            {tab === "support" && (
              <SectionCard title="Support Settings" icon={FaHeadset}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-espresso-950/30 rounded-xl border border-espresso-800/20 text-center hover:border-gold-400/30 transition-all cursor-pointer"
                    onClick={() => show("Contact support form opened")}>
                    <FaHeadset className="text-gold-400 text-2xl mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-cream-50">Contact Support</h3>
                    <p className="text-xs text-cream-50/50 mt-1">Reach our team anytime</p>
                  </div>
                  <div className="p-5 bg-espresso-950/30 rounded-xl border border-espresso-800/20 text-center hover:border-gold-400/30 transition-all cursor-pointer"
                    onClick={() => show("Report issue form opened")}>
                    <FaTimes className="text-red-400 text-2xl mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-cream-50">Report Issue</h3>
                    <p className="text-xs text-cream-50/50 mt-1">Report a problem</p>
                  </div>
                  <div className="p-5 bg-espresso-950/30 rounded-xl border border-espresso-800/20 text-center hover:border-gold-400/30 transition-all cursor-pointer"
                    onClick={() => show("Opening FAQ section")}>
                    <FaQuestionCircle className="text-gold-400 text-2xl mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-cream-50">FAQ Section</h3>
                    <p className="text-xs text-cream-50/50 mt-1">Find answers quickly</p>
                  </div>
                  <div className="p-5 bg-espresso-950/30 rounded-xl border border-espresso-800/20 text-center hover:border-gold-400/30 transition-all cursor-pointer"
                    onClick={() => show("Live chat preferences saved")}>
                    <FaComments className="text-gold-400 text-2xl mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-cream-50">Live Chat</h3>
                    <p className="text-xs text-cream-50/50 mt-1">Chat preferences</p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ===== SMART FEATURES ===== */}
            {tab === "smart" && (
              <SectionCard title="Smart Personalized Features" icon={FaRobot}>
                <div className="bg-gradient-to-r from-gold-500/5 to-espresso-800/30 rounded-xl p-5 border border-gold-500/10 mb-4">
                  <div className="flex items-center gap-3">
                    <FaRobot className="text-gold-400 text-2xl" />
                    <div>
                      <h3 className="text-sm font-bold text-cream-50">AI-Powered Personalization</h3>
                      <p className="text-xs text-cream-50/60 mt-1">Smart features to enhance your coffee experience</p>
                    </div>
                  </div>
                </div>

                <SettingRow label="Recommend Coffee for Me" desc="Get AI-powered coffee suggestions based on your taste">
                  <Toggle checked={smartPrefs.recommendCoffee} onChange={() => setSmartPrefs(p => ({ ...p, recommendCoffee: !p.recommendCoffee }))} />
                </SettingRow>

                <SettingRow label="AI Taste Suggestions" desc="Learn your preferences and suggest new flavors">
                  <Toggle checked={smartPrefs.aiSuggestions} onChange={() => setSmartPrefs(p => ({ ...p, aiSuggestions: !p.aiSuggestions }))} />
                </SettingRow>

                <SettingRow label="Personalized Homepage" desc="See content curated just for you">
                  <Toggle checked={smartPrefs.personalizedHome} onChange={() => setSmartPrefs(p => ({ ...p, personalizedHome: !p.personalizedHome }))} />
                </SettingRow>

                <div>
                  <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Favorite Brewing Method</label>
                  <select className={inputCls + " max-w-xs"} value={smartPrefs.brewingMethod} onChange={e => setSmartPrefs(p => ({ ...p, brewingMethod: e.target.value }))}>
                    <option value="pour_over">Pour Over</option>
                    <option value="french_press">French Press</option>
                    <option value="espresso_machine">Espresso Machine</option>
                    <option value="aeroPress">AeroPress</option>
                    <option value="cold_brew">Cold Brew</option>
                    <option value="drip">Drip Coffee</option>
                  </select>
                </div>

                <SettingRow label="Daily Coffee Reminder" desc="Get reminded to enjoy your daily coffee">
                  <Toggle checked={smartPrefs.dailyReminder} onChange={() => setSmartPrefs(p => ({ ...p, dailyReminder: !p.dailyReminder }))} />
                </SettingRow>

                <SettingRow label="Subscription Management" desc="Manage your coffee subscription">
                  <button className={btn + " text-xs"} onClick={() => { show("Subscription page opened"); addActivity("Opened subscription management"); }}>
                    <FaSyncAlt size={11} /> Manage Subscription
                  </button>
                </SettingRow>

                <div className="pt-2 flex justify-end">
                  <button className={btn} onClick={() => { show("Smart features saved!"); addActivity("Updated smart features"); }}>
                    <FaCheck size={12} /> Save Smart Settings
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ===== ACTIVITY LOG (common) ===== */}
            <div className={cardCls}>
              <div className="flex items-center gap-2 px-5 py-4 border-b border-espresso-700/30">
                <FaHistory className="text-gold-400" size={16} />
                <h2 className="text-base font-playfair text-gold-400 font-bold">Recent Activity</h2>
              </div>
              <div className="p-5">
                {activityLog.length === 0 ? (
                  <p className="text-center text-cream-50/40 text-sm py-4">No activity recorded yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activityLog.slice(0, 10).map((a, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-espresso-950/30 rounded-lg border border-espresso-800/20">
                        <div className="w-7 h-7 rounded-full bg-gold-500/10 flex items-center justify-center">
                          <FaHistory className="text-gold-400 text-[10px]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-cream-50/80">{a.action}</p>
                          <p className="text-[10px] text-cream-50/40">{new Date(a.time).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex justify-between">
                  <button className={btnOut + " text-xs"} onClick={() => { setActivityLog([]); show("Activity log cleared"); }}>
                    <FaTrash size={11} /> Clear Log
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
