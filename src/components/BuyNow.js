import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "./Navbar";
import CoffeeLoader from "./CoffeeLoader";
import { FaShoppingCart } from "react-icons/fa";

const socket = io("http://localhost:5000");

function BuyNow({ setNotifications }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [buyerName, setBuyerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money");
  const [orderType, setOrderType] = useState("Commandé");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setBuyerName(user.username || "Anonymous");
  }, []);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/menu/${id}`);
        setFood(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    setMessage("");

    if (quantity < 1) {
      setMessage("❌ Quantity must be at least 1.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = { ...food, quantity, paymentMethod, orderType };
    localStorage.setItem("cart", JSON.stringify([...cart, item]));

    const notification = {
      id: Date.now(),
      message: `${buyerName} added ${food.name} (x${quantity}) to cart`,
      time: new Date(),
      viewed: false,
    };
    socket.emit("newNotification", notification);
    setNotifications && setNotifications(prev => [notification, ...prev]);

    setMessage(
      <div className="flex items-center gap-2 flex-wrap">
        <span>🎉 Added to cart! </span>
        <button
          className="bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold px-3 py-1.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/25 flex items-center text-sm"
          onClick={() => navigate("/cart")}
        >
          <FaShoppingCart className="mr-1.5" /> Go to Cart
        </button>
      </div>
    );
  };

  if (loading) return <CoffeeLoader message="Preparing your order..." />;
  if (!food) return <div className="text-center py-24 text-red-400 font-poppins">Item not found!</div>;

  return (
    <div className="bg-espresso-950 min-h-screen font-poppins">
      <Navbar />
      <div
        className="flex justify-center items-center min-h-[90vh] p-6"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1950&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-espresso-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-espresso-700/50 w-full max-w-md p-8 text-center">
          <img
            src={`http://localhost:5000${food.image}`}
            alt={food.name}
            className="w-full h-60 object-cover rounded-xl mb-4"
          />
          <h2 className="text-gold-400 font-playfair text-3xl mb-2">{food.name}</h2>
          <p className="text-gold-400 font-bold text-lg mb-2">{food.currency} {food.price}</p>
          <p className="text-cream-50 font-poppins text-sm mb-6">{food.description || "No description available."}</p>

          <form onSubmit={handleAddToCart} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-cream-200 text-left">Buyer Name</label>
            <input
              type="text"
              value={buyerName}
              readOnly
              className="w-full px-4 py-3 bg-espresso-900/70 border border-espresso-700 text-cream-50 rounded-xl cursor-not-allowed focus:outline-none"
            />

            <label className="text-sm font-medium text-cream-200 text-left">Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              className="w-full px-4 py-3 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-xl focus:border-gold-400 focus:ring-gold-400/30 focus:outline-none transition-all duration-300 placeholder-cream-200/50"
            />

            <label className="text-sm font-medium text-cream-200 text-left">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-xl focus:border-gold-400 focus:ring-gold-400/30 focus:outline-none transition-all duration-300"
            >
              <option value="Mobile Money">Mobile Money</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>

            <label className="text-sm font-medium text-cream-200 text-left">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full px-4 py-3 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-xl focus:border-gold-400 focus:ring-gold-400/30 focus:outline-none transition-all duration-300"
            >
              <option value="Commandé">Commandé (Pre-order)</option>
              <option value="Be Ordered">Be Ordered (Immediate)</option>
            </select>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/25 text-lg mt-2">
              Add to Cart
            </button>
          </form>

          {message && <div className="mt-4">{message}</div>}

          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2.5 bg-espresso-800/70 text-cream-50 rounded-xl border border-espresso-700/50 hover:bg-espresso-700/50 transition-all duration-300"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyNow;
