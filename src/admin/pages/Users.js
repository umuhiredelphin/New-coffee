import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import { FaEdit, FaTrash, FaUsers, FaSearch, FaSpinner, FaUserPlus } from "react-icons/fa";

const api = axios.create({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("http://localhost:5000/api/users");
      const data = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`http://localhost:5000/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.username || u.name || "")?.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "")?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-espresso-950 flex">
      <Sidebar />
      <div className="ml-60 flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <FaUsers className="text-espresso-950 text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cream-50 font-playfair">Users</h1>
                <p className="text-sm text-cream-50/50">Manage registered accounts</p>
              </div>
            </div>
            <span className="text-xs text-cream-50/30 px-3 py-1.5 rounded-full bg-espresso-800/50 border border-espresso-700/50">
              {users.length} total
            </span>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <div className="mb-6 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-50/30 text-sm" />
            <input type="text" placeholder="Search by username or email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-espresso-900/60 border border-espresso-700/50 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <FaSpinner className="animate-spin text-gold-400 text-xl" />
              <span className="text-cream-50/50 text-sm">Loading users...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-espresso-800/50 flex items-center justify-center">
                <FaUsers className="text-cream-50/20 text-2xl" />
              </div>
              <p className="text-cream-50/40 text-sm">{search ? "No users match your search." : "No users registered yet."}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-espresso-800/50 overflow-hidden bg-espresso-900/40 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-espresso-800/50 bg-espresso-900/60">
                      <th className="text-left px-4 py-3.5 text-cream-50/60 font-medium">Username</th>
                      <th className="text-left px-4 py-3.5 text-cream-50/60 font-medium">Email</th>
                      <th className="text-left px-4 py-3.5 text-cream-50/60 font-medium">Phone</th>
                      <th className="text-left px-4 py-3.5 text-cream-50/60 font-medium">Registered</th>
                      <th className="text-right px-4 py-3.5 text-cream-50/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr key={user._id || user.id} className="border-b border-espresso-800/30 hover:bg-espresso-800/30 transition-colors">
                        <td className="px-4 py-3.5 text-cream-50 font-medium">{user.username || user.name}</td>
                        <td className="px-4 py-3.5 text-cream-50/70">{user.email}</td>
                        <td className="px-4 py-3.5 text-cream-50/70">{user.phone || "\u2014"}</td>
                        <td className="px-4 py-3.5 text-cream-50/50 text-xs">
                          {new Date(user.createdAt || user.created_at || Date.now()).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/users/edit/${user._id || user.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 hover:bg-gold-400/20 transition-all text-xs font-medium">
                              <FaEdit /> Edit
                            </Link>
                            <button onClick={() => handleDelete(user._id || user.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-medium">
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-espresso-800/30 text-xs text-cream-50/30">
                {filtered.length} {filtered.length === 1 ? "user" : "users"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}