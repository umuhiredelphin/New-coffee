import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowRight, FaTag, FaMotorcycle, FaShieldAlt, FaCheckCircle, FaClock, FaCoffee, FaStore, FaChair, FaMobileAlt, FaQrcode } from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000";

function CartItem({ item, onUpdateQty, onRemove }) {
  const imgSrc = item.image?.startsWith("http")
    ? item.image
    : item.image
    ? `${API}${item.image}`
    : "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop";

  return (
    <div className="flex items-center gap-4 p-4 bg-espresso-900/60 backdrop-blur-sm rounded-xl border border-espresso-700/30 hover:border-gold-500/20 transition-all group">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-espresso-950">
        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop"; }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-cream-50 font-semibold text-sm sm:text-base truncate">{item.name}</h3>
        <p className="text-gold-400 font-bold text-sm mt-0.5">
          {item.price?.toLocaleString?.() || item.price} RWF
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-espresso-950/80 rounded-lg border border-espresso-700/50">
          <button onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
            className="p-1.5 text-cream-400 hover:text-gold-400 transition-all disabled:opacity-30">
            <FaMinus size={10} />
          </button>
          <span className="w-8 text-center text-cream-50 text-sm font-semibold tabular-nums">{item.quantity}</span>
          <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="p-1.5 text-cream-400 hover:text-gold-400 transition-all">
            <FaPlus size={10} />
          </button>
        </div>
        <button onClick={() => onRemove(item.id)}
          className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [delivery, setDelivery] = useState({
    name: user?.username || "", phone: user?.phone || "", email: user?.email || "", address: ""
  });
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/order-settings`).then(res => {
      if (res.data.success) setSettings(res.data.data);
    }).catch(() => {});
  }, []);

  const loadCart = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    const merged = saved.reduce((acc, item) => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) existing.quantity += item.quantity;
      else acc.push({ ...item });
      return acc;
    }, []);
    setCart(merged);
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/api/orders/last?buyerName=${encodeURIComponent(user.username)}`)
      .then(res => { if (res.data.success && res.data.order) setLastOrder(res.data.order); })
      .catch(() => {});
  }, [user]);

  const updateQty = (id, qty) => {
    const updated = cart.map(i => i.id === id ? { ...i, quantity: qty } : i);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const fee = settings ? settings.deliveryFee : 1500;
  const threshold = settings ? settings.freeDeliveryThreshold : 10000;
  const deliveryFee = (orderType === "delivery" && subtotal >= threshold) ? 0 : (orderType === "delivery" ? fee : 0);
  const total = Math.max(0, subtotal + deliveryFee - promoDiscount);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) { setPromoDiscount(0); setPromoError(""); return; }
    const promo = settings?.promoCodes?.find(p => p.code === code && p.isEnabled);
    if (promo) {
      if (promo.type === "percentage") setPromoDiscount(Math.round(subtotal * promo.value / 100));
      else setPromoDiscount(promo.value);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
    }
  };

  const getMinPickupDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleCheckout = async () => {
    if (!user) { navigate("/login"); return; }
    if (orderType === "pickup" && (!pickupDate || !pickupTime)) { alert("Please select pickup date and time"); return; }
    if (orderType === "dine-in" && !tableNumber) { alert("Please enter your table number"); return; }
    setSubmitting(true);
    try {
      const items = cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
      const payload = {
        buyerName: user.username,
        phone: delivery.phone,
        items,
        paymentMethod: "MoMo",
        orderType,
      };
      if (orderType === "delivery") payload.deliveryAddress = delivery.address;
      if (orderType === "pickup") payload.pickupTime = new Date(`${pickupDate}T${pickupTime}`).toISOString();
      if (orderType === "dine-in") payload.tableNumber = parseInt(tableNumber) || 0;
      const res = await axios.post(`${API}/api/cart/confirm`, payload);
      if (res.data.success) {
        localStorage.setItem("cart", JSON.stringify([]));
        localStorage.setItem("lastOrder", JSON.stringify({ orderId: res.data.orderId }));
        navigate("/payment", { state: { orderId: res.data.orderId, amount: total, orderType, cartItems: items } });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayLastOrder = () => {
    if (lastOrder) {
      navigate("/payment", {
        state: { orderId: lastOrder.id, amount: lastOrder.total, orderType: lastOrder.orderType }
      });
    }
  };

  const orderTypes = [
    { key: "delivery", icon: FaMotorcycle, label: "Delivery", desc: "Delivered to your door" },
    { key: "pickup", icon: FaStore, label: "Pickup", desc: "Pick up at our shop" },
    { key: "dine-in", icon: FaChair, label: "Dine In", desc: "Eat at the cafe" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FaShoppingCart className="text-6xl text-espresso-600 mx-auto mb-4" />
          <h2 className="text-2xl font-playfair font-bold text-cream-50 mb-2">Login Required</h2>
          <p className="text-cream-400/60 text-sm mb-6">Please log in to view your cart</p>
          <button onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-gold-500/30">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/20">
            <FaShoppingCart className="text-xl text-espresso-950" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50">Your Cart</h1>
            <p className="text-cream-400/50 text-sm mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Last Order Banner */}
        {lastOrder && lastOrder.status === "pending" && (
          <div className="mb-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaClock className="text-gold-400" />
              <div>
                <p className="text-cream-50 text-sm font-semibold">You have a pending order</p>
                <p className="text-cream-400/60 text-xs">{lastOrder.foodName} - {lastOrder.total?.toLocaleString?.() || lastOrder.total} RWF</p>
              </div>
            </div>
            <button onClick={handlePayLastOrder}
              className="px-4 py-2 bg-gold-500 text-espresso-950 font-bold rounded-lg text-sm hover:bg-gold-400 transition-all">
              Complete Payment
            </button>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <FaShoppingCart className="text-6xl text-espresso-600 mx-auto mb-4" />
            <h2 className="text-xl font-playfair font-bold text-cream-50 mb-2">Your cart is empty</h2>
            <p className="text-cream-400/60 text-sm mb-6">Add some coffee items to get started</p>
            <button onClick={() => navigate("/menu")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-gold-500/30">
              Browse Menu <FaArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <CartItem key={item.id} item={item} onUpdateQty={updateQty} onRemove={removeItem} />
              ))}
              <button onClick={() => navigate("/menu")}
                className="flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300 transition-all mt-2">
                <FaPlus size={10} /> Add More Items
              </button>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-espresso-900/60 backdrop-blur-sm rounded-xl border border-espresso-700/30 p-5 space-y-4">
                <h3 className="text-cream-50 font-bold text-base">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-cream-400/70">
                    <span>Subtotal</span>
                    <span className="text-cream-50 font-medium tabular-nums">{subtotal.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-cream-400/70">
                    <span>Delivery Fee</span>
                    <span className="text-cream-50 font-medium tabular-nums">
                      {orderType === "delivery" ? (deliveryFee === 0 ? <span className="text-green-400">Free</span> : `${deliveryFee.toLocaleString()} RWF`) : <span className="text-green-400">-</span>}
                    </span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-medium">-{promoDiscount.toLocaleString()} RWF</span>
                    </div>
                  )}
                  <div className="border-t border-espresso-700/30 pt-2 flex justify-between text-cream-50 font-bold text-base">
                    <span>Total</span>
                    <span className="text-gold-400 tabular-nums">{total.toLocaleString()} RWF</span>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-cream-400/60 text-xs mb-2">How would you like to receive your order?</label>
                  <div className="space-y-1.5">
                    {orderTypes.map(ot => (
                      <label key={ot.key} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        orderType === ot.key ? 'bg-gold-500/10 border-gold-500/30' : 'bg-espresso-950/30 border-espresso-700/30 hover:border-espresso-600'
                      }`}>
                        <input type="radio" name="orderType" value={ot.key} checked={orderType === ot.key}
                          onChange={() => setOrderType(ot.key)} className="accent-gold-500" />
                        <ot.icon className={`text-sm ${orderType === ot.key ? 'text-gold-400' : 'text-cream-500/60'}`} />
                        <div>
                          <p className="text-cream-50 text-sm font-medium">{ot.label}</p>
                          <p className="text-cream-400/50 text-[10px]">{ot.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields */}
                {orderType === "delivery" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">Phone Number</label>
                      <input type="tel" value={delivery.phone} onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))}
                        placeholder="+250 7XX XXX XXX"
                        className="w-full px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:border-gold-400/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">Delivery Address</label>
                      <input type="text" value={delivery.address} onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))}
                        placeholder="Street, building, landmark"
                        className="w-full px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:border-gold-400/50 transition-all" />
                    </div>
                  </div>
                )}

                {orderType === "pickup" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">Pickup Date</label>
                      <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                        min={getMinPickupDate()}
                        className="w-full px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:border-gold-400/50 transition-all [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-cream-400/60 text-xs mb-1">Pickup Time</label>
                      <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:border-gold-400/50 transition-all [color-scheme:dark]" />
                    </div>
                    <p className="text-cream-400/30 text-[10px] flex items-center gap-1">
                      <FaStore size={10} /> Your order will be ready at the selected time
                    </p>
                  </div>
                )}

                {orderType === "dine-in" && (
                  <div>
                    <label className="block text-cream-400/60 text-xs mb-1">Table Number</label>
                    <input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                      placeholder="e.g. 5" min={1}
                      className="w-full px-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:border-gold-400/50 transition-all" />
                    <p className="text-cream-400/30 text-[10px] mt-1 flex items-center gap-1">
                      <FaChair size={10} /> We'll bring your order to your table
                    </p>
                  </div>
                )}

                {/* Promo Code */}
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FaTag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cream-500/40 text-xs" />
                      <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)}
                        placeholder="Promo code" maxLength={20}
                        className="w-full pl-8 pr-3 py-2 bg-espresso-950/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:border-gold-400/50 transition-all" />
                    </div>
                    <button onClick={applyPromo}
                      className="px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold rounded-lg text-xs hover:bg-gold-500/20 transition-all">
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-red-400 text-[10px] mt-1">{promoError}</p>}
                  {promoDiscount > 0 && <p className="text-green-400 text-[10px] mt-1">Promo applied! Save {promoDiscount.toLocaleString()} RWF</p>}
                </div>

                {/* Mobile Money Payment Info */}
                <div className="bg-espresso-950/40 rounded-xl p-4 border border-espresso-700/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold-500/10">
                      <FaMobileAlt className="text-gold-400 text-lg" />
                    </div>
                    <div>
                      <p className="text-cream-50 text-sm font-semibold">Mobile Money Payment</p>
                      <p className="text-cream-400/50 text-[10px]">MTN / Airtel Money</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-cream-400/50 text-xs">
                    <FaShieldAlt className="text-green-400/60" size={10} />
                    <span>Secured via MoMo encrypted gateway</span>
                  </div>
                </div>

                <button onClick={handleCheckout} disabled={submitting || cart.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-espresso-950 border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><FaMobileAlt /> Pay with MoMo - {total.toLocaleString()} RWF</>
                  )}
                </button>
              </div>

              {/* Trust badges */}
              <div className="bg-espresso-900/40 rounded-xl border border-espresso-700/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cream-400/60 text-xs">
                  <FaShieldAlt className="text-green-400/60" /> Secured with 256-bit encryption
                </div>
                <div className="flex items-center gap-2 text-cream-400/60 text-xs">
                  <FaMobileAlt className="text-gold-400/60" /> Pay via MoMo Push or Merchant Code
                </div>
                {orderType === "delivery" && (
                  <div className="flex items-center gap-2 text-cream-400/60 text-xs">
                    <FaMotorcycle className="text-gold-400/60" /> Free delivery over {threshold.toLocaleString()} RWF
                  </div>
                )}
                <div className="flex items-center gap-2 text-cream-400/60 text-xs">
                  <FaCoffee className="text-gold-400/60" /> Freshly prepared after order
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
