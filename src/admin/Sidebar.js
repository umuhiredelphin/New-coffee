import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaHome, 
  FaUsers, 
  FaBox, 
  FaUserTie, 
  FaChartBar, 
  FaCog, 
  FaUtensils, 
  FaChair, 
  FaShoppingCart,
  FaBars,
  FaUser,
  FaKey,
  FaUserCog,
  FaSignOutAlt
} from "react-icons/fa";
import { MdTableRestaurant } from "react-icons/md";
import "./Admin.css";

const Sidebar = () => {
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);

  return (
    <div className="sidebar">
      <h2>F&F Coffee</h2>

      {/* Main menu links */}
      <ul className="main-links">
        <li><Link to="/admin/dashboard"><FaHome /> Dashboard</Link></li>
        <li><Link to="/admin/users"><FaUsers /> Users</Link></li>
        <li><Link to="/admin/table-reservations"><MdTableRestaurant /> Table Reservation</Link></li>
        <li><Link to="/admin/tables/add"><FaChair /> Add Table</Link></li>
        <li><Link to="/admin/stock"><FaBox /> Stock</Link></li>
        <li><Link to="/admin/employees"><FaUserTie /> Employees</Link></li>
        <li><Link to="/admin/reports"><FaChartBar /> Reports</Link></li>
        <li><Link to="/admin/settings"><FaCog /> Settings</Link></li>
        <li><Link to="/admin/menu/add"><FaUtensils /> Add Menu</Link></li>
      </ul>

      {/* Bottom cards */}
      <div className="sidebar-bottom-cards">
        {/* Cart Card */}
        <div className="sidebar-card">
          <Link to="/admin/cart">
            <FaShoppingCart className="sidebar-card-icon" />
            <span>Cart</span>
          </Link>
        </div>

        {/* System Menu Card */}
        <div className="sidebar-card" onClick={() => setIsSystemMenuOpen(true)}>
          <FaBars className="sidebar-card-icon" />
          <span>System Menu</span>
        </div>
      </div>

      {/* Right Corner System Menu Popup */}
      {isSystemMenuOpen && (
        <div className="system-menu-popup">
          <ul className="system-menu-list">
            <li><Link to="/admin/account"><FaUser /> Account</Link></li>
            <li><Link to="/admin/manage-account"><FaUserCog /> Manage Account</Link></li>
            <li><Link to="/admin/change-password"><FaKey /> Change Password</Link></li>
            <li><Link to="/logout"><FaSignOutAlt /> Logout</Link></li>
          </ul>
          <button className="system-menu-cancel" onClick={() => setIsSystemMenuOpen(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
