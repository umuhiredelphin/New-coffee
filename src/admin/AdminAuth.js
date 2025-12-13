import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminAuth = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetData, setResetData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetStep, setResetStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000/api/admin";

  // Input validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Handle input changes for login/register
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Form data updated:", updated);
      return updated;
    });
    setError("");
    setSuccessMessage("");
  };

  // Handle reset form changes
  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Reset data updated:", updated);
      return updated;
    });
    setError("");
    setSuccessMessage("");
  };

  // Capture autofill or programmatic changes
  useEffect(() => {
    const inputs = {
      username: document.getElementById("username"),
      email: document.getElementById("email"),
      password: document.getElementById("password"),
      resetCode: document.getElementById("resetCode"),
      newPassword: document.getElementById("newPassword"),
      confirmPassword: document.getElementById("confirmPassword"),
    };
    const checkAutofill = () => {
      const updates = {};
      if (inputs.username && inputs.username.value !== formData.username)
        updates.username = inputs.username.value;
      if (inputs.email && inputs.email.value !== formData.email)
        updates.email = inputs.email.value;
      if (inputs.password && inputs.password.value !== formData.password)
        updates.password = inputs.password.value;
      if (inputs.resetCode && inputs.resetCode.value !== resetData.resetCode)
        updates.resetCode = inputs.resetCode.value;
      if (
        inputs.newPassword &&
        inputs.newPassword.value !== resetData.newPassword
      )
        updates.newPassword = inputs.newPassword.value;
      if (
        inputs.confirmPassword &&
        inputs.confirmPassword.value !== resetData.confirmPassword
      )
        updates.confirmPassword = inputs.confirmPassword.value;
      if (Object.keys(updates).length > 0) {
        console.log("Autofill detected:", updates);
        if (updates.username || updates.email || updates.password) {
          setFormData((prev) => ({ ...prev, ...updates }));
        } else {
          setResetData((prev) => ({ ...prev, ...updates }));
        }
      }
    };
    Object.values(inputs)
      .filter(Boolean)
      .forEach((input) =>
        input.addEventListener("input", checkAutofill)
      );
    return () =>
      Object.values(inputs)
        .filter(Boolean)
        .forEach((input) =>
          input.removeEventListener("input", checkAutofill)
        );
  }, [formData, resetData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      // Login Flow
      if (!isRegistering && !showForgotPassword) {
        const { email, password } = formData;
        if (!email || !password) {
          setError("Email and password are required!");
          setLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setError("Invalid email format!");
          setLoading(false);
          return;
        }
        if (!isValidPassword(password)) {
          setError("Password must be at least 8 characters long!");
          setLoading(false);
          return;
        }

        const res = await axios.post(`${API_BASE}/login`, { email, password });
        console.log("Login response:", res.data);

        if (res.data.success) {
          localStorage.setItem("token", res.data.token); // Store token
          onLogin(res.data.admin, res.data.token);
          navigate("/admin"); // Always navigate to /admin
        } else {
          setError(res.data.message);
        }
        setLoading(false);
        return;
      }

      // Registration Flow
      if (isRegistering) {
        const { username, email, password } = formData;
        if (!username || !email || !password) {
          setError("All fields are required!");
          setLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setError("Invalid email format!");
          setLoading(false);
          return;
        }
        if (!isValidPassword(password)) {
          setError("Password must be at least 8 characters long!");
          setLoading(false);
          return;
        }

        const res = await axios.post(`${API_BASE}/register`, {
          username,
          email,
          password,
        });
        console.log("Register response:", res.data);

        if (res.data.success) {
          setSuccessMessage(res.data.message);
          setIsRegistering(false); // Switch to login form
          setFormData({ username: "", email: "", password: "" });
          // Do not navigate, stay on login form
        } else {
          setError(res.data.message);
        }
        setLoading(false);
        return;
      }

      // Forgot Password - Step 1: Send Reset Code
      if (showForgotPassword && resetStep === 1) {
        const { email } = resetData;
        if (!email) {
          setError("Email is required!");
          setLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setError("Invalid email format!");
          setLoading(false);
          return;
        }
        const res = await axios.post(`${API_BASE}/forgot`, { email });
        console.log("Forgot password response:", res.data);
        setSuccessMessage(res.data.message);
        if (res.data.success) {
          setResetStep(2);
        } else {
          setError(res.data.message);
        }
        setLoading(false);
        return;
      }

      // Forgot Password - Step 2: Verify Reset Code
      if (showForgotPassword && resetStep === 2) {
        const { email, resetCode } = resetData;
        if (!email || !resetCode) {
          setError("Email and reset code are required!");
          setLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setError("Invalid email format!");
          setLoading(false);
          return;
        }
        if (resetCode.length !== 6 || !/^\d+$/.test(resetCode)) {
          setError("Reset code must be a 6-digit number!");
          setLoading(false);
          return;
        }
        const res = await axios.post(`${API_BASE}/reset/verify`, {
          email,
          code: resetCode,
        });
        console.log("Reset verify response:", res.data);
        setSuccessMessage(res.data.message);
        if (res.data.success) {
          setResetStep(3);
        } else {
          setError(res.data.message);
        }
        setLoading(false);
        return;
      }

      // Forgot Password - Step 3: Set New Password
      if (showForgotPassword && resetStep === 3) {
        const { email, resetCode, newPassword, confirmPassword } = resetData;
        if (!newPassword || !confirmPassword) {
          setError("New password and confirm password are required!");
          setLoading(false);
          return;
        }
        if (!isValidPassword(newPassword)) {
          setError("New password must be at least 8 characters long!");
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }
        const res = await axios.post(`${API_BASE}/reset`, {
          email,
          code: resetCode,
          newPassword,
        });
        console.log("Reset password response:", res.data);
        setSuccessMessage(res.data.message);
        if (res.data.success) {
          setShowForgotPassword(false);
          setResetStep(1);
          setResetData({
            email: "",
            resetCode: "",
            newPassword: "",
            confirmPassword: "",
          });
          setFormData({ username: "", email: "", password: "" });
          navigate("/admin"); // Navigate to /admin after reset
        } else {
          setError(res.data.message);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Axios error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Network or server error. Please try again."
      );
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#f4f7f8",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
    },
    title: { color: "#77a8a8", marginBottom: "15px", fontSize: "24px" },
    form: { display: "flex", flexDirection: "column", gap: "15px" },
    input: {
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
      outline: "none",
    },
    button: {
      padding: "12px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#77a8a8",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
      transition: "0.3s",
      opacity: loading ? 0.6 : 1,
      pointerEvents: loading ? "none" : "auto",
    },
    toggleText: {
      marginTop: "15px",
      color: "#555",
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "14px",
    },
    error: { color: "red", fontSize: "14px", marginTop: "10px" },
    success: { color: "green", fontSize: "14px", marginTop: "10px" },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {isRegistering
          ? "Create Admin Account"
          : showForgotPassword
          ? resetStep === 1
            ? "Reset Password"
            : resetStep === 2
            ? "Verify Reset Code"
            : "Set New Password"
          : "Admin Login"}
      </h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        {(isRegistering || (!showForgotPassword && !isRegistering)) && (
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={showForgotPassword ? resetData.email : formData.email}
            onChange={showForgotPassword ? handleResetChange : handleChange}
            onInput={showForgotPassword ? handleResetChange : handleChange}
            required
            style={styles.input}
          />
        )}

        {isRegistering && (
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            onInput={handleChange}
            required
            style={styles.input}
          />
        )}

        {(!showForgotPassword && !isRegistering) && (
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onInput={handleChange}
            required
            style={styles.input}
          />
        )}

        {isRegistering && (
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            onInput={handleChange}
            required
            style={styles.input}
          />
        )}

        {showForgotPassword && resetStep === 1 && (
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={resetData.email}
            onChange={handleResetChange}
            onInput={handleResetChange}
            required
            style={styles.input}
          />
        )}

        {showForgotPassword && resetStep === 2 && (
          <input
            type="text"
            id="resetCode"
            name="resetCode"
            placeholder="Enter reset code"
            value={resetData.resetCode}
            onChange={handleResetChange}
            onInput={handleResetChange}
            required
            style={styles.input}
          />
        )}

        {showForgotPassword && resetStep === 3 && (
          <>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="New Password"
              value={resetData.newPassword}
              onChange={handleResetChange}
              onInput={handleResetChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={resetData.confirmPassword}
              onChange={handleResetChange}
              onInput={handleResetChange}
              required
              style={styles.input}
            />
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading
            ? "Processing..."
            : isRegistering
            ? "Register"
            : showForgotPassword
            ? resetStep === 1
              ? "Send Reset Code"
              : resetStep === 2
              ? "Verify Code"
              : "Set Password"
            : "Login"}
        </button>
      </form>

      {!isRegistering && !showForgotPassword && (
        <>
          <p
            style={styles.toggleText}
            onClick={() => {
              setIsRegistering(true);
              setFormData({ username: "", email: "", password: "" });
              setError("");
              setSuccessMessage("");
            }}
          >
            Create New Account
          </p>
          <p
            style={styles.toggleText}
            onClick={() => {
              setShowForgotPassword(true);
              setResetStep(1);
              setFormData({ username: "", email: "", password: "" });
              setError("");
              setSuccessMessage("");
            }}
          >
            Forgot Password?
          </p>
        </>
      )}

      {(isRegistering || showForgotPassword) && (
        <p
          style={styles.toggleText}
          onClick={() => {
            setIsRegistering(false);
            setShowForgotPassword(false);
            setResetStep(1);
            setResetData({
              email: "",
              resetCode: "",
              newPassword: "",
              confirmPassword: "",
            });
            setFormData({ username: "", email: "", password: "" });
            setError("");
            setSuccessMessage("");
          }}
        >
          Back to Login
        </p>
      )}
    </div>
  );
};

export default AdminAuth;