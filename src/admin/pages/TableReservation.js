import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaTrash, FaCheck, FaTimes, FaBook } from "react-icons/fa";

const api = () => axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function TableReservation() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api().get("/bookings");
      const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];
      setBookings(data.map(b => ({ ...b, foods: b.foods || [] })));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await api().delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b._id !== id && b.id !== id));
    } catch (err) {
      alert(`Failed to delete booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api().put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => (b._id === id || b.id === id ? { ...b, status: res.data.status || status } : b)));
    } catch (err) {
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar />
      <div className="ml-60 flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
            <FaBook className="text-2xl text-espresso-950" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cream-50">Table Reservations</h1>
            <p className="text-cream-50/40 text-sm mt-0.5">Manage incoming table booking requests</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
            <p className="mt-4 text-cream-50/50 text-sm animate-pulse">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-3"><FaTimes className="inline mr-2" />{error}</div>
            <button onClick={fetchBookings}
              className="px-5 py-2 rounded-xl bg-gold-400 text-espresso-950 font-semibold text-sm hover:shadow-lg hover:shadow-gold-500/20 transition-all">Retry</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-xl bg-espresso-800/40 border border-espresso-700/40 text-cream-50/40 mb-3"><FaBook className="text-3xl" /></div>
            <p className="text-cream-50/50 text-sm">No bookings available.</p>
          </div>
        ) : (
          <div className="bg-espresso-800/40 rounded-xl border border-espresso-700/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-espresso-700/40">
              <p className="text-cream-50/50 text-sm">Showing <span className="text-cream-50 font-semibold">{bookings.length}</span> booking(s)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-espresso-900/40">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Phone</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Table</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Guests</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Time</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Status</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-700/30">
                  {bookings.map((booking) => (
                    <tr key={booking._id || booking.id} className="hover:bg-espresso-700/20 transition-colors">
                      <td className="px-6 py-4"><span className="font-medium text-cream-50">{booking.name}</span></td>
                      <td className="px-6 py-4 text-cream-50/60 text-sm">{booking.email || "-"}</td>
                      <td className="px-6 py-4 text-cream-50/60 text-sm">{booking.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-espresso-700/40 text-cream-50 text-xs font-semibold">
                          {booking.table_number || booking.tableId || booking.table_id || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-cream-50/80 font-medium">{booking.num_people || booking.guests}</td>
                      <td className="px-6 py-4 text-cream-50/60 text-sm">
                        {booking.date ? new Date(booking.date).toLocaleDateString() : booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-cream-50/60 text-sm">{booking.time || formatTime(booking.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          (booking.status === "Accepted" || booking.status === "confirmed")
                            ? "bg-emerald-500/15 text-emerald-400"
                            : (booking.status === "Rejected" || booking.status === "cancelled")
                            ? "bg-red-500/15 text-red-400"
                            : "bg-gold-500/15 text-gold-400"
                        }`}>{booking.status || "Pending"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleStatusUpdate(booking._id || booking.id, "Accepted")}
                            disabled={booking.status === "Accepted" || booking.status === "confirmed"}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1">
                            <FaCheck /> Accept
                          </button>
                          <button onClick={() => handleStatusUpdate(booking._id || booking.id, "Rejected")}
                            disabled={booking.status === "Rejected" || booking.status === "cancelled"}
                            className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1">
                            <FaTimes /> Reject
                          </button>
                          <button onClick={() => handleDelete(booking._id || booking.id)}
                            className="px-3 py-1.5 rounded-lg bg-espresso-600/40 text-cream-50/50 text-xs font-semibold hover:bg-espresso-500/40 hover:text-cream-50/70 transition-all flex items-center gap-1">
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}