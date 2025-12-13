import React from "react";
import Sidebar from "./Sidebar";   // ✅ now uses employee's own Sidebar
import Header from "./Header";     // ✅ now uses employee's own Header
import "./Employee.css";

const Employee = () => {
  return (
    <div className="employee-container">
      <Sidebar />
      <div className="employee-main">
        <Header title="Employee Dashboard" />
        <div className="employee-content">
          <h2>Welcome, Employee</h2>
          <div className="cards">
            <div className="card">📥 Stock In</div>
            <div className="card">📤 Stock Out</div>
            <div className="card">📝 Reports</div>
            <div className="card">📅 Last Data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employee;
