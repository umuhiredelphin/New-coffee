import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaSpinner, FaSignInAlt, FaCoffee, FaUserTie } from "react-icons/fa";

const API = "http://localhost:5000";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/employees/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("employeeToken", res.data.token);
        localStorage.setItem("employee", JSON.stringify(res.data.data));
        navigate("/employee/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
            <FaUserTie className="text-2xl text-espresso-950" />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-cream-50">Employee Login</h1>
          <p className="text-cream-400/50 text-sm mt-1">Sign in to manage tables and orders</p>
        </div>

        <form onSubmit={handleLogin} className="bg-espresso-900/60 backdrop-blur-sm rounded-2xl border border-espresso-700/30 p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs text-center">{error}</div>
          )}

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaEnvelope size={10} /> Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="employee@example.com"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaLock size={10} /> Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" /> Signing in...</> : <><FaSignInAlt /> Sign In</>}
          </button>

          <p className="text-center text-cream-500/40 text-xs">
            Don't have an account? <button type="button" onClick={() => navigate("/employee/access")} className="text-gold-400 hover:text-gold-300">Register here</button>
          </p>
        </form>
      </div>
    </div>
  );
}