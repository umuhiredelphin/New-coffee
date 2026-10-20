import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage(data.message || "Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Reset failed. Try again.");
      }
    } catch (err) {
      console.error("Reset Error:", err);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso-950 via-espresso-900 to-black flex items-center justify-center p-4 font-poppins">
      <div className="bg-espresso-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-espresso-700/50 w-full max-w-md p-8">
        <h2 className="text-gold-400 font-playfair text-3xl text-center mb-2">
          🔒 Reset Your Password
        </h2>
        <p className="text-cream-200 text-center mb-8">
          Enter and confirm your new password
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-center bg-espresso-900/50 border border-espresso-700 rounded-xl px-4 focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400/30 transition-all duration-300">
            <FaLock className="text-gold-400 mr-3" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-3 bg-transparent text-cream-50 placeholder-cream-200/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-espresso-900/50 border border-espresso-700 rounded-xl px-4 focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400/30 transition-all duration-300">
            <FaLock className="text-gold-400 mr-3" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full py-3 bg-transparent text-cream-50 placeholder-cream-200/50 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {message && <p className="text-green-400 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
