import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import { FaTrash, FaEdit } from "react-icons/fa";

const axiosInstance = axios.create({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to view users.");
        navigate("/login");
        return;
      }
      setLoading(true);
      const response = await axiosInstance.get("http://localhost:5000/api/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to fetch users. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`http://localhost:5000/api/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
      alert("User deleted successfully.");
    } catch (err) {
      console.error("Delete user error:", err.response?.data || err);
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-container" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f2f5", overflowX: "auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "15px", color: "#333" }}>Registered Users</h2>

        {loading && <p style={{ textAlign: "center" }}>Loading users...</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {!loading && users.length === 0 && <p style={{ textAlign: "center" }}>No users registered yet.</p>}

        {!loading && users.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <table style={{ width: "85%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "10px", overflow: "hidden", fontSize: "13px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ backgroundColor: "#77a8a8", color: "#fff", textAlign: "center" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Registered At</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} style={{ textAlign: "center", borderBottom: "1px solid #ddd", backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{new Date(user.created_at).toLocaleString()}</td>
                    <td style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                      <Link to={`/admin/users/edit/${user.id}`} style={{ ...buttonStyle, backgroundColor: "#007bff" }}>
                        <FaEdit /> Edit
                      </Link>
                      <button onClick={() => handleDelete(user.id)} style={{ ...buttonStyle, backgroundColor: "#dc3545" }}>
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: "8px", textAlign: "center", minWidth: "70px" };
const buttonStyle = { padding: "4px 8px", borderRadius: "5px", border: "none", cursor: "pointer", color: "#fff", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", fontSize: "12px", transition: "0.3s", textDecoration: "none" };