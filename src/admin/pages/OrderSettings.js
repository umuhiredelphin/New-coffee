import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { FaCog, FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaTag, FaMoneyBillWave, FaMotorcycle, FaSave, FaSpinner } from "react-icons/fa";

const API = "http://localhost:5000";

export default function OrderSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [promoForm, setPromoForm] = useState({ code: "", type: "percentage", value: "" });
  const [showPromoForm, setShowPromoForm] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/order-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data.data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); localStorage.removeItem("token");
    localStorage.removeItem("admin"); localStorage.removeItem("cart");
    navigate("/");
  };

  const addPromoCode = () => {
    const code = promoForm.code.trim().toUpperCase();
    if (!code) { showToast("Enter a promo code", "error"); return; }
    const val = parseFloat(promoForm.value);
    if (!val || val <= 0) { showToast("Enter a valid value", "error"); return; }
    if (promoForm.type === "percentage" && val > 100) { showToast("Percentage cannot exceed 100", "error"); return; }
    setSettings(prev => {
      if (prev.promoCodes.find(p => p.code === code)) {
        showToast("Code already exists", "error");
        return prev;
      }
      return { ...prev, promoCodes: [...prev.promoCodes, { code, type: promoForm.type, value: val, isEnabled: true }] };
    });
    setPromoForm({ code: "", type: "percentage", value: "" });
    setShowPromoForm(false);
  };

  const removePromoCode = (code) => {
    setSettings(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.filter(p => p.code !== code)
    }));
  };

  const togglePromoCode = (code) => {
    setSettings(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.map(p =>
        p.code === code ? { ...p, isEnabled: !p.isEnabled } : p
      )
    }));
  };

  const togglePaymentMethod = (method) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(pm =>
        pm.method === method ? { ...pm, isEnabled: !pm.isEnabled } : pm
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/order-settings`, {
        promoCodes: settings.promoCodes,
        paymentMethods: settings.paymentMethods,
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Settings saved successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex h-screen bg-espresso-950">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const pCodes = settings.promoCodes || [];
  const pMethods = settings.paymentMethods || [];

  return (
    <div className="flex h-screen bg-espresso-950 font-poppins">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <Header title="Order Settings" onLogout={handleLogout} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
                <FaCog className="text-xl text-espresso-950" />
              </div>
              <div>
                <h1 className="text-2xl font-playfair font-bold text-cream-50">Order Settings</h1>
                <p className="text-cream-400/50 text-sm">Configure promo codes, payment methods, and delivery</p>
              </div>
            </div>

            {/* Promo Codes */}
            <div className="bg-espresso-900/60 backdrop-blur-sm rounded-xl border border-espresso-700/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaTag className="text-gold-400" />
                  <h2 className="text-cream-50 font-bold text-base">Promo Codes</h2>
                </div>
                <button onClick={() => setShowPromoForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold rounded-lg text-xs hover:bg-gold-500/20 transition-all">
                  <FaPlus size={10} /> Add Code
                </button>
              </div>

              {showPromoForm && (
                <div className="bg-espresso-950/60 rounded-lg p-4 border border-espresso-700/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">Code</label>
                      <input type="text" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SUMMER20" maxLength={20}
                        className="w-full px-3 py-2 bg-espresso-950/80 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50" />
                    </div>
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">Type</label>
                      <select value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-espresso-950/80 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (RWF)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">{promoForm.type === "percentage" ? "Percentage" : "Amount (RWF)"}</label>
                      <input type="number" value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))}
                        placeholder={promoForm.type === "percentage" ? "e.g. 20" : "e.g. 1000"} min={1}
                        className="w-full px-3 py-2 bg-espresso-950/80 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setShowPromoForm(false); setPromoForm({ code: "", type: "percentage", value: "" }); }}
                      className="px-3 py-1.5 text-cream-400/60 text-sm hover:text-cream-50 transition-all">Cancel</button>
                    <button onClick={addPromoCode}
                      className="px-4 py-1.5 bg-gold-500 text-espresso-950 font-semibold rounded-lg text-sm hover:bg-gold-400 transition-all">Add</button>
                  </div>
                </div>
              )}

              {pCodes.length === 0 ? (
                <p className="text-cream-400/40 text-sm text-center py-4">No promo codes configured</p>
              ) : (
                <div className="space-y-2">
                  {pCodes.map((promo) => (
                    <div key={promo.code} className="flex items-center justify-between bg-espresso-950/40 rounded-lg px-4 py-3 border border-espresso-700/20">
                      <div className="flex items-center gap-3">
                        <FaTag className={`text-xs ${promo.isEnabled ? 'text-gold-400' : 'text-espresso-600'}`} />
                        <div>
                          <span className={`font-mono font-bold text-sm ${promo.isEnabled ? 'text-cream-50' : 'text-espresso-500'}`}>
                            {promo.code}
                          </span>
                          <span className="ml-3 text-xs text-cream-400/60">
                            {promo.type === "percentage" ? `${promo.value}% OFF` : `${promo.value.toLocaleString()} RWF OFF`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePromoCode(promo.code)}
                          className={`p-1.5 rounded-lg transition-all ${promo.isEnabled ? 'text-green-400 hover:bg-green-500/10' : 'text-espresso-600 hover:bg-espresso-700/30'}`}
                          title={promo.isEnabled ? "Disable" : "Enable"}>
                          {promo.isEnabled ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                        </button>
                        <button onClick={() => removePromoCode(promo.code)}
                          className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-espresso-900/60 backdrop-blur-sm rounded-xl border border-espresso-700/30 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-gold-400" />
                <h2 className="text-cream-50 font-bold text-base">Payment Methods</h2>
              </div>
              <div className="space-y-2">
                {pMethods.map((pm) => (
                  <div key={pm.method} className="flex items-center justify-between bg-espresso-950/40 rounded-lg px-4 py-3 border border-espresso-700/20">
                    <div className="flex items-center gap-3">
                      <FaMoneyBillWave className={`text-sm ${pm.isEnabled ? 'text-gold-400' : 'text-espresso-600'}`} />
                      <span className={`text-sm font-medium ${pm.isEnabled ? 'text-cream-50' : 'text-espresso-500'}`}>
                        {pm.method === "momo" ? "Mobile Money (MTN / Airtel)" : "Cash on Delivery"}
                      </span>
                    </div>
                    <button onClick={() => togglePaymentMethod(pm.method)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        pm.isEnabled
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-espresso-800/50 text-espresso-500 border border-espresso-700/30'
                      }`}>
                      {pm.isEnabled ? <><FaToggleOn size={14} /> Enabled</> : <><FaToggleOff size={14} /> Disabled</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="bg-espresso-900/60 backdrop-blur-sm rounded-xl border border-espresso-700/30 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FaMotorcycle className="text-gold-400" />
                <h2 className="text-cream-50 font-bold text-base">Delivery Settings</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream-400/60 text-xs mb-1.5">Delivery Fee (RWF)</label>
                  <input type="number" value={settings.deliveryFee} onChange={e => setSettings(prev => ({ ...prev, deliveryFee: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min={0} className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
                  <p className="text-cream-400/30 text-[10px] mt-1">Flat delivery fee charged per order</p>
                </div>
                <div>
                  <label className="block text-cream-400/60 text-xs mb-1.5">Free Delivery Threshold (RWF)</label>
                  <input type="number" value={settings.freeDeliveryThreshold} onChange={e => setSettings(prev => ({ ...prev, freeDeliveryThreshold: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min={0} className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400/50 transition-all" />
                  <p className="text-cream-400/30 text-[10px] mt-1">Orders above this amount get free delivery</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
                {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Settings</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[99999] px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all animate-fade-in ${
          toast.type === "error" ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
