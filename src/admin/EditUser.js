import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import { FaUserEdit, FaSpinner, FaArrowLeft, FaSave } from "react-icons/fa";

const api = () => axios.create({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api().get(`http://localhost:5000/api/users/${id}`);
        setForm({
          username: res.data.username || res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
        });
      } catch {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api().put(`http://localhost:5000/api/users/${id}`, form);
      navigate("/admin/users");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso-950 flex">
      <Sidebar />
      <div className="ml-60 flex-1 p-6">
        <div className="max-w-lg mx-auto">
          <button onClick={() => navigate("/admin/users")}
            className="inline-flex items-center gap-2 text-sm text-cream-50/50 hover:text-cream-50 transition-colors mb-6">
            <FaArrowLeft className="text-xs" /> Back to Users
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <FaUserEdit className="text-espresso-950 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-cream-50 font-playfair">Edit User</h1>
              <p className="text-sm text-cream-50/50">Update user account details</p>
            </div>
          </div>

          {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <FaSpinner className="animate-spin text-gold-400 text-xl" />
              <span className="text-cream-50/50 text-sm">Loading user...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-cream-50/60 mb-1.5">Username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl bg-espresso-900/60 border border-espresso-700/50 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm text-cream-50/60 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl bg-espresso-900/60 border border-espresso-700/50 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm text-cream-50/60 mb-1.5">Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-espresso-900/60 border border-espresso-700/50 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all text-sm" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold text-sm hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => navigate("/admin/users")}
                  className="px-5 py-2.5 rounded-xl border border-espresso-700/50 text-cream-50/60 hover:text-cream-50 hover:border-espresso-600/50 transition-all text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}