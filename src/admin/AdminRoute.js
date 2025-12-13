import React from "react";
import { Navigate } from "react-router-dom";

// AdminRoute: Wrap admin pages with this
const AdminRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));

  if (!admin || admin.role !== "admin") {
    // Not logged in as admin, redirect to login
    return <Navigate to="/admin/manage-account" />;
  }

  // Admin is authenticated, show the page
  return children;
};

export default AdminRoute;
