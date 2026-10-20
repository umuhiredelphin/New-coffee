import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { FaChair, FaTable, FaPlus, FaTrash, FaImage, FaUpload, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const API = "http://localhost:5000";

export default function Employee({ onLogout }) {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState("");
  const [tableImage, setTableImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) { navigate("/employee/login"); return; }
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API}/api/tables`);
      setTables(Array.isArray(res.data) ? res.data : res.data.tables || []);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employee");
    navigate("/employee/login");
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setTableImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setTableNumber("");
    setTableImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!tableNumber) return alert("Table number is required.");
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append("tableNumber", tableNumber);
      if (tableImage) fd.append("tableImage", tableImage);
      await axios.post(`${API}/api/tables`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      resetForm();
      fetchTables();
    } catch { alert("Failed to add table."); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this table?")) return;
    try { await axios.delete(`${API}/api/tables/${id}`); fetchTables(); }
    catch { alert("Failed to delete table."); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/tables/${id}`, { status });
      setTables(prev => prev.map(t => (t._id || t.id) === id ? { ...t, status } : t));
    } catch (err) {
      console.error("Failed to update table:", err);
    }
  };

  const statusColors = {
    available: "bg-green-500/20 text-green-400 border-green-500/30",
    occupied: "bg-red-500/20 text-red-400 border-red-500/30",
    reserved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    cleaning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  const statusIcons = {
    available: FaCheckCircle,
    occupied: FaTimesCircle,
    reserved: FaClock,
    cleaning: FaSpinner,
  };

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header title="Table Management" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleAdd}
                  className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl p-6 shadow-xl shadow-black/20 sticky top-4">
                  <h2 className="text-lg font-bold text-cream-50 mb-5 flex items-center gap-3">
                    <FaPlus className="text-gold-400" /> Add New Table
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-cream-50/80 mb-2">
                        <FaTable className="inline mr-1.5 text-gold-400 text-xs" /> Table Number
                      </label>
                      <input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                        placeholder="e.g. 1" min="1" required
                        className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-cream-50/80 mb-2">
                        <FaImage className="inline mr-1.5 text-gold-400 text-xs" /> Table Image
                      </label>
                      <input type="file" ref={fileRef} onChange={handleImage} accept="image/*"
                        className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500/20 file:text-gold-400 file:text-sm file:font-semibold hover:file:bg-gold-500/30 focus:outline-none focus:border-gold-400/60 transition-all" />
                    </div>
                    {preview && (
                      <div className="rounded-xl overflow-hidden border border-espresso-700/40">
                        <img src={preview} alt="Preview" className="w-full h-36 object-cover" />
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={adding}
                    className="mt-5 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold py-3 rounded-xl text-sm hover:from-gold-400 hover:to-gold-500 transition-all duration-200 shadow-lg shadow-gold-500/20 disabled:opacity-50">
                    <FaUpload className={adding ? "animate-pulse" : ""} />
                    {adding ? "Adding..." : "Add Table"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl p-6 shadow-xl shadow-black/20">
                  <h2 className="text-lg font-bold text-cream-50 mb-5 flex items-center gap-3">
                    <FaTable className="text-gold-400" /> Tables
                    <span className="ml-auto text-sm font-normal text-cream-50/50">{tables.length} table{tables.length !== 1 ? "s" : ""}</span>
                  </h2>

                  {tables.length === 0 ? (
                    <div className="text-center py-16">
                      <FaChair className="text-5xl text-espresso-700 mx-auto mb-4" />
                      <p className="text-cream-50/50 text-lg">No tables yet. Add one!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tables.map(table => {
                        const id = table._id || table.id;
                        const StatusIcon = statusIcons[table.status] || FaChair;
                        return (
                          <div key={id}
                            className="group bg-espresso-950/60 border border-espresso-800/40 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all duration-200">
                            {table.tableImage || table.table_image ? (
                              <img src={table.tableImage || table.table_image} alt={`Table ${table.tableNumber || table.table_number}`}
                                className="w-full h-32 object-cover" />
                            ) : (
                              <div className="w-full h-32 bg-espresso-800/40 flex items-center justify-center">
                                <FaChair className="text-4xl text-espresso-700" />
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-cream-50 text-lg">Table {table.tableNumber || table.table_number}</h3>
                                <StatusIcon className={`text-lg ${(statusColors[table.status]?.split(" ")[1]) || "text-cream-400"}`} />
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColors[table.status] || "bg-espresso-700/50 text-cream-400"}`}>
                                  {table.status || "unknown"}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <button onClick={() => updateStatus(id, "available")}
                                  className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-semibold hover:bg-green-500/20 transition-all">Available</button>
                                <button onClick={() => updateStatus(id, "occupied")}
                                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-semibold hover:bg-red-500/20 transition-all">Occupied</button>
                                <button onClick={() => updateStatus(id, "reserved")}
                                  className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-semibold hover:bg-blue-500/20 transition-all">Reserved</button>
                                <button onClick={() => updateStatus(id, "cleaning")}
                                  className="flex-1 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-[10px] font-semibold hover:bg-yellow-500/20 transition-all">Cleaning</button>
                                <button onClick={() => handleDelete(id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all">
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}