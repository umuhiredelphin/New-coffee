import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("token") }, // Add token for secure Socket.IO
});

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function TableReservation() {
  const [bookings, setBookings] = useState([]);
  const [currency, setCurrency] = useState("RWF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token on mount
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchBookings();

    // Real-time updates
    socket.on("bookingStatusUpdated", (updatedBooking) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? { ...updatedBooking, foods: updatedBooking.foods || [] } : b))
      );
    });

    socket.on("bookingDeleted", ({ id }) => {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    });

    return () => {
      socket.off("bookingStatusUpdated");
      socket.off("bookingDeleted");
    };
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/bookings");
      setBookings(res.data.map((booking) => ({
        ...booking,
        foods: booking.foods || [], // Ensure foods is always an array
      })));
    } catch (err) {
      console.error("Fetch bookings error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to fetch bookings");
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axiosInstance.delete(`/bookings/${id}`);
      alert("Booking deleted successfully.");
      socket.emit("deleteBooking", { id });
    } catch (err) {
      console.error("Delete booking error:", err.response?.data || err);
      alert(`Failed to delete booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await axiosInstance.put(`/bookings/${id}/status`, { status });
      alert(`Booking ${status.toLowerCase()} successfully!`);
      socket.emit("updateBookingStatus", res.data);
    } catch (err) {
      console.error("Status update error:", err.response?.data || err);
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  const convertPrice = (price) => {
    if (!price) return currency === "RWF" ? "0 RWF" : "$0.00";
    if (currency === "RWF") return `${price.toLocaleString()} RWF`;
    const exchangeRate = 1400; // Move to env or config in production
    return `$${(price / exchangeRate).toFixed(2)}`;
  };

  const calculateTotalPrice = (foods) => {
    if (!foods || !Array.isArray(foods)) return 0;
    return foods.reduce((total, food) => total + (food.price || 0) * (food.quantity || 1), 0);
  };

  return (
    <div className="admin-container" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f2f5", overflowX: "auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "15px", color: "#333" }}>Table Reservations</h2>

        <div style={{ textAlign: "right", marginBottom: "15px", marginRight: "2%" }}>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>Currency:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "5px", border: "1px solid #77a8a8", backgroundColor: "#fff", cursor: "pointer" }}
          >
            <option value="RWF">RWF (Rwandan Franc)</option>
            <option value="$">USD ($)</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#555" }}>Loading bookings...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>{error}</p>
        ) : bookings.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>No bookings available.</p>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <table style={{ width: "85%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "10px", overflow: "hidden", fontSize: "13px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ backgroundColor: "#77a8a8", color: "#fff", textAlign: "center" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Table</th>
                  <th style={thStyle}>People</th>
                  <th style={thStyle}>Food Ordered</th>
                  <th style={thStyle}>Food Items</th>
                  <th style={thStyle}>Total Price</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => {
                  const totalPrice = calculateTotalPrice(booking.foods);

                  return (
                    <tr key={booking.id} style={{ textAlign: "center", borderBottom: "1px solid #ddd", backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                      <td>{index + 1}</td>
                      <td>{booking.name}</td>
                      <td>{booking.email || "-"}</td>
                      <td>{booking.phone}</td>
                      <td>{booking.table_number || booking.table_id}</td>
                      <td>{booking.num_people}</td>
                      <td>{booking.order_food}</td>
                      <td>
                        {booking.foods.length > 0 ? (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                            {booking.foods.map((food, i) => (
                              <div key={i} style={{ textAlign: "center" }}>
                                {food.image && (
                                  <img
                                    src={`http://localhost:5000${food.image}`}
                                    alt={food.name}
                                    width="35"
                                    style={{ borderRadius: "5px", objectFit: "cover" }}
                                    onError={(e) => (e.target.src = "/fallback-image.png")} // Fallback for broken images
                                  />
                                )}
                                <p style={{ margin: 0, fontSize: "11px" }}>{food.name} x{food.quantity || 1}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>-</p>
                        )}
                      </td>
                      <td style={{ fontWeight: "bold", color: "#333" }}>{convertPrice(totalPrice)}</td>
                      <td>
                        <span
                          style={{
                            color:
                              booking.status === "Accepted" ? "green" :
                              booking.status === "Rejected" ? "red" : "orange",
                            fontWeight: "bold",
                          }}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, "Accepted")}
                          style={{ ...buttonStyle, backgroundColor: "#28a745" }}
                          disabled={booking.status === "Accepted"}
                        >
                          <FaCheck /> Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, "Rejected")}
                          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                          disabled={booking.status === "Rejected"}
                        >
                          <FaTimes /> Reject
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: "8px", textAlign: "center", minWidth: "70px" };
const buttonStyle = {
  padding: "4px 8px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  justifyContent: "center",
  fontSize: "12px",
  transition: "0.3s",
  opacity: (props) => (props.disabled ? 0.5 : 1), // Visual feedback for disabled buttons
};