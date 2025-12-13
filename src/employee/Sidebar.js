import React from "react";
import "./Employee.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Employee Panel</h2>
      <ul>
        <li>🏠 Dashboard</li>
        <li>📥 Stock In</li>
        <li>📤 Stock Out</li>
        <li>📝 Reports</li>
        <li>📅 Last Data</li>
      </ul>
    </div>
  );
};

export default Sidebar;
