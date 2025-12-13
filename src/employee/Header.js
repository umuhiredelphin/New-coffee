import React from "react";
import "./Employee.css";

const Header = ({ title }) => {
  return (
    <div className="header">
      <h1>{title || "Employee Dashboard"}</h1>
      <div className="user-info">
        <span>👤 Employee</span>
      </div>
    </div>
  );
};

export default Header;
