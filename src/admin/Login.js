import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCoffee, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaKey } from "react-icons/fa";
import bgImage from "../assets/coff.jpg";

const API = "http://localhost:5000/api/admin";
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const inputClass = "w-full pl-10 pr-4 py-2.5 bg-espresso-950/50 border border-espresso-700/50 rounded-lg text-cream-50 text-sm placeholder-cream-50/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all";
const inputPwdClass = "w-full pl-10 pr-10 py-2.5 bg-espresso-950/50 border border-espresso-700/50 rounded-lg text-cream-50 text-sm placeholder-cream-50/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all";
const btnClass = "w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold text-sm transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) { setError("Email and password are required"); return; }
    if (!isValidEmail(email)) { setError("Invalid email format"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        if (onLogin) onLogin(res.data.admin, res.data.token);
        navigate("/admin");
      } else setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
    } finally { setLoading(false); }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!resetEmail || !isValidEmail(resetEmail)) { setError("Valid email is required"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot`, { email: resetEmail });
      if (res.data.success) { setSuccess(res.data.message); setResetStep(2); }
      else setError(res.data.message);
    } catch (err) { setError(err.response?.data?.message || "Network error"); }
    finally { setLoading(false); }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!resetCode || resetCode.length !== 6 || !/^\d+$/.test(resetCode)) { setError("Enter a valid 6-digit code"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/reset/verify`, { email: resetEmail, code: resetCode });
      if (res.data.success) { setSuccess(res.data.message); setResetStep(3); }
      else setError(res.data.message);
    } catch (err) { setError(err.response?.data?.message || "Network error"); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/reset`, { email: resetEmail, code: resetCode, newPassword });
      if (res.data.success) {
        setSuccess("Password reset successfully! Redirecting...");
        setTimeout(() => {
          setShowForgot(false); setResetStep(1);
          setResetEmail(""); setResetCode(""); setNewPassword(""); setConfirmPassword("");
          navigate("/admin/login");
        }, 1500);
      } else setError(res.data.message);
    } catch (err) { setError(err.response?.data?.message || "Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-espresso-950 relative flex items-center justify-center p-4 font-poppins overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-950/95 via-espresso-950/90 to-espresso-950/80" />
      </div>
      <div className="absolute inset-0 bg-coffee-texture opacity-30" />
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <FaCoffee className="text-espresso-950 text-2xl" />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-cream-50">F&F Coffee</h1>
          <p className="text-cream-50/50 text-sm mt-1">Admin Dashboard</p>
        </div>
        <div className="bg-espresso-900/60 backdrop-blur-xl border border-espresso-800/30 rounded-2xl p-8 shadow-2xl">
          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-center text-base font-playfair font-bold text-gold-400 mb-4">Admin Sign In</h2>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40 text-sm" />
                <input type="email" placeholder="Admin email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); } }
                  className={inputClass} required />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40 text-sm" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); } }
                  className={inputPwdClass} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/40 hover:text-cream-50 transition-colors">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
              {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{success}</div>}
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setShowForgot(true); setError(""); setSuccess(""); }}
                  className="text-sm text-cream-50/50 hover:text-gold-400 transition-colors">
                  Forgot Password?
                </button>
              </div>

            </form>
          ) : (
            <div className="space-y-4">
              <button type="button" onClick={() => { setShowForgot(false); setResetStep(1); setError(""); setSuccess(""); }}
                className="flex items-center gap-1 text-sm text-cream-50/50 hover:text-gold-400 transition-colors mb-2">
                <FaArrowLeft size={12} /> Back to Login
              </button>
              {resetStep === 1 && (
                <>
                  <h2 className="text-center text-base font-playfair font-bold text-gold-400">Reset Password</h2>
                  <p className="text-cream-50/50 text-xs text-center">Enter your email to receive a 6-digit reset code</p>
                  <form onSubmit={handleSendCode} className="space-y-4 mt-4">
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40 text-sm" />
                      <input type="email" placeholder="Admin email" value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className={inputClass} required />
                    </div>
                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
                    {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{success}</div>}
                    <button type="submit" disabled={loading} className={btnClass}>
                      {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Sending...</span> : "Send Reset Code"}
                    </button>
                  </form>
                </>
              )}
              {resetStep === 2 && (
                <>
                  <h2 className="text-center text-base font-playfair font-bold text-gold-400">Verify Code</h2>
                  <p className="text-cream-50/50 text-xs text-center">A code was sent to <span className="text-gold-400">{resetEmail}</span></p>
                  <form onSubmit={handleVerifyCode} className="space-y-4 mt-4">
                    <div className="relative">
                      <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40 text-sm" />
                      <input type="text" placeholder="Enter 6-digit code" maxLength={6} value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                        className={inputClass + " text-center tracking-[0.3em] font-bold"} required />
                    </div>
                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
                    {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{success}</div>}
                    <button type="submit" disabled={loading} className={btnClass}>
                      {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Verifying...</span> : "Verify Code"}
                    </button>
                  </form>
                </>
              )}
              {resetStep === 3 && (
                <>
                  <h2 className="text-center text-base font-playfair font-bold text-gold-400">New Password</h2>
                  <p className="text-cream-50/50 text-xs text-center">Choose a new password for your account</p>
                  <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40 text-sm" />
                      <input type="password" placeholder="New password (min 8 chars)" value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputPwdClass} required />
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40 text-sm" />
                      <input type="password" placeholder="Confirm new password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputPwdClass} required />
                    </div>
                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
                    {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{success}</div>}
                    <button type="submit" disabled={loading} className={btnClass}>
                      {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Resetting...</span> : <span className="flex items-center justify-center gap-2"><FaCheck size={14} /> Reset Password</span>}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
        <p className="text-center text-cream-50/20 text-xs mt-6">&copy; {new Date().getFullYear()} F&F Coffee Shop. All rights reserved.</p>
      </div>
    </div>
  );
}