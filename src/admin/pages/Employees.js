import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { FaUsers, FaPlus, FaTrash, FaTimes, FaEnvelope, FaPhone, FaKey } from "react-icons/fa";

const API = "http://localhost:5000";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleLogout = () => {
    localStorage.removeItem("user"); localStorage.removeItem("token");
    localStorage.removeItem("admin"); localStorage.removeItem("cart");
    navigate("/");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !mobile) { alert("Please fill all fields"); return; }
    setSaving(true);
    setNewCode(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/admin/employees`, { email, mobile }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNewCode(res.data.data.code);
        setEmployees(prev => [...prev, { email, mobile, code: res.data.data.code, isRegistered: false }]);
        setEmail("");
        setMobile("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-espresso-950/50 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all";

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header onLogout={handleLogout} title="Employee Management" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
                <FaUsers className="text-2xl text-espresso-950" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cream-50">Employee Management</h1>
                <p className="text-cream-50/40 text-sm mt-0.5">{employees.length} employees</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-gold-500/30 transition-all">
              <FaPlus /> Register Employee
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-20 bg-espresso-900/40 rounded-xl border border-espresso-800/20">
              <FaUsers className="text-5xl text-espresso-600 mx-auto mb-4" />
              <p className="text-cream-400/60 text-sm">No employees yet. Register one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-espresso-700/30 text-cream-400/60 text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id} className="border-b border-espresso-800/20 hover:bg-espresso-900/40 transition-all">
                      <td className="py-3 px-4 text-cream-50 font-medium">{emp.username || "\u2014"}</td>
                      <td className="py-3 px-4 text-cream-50">{emp.email}</td>
                      <td className="py-3 px-4 text-cream-300/80">{emp.mobile}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gold-400">{emp.code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${emp.isRegistered ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {emp.isRegistered ? "Registered" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDelete(emp._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                          <FaTrash size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Register Modal */}
          {showModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-espresso-900 rounded-2xl w-full max-w-md border border-espresso-700/50 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-espresso-800">
                  <h2 className="text-lg font-playfair font-bold text-cream-50">Register Employee</h2>
                  <button onClick={() => { setShowModal(false); setNewCode(null); }}
                    className="p-1.5 rounded-lg text-cream-400 hover:text-gold-400 hover:bg-espresso-800 transition-all">
                    <FaTimes size={16} />
                  </button>
                </div>

                {newCode ? (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto">
                      <FaKey className="text-gold-400 text-2xl" />
                    </div>
                    <h3 className="text-cream-50 font-bold text-lg">Employee Registered!</h3>
                    <p className="text-cream-400/60 text-sm">Share this code with the employee:</p>
                    <p className="text-3xl font-mono font-bold text-gold-400 tracking-widest">{newCode}</p>
                    <p className="text-cream-400/40 text-xs">They will need it along with their email to complete registration</p>
                    <button onClick={() => { setShowModal(false); setNewCode(null); }}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm">
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1">
                        <FaEnvelope size={10} /> Email Address
                      </label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="employee@example.com" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-50/60 mb-1.5 flex items-center gap-1">
                        <FaPhone size={10} /> Mobile Number
                      </label>
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                        placeholder="078X XXX XXX" required className={inputCls} />
                    </div>
                    <button type="submit" disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-espresso-950 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold-500/30 transition-all disabled:opacity-50">
                      {saving ? <><span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Registering...</> : <><FaPlus /> Register</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}