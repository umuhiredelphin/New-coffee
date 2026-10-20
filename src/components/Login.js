import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowLeft, FaKey, FaCoffee } from "react-icons/fa";

export default function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setIsLoggedIn(true);
        navigate("/home");
      } else {
        setError(data.message || "Incorrect email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset link sent to your email.");
      } else {
        setError(data.message || "Email not found. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso-950 via-espresso-900 to-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-coffee-texture opacity-20 pointer-events-none"></div>
      <div className="absolute top-20 -left-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-gradient-to-b from-espresso-800/80 to-espresso-900/80 backdrop-blur-xl border border-gold-500/20 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-400"></div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30 animate-float">
              <FaCoffee className="text-3xl text-espresso-950" />
            </div>
          </div>

          {!isForgotPassword ? (
            <>
              <h1 className="font-playfair text-3xl text-center mb-1 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-400 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-cream-200/80 text-center mb-8 text-sm">Login to your account</p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/60 group-focus-within:text-gold-400 transition-colors duration-300" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-espresso-900/60 border border-espresso-700/60 rounded-2xl py-3.5 pl-12 pr-4 text-cream-100 placeholder-cream-200/40 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
                  />
                </div>

                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/60 group-focus-within:text-gold-400 transition-colors duration-300" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-espresso-900/60 border border-espresso-700/60 rounded-2xl py-3.5 pl-12 pr-4 text-cream-100 placeholder-cream-200/40 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
                  />
                </div>

                {error && <p className="text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-sm">{error}</p>}
                {message && <p className="text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl text-sm">{message}</p>}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-400 hover:from-gold-400 hover:via-amber-400 hover:to-gold-500 text-espresso-950 font-bold py-3.5 rounded-2xl transition-all duration-500 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Login
                </button>

                <p
                  className="text-center cursor-pointer text-sm text-cream-200/60 hover:text-gold-400 transition-colors duration-300"
                  onClick={() => setIsForgotPassword(true)}
                >
                  <FaKey className="mr-2 inline" /> Forgot Password?
                </p>
              </form>

              <div className="mt-8 text-center border-t border-espresso-700/30 pt-6">
                <p className="text-cream-200/60 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
                    Sign Up
                  </Link>
                </p>
              </div>

              <Link to="/" className="block text-center text-cream-200/50 hover:text-gold-400 transition-colors mt-4 text-sm">
                &larr; Back to Home
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-playfair text-3xl text-center mb-1 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-400 bg-clip-text text-transparent">
                <FaKey className="mr-3 inline" /> Forgot Password
              </h1>
              <p className="text-cream-200/80 text-center mb-8 text-sm">Enter your email to reset your password</p>

              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/60 group-focus-within:text-gold-400 transition-colors duration-300" />
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-espresso-900/60 border border-espresso-700/60 rounded-2xl py-3.5 pl-12 pr-4 text-cream-100 placeholder-cream-200/40 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
                  />
                </div>

                {error && <p className="text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-sm">{error}</p>}
                {message && <p className="text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl text-sm">{message}</p>}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-400 hover:from-gold-400 hover:via-amber-400 hover:to-gold-500 text-espresso-950 font-bold py-3.5 rounded-2xl transition-all duration-500 shadow-lg shadow-gold-500/30 hover:shadow-gold-400/40 hover:-translate-y-0.5"
                >
                  Send Reset Link
                </button>
              </form>

              <p
                className="text-center cursor-pointer text-sm text-cream-200/60 hover:text-gold-400 transition-colors duration-300 mt-8"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setMessage("");
                }}
              >
                <FaArrowLeft className="mr-2 inline" /> Back to Login
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
