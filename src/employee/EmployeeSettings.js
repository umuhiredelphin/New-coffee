import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock, FaSave, FaTimes, FaEye, FaEyeSlash, FaCog, FaArrowLeft, FaCheck, FaSpinner, FaCamera } from "react-icons/fa";
import Sidebar from "./Sidebar";
import Header from "./Header";

const API = "http://localhost:5000";
const getImageUrl = (path) => (path ? `${API}${path}` : null);

export default function EmployeeSettings({ onLogout }) {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee") || "null");

  const [tab, setTab] = useState("profile");
  const [notif, setNotif] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [username, setUsername] = useState(employee?.username || "");
  const [email] = useState(employee?.email || "");
  const [profileImage, setProfileImage] = useState(employee?.profileImage || "");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const show = (msg, type = "info") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employee");
    navigate("/employee/login");
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    uploadImage(f);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const token = localStorage.getItem("employeeToken");
      const fd = new FormData();
      fd.append("profileImage", file);
      const res = await axios.post(`${API}/api/employees/upload-profile`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const updated = { ...employee, profileImage: res.data.profileImage };
        localStorage.setItem("employee", JSON.stringify(updated));
        setProfileImage(res.data.profileImage);
        setPreview(null);
        show("Profile photo updated!");
      }
    } catch {
      show("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!username.trim()) { show("Username is required", "error"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("employeeToken");
      const res = await axios.put(
        `${API}/api/employees/update-profile`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const updated = { ...employee, username, profileImage: res.data.data.profileImage || profileImage };
        localStorage.setItem("employee", JSON.stringify(updated));
        show("Profile updated successfully!");
      } else {
        show(res.data.message || "Update failed", "error");
      }
    } catch (err) {
      show(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) { show("Current password is required", "error"); return; }
    if (!newPassword) { show("New password is required", "error"); return; }
    if (newPassword.length < 6) { show("Password must be at least 6 characters", "error"); return; }
    if (newPassword !== confirmPassword) { show("Passwords do not match", "error"); return; }
    setChangingPwd(true);
    try {
      const token = localStorage.getItem("employeeToken");
      const res = await axios.put(
        `${API}/api/employees/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        show("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        show(res.data.message || "Failed to change password", "error");
      }
    } catch (err) {
      show(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setChangingPwd(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 bg-espresso-950/50 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all disabled:opacity-60";
  const btn = "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg text-sm transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/30 active:scale-95 disabled:opacity-50";

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header title="Settings" />
        {notif && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-slide-in-right ${
            notif.type === "error"
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
              : "bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950"
          }`}>
            <span className="font-medium text-sm">{notif.msg}</span>
            <button onClick={() => setNotif(null)} className="text-current hover:opacity-80"><FaTimes /></button>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate("/employee/dashboard")} className="text-cream-50/50 hover:text-gold-400 transition-colors"><FaArrowLeft size={16} /></button>
              <FaCog className="text-gold-400 text-lg" />
              <h1 className="text-xl font-playfair font-bold text-cream-50">Account Settings</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-44 shrink-0">
                <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-1.5 space-y-0.5">
                  <button
                    onClick={() => setTab("profile")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      tab === "profile"
                        ? "bg-gold-500/10 text-gold-400 border-l-2 border-gold-400 font-semibold"
                        : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/30"
                    }`}
                  >
                    <FaUser size={14} /><span>Profile</span>
                  </button>
                  <button
                    onClick={() => setTab("password")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      tab === "password"
                        ? "bg-gold-500/10 text-gold-400 border-l-2 border-gold-400 font-semibold"
                        : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/30"
                    }`}
                  >
                    <FaLock size={14} /><span>Password</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-5">
                {tab === "profile" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="px-5 py-4 border-b border-espresso-800/30">
                      <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2">
                        <FaUser size={14} /> Profile Information
                      </h2>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-full bg-espresso-800 border-2 border-espresso-700/50 overflow-hidden flex items-center justify-center">
                            {preview ? (
                              <img src={preview} alt="" className="w-full h-full object-cover" />
                            ) : getImageUrl(profileImage) ? (
                              <img src={getImageUrl(profileImage)} alt="" className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextSibling?.classList.remove("hidden"); }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-2xl font-bold text-gold-400 ${preview || getImageUrl(profileImage) ? "hidden" : ""}`}>
                              {(employee?.username || "?").charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-500 text-espresso-950 flex items-center justify-center border-2 border-espresso-950 hover:bg-gold-400 transition-all disabled:opacity-50"
                          >
                            {uploading ? <FaSpinner className="animate-spin" size={10} /> : <FaCamera size={10} />}
                          </button>
                          <input type="file" ref={fileRef} onChange={handleImage} accept="image/*" className="hidden" />
                        </div>
                        <div>
                          <p className="text-cream-50 font-medium text-sm">{employee?.username || "Employee"}</p>
                          <p className="text-cream-50/40 text-xs mt-0.5">Click the camera icon to change photo</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Username</label>
                        <input
                          type="text" value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Email</label>
                        <input
                          type="email" value={email} disabled
                          className={inputCls + " cursor-not-allowed"}
                        />
                        <p className="text-[10px] text-cream-50/40 mt-1">Email cannot be changed</p>
                      </div>
                      <button onClick={saveProfile} disabled={saving} className={btn}>
                        {saving ? (
                          <><FaSpinner className="animate-spin" size={13} /> Saving...</>
                        ) : (
                          <><FaSave size={13} /> Save Changes</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {tab === "password" && (
                  <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl">
                    <div className="px-5 py-4 border-b border-espresso-800/30">
                      <h2 className="text-base font-playfair text-gold-400 font-bold flex items-center gap-2">
                        <FaLock size={14} /> Change Password
                      </h2>
                    </div>
                    <form onSubmit={changePassword} className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className={inputCls + " pr-10"}
                          />
                          <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/40 hover:text-gold-400">
                            {showCurrent ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 chars)"
                            className={inputCls + " pr-10"}
                          />
                          <button type="button" onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/40 hover:text-gold-400">
                            {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={inputCls + " pr-10"}
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/40 hover:text-gold-400">
                            {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" disabled={changingPwd} className={btn}>
                        {changingPwd ? (
                          <><FaSpinner className="animate-spin" size={13} /> Changing...</>
                        ) : (
                          <><FaCheck size={13} /> Change Password</>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
