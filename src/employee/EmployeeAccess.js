import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaKey, FaEnvelope, FaArrowRight, FaSpinner, FaCoffee } from "react-icons/fa";

const API = "http://localhost:5000";

export default function EmployeeAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !code) { setError("Please fill all fields"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/employees/verify`, { email, code });
      if (res.data.success) {
        navigate("/employee/register", { state: { email: res.data.data.email, mobile: res.data.data.mobile } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
            <FaCoffee className="text-2xl text-espresso-950" />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-cream-50">Employee Access</h1>
          <p className="text-cream-400/50 text-sm mt-1">Enter your email and the code from your admin</p>
        </div>

        <form onSubmit={handleVerify} className="bg-espresso-900/60 backdrop-blur-sm rounded-2xl border border-espresso-700/30 p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs text-center">{error}</div>
          )}

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaEnvelope size={10} /> Email Address
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="employee@example.com"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaKey size={10} /> Registration Code
            </label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code from admin"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:border-gold-400/50 transition-all" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" /> Verifying...</> : <><FaArrowRight /> Verify Code</>}
          </button>

          <p className="text-center text-cream-500/40 text-xs">
            Already registered? <button type="button" onClick={() => navigate("/employee/login")} className="text-gold-400 hover:text-gold-300">Login here</button>
          </p>
        </form>
      </div>
    </div>
  );
}