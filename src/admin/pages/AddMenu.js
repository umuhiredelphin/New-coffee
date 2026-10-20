import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaBox, FaList, FaUtensils, FaTag, FaDollarSign, FaImage, FaEdit, FaTrash, FaPlus, FaTimes, FaCoffee, FaFire, FaFolderPlus, FaFolderOpen } from "react-icons/fa";

const API = "http://localhost:5000";

export default function AddMenu() {
  const [form, setForm] = useState({
    _id: null, name: "", type: "food", category: "breakfast", categoryRef: "",
    price: "", currency: "RWF", image: null, description: ""
  });
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState("add");
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", label: "" });
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    if (tab === "manage") fetchMenu();
    fetchCategories();
  }, [tab]);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API}/api/menu`);
      setMenuItems(Array.isArray(res.data) ? res.data : res.data.menus || []);
    } catch { alert("Failed to fetch menu items."); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/categories`);
      setCategories(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(p => ({ ...p, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (k !== "categoryRef") fd.append(k, form[k]);
      });
      // Send categoryRef as the selected category id
      fd.append("categoryRef", form.categoryRef || "");

      if (form._id) {
        await axios.put(`${API}/api/menu/${form._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post(`${API}/api/menu`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setForm({ _id: null, name: "", type: "food", category: "breakfast", categoryRef: "", price: "", currency: "RWF", image: null, description: "" });
      setTab("manage");
      fetchMenu();
    } catch { alert("Failed to save menu item."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try { await axios.delete(`${API}/api/menu/${id}`); fetchMenu(); }
    catch { alert("Failed to delete."); }
  };

  const handleEdit = (item) => {
    setForm({
      _id: item._id || item.id, name: item.name, type: item.type,
      category: item.category, categoryRef: item.categoryRef?._id || item.categoryRef || "",
      price: item.price,
      currency: item.currency, image: null, description: item.description || ""
    });
    setTab("add");
  };

  const handleAddCategory = async () => {
    const name = catForm.name.trim();
    const label = catForm.label.trim();
    if (!name || !label) { alert("Enter both name and label"); return; }
    setCatLoading(true);
    try {
      await axios.post(`${API}/api/categories`, { name, label });
      setCatForm({ name: "", label: "" });
      setShowCatModal(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create category");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API}/api/categories/${id}`);
      fetchCategories();
    } catch { alert("Failed to delete category"); }
  };

  const categoryOptions = categories.length > 0
    ? categories.map(c => ({ value: c.name, label: c.label, _id: c._id }))
    : [
        { value: "breakfast", label: "Breakfast", _id: "" },
        { value: "lunch", label: "Lunch", _id: "" },
        { value: "dinner", label: "Dinner", _id: "" },
        { value: "coffee", label: "Coffee", _id: "" },
      ];

  return (
    <div className="min-h-screen bg-espresso-950 flex">
      <Sidebar />
      <div className="ml-60 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-cream-50 tracking-tight">
            <FaUtensils className="inline mr-3 text-gold-400" /> Menu Management
          </h1>
        </div>

        <div className="flex gap-1 mb-8 bg-espresso-900/60 rounded-xl p-1 w-fit border border-espresso-800/40">
          <button onClick={() => setTab("add")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === "add" ? "bg-gold-500 text-espresso-950 shadow-lg shadow-gold-500/20"
                : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
            }`}>
            <FaPlus /> {form._id ? "Edit Item" : "Add Item"}
          </button>
          <button onClick={() => setTab("manage")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === "manage" ? "bg-gold-500 text-espresso-950 shadow-lg shadow-gold-500/20"
                : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
            }`}>
            <FaList /> Manage Items
          </button>
          <button onClick={() => setTab("categories")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === "categories" ? "bg-gold-500 text-espresso-950 shadow-lg shadow-gold-500/20"
                : "text-cream-50/60 hover:text-cream-50 hover:bg-espresso-800/50"
            }`}>
            <FaFolderOpen /> Categories
          </button>
        </div>

        {tab === "add" && (
          <form onSubmit={handleSubmit}
            className="max-w-2xl bg-espresso-900/60 border border-espresso-800/40 rounded-2xl p-8 shadow-xl shadow-black/20 animate-fade-in">
            <h2 className="text-xl font-bold text-cream-50 mb-6 flex items-center gap-3">
              <FaCoffee className="text-gold-400" /> {form._id ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-cream-50/80 mb-2">
                  <FaTag className="inline mr-1.5 text-gold-400 text-xs" /> Item Name
                </label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Cappuccino" required
                  className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-cream-50/80 mb-2">Type</label>
                  <select name="type" value={form.type} onChange={handleChange}
                    className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all">
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-cream-50/80">Category</label>
                    <button type="button" onClick={() => setShowCatModal(true)}
                      className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-all">
                      <FaPlus size={9} /> New
                    </button>
                  </div>
                  <select name="category" value={form.category} onChange={e => {
                    const selected = categoryOptions.find(c => c.value === e.target.value);
                    setForm(p => ({ ...p, category: e.target.value, categoryRef: selected?._id || "" }));
                  }}
                    className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all">
                    {categoryOptions.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-cream-50/80 mb-2">
                    <FaDollarSign className="inline mr-1.5 text-gold-400 text-xs" /> Price
                  </label>
                  <input type="number" name="price" value={form.price} onChange={handleChange}
                    placeholder="0.00" step="0.01" required
                    className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cream-50/80 mb-2">Currency</label>
                  <select name="currency" value={form.currency} onChange={handleChange}
                    className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all">
                    <option value="RWF">RWF</option>
                    <option value="$">USD ($)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-50/80 mb-2">
                  <FaImage className="inline mr-1.5 text-gold-400 text-xs" /> Image
                </label>
                <input type="file" name="image" onChange={handleChange} accept="image/*"
                  className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500/20 file:text-gold-400 file:text-sm file:font-semibold hover:file:bg-gold-500/30 focus:outline-none focus:border-gold-400/60 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream-50/80 mb-2">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe this item..." rows="4"
                  className="w-full bg-espresso-950 border border-espresso-700/60 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all resize-none" />
              </div>
            </div>

            {form._id && (
              <button type="button" onClick={() => setForm({ _id: null, name: "", type: "food", category: "breakfast", categoryRef: "", price: "", currency: "RWF", image: null, description: "" })}
                className="mt-4 flex items-center gap-2 text-sm text-cream-50/50 hover:text-cream-50 transition-colors">
                <FaTimes /> Cancel Edit
              </button>
            )}

            <button type="submit" disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 font-bold py-3.5 rounded-xl text-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-200 shadow-lg shadow-gold-500/20 disabled:opacity-50">
              <FaFire className={loading ? "animate-pulse" : ""} />
              {loading ? "Saving..." : form._id ? "Update Menu Item" : "Add Menu Item"}
            </button>
          </form>
        )}

        {tab === "manage" && (
          <div className="animate-fade-in">
            {menuItems.length === 0 ? (
              <div className="text-center py-20">
                <FaBox className="text-6xl text-espresso-700 mx-auto mb-4" />
                <p className="text-cream-50/50 text-lg">No menu items yet.</p>
              </div>
            ) : (
              <div className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-espresso-950/80 border-b border-espresso-800/40">
                        {["#", "Image", "Name", "Type", "Category", "Price", "Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-4 text-sm font-semibold text-cream-50/60 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item, i) => (
                        <tr key={item._id || item.id}
                          className="border-b border-espresso-800/20 hover:bg-espresso-800/30 transition-colors">
                          <td className="px-5 py-4 text-cream-50/60 text-sm">{i + 1}</td>
                          <td className="px-5 py-4">
                            {item.image ? (
                              <img src={`${API}${item.image}`} alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-espresso-700/40"
                                onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-espresso-800/60 flex items-center justify-center">
                                <FaImage className="text-espresso-600" />
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 font-semibold text-cream-50">{item.name}</td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              item.type === "food" ? "bg-gold-500/20 text-gold-400" : "bg-cream-500/20 text-cream-400"
                            }`}>{item.type}</span>
                          </td>
                          <td className="px-5 py-4 text-cream-50/70 text-sm capitalize">{item.category}</td>
                          <td className="px-5 py-4 font-bold text-gold-400">{item.currency} {item.price}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(item)}
                                className="p-2.5 rounded-xl bg-gold-500/15 text-gold-400 hover:bg-gold-500/30 transition-all"><FaEdit /></button>
                              <button onClick={() => handleDelete(item._id || item.id)}
                                className="p-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-all"><FaTrash /></button>
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
        )}

        {tab === "categories" && (
          <div className="animate-fade-in max-w-2xl">
            <div className="bg-espresso-900/60 border border-espresso-800/40 rounded-2xl p-8 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-cream-50 flex items-center gap-3">
                  <FaFolderOpen className="text-gold-400" /> Categories
                </h2>
                <button onClick={() => setShowCatModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold rounded-lg text-sm hover:bg-gold-500/20 transition-all">
                  <FaPlus size={12} /> Add Category
                </button>
              </div>

              {categories.length === 0 ? (
                <p className="text-cream-50/40 text-center py-10">No categories yet. Create your first category!</p>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat._id} className="flex items-center justify-between bg-espresso-950/50 rounded-xl px-4 py-3 border border-espresso-700/20">
                      <div className="flex items-center gap-3">
                        <FaFolderPlus className="text-gold-400 text-sm" />
                        <div>
                          <span className="text-cream-50 font-semibold text-sm">{cat.label}</span>
                          <span className="text-cream-400/40 text-xs ml-2">({cat.name})</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat._id)}
                        className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCatModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCatModal(false)}>
            <div className="bg-espresso-900 rounded-2xl p-6 border border-espresso-700/50 shadow-2xl w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-cream-50 flex items-center gap-2">
                  <FaFolderPlus className="text-gold-400" /> New Category
                </h3>
                <button onClick={() => setShowCatModal(false)}
                  className="p-1.5 rounded-lg text-cream-400/60 hover:text-cream-50 hover:bg-espresso-800/50 transition-all">
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-cream-400/60 text-xs mb-1.5">Name (slug)</label>
                  <input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                    placeholder="e.g. special-coffee" maxLength={30}
                    className="w-full px-4 py-2.5 bg-espresso-950/80 border border-espresso-700/50 rounded-xl text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
                </div>
                <div>
                  <label className="block text-cream-400/60 text-xs mb-1.5">Label (display name)</label>
                  <input type="text" value={catForm.label} onChange={e => setCatForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Special Coffee" maxLength={30}
                    className="w-full px-4 py-2.5 bg-espresso-950/80 border border-espresso-700/50 rounded-xl text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => { setShowCatModal(false); setCatForm({ name: "", label: "" }); }}
                    className="px-4 py-2 text-cream-400/60 text-sm hover:text-cream-50 transition-all">Cancel</button>
                  <button onClick={handleAddCategory} disabled={catLoading}
                    className="px-5 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 disabled:opacity-50 flex items-center gap-2">
                    {catLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
