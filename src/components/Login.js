import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowLeft, FaKey } from "react-icons/fa";
import "./login.css";

export default function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle login submit
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
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: data.email,
            phone: data.phone,
            username: data.username,
          })
        );

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

  // Handle forgot password submit
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
    <div className="auth-container">
      <div className="auth-card">
        {!isForgotPassword ? (
          <>
            <h1 className="title">Welcome Back!</h1>
            <p className="subtitle">Login to your account</p>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="input-group">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message">{message}</p>}

              <button type="submit" className="btn">
                Login
              </button>

              <p
                className="forgot-link"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot Password?
              </p>
            </form>

            <div className="auth-links">
              <p>
                Don’t have an account?{" "}
                <Link to="/signup" className="link">
                  Sign Up
                </Link>
              </p>
            </div>

            <Link to="/" className="back-home">
              ← Back to Home
            </Link>
          </>
        ) : (
          <>
            <h1 className="title">
              <FaKey style={{ marginRight: "8px" }} /> Forgot Password
            </h1>
            <p className="subtitle">Enter your email to reset your password</p>

            <form onSubmit={handleForgotSubmit} className="auth-form">
              <div className="input-group">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message">{message}</p>}

              <button type="submit" className="btn">
                Send Reset Link
              </button>
            </form>

            <p
              className="forgot-link"
              onClick={() => {
                setIsForgotPassword(false);
                setError("");
                setMessage("");
              }}
            >
              <FaArrowLeft /> Back to Login
            </p>
          </>
        )}
      </div>
    </div>
  );
}
