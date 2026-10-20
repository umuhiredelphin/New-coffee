import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children, requiredRole }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const token = localStorage.getItem("token");

  if (!admin || !token) {
    return <Navigate to="/admin/login" />;
  }

  if (requiredRole) {
    const roleHierarchy = { super_admin: 3, admin: 2, manager: 1 };
    const userLevel = roleHierarchy[admin.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    if (userLevel < requiredLevel) {
      return <Navigate to="/admin" />;
    }
  }

  return children;
};

export default AdminRoute;