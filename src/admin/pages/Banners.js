import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import {
  FaImage, FaPlus, FaTrash, FaEdit, FaEye, FaEyeSlash,
  FaArrowUp, FaArrowDown, FaTimes, FaPalette, FaCalendarAlt,
  FaVideo, FaFont, FaTextHeight, FaPaintBrush, FaPlusCircle
} from "react-icons/fa";

const API = "http://localhost:5000";

const initialText = { content: "", font: "font-playfair", size: "text-lg", color: "#ffffff", x: 10, y: 10 };

const initialForm = {
  title: "", subtitle: "", description: "", discountText: "",
  buttonText: "Order Now", buttonLink: "/menu",
  mediaType: "image",
  media: "",
  overlayColor: "from-espresso-950/90 via-espresso-950/40 to-transparent",
  position: "home",
  priority: 0,
  startDate: "",
  endDate: "",
  texts: [],
};

export default function Banners() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileRef = useRef(null);

  const fetchBanners = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleLogout = () => {
    localStorage.removeItem("user"); localStorage.removeItem("token");
    localStorage.removeItem("admin"); localStorage.removeItem("cart");
    navigate("/");
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("video/")) {
      setForm(prev => ({ ...prev, mediaType: "video" }));
    } else if (f.type.startsWith("image/")) {
      setForm(prev => ({ ...prev, mediaType: "image" }));
    } else {
      alert("Please select an image or video file");
      setFile(null);
      return;
    }
    const r = new FileReader();
    r.onloadend = () => setPreviewUrl(r.result);
    r.readAsDataURL(f);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setFile(null);
    setPreviewUrl(null);
    setPreviewMode(false);
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditing(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      discountText: banner.discountText || "",
      buttonText: banner.buttonText || "Order Now",
      buttonLink: banner.buttonLink || "/menu",
      mediaType: banner.mediaType || "image",
      media: banner.media || "",
      overlayColor: banner.overlayColor || "from-espresso-950/90 via-espresso-950/40 to-transparent",
      position: banner.position || "home",
      priority: banner.priority ?? 0,
      startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
      endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
      texts: (banner.texts || []).length > 0 ? banner.texts : [],
    });
    setFile(null);
    setPreviewUrl(banner.media ? `${API}${banner.media}` : null);
    setPreviewMode(false);
    setShowModal(true);
  };

  const addText = () => {
    setForm(prev => ({ ...prev, texts: [...prev.texts, { ...initialText }] }));
  };

  const updateText = (index, field, value) => {
    setForm(prev => {
      const texts = [...prev.texts];
      texts[index] = { ...texts[index], [field]: value };
      return { ...prev, texts };
    });
  };

  const removeText = (index) => {
    setForm(prev => ({ ...prev, texts: prev.texts.filter((_, i) => i !== index) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!file && !editing) { alert("Please select an image or video"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("subtitle", form.subtitle);
      fd.append("description", form.description);
      fd.append("discountText", form.discountText);
      fd.append("buttonText", form.buttonText);
      fd.append("buttonLink", form.buttonLink);
      fd.append("mediaType", form.mediaType);
      fd.append("overlayColor", form.overlayColor);
      fd.append("position", form.position);
      fd.append("priority", form.priority);
      fd.append("startDate", form.startDate || "");
      fd.append("endDate", form.endDate || "");
      fd.append("texts", JSON.stringify(form.texts));
      if (file) fd.append("media", file);

      if (editing) {
        const res = await axios.put(`${API}/api/admin/banners/${editing}`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          setBanners(prev => prev.map(b => b._id === editing ? res.data.data : b));
        }
      } else {
        const res = await axios.post(`${API}/api/admin/banners`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) setBanners(prev => [...prev, res.data.data]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`${API}/api/admin/banners/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBanners(prev => prev.map(b => b._id === id ? { ...b, isEnabled: !b.isEnabled } : b));
      }
    } catch (err) {
      console.error("Failed to toggle banner:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error("Failed to delete banner:", err);
    }
  };

  const moveBanner = async (index, dir) => {
    const newBanners = [...banners];
    const target = index + dir;
    if (target < 0 || target >= newBanners.length) return;
    [newBanners[index], newBanners[target]] = [newBanners[target], newBanners[index]];
    setBanners(newBanners);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/banners/reorder`, { ids: newBanners.map(b => b._id) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { /* ignore */ }
  };

  const inputCls = "w-full px-3 py-2 bg-espresso-950/50 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all";

  const fonts = [
    { value: "font-playfair", label: "Playfair" },
    { value: "font-poppins", label: "Poppins" },
    { value: "font-mono", label: "Monospace" },
    { value: "font-sans", label: "Sans" },
  ];

  const sizes = [
    { value: "text-sm", label: "Small" },
    { value: "text-base", label: "Medium" },
    { value: "text-lg", label: "Large" },
    { value: "text-xl", label: "XLarge" },
    { value: "text-2xl", label: "2XLarge" },
    { value: "text-3xl", label: "3XLarge" },
    { value: "text-4xl", label: "4XLarge" },
  ];

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header onLogout={handleLogout} title="Banner Management" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
                <FaImage className="text-2xl text-espresso-950" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cream-50">Banner Management</h1>
                <p className="text-cream-50/40 text-sm mt-0.5">{banners.length} banners</p>
              </div>
            </div>
            <button onClick={openAdd}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-gold-500/30 transition-all">
              <FaPlus /> Add Banner
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-20 bg-espresso-900/40 rounded-xl border border-espresso-800/20">
              <FaImage className="text-5xl text-espresso-600 mx-auto mb-4" />
              <p className="text-cream-400/60 text-sm">No banners yet. Click "Add Banner" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {banners.map((banner, idx) => (
                <div key={banner._id}
                  className={`bg-espresso-900/60 backdrop-blur-sm rounded-xl border overflow-hidden transition-all duration-200 ${
                    banner.isEnabled ? 'border-espresso-700/30' : 'border-espresso-700/10 opacity-60'
                  }`}>
                  <div className="relative h-40 bg-espresso-950">
                    {banner.media ? (
                      banner.mediaType === "video" ? (
                        <video src={`${API}${banner.media}`} muted autoPlay loop
                          className="w-full h-full object-cover" />
                      ) : (
                        <img src={`${API}${banner.media}`} alt="Banner"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-espresso-600">
                        <FaImage size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      {(banner.texts || []).filter(t => t.content).slice(0, 2).map((t, i) => (
                        <p key={i} className={`text-cream-50 text-xs truncate ${t.font}`} style={{ color: t.color }}>
                          {t.content}
                        </p>
                      ))}
                    </div>
                    {banner.mediaType === "video" && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] flex items-center gap-1">
                        <FaVideo size={8} /> Video
                      </span>
                    )}
                    <button onClick={() => handleToggle(banner._id)}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                        banner.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-espresso-700/50 text-cream-500'
                      }`} title={banner.isEnabled ? 'Disable' : 'Enable'}>
                      {banner.isEnabled ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
                    </button>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-cream-500/60">
                      <span className="px-1.5 py-0.5 rounded bg-espresso-800/50 capitalize">{banner.position}</span>
                      <span className="ml-auto">Priority: {banner.priority}</span>
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={() => moveBanner(idx, -1)} disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-espresso-800/50 text-cream-400 hover:text-gold-400 disabled:opacity-30 transition-all">
                        <FaArrowUp size={11} />
                      </button>
                      <button onClick={() => moveBanner(idx, 1)} disabled={idx === banners.length - 1}
                        className="p-1.5 rounded-lg bg-espresso-800/50 text-cream-400 hover:text-gold-400 disabled:opacity-30 transition-all">
                        <FaArrowDown size={11} />
                      </button>
                      <button onClick={() => openEdit(banner)}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                        <FaEdit size={11} />
                      </button>
                      <button onClick={() => handleDelete(banner._id)}
                        className="ml-auto p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-espresso-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-espresso-700/50 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-espresso-800 sticky top-0 bg-espresso-900 z-10">
                  <h2 className="text-lg font-playfair font-bold text-cream-50">
                    {editing ? "Edit Banner" : "Add New Banner"}
                  </h2>
                  <button onClick={() => setShowModal(false)}
                    className="p-1.5 rounded-lg text-cream-400 hover:text-gold-400 hover:bg-espresso-800 transition-all">
                    <FaTimes size={16} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                  {/* Media Upload */}
                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-2">Image or Video</label>
                    <div className="flex items-center gap-4">
                      <div className="w-36 h-24 rounded-xl overflow-hidden bg-espresso-950 border border-espresso-700/50 flex items-center justify-center flex-shrink-0">
                        {previewUrl ? (
                          form.mediaType === "video" ? (
                            <video src={previewUrl} muted autoPlay loop className="w-full h-full object-cover" />
                          ) : (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <FaImage className="text-espresso-600 text-3xl" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input type="file" ref={fileRef} onChange={handleFile} accept="image/*,video/*" className="hidden" />
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="px-4 py-2 rounded-lg bg-espresso-800/50 border border-espresso-700/50 text-cream-50 text-sm hover:border-gold-400/50 transition-all">
                          {file || previewUrl ? "Change File" : "Choose File"}
                        </button>
                        {file && <p className="text-[10px] text-cream-400/50 mt-1">{file.name}</p>}
                        <p className="text-[10px] text-cream-500/30 mt-1">Supports JPG, PNG, MP4, WebM</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Title</label>
                      <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Fresh Coffee Delivered Daily"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Subtitle</label>
                      <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                        placeholder="Get 20% OFF This Week"
                        className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Short description for the banner"
                      rows={2} className={inputCls + " resize-none"} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Discount Text</label>
                      <input type="text" value={form.discountText} onChange={e => setForm(f => ({ ...f, discountText: e.target.value }))}
                        placeholder="20% OFF" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Button Text</label>
                      <input type="text" value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                        placeholder="Order Now" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Button Link</label>
                    <input type="text" value={form.buttonLink} onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))}
                      placeholder="/menu" className={inputCls} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Position</label>
                      <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                        className={inputCls}>
                        <option value="home">Home</option>
                        <option value="promo">Promo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5">Priority (Order)</label>
                      <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                        min="0" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1">
                        <FaCalendarAlt size={10} /> Start Date
                      </label>
                      <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1">
                        <FaCalendarAlt size={10} /> End Date
                      </label>
                      <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                        className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1">
                      <FaPalette size={10} /> Overlay Color (Tailwind gradient class)
                    </label>
                    <input type="text" value={form.overlayColor} onChange={e => setForm(f => ({ ...f, overlayColor: e.target.value }))}
                      placeholder="from-espresso-950/80 via-espresso-950/40 to-transparent"
                      className={inputCls} />
                  </div>

                  {/* Text Overlays */}
                  <div className="border border-espresso-700/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-cream-50 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <FaFont size={10} /> Text Overlays
                      </h4>
                      <button type="button" onClick={addText}
                        className="text-xs text-gold-400 flex items-center gap-1 hover:text-gold-300 transition-all">
                        <FaPlusCircle size={10} /> Add Text
                      </button>
                    </div>

                    {form.texts.length === 0 && (
                      <p className="text-cream-500/40 text-xs text-center py-3">No text added. Click "Add Text" to overlay text on the banner.</p>
                    )}

                    {form.texts.map((text, i) => (
                      <div key={i} className="bg-espresso-950/40 rounded-lg p-3 space-y-2 border border-espresso-700/20">
                        <div className="flex items-center justify-between">
                          <span className="text-cream-400/60 text-[10px] uppercase">Text {i + 1}</span>
                          <button type="button" onClick={() => removeText(i)}
                            className="text-red-400 hover:text-red-300 transition-all">
                            <FaTimes size={10} />
                          </button>
                        </div>
                        <input type="text" value={text.content} onChange={e => updateText(i, "content", e.target.value)}
                          placeholder="Enter text to display on banner"
                          className={inputCls + " text-sm"} />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-cream-500/60 mb-1 flex items-center gap-1">
                              <FaFont size={8} /> Font
                            </label>
                            <select value={text.font} onChange={e => updateText(i, "font", e.target.value)}
                              className={inputCls + " text-xs"}>
                              {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-cream-500/60 mb-1 flex items-center gap-1">
                              <FaTextHeight size={8} /> Size
                            </label>
                            <select value={text.size} onChange={e => updateText(i, "size", e.target.value)}
                              className={inputCls + " text-xs"}>
                              {sizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-cream-500/60 mb-1 flex items-center gap-1">
                              <FaPaintBrush size={8} /> Color
                            </label>
                            <input type="color" value={text.color || "#ffffff"} onChange={e => updateText(i, "color", e.target.value)}
                              className="w-full h-8 rounded-lg bg-espresso-950/50 border border-espresso-700/50 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Preview */}
                  <div>
                    <button type="button" onClick={() => setPreviewMode(!previewMode)}
                      className="text-xs text-gold-400 flex items-center gap-1 hover:text-gold-300 transition-all mb-2">
                      <FaEye /> {previewMode ? "Hide Preview" : "Show Preview"}
                    </button>
                    {previewMode && (
                      <div className="relative h-48 rounded-xl overflow-hidden bg-espresso-950 border border-espresso-700/50">
                        {previewUrl ? (
                          form.mediaType === "video" ? (
                            <video src={previewUrl} muted autoPlay loop className="w-full h-full object-cover" />
                          ) : (
                            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-espresso-600 text-xs">No media</div>
                        )}
                        <div className={`absolute inset-0 bg-gradient-to-t ${form.overlayColor}`} />
                        <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
                          {form.title && <h3 className="text-cream-50 font-bold text-sm font-playfair">{form.title}</h3>}
                          {form.subtitle && <p className="text-cream-300/80 text-xs">{form.subtitle}</p>}
                          {form.discountText && <p className="text-gold-400 text-xs font-bold mt-0.5">{form.discountText}</p>}
                          {form.buttonText && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-3 py-1 bg-gold-500 text-espresso-950 font-bold rounded-full text-[10px] w-fit">
                              {form.buttonText}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-espresso-800">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-lg bg-espresso-800/50 border border-espresso-700/50 text-cream-50 text-sm hover:border-gold-400/50 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-gold-500/30 transition-all disabled:opacity-50">
                      {saving ? <><span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FaPlus /> {editing ? "Update Banner" : "Create Banner"}</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}