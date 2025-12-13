import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AdminAuth from "./AdminAuth";
import "./Admin.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample data
const stockData = [
  { month: "Jan", stock: 50 },
  { month: "Feb", stock: 80 },
  { month: "Mar", stock: 65 },
  { month: "Apr", stock: 90 },
  { month: "May", stock: 70 },
  { month: "Jun", stock: 100 },
];

const bookingData = [
  { month: "Jan", bookings: 20 },
  { month: "Feb", bookings: 35 },
  { month: "Mar", bookings: 25 },
  { month: "Apr", bookings: 40 },
  { month: "May", bookings: 30 },
  { month: "Jun", bookings: 50 },
];

const revenueData = [
  { month: "Jan", revenue: 200 },
  { month: "Feb", revenue: 400 },
  { month: "Mar", revenue: 300 },
  { month: "Apr", revenue: 500 },
  { month: "May", revenue: 450 },
  { month: "Jun", revenue: 600 },
];

const Admin = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const loggedInAdmin = JSON.parse(localStorage.getItem("adminLoggedIn"));
    if (loggedInAdmin) setAdmin(loggedInAdmin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setAdmin(null);
  };

  if (!admin) return <AdminAuth onLogin={setAdmin} />;

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <div className="admin-content">
          <h2>Welcome, {admin.username || "Admin"}</h2>
          <button onClick={handleLogout}>Logout</button>

          {/* Dashboard Cards */}
          <div className="cards">
            <div className="card">📦 Stock Overview</div>
            <div className="card">📅 Table Bookings</div>
            <div className="card">💵 Revenue</div>
            <div className="card">👥 Employees</div>
            <div className="card">⚙️ Settings</div>
          </div>

          {/* Statistics Section */}
          <div className="stats-grid">
            {/* Stock Trend */}
            <div className="stats-section">
              <h3>📦 Stock Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#77a8a8"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Booking Trend */}
            <div className="stats-section">
              <h3>📅 Table Bookings</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#7e7ce" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend */}
            <div className="stats-section">
              <h3>💵 Revenue</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff9800"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
