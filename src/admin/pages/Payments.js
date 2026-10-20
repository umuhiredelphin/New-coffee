import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaFilter, FaEye, FaMobileAlt, FaPhone, FaQrcode, FaUser, FaCopy, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://localhost:5000";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/api/admin/payments`),
        axios.get(`${API}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      ]);
      setPayments(paymentsRes.data.payments || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatAmount = (amount) => (amount || 0).toLocaleString() + " RWF";

  const getPaymentIcon = (method) => {
    switch (method) {
      case "momo_phone": return <FaPhone className="text-purple-400" />;
      case "momo_code": return <FaQrcode className="text-emerald-400" />;
      case "MoMo": return <FaMobileAlt className="text-purple-400" />;
      default: return <FaMoneyBillWave className="text-blue-400" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "momo_phone": return "MoMo Phone";
      case "momo_code": return "Merchant Code";
      case "MoMo": return "Mobile Money";
      case "Cash": return "Cash on Delivery";
      case "Pesapal": return "Pesapal";
      default: return method || "Unknown";
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "momo_phone": return "bg-purple-500/15 text-purple-400";
      case "momo_code": return "bg-emerald-500/15 text-emerald-400";
      case "MoMo": return "bg-purple-500/15 text-purple-400";
      default: return "bg-blue-500/15 text-blue-400";
    }
  };

  const allRecords = [
    ...payments.map(p => ({
      ...p,
      source: "payment",
      displayId: p._id?.toString().slice(-6),
      displayCustomer: p.customerName || p.description || "N/A",
      displayAmount: p.amount,
      displayMethod: p.paymentMethod,
      displayStatus: p.status,
      displayDate: p.createdAt,
      displayTransactionId: p.transaction_id || p.tx_ref || "N/A",
      displayPhone: p.phoneNumber || "N/A",
    })),
    ...orders.filter(o => o.paymentMethod !== "Cash").map(o => ({
      ...o,
      source: "order",
      displayId: o.id?.toString().slice(-6),
      displayCustomer: o.buyerName || "N/A",
      displayAmount: o.total,
      displayMethod: o.paymentMethod,
      displayStatus: o.status === "paid" ? "completed" : o.status,
      displayDate: o.createdAt,
      displayTransactionId: o.id?.toString() || "N/A",
      displayPhone: "N/A",
    }))
  ].sort((a, b) => new Date(b.displayDate || 0) - new Date(a.displayDate || 0));

  const filteredRecords = allRecords.filter(p => {
    const matchesSearch = (p.displayCustomer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.displayId?.includes(searchTerm) ||
      p.displayTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterStatus !== "all" && p.displayStatus !== filterStatus) return false;
    if (filterType !== "all" && p.displayMethod !== filterType) return false;
    return matchesSearch;
  });

  const totalAmount = allRecords.reduce((sum, p) => sum + (p.displayAmount || 0), 0);
  const completedAmount = allRecords.filter(p => p.displayStatus === "completed" || p.displayStatus === "paid").reduce((sum, p) => sum + (p.displayAmount || 0), 0);
  const pendingAmount = allRecords.filter(p => p.displayStatus === "pending").reduce((sum, p) => sum + (p.displayAmount || 0), 0);
  const momoPhoneCount = allRecords.filter(p => p.displayMethod === "momo_phone").length;
  const momoCodeCount = allRecords.filter(p => p.displayMethod === "momo_code").length;
  const completedCount = allRecords.filter(p => p.displayStatus === "completed" || p.displayStatus === "paid").length;

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <ToastContainer theme="dark" />
      <Sidebar />
      <div className="ml-60 flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
            <FaMoneyBillWave className="text-2xl text-espresso-950" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cream-50">Payment Management</h1>
            <p className="text-cream-50/40 text-sm mt-0.5">Track all Mobile Money and order payments</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Completed</p>
                <p className="text-xl font-bold mt-1">{formatAmount(completedAmount)}</p>
                <p className="text-white/50 text-xs mt-0.5">{completedCount} payments</p>
              </div>
              <div className="p-3 rounded-lg bg-white/15"><FaCheckCircle className="text-xl" /></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold mt-1">{formatAmount(pendingAmount)}</p>
                <p className="text-white/50 text-xs mt-0.5">{allRecords.filter(p => p.displayStatus === "pending").length} payments</p>
              </div>
              <div className="p-3 rounded-lg bg-white/15"><FaClock className="text-xl" /></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-xl font-bold mt-1">{formatAmount(totalAmount)}</p>
                <p className="text-white/50 text-xs mt-0.5">{allRecords.length} records</p>
              </div>
              <div className="p-3 rounded-lg bg-white/15"><FaMoneyBillWave className="text-xl" /></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">MoMo Phone</p>
                <p className="text-xl font-bold mt-1">{momoPhoneCount}</p>
                <p className="text-white/50 text-xs mt-0.5">Push payments</p>
              </div>
              <div className="p-3 rounded-lg bg-white/15"><FaPhone className="text-xl" /></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Merchant Code</p>
                <p className="text-xl font-bold mt-1">{momoCodeCount}</p>
                <p className="text-white/50 text-xs mt-0.5">USSD payments</p>
              </div>
              <div className="p-3 rounded-lg bg-white/15"><FaQrcode className="text-xl" /></div>
            </div>
          </div>
        </div>

        <div className="bg-espresso-800/40 rounded-xl p-5 mb-6 border border-espresso-700/40">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-50/30" />
              <input type="text" placeholder="Search by customer, order ID or transaction..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-espresso-900/60 border border-espresso-700/40 text-cream-50 placeholder-cream-50/30 focus:outline-none focus:border-gold-400/50 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-cream-50/30 text-sm" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-espresso-900/60 border border-espresso-700/40 text-cream-50 text-sm focus:outline-none focus:border-gold-400/50">
                <option value="all" className="bg-espresso-900">All Methods</option>
                <option value="momo_phone" className="bg-espresso-900">MoMo Phone</option>
                <option value="momo_code" className="bg-espresso-900">Merchant Code</option>
                <option value="MoMo" className="bg-espresso-900">Mobile Money</option>
                <option value="Pesapal" className="bg-espresso-900">Pesapal</option>
                <option value="Cash" className="bg-espresso-900">Cash on Delivery</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-espresso-900/60 border border-espresso-700/40 text-cream-50 text-sm focus:outline-none focus:border-gold-400/50">
                <option value="all" className="bg-espresso-900">All Status</option>
                <option value="completed" className="bg-espresso-900">Completed</option>
                <option value="pending" className="bg-espresso-900">Pending</option>
                <option value="failed" className="bg-espresso-900">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
            <p className="mt-4 text-cream-50/50 text-sm animate-pulse">Loading payments...</p>
          </div>
        ) : (
          <div className="bg-espresso-800/40 rounded-xl border border-espresso-700/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-espresso-900/40">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Method</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Date</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-cream-50/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-700/30">
                  {filteredRecords.length > 0 ? filteredRecords.map((payment, idx) => (
                    <tr key={idx} className="hover:bg-espresso-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-cream-50 font-mono text-xs">#{payment.displayId}</td>
                      <td className="px-6 py-4 text-cream-50/80">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-cream-500/40" size={10} />
                          <span>{payment.displayCustomer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-cream-50/50 text-xs font-mono">{payment.displayPhone}</td>
                      <td className="px-6 py-4 font-bold text-gold-400 text-sm">{formatAmount(payment.displayAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.displayMethod)}`}>
                          {getPaymentIcon(payment.displayMethod)} {getPaymentMethodLabel(payment.displayMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          payment.displayStatus === "completed" || payment.displayStatus === "paid"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : payment.displayStatus === "failed" || payment.displayStatus === "cancelled"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-gold-500/15 text-gold-400"
                        }`}>{payment.displayStatus}</span>
                      </td>
                      <td className="px-6 py-4 text-cream-50/40 text-xs">
                        {payment.displayDate ? new Date(payment.displayDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setSelectedPayment(payment)}
                          className="px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 text-xs font-semibold hover:bg-gold-400/20 transition-all">
                          <FaEye className="inline mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" className="px-6 py-12 text-center text-cream-50/40">No payments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-espresso-800 rounded-xl shadow-2xl w-full max-w-lg border border-espresso-700/40 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-espresso-700/40 flex items-center justify-between">
              <h3 className="text-lg font-bold text-cream-50">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-cream-50/50 hover:text-cream-50 transition-colors">
                <FaTimesCircle />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Payment ID</span>
                <span className="font-semibold text-cream-50 font-mono text-xs">#{selectedPayment.displayId}</span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Customer</span>
                <span className="font-semibold text-cream-50">{selectedPayment.displayCustomer}</span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Phone</span>
                <span className="font-semibold text-cream-50 font-mono">{selectedPayment.displayPhone}</span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Amount</span>
                <span className="font-bold text-gold-400 text-lg">{formatAmount(selectedPayment.displayAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Method</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(selectedPayment.displayMethod)}`}>
                  {getPaymentIcon(selectedPayment.displayMethod)} {getPaymentMethodLabel(selectedPayment.displayMethod)}
                </span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Transaction ID</span>
                <span className="font-semibold text-cream-50 font-mono text-xs">{selectedPayment.displayTransactionId}</span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedPayment.displayStatus === "completed" || selectedPayment.displayStatus === "paid"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : selectedPayment.displayStatus === "failed" || selectedPayment.displayStatus === "cancelled"
                    ? "bg-red-500/15 text-red-400"
                    : "bg-gold-500/15 text-gold-400"
                }`}>{selectedPayment.displayStatus}</span>
              </div>
              <div className="flex justify-between border-b border-espresso-700/30 pb-2">
                <span className="text-cream-50/50 text-sm">Date</span>
                <span className="font-semibold text-cream-50 text-xs">
                  {selectedPayment.displayDate ? new Date(selectedPayment.displayDate).toLocaleString() : "N/A"}
                </span>
              </div>
              {selectedPayment.orderItems && selectedPayment.orderItems.length > 0 && (
                <div>
                  <p className="text-cream-50/50 text-sm mb-2 font-medium">Items:</p>
                  <div className="bg-espresso-900/60 rounded-lg p-3 space-y-1.5 border border-espresso-700/30">
                    {selectedPayment.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-cream-50/70">{item.name} x{item.quantity}</span>
                        <span className="font-medium text-cream-50">{((item.price || 0) * item.quantity).toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedPayment.source === "order" && selectedPayment.items && selectedPayment.items.length > 0 && (
                <div>
                  <p className="text-cream-50/50 text-sm mb-2 font-medium">Items:</p>
                  <div className="bg-espresso-900/60 rounded-lg p-3 space-y-1.5 border border-espresso-700/30">
                    {selectedPayment.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-cream-50/70">{item.name || item.foodName} x{item.quantity}</span>
                        <span className="font-medium text-cream-50">{((item.price || 0) * item.quantity).toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
