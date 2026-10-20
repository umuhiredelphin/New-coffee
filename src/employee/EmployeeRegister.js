import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSpinner, FaCheckCircle, FaCoffee } from "react-icons/fa";

const API = "http://localhost:5000";

export default function EmployeeRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: prefilledEmail, mobile: prefilledMobile } = location.state || {};

  const [email] = useState(prefilledEmail || "");
  const [mobile] = useState(prefilledMobile || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Please fill all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/employees/register`, { email, username, password });
      if (res.data.success) {
        localStorage.setItem("employeeToken", res.data.token);
        localStorage.setItem("employee", JSON.stringify(res.data.data));
        navigate("/employee/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!prefilledEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex items-center justify-center p-4">
        <div className="text-center text-cream-400/60">
          <FaCoffee className="text-4xl mx-auto mb-3" />
          <p>No verification data found. Please start from the access page.</p>
          <button onClick={() => navigate("/employee/access")} className="mt-4 text-gold-400 hover:text-gold-300">Go to Access Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <FaCheckCircle className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-cream-50">Complete Registration</h1>
          <p className="text-cream-400/50 text-sm mt-1">Set up your account details</p>
        </div>

        <form onSubmit={handleRegister} className="bg-espresso-900/60 backdrop-blur-sm rounded-2xl border border-espresso-700/30 p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs text-center">{error}</div>
          )}

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaEnvelope size={10} /> Email
            </label>
            <input type="email" value={email} disabled
              className="w-full px-3 py-2.5 bg-espresso-800/40 border border-espresso-700/50 rounded-lg text-cream-400 text-sm cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaPhone size={10} /> Mobile Number
            </label>
            <input type="tel" value={mobile} disabled
              className="w-full px-3 py-2.5 bg-espresso-800/40 border border-espresso-700/50 rounded-lg text-cream-400 text-sm cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaUser size={10} /> Username
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaLock size={10} /> Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Create a password (min 6 chars)"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaCheckCircle /> Complete Registration</>}
          </button>
        </form>
      </div>
    </div>
  );
}