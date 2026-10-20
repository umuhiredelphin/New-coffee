import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaChair, FaTable, FaPlus, FaTrash, FaImage, FaUpload } from "react-icons/fa";

export default function AddTable() {
  const [tableNumber, setTableNumber] = useState("");
  const [tableImage, setTableImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tables");
      setTables(Array.isArray(res.data) ? res.data : res.data.tables || []);
    } catch { alert("Failed to fetch tables."); }
  };

  useEffect(() => { fetchTables(); }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber) return alert("Table number is required.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("tableNumber", tableNumber);
      if (tableImage) fd.append("tableImage", tableImage);
      await axios.post("http://localhost:5000/api/tables", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      resetForm();
      fetchTables();
    } catch { alert("Failed to add table."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this table?")) return;
    try { await axios.delete(`http://localhost:5000/api/tables/${id}`); fetchTables(); }
    catch { alert("Failed to delete table."); }
  };

  return (
    <div className="min-h-screen bg-espresso-950 flex">
      <Sidebar />
      <div className="ml-60 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-cream-50 tracking-tight">
            <FaChair className="inline mr-3 text-gold-400" /> Tables Management
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}
              className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl p-8 shadow-xl shadow-black/20 animate-fade-in sticky top-8">
              <h2 className="text-xl font-bold text-cream-50 mb-6 flex items-center gap-3">
                <FaPlus className="text-gold-400" /> Add New Table
              </h2>
              <div className="space-y-5">
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
                    <img src={preview} alt="Preview" className="w-full h-44 object-cover" />
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold py-3.5 rounded-xl text-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-200 shadow-lg shadow-gold-500/20 disabled:opacity-50">
                <FaUpload className={loading ? "animate-pulse" : ""} />
                {loading ? "Adding..." : "Add Table"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl p-6 shadow-xl shadow-black/20 animate-fade-in">
              <h2 className="text-xl font-bold text-cream-50 mb-6 flex items-center gap-3">
                <FaTable className="text-gold-400" /> Existing Tables
                <span className="ml-auto text-sm font-normal text-cream-50/50">{tables.length} table{tables.length !== 1 ? "s" : ""}</span>
              </h2>

              {tables.length === 0 ? (
                <div className="text-center py-16">
                  <FaChair className="text-5xl text-espresso-700 mx-auto mb-4" />
                  <p className="text-cream-50/50 text-lg">No tables yet. Add one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tables.map(table => (
                    <div key={table._id || table.id}
                      className="group bg-espresso-950/60 border border-espresso-800/40 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all duration-200">
                      {table.table_image ? (
                        <img src={table.table_image} alt={`Table ${table.table_number}`}
                          className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 bg-espresso-800/40 flex items-center justify-center">
                          <FaChair className="text-4xl text-espresso-700" />
                        </div>
                      )}
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-cream-50 text-lg">Table {table.table_number}</h3>
                          <p className="text-xs text-cream-50/40">ID: {table._id || table.id}</p>
                        </div>
                        <button onClick={() => handleDelete(table._id || table.id)}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all opacity-0 group-hover:opacity-100">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}