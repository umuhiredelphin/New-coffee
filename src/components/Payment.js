import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMobileAlt, FaQrcode, FaPhone, FaUser, FaCheckCircle, FaSpinner, FaArrowLeft, FaCoffee, FaShieldAlt, FaClock, FaInfoCircle, FaCamera, FaUpload, FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import mtnGuide from "../assets/mtn.png";

const API = "http://localhost:5000";
const MERCHANT_CODE = process.env.REACT_APP_MERCHANT_CODE || "197443";
const MERCHANT_NAME = process.env.REACT_APP_MERCHANT_NAME || "Brew Haven Coffee";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const state = location.state || {};

  const { orderId, amount: initialAmount, orderType, cartItems } = state;

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amount] = useState(initialAmount || 0);
  const [customerName, setCustomerName] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!orderId && !initialAmount) {
      navigate("/cart");
    }
  }, [orderId, initialAmount, navigate]);

  const handleDialUSSD = () => {
    const ussdCode = `*182#`;
    window.location.href = `tel:${ussdCode}`;
    toast.info("Dial *182# on your phone to pay with MoMo", { position: "top-right", autoClose: 4000, theme: "dark" });
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhonePayment = async () => {
    if (!customerName.trim()) { toast.error("Please enter your name", { theme: "dark" }); return; }
    if (!phoneNumber.trim() || phoneNumber.length < 10) { toast.error("Please enter a valid phone number", { theme: "dark" }); return; }

    setSubmitting(true);
    setPaymentStatus("processing");
    setStatusMessage("Sending payment request...");

    try {
      const res = await axios.post(`${API}/api/payments/momo-phone`, {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        amount,
        orderItems: cartItems || []
      });

      if (res.data.success) {
        setPaymentId(res.data.data.paymentId);
        setStatusMessage("Check your phone to complete payment");
        setPaymentStatus("pending");

        setTimeout(async () => {
          try {
            const verifyRes = await axios.post(`${API}/api/payments/verify`, {
              paymentId: res.data.data.paymentId
            });
            if (verifyRes.data.success) {
              setPaymentStatus("completed");
              setStatusMessage("Payment successful \u2615");
              toast.success("Payment completed successfully!", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark"
              });
              setShowModal(true);
            }
          } catch {
            setPaymentStatus("failed");
            setStatusMessage("Payment verification failed");
          }
        }, 4000);
      }
    } catch (err) {
      setPaymentStatus("failed");
      setStatusMessage(err.response?.data?.message || "Payment failed. Please try again.");
      toast.error(err.response?.data?.message || "Payment failed", { theme: "dark" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodePayment = async () => {
    if (!transactionId.trim()) { toast.error("Please enter your transaction ID", { theme: "dark" }); return; }

    setSubmitting(true);
    setPaymentStatus("processing");
    setStatusMessage("Verifying payment...");

    try {
      const res = await axios.post(`${API}/api/payments/momo-code`, {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        amount,
        transactionId: transactionId.trim(),
        orderItems: cartItems || []
      });

      if (res.data.success) {
        setPaymentId(res.data.data.paymentId);

        const verifyRes = await axios.post(`${API}/api/payments/verify`, {
          paymentId: res.data.data.paymentId
        });

        if (verifyRes.data.success) {
          setPaymentStatus("completed");
          setStatusMessage("Payment verified successfully \u2615");
          toast.success("Payment verified!", { position: "top-right", autoClose: 3000, theme: "dark" });
          setShowModal(true);
        }
      }
    } catch (err) {
      setPaymentStatus("failed");
      setStatusMessage(err.response?.data?.message || "Verification failed. Please try again.");
      toast.error(err.response?.data?.message || "Verification failed", { theme: "dark" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/orderhistory");
  };

  const formatCurrency = (n) => (n?.toLocaleString?.() || n || 0) + " RWF";

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gold-500/20">
          <FaMobileAlt className="text-2xl text-espresso-950" />
        </div>
        <h3 className="text-cream-50 font-bold text-lg">Choose Payment Method</h3>
        <p className="text-cream-400/50 text-xs mt-1">Select how you'd like to pay with Mobile Money</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button onClick={() => setPaymentMethod("phone")}
          className="group relative p-5 rounded-xl border border-espresso-700/30 bg-espresso-900/40 hover:bg-espresso-900/60 hover:border-gold-500/30 transition-all text-left">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaArrowRight className="text-gold-400 text-xs" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-3 border border-purple-500/10">
            <FaPhone className="text-purple-400 text-lg" />
          </div>
          <h4 className="text-cream-50 font-semibold text-sm mb-1">Pay with Phone</h4>
          <p className="text-cream-400/50 text-xs leading-relaxed">
            Get a payment request sent directly to your phone. Confirm with your MoMo PIN.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-purple-400/60 text-[10px]">
            <FaShieldAlt size={8} /> MoMo Push Request
          </div>
        </button>

        <button onClick={() => setPaymentMethod("code")}
          className="group relative p-5 rounded-xl border border-espresso-700/30 bg-espresso-900/40 hover:bg-espresso-900/60 hover:border-gold-500/30 transition-all text-left">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaArrowRight className="text-gold-400 text-xs" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mb-3 border border-emerald-500/10">
            <FaQrcode className="text-emerald-400 text-lg" />
          </div>
          <h4 className="text-cream-50 font-semibold text-sm mb-1">Merchant Code</h4>
          <p className="text-cream-400/50 text-xs leading-relaxed">
            Dial the merchant USSD code, enter amount, and submit your transaction ID.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-emerald-400/60 text-[10px]">
            <FaShieldAlt size={8} /> USSD Payment
          </div>
        </button>
      </div>

      <div className="bg-espresso-900/30 rounded-xl p-4 border border-espresso-700/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream-400/60">Total Amount</span>
          <span className="text-gold-400 font-bold text-lg tabular-nums">{formatCurrency(amount)}</span>
        </div>
      </div>
    </div>
  );

  const renderPhonePayment = () => (
    <div className="space-y-4">
      <button onClick={() => { setPaymentMethod(null); setPaymentStatus("idle"); setStatusMessage(""); }}
        className="flex items-center gap-1.5 text-cream-400/50 hover:text-gold-400 text-xs transition-all mb-1">
        <FaArrowLeft size={10} /> Back to methods
      </button>

      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-2 border border-purple-500/10">
          <FaPhone className="text-purple-400 text-xl" />
        </div>
        <h3 className="text-cream-50 font-bold text-base">Pay with Phone Number</h3>
        <p className="text-cream-400/50 text-xs">Receive a MoMo payment request on your phone</p>
      </div>

      {paymentStatus === "idle" || paymentStatus === "failed" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaUser size={10} /> Full Name
            </label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-purple-400/50 transition-all placeholder-cream-500/30" />
          </div>
          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaPhone size={10} /> Phone Number
            </label>
            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
              placeholder="e.g. 078X XXX XXX"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-purple-400/50 transition-all placeholder-cream-500/30" />
          </div>

          <div className="bg-espresso-950/40 rounded-xl p-4 border border-espresso-700/20">
            <div className="flex justify-between text-sm">
              <span className="text-cream-400/60">Amount to pay</span>
              <span className="text-gold-400 font-bold text-lg tabular-nums">{formatCurrency(amount)}</span>
            </div>
          </div>

          <button onClick={handlePhonePayment} disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><FaSpinner className="animate-spin" /> Processing...</> : <><FaMobileAlt /> Pay {formatCurrency(amount)}</>}
          </button>

          <p className="text-cream-400/30 text-[10px] text-center flex items-center justify-center gap-1">
            <FaShieldAlt size={8} /> Secured via MoMo encrypted channel
          </p>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          {paymentStatus === "processing" && (
            <div className="animate-pulse">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <FaSpinner className="text-purple-400 text-2xl animate-spin" />
              </div>
              <p className="text-cream-50 font-semibold">{statusMessage}</p>
              <p className="text-cream-400/40 text-xs mt-1">Please wait while we process your request</p>
            </div>
          )}

          {paymentStatus === "pending" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-3 animate-bounce">
                <FaClock className="text-gold-400 text-2xl" />
              </div>
              <p className="text-cream-50 font-semibold text-base">{statusMessage}</p>
              <p className="text-cream-400/50 text-xs mt-2">
                Dial <span className="text-gold-400 font-mono font-bold">{MERCHANT_CODE}</span> to complete
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-cream-400/30 text-[10px]">Waiting for confirmation...</span>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div>
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <FaTimes className="text-red-400 text-2xl" />
              </div>
              <p className="text-red-400 font-semibold">{statusMessage}</p>
              <button onClick={() => setPaymentStatus("idle")}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCodePayment = () => (
    <div className="space-y-4">
      <button onClick={() => { setPaymentMethod(null); setPaymentStatus("idle"); setStatusMessage(""); }}
        className="flex items-center gap-1.5 text-cream-400/50 hover:text-gold-400 text-xs transition-all mb-1">
        <FaArrowLeft size={10} /> Back to methods
      </button>

      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-2 border border-emerald-500/10">
          <FaQrcode className="text-emerald-400 text-xl" />
        </div>
        <h3 className="text-cream-50 font-bold text-base">Pay with USSD Code</h3>
        <p className="text-cream-400/50 text-xs">Dial the code on your phone, then submit the transaction ID</p>
      </div>

      {paymentStatus !== "completed" ? (
        <div className="space-y-3">
          {/* Pay to - Merchant Owner */}
          <div className="bg-espresso-950/60 rounded-xl p-4 border border-emerald-500/20 text-center">
            <p className="text-cream-400/50 text-[10px] uppercase tracking-wider mb-1">Pay to</p>
            <p className="text-cream-50 font-bold text-lg">{MERCHANT_NAME}</p>
            <p className="text-cream-400/30 text-xs mt-1">Merchant Code: <span className="text-cream-50 font-mono font-semibold">{MERCHANT_CODE}</span></p>
          </div>

          {/* USSD Dial Button */}
          <button onClick={handleDialUSSD}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-base transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] flex items-center justify-center gap-3">
            <FaMobileAlt className="text-xl" />
            Dial *182#
          </button>

          <div className="bg-espresso-950/40 rounded-xl p-4 border border-espresso-700/20">
            <h4 className="text-cream-50 text-xs font-semibold mb-2 flex items-center gap-1.5">
              <FaInfoCircle className="text-gold-400" size={10} /> How to Pay
            </h4>
            <ol className="space-y-1.5 text-cream-400/60 text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold min-w-[16px]">1.</span>
                <span>Tap <strong className="text-cream-50">Dial *182#</strong> above to open the MoMo menu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold min-w-[16px]">2.</span>
                <span>Select <strong className="text-cream-50">Pay Merchant</strong> and enter code <strong className="text-cream-50 font-mono">{MERCHANT_CODE}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold min-w-[16px]">3.</span>
                <span>Enter amount: <span className="text-gold-400 font-bold">{formatCurrency(amount)}</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold min-w-[16px]">4.</span>
                <span>Enter your MoMo PIN to confirm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold min-w-[16px]">5.</span>
                <span>Enter the transaction ID from the confirmation SMS below</span>
              </li>
            </ol>
          </div>

          <div className="bg-espresso-950/40 rounded-xl p-3 border border-yellow-500/20 text-center">
            <h4 className="text-cream-50 text-xs font-semibold mb-2 flex items-center justify-center gap-1.5">
              <FaInfoCircle className="text-yellow-400" size={10} /> How to Pay with MTN MoMo
            </h4>
            <img src={mtnGuide} alt="MTN MoMo payment guide"
              className="w-full max-w-xs mx-auto rounded-lg border border-espresso-700/30" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaSearch size={10} /> Transaction ID
            </label>
            <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
              placeholder="Enter the transaction ID from SMS"
              className="w-full px-3 py-2.5 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:border-emerald-400/50 transition-all placeholder-cream-500/30 font-mono" />
          </div>

          <div>
            <label className="block text-cream-400/60 text-xs mb-1.5 flex items-center gap-1">
              <FaCamera size={10} /> Screenshot (optional)
            </label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleScreenshotChange}
                className="hidden" id="screenshot-upload" />
              <label htmlFor="screenshot-upload"
                className="flex items-center gap-3 p-3 bg-espresso-950/60 border border-dashed border-espresso-700/50 rounded-lg cursor-pointer hover:border-emerald-400/30 transition-all">
                <div className="p-2 rounded-lg bg-espresso-800/60">
                  <FaUpload className="text-cream-400/60" />
                </div>
                <div>
                  <p className="text-cream-50 text-xs font-medium">
                    {screenshot ? screenshot.name : "Upload payment screenshot"}
                  </p>
                  <p className="text-cream-400/30 text-[10px]">PNG, JPG up to 5MB</p>
                </div>
              </label>
            </div>
            {screenshotPreview && (
              <div className="mt-2 relative inline-block">
                <img src={screenshotPreview} alt="Screenshot preview"
                  className="h-20 w-auto rounded-lg border border-espresso-700/30 object-cover" />
                <button onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px]">
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          <div className="bg-espresso-950/40 rounded-xl p-4 border border-espresso-700/20">
            <div className="flex justify-between text-sm">
              <span className="text-cream-400/60">Amount to pay</span>
              <span className="text-gold-400 font-bold text-lg tabular-nums">{formatCurrency(amount)}</span>
            </div>
          </div>

          <button onClick={handleCodePayment} disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><FaSpinner className="animate-spin" /> Verifying...</> : <><FaCheckCircle /> Verify Payment</>}
          </button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <FaCheckCircle className="text-emerald-400 text-2xl" />
          </div>
          <p className="text-emerald-400 font-bold text-base">{statusMessage}</p>
          <p className="text-cream-400/50 text-xs">Transaction ID: <span className="text-cream-50 font-mono font-semibold">{transactionId}</span></p>
        </div>
      )}
    </div>
  );

  if (!orderId && !initialAmount) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex items-center justify-center">
        <div className="text-center">
          <FaCoffee className="text-5xl text-espresso-600 mx-auto mb-4" />
          <p className="text-cream-400/60">No payment to process</p>
          <button onClick={() => navigate("/cart")} className="mt-4 text-gold-400 hover:text-gold-300">Go to Cart</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">
      <ToastContainer />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => paymentMethod ? setPaymentMethod(null) : navigate("/cart")}
          className="flex items-center gap-1.5 text-cream-400/60 hover:text-gold-400 text-sm mb-6 transition-all">
          <FaArrowLeft size={12} /> {paymentMethod ? "Back to methods" : "Back to Cart"}
        </button>

        <div className="bg-espresso-900/60 backdrop-blur-sm rounded-2xl border border-espresso-700/30 p-5 sm:p-6">
          {!paymentMethod && renderMethodSelection()}
          {paymentMethod === "phone" && renderPhonePayment()}
          {paymentMethod === "code" && renderCodePayment()}
        </div>

        {/* Security footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-cream-400/30 text-[10px]">
          <div className="flex items-center gap-1">
            <FaShieldAlt size={8} /> 256-bit encrypted
          </div>
          <div className="w-px h-3 bg-espresso-700/50" />
          <div className="flex items-center gap-1">
            <FaCheckCircle size={8} /> Secured payment
          </div>
          <div className="w-px h-3 bg-espresso-700/50" />
          <div className="flex items-center gap-1">
            <FaMobileAlt size={8} /> MoMo powered
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-espresso-800 to-espresso-900 rounded-2xl shadow-2xl w-full max-w-sm border border-espresso-700/40 overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <FaCheckCircle className="text-white text-3xl" />
              </div>
              <h3 className="text-cream-50 font-bold text-xl mb-1">Payment Successful!</h3>
              <p className="text-cream-400/60 text-sm mb-2">Your payment has been processed</p>
              <div className="bg-espresso-950/50 rounded-xl p-4 border border-espresso-700/30 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cream-400/60">Amount</span>
                  <span className="text-gold-400 font-bold">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cream-400/60">Status</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <FaCheckCircle size={10} /> Completed
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); navigate("/orderhistory"); }}
                  className="flex-1 py-2.5 bg-espresso-800/80 border border-espresso-700/50 text-cream-50 font-semibold rounded-xl text-sm hover:border-gold-400/30 transition-all">
                  View Orders
                </button>
                <button onClick={() => { setShowModal(false); navigate("/menu"); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30">
                  Order More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
