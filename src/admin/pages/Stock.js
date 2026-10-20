import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import {
  FaBox, FaSearch, FaEdit, FaTimes, FaPlus, FaMinus, FaExclamationTriangle,
  FaCheckCircle, FaHistory, FaArrowUp, FaArrowDown, FaTrash, FaFilter,
  FaWarehouse, FaChartLine, FaBell, FaClipboardList
} from "react-icons/fa";

const categories = [
  { id: "ingredients", name: "Ingredients" },
  { id: "supplies", name: "Supplies" },
  { id: "packaging", name: "Packaging" },
  { id: "equipment", name: "Equipment" },
  { id: "other", name: "Other" }
];
const units = ["pcs", "kg", "g", "L", "ml", "packs", "boxes", "bags"];

export default function Stock() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");
  const [stockHistory, setStockHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalType, setStockModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [stockSupplier, setStockSupplier] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: "", category: "ingredients", unit: "pcs",
    currentStock: 0, minStock: 10, price: 0
  });

  useEffect(() => {
    fetchStockItems();
    if (activeTab === "history") fetchStockHistory();
  }, [activeTab]);

  const fetchStockItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stock/items");
      setStockItems(res.data.items || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStockHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await axios.get("http://localhost:5000/api/stock/history");
      setStockHistory(res.data.history || []);
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  const handleOpenStockModal = (item, type) => {
    setSelectedItem(item);
    setStockModalType(type);
    setStockQuantity("");
    setStockReason("");
    setStockSupplier("");
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockQuantity || parseInt(stockQuantity) <= 0) { alert("Please enter a valid quantity"); return; }
    setSubmitting(true);
    try {
      const endpoint = stockModalType === "in" ? "/api/stock/in" : "/api/stock/out";
      const payload = {
        stockItemId: selectedItem._id,
        quantity: parseInt(stockQuantity),
        reason: stockReason,
        ...(stockModalType === "in" && { supplier: stockSupplier })
      };
      await axios.post(`http://localhost:5000${endpoint}`, payload);
      setShowStockModal(false);
      fetchStockItems();
      if (activeTab === "history") fetchStockHistory();
    } catch (err) { alert("Failed to process stock: " + (err.response?.data?.error || err.message)); }
    finally { setSubmitting(false); }
  };

  const handleQuickUpdate = async (id, change) => {
    const item = stockItems.find(i => i._id === id);
    if (!item) return;
    const newStock = (item.currentStock || item.stock || 0) + change;
    if (newStock < 0) return;
    try {
      await axios.put(`http://localhost:5000/api/stock/items/${id}`, { currentStock: newStock });
      setStockItems(stockItems.map(i => i._id === id ? { ...i, currentStock: newStock, stock: newStock } : i));
    } catch (err) { alert("Failed to update stock."); }
  };

  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name, category: item.category || "ingredients", unit: item.unit || "pcs",
        currentStock: item.currentStock || item.stock || 0, minStock: item.minStock || 10, price: item.price || 0
      });
    } else {
      setEditingItem(null);
      setItemForm({ name: "", category: "ingredients", unit: "pcs", currentStock: 0, minStock: 10, price: 0 });
    }
    setShowItemModal(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemForm.name) { alert("Please enter item name"); return; }
    setSubmitting(true);
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/stock/items/${editingItem._id}`, itemForm);
      } else {
        await axios.post("http://localhost:5000/api/stock/items", itemForm);
      }
      setShowItemModal(false);
      fetchStockItems();
    } catch (err) { alert("Failed to save item: " + (err.response?.data?.error || err.message)); }
    finally { setSubmitting(false); }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try { await axios.delete(`http://localhost:5000/api/stock/items/${id}`); fetchStockItems(); }
    catch { alert("Failed to delete item."); }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock, minStock) => {
    const current = stock || 0;
    const min = minStock || 10;
    if (current === 0) return { color: "text-red-400", bg: "bg-red-500/20", label: "Out of Stock" };
    if (current < min) return { color: "text-amber-400", bg: "bg-amber-500/20", label: "Low Stock" };
    return { color: "text-green-400", bg: "bg-green-500/20", label: "In Stock" };
  };

  const totalStock = stockItems.reduce((sum, item) => sum + (item.currentStock || item.stock || 0), 0);
  const lowStockItems = stockItems.filter(item => { const s = item.currentStock || item.stock || 0; return s > 0 && s < (item.minStock || 10); }).length;
  const outOfStockItems = stockItems.filter(item => !(item.currentStock || item.stock || 0)).length;
  const stockInCount = stockHistory.filter(h => h.type === "stock_in").length;
  const stockOutCount = stockHistory.filter(h => h.type === "stock_out").length;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar />
      <div className="ml-60 flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
              <FaWarehouse className="text-2xl text-espresso-950" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-cream-50">Stock Inventory</h1>
              <p className="text-cream-50/40 text-sm mt-0.5">Manage ingredients, supplies and equipment</p>
            </div>
          </div>
          <button onClick={() => handleOpenItemModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-gold-500/30 transition-all">
            <FaPlus /> Add Item
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === "inventory" ? "bg-gold-400 text-espresso-950 shadow-md" : "bg-espresso-800/60 text-cream-50/60 hover:text-cream-50 hover:bg-espresso-700/60"
            }`}><FaBox /> Inventory</button>
          <button onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === "history" ? "bg-gold-400 text-espresso-950 shadow-md" : "bg-espresso-800/60 text-cream-50/60 hover:text-cream-50 hover:bg-espresso-700/60"
            }`}><FaHistory /> Stock History</button>
        </div>

        {activeTab === "inventory" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="flex items-center justify-between relative">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Items</p><p className="text-3xl font-bold mt-1">{stockItems.length}</p></div>
                  <div className="p-3 rounded-lg bg-white/15"><FaBox className="text-xl" /></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="flex items-center justify-between relative">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Units</p><p className="text-3xl font-bold mt-1">{totalStock}</p></div>
                  <div className="p-3 rounded-lg bg-white/15"><FaChartLine className="text-xl" /></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="flex items-center justify-between relative">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Low Stock</p><p className="text-3xl font-bold mt-1">{lowStockItems}</p></div>
                  <div className="p-3 rounded-lg bg-white/15"><FaBell className="text-xl" /></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="flex items-center justify-between relative">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Out of Stock</p><p className="text-3xl font-bold mt-1">{outOfStockItems}</p></div>
                  <div className="p-3 rounded-lg bg-white/15"><FaExclamationTriangle className="text-xl" /></div>
                </div>
              </div>
            </div>

            {(lowStockItems > 0 || outOfStockItems > 0) && (
              <div className="flex items-center gap-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-5 py-3 mb-6 text-sm font-medium">
                <FaExclamationTriangle className="text-lg shrink-0" />
                <span>{outOfStockItems > 0 && `${outOfStockItems} item(s) out of stock! `}{lowStockItems > 0 && `${lowStockItems} item(s) running low.`}</span>
              </div>
            )}

            <div className="bg-espresso-800/40 rounded-xl p-5 mb-6 border border-espresso-700/40">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-50/30" />
                  <input type="text" placeholder="Search stock items..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <FaFilter className="text-cream-50/30 text-sm" />
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-espresso-900/60 border border-espresso-700/40 text-cream-50 text-sm focus:outline-none focus:border-gold-400/50">
                    <option value="all" className="bg-espresso-900">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-espresso-900">{cat.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-espresso-800/40 rounded-xl border border-espresso-700/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-espresso-700/40">
                <h2 className="text-lg font-bold text-cream-50 flex items-center gap-2"><FaClipboardList className="text-gold-400" /> Stock Items</h2>
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                  <p className="mt-4 text-cream-50/50 text-sm animate-pulse">Loading inventory...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-12 text-center text-cream-50/40">No stock items found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-espresso-900/40">
                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Item Name</th>
                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Category</th>
                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Unit</th>
                        <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Stock</th>
                        <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Min</th>
                        <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Status</th>
                        <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-espresso-700/30">
                      {filteredItems.map((item) => {
                        const status = getStockStatus(item.currentStock || item.stock, item.minStock);
                        return (
                          <tr key={item._id} className="hover:bg-espresso-700/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-espresso-700/50 flex items-center justify-center"><FaBox className="text-gold-400 text-sm" /></div>
                                <span className="font-medium text-cream-50">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-cream-50/60 bg-espresso-700/30 px-2.5 py-1 rounded-full">{categories.find(c => c.id === item.category)?.name || "Other"}</span>
                            </td>
                            <td className="px-6 py-4 text-cream-50/60 text-sm">{item.unit}</td>
                            <td className="px-6 py-4 text-center"><span className="text-xl font-bold text-cream-50">{item.currentStock || item.stock || 0}</span></td>
                            <td className="px-6 py-4 text-center text-cream-50/40">{item.minStock || 10}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                {status.label === "In Stock" ? <FaCheckCircle className="text-xs" /> : <FaExclamationTriangle className="text-xs" />}
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleOpenStockModal(item, "out")}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all"><FaArrowDown className="inline mr-1" />Out</button>
                                <button onClick={() => handleQuickUpdate(item._id, -1)}
                                  disabled={!(item.currentStock || item.stock || 0)}
                                  className="p-1.5 rounded-lg text-cream-50/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all"><FaMinus /></button>
                                <span className="px-2 py-1 rounded bg-espresso-800/60 text-cream-50 font-bold text-sm min-w-[40px] text-center border border-espresso-700/40">{item.currentStock || item.stock || 0}</span>
                                <button onClick={() => handleQuickUpdate(item._id, 1)}
                                  className="p-1.5 rounded-lg text-cream-50/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"><FaPlus /></button>
                                <button onClick={() => handleOpenStockModal(item, "in")}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all"><FaArrowUp className="inline mr-1" />In</button>
                                <button onClick={() => handleOpenItemModal(item)}
                                  className="p-1.5 rounded-lg text-cream-50/30 hover:text-gold-400 hover:bg-gold-400/10 transition-all"><FaEdit /></button>
                                <button onClick={() => handleDeleteItem(item._id)}
                                  className="p-1.5 rounded-lg text-cream-50/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><FaTrash /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "history" && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Stock In</p><p className="text-3xl font-bold mt-1">{stockInCount}</p></div>
                  <div className="p-3 rounded-lg bg-white/15"><FaArrowUp className="text-xl" /></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Stock Out</p><p className="text-3xl font-bold mt-1">{stockOutCount}</p></div>
                  <div className="p-3 rounded-lg bg-white/15"><FaArrowDown className="text-xl" /></div>
                </div>
              </div>
            </div>

            <div className="bg-espresso-800/40 rounded-xl border border-espresso-700/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-espresso-700/40">
                <h2 className="text-lg font-bold text-cream-50 flex items-center gap-2"><FaHistory className="text-gold-400" /> Stock History</h2>
              </div>
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                  <p className="mt-4 text-cream-50/50 text-sm animate-pulse">Loading history...</p>
                </div>
              ) : stockHistory.length === 0 ? (
                <div className="py-12 text-center text-cream-50/40">No history yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-espresso-900/40">
                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Date</th>
                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Item</th>
                        <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Type</th>
                        <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Qty</th>
                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-espresso-700/30">
                      {stockHistory.map((record, idx) => (
                        <tr key={idx} className="hover:bg-espresso-700/20 transition-colors">
                          <td className="px-6 py-4 text-cream-50/60 text-sm">{formatDate(record.createdAt)}</td>
                          <td className="px-6 py-4 text-cream-50 font-medium">{record.menuItemName}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.type === "stock_in" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                              {record.type === "stock_in" ? "In" : "Out"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-cream-50 font-bold">{record.quantity}</td>
                          <td className="px-6 py-4 text-cream-50/40 text-sm">{record.reason || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showStockModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-espresso-800 rounded-xl shadow-2xl w-full max-w-md border border-espresso-700/40">
            <div className={`p-5 rounded-t-xl ${stockModalType === "in" ? "bg-emerald-600" : "bg-red-600"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {stockModalType === "in" ? <FaArrowUp /> : <FaArrowDown />}
                  {stockModalType === "in" ? "Stock In" : "Stock Out"}
                </h3>
                <button onClick={() => setShowStockModal(false)} className="text-white/70 hover:text-white transition-colors"><FaTimes /></button>
              </div>
            </div>
            <form onSubmit={handleStockSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Item</label>
                <div className="px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 font-medium">{selectedItem?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Quantity</label>
                <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} min="1" required
                  className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" />
              </div>
              {stockModalType === "in" && (
                <div>
                  <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Supplier</label>
                  <input type="text" value={stockSupplier} onChange={(e) => setStockSupplier(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Reason</label>
                <input type="text" value={stockReason} onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStockModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-lg border border-espresso-600/50 text-cream-50/70 font-semibold text-sm hover:bg-espresso-700/50 transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className={`flex-1 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all ${stockModalType === "in" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"} disabled:opacity-50`}>
                  {submitting ? "Processing..." : stockModalType === "in" ? "Add Stock" : "Remove Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-espresso-800 rounded-xl shadow-2xl w-full max-w-md border border-espresso-700/40">
            <div className="p-5 border-b border-espresso-700/40">
              <h3 className="text-lg font-bold text-cream-50 flex items-center gap-2"><FaBox className="text-gold-400" /> {editingItem ? "Edit Stock Item" : "Add Stock Item"}</h3>
            </div>
            <form onSubmit={handleItemSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Item Name</label>
                <input type="text" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" placeholder="Enter item name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Category</label>
                <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 text-sm focus:outline-none focus:border-gold-400/50">
                  {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-espresso-900">{cat.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Unit</label>
                  <select value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 text-sm focus:outline-none focus:border-gold-400/50">
                    {units.map(u => <option key={u} value={u} className="bg-espresso-900">{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Min Stock</label>
                  <input type="number" value={itemForm.minStock} onChange={(e) => setItemForm({ ...itemForm, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-50/70 mb-1.5">Initial Stock</label>
                <input type="number" value={itemForm.currentStock} onChange={(e) => setItemForm({ ...itemForm, currentStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" min="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowItemModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-lg border border-espresso-600/50 text-cream-50/70 font-semibold text-sm hover:bg-espresso-700/50 transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50">
                  {submitting ? "Saving..." : editingItem ? "Update" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}