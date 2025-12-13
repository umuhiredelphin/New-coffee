import React, { useState } from "react";
import axios from "axios";

const Login = ({ setIsLoggedIn, setUserRole }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/login", formData);

      if (response.data.success) {
        const user = response.data.user; // { id, name, email, role }
        const token = response.data.token;

        // Save user info and token
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        setIsLoggedIn(true);
        setUserRole(user.role);

        // Redirect based on role
        if (user.role === "admin") {
          window.location.href = "/admin"; // Admin dashboard
        } else if (user.role === "employee") {
          window.location.href = "/employee";
        } else {
          window.location.href = "/home";
        }
      } else {
        setMessage(response.data.message || "Login failed");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
